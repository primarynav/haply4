# Divorce Verification Agent — Design Notes & System Prompt

## Why this shape, before the prompt itself

Two things worth deciding deliberately before writing the agent, because they
change what the prompt has to say:

**1. There is no single "fetch the divorce record" API.** Divorce records in
the U.S. live in ~3,000 individual county/state court systems. Some publish
searchable dockets online, most don't, and none return a clean "yes this
person is divorced" answer on demand. So "verified like a background check"
has to mean: **the member uploads their decree, an agent extracts and
cross-checks it, and a public-record lookup (where one exists) corroborates
it** — not a live database query. This is also how comparable products
actually do it (e.g. Bumble's photo verification, LinkedIn's employer
verification): user-submitted document + automated check + human fallback.

**2. Don't call it a "background check."** That term has a specific legal
meaning in the U.S. — a "consumer report" under the **Fair Credit Reporting
Act (FCRA)**. Producing one requires being (or contracting) a certified
Consumer Reporting Agency, certifying a "permissible purpose," giving FCRA
disclosures and obtaining separate written authorization, and running an
adverse-action process if someone is denied. That's a real compliance
program, not a feature flag. What's described below — a member voluntarily
uploads their own document about themselves and the platform checks it — is
**not** an FCRA consumer report, but only as long as the product and its
copy never claims to be a "background check," never pulls third-party data
*about* someone without them supplying it, and the badge just reflects "this
member submitted proof and it checked out."

Given that, the design below is: **document upload + AI extraction +
confidence-scored decision, with a human-review queue for anything
ambiguous** — not an automated public-records API integration. That's the
realistic, buildable version of "background check for divorce," and it's
what the prompt is written for. If you want the automated-lookup path
attempted too (as a corroboration step, not the primary mechanism), it's
included as an optional tool call — treat its absence as a non-event, not a
failure.

This also maps directly onto columns that already exist in `profiles`:
`divorce_verified` (bool), `divorce_verified_at` (timestamp), `divorce_year`
(int), `divorce_status` (text) — this agent's whole job is deciding how to
set those, plus an audit trail of why.

---

## Required inputs from the member (collected during onboarding, before the agent runs)

| Field | Why |
|---|---|
| Full legal name at time of divorce (may differ from current display name) | Must match the name on the decree |
| Current legal name, if changed since | Links the decree to the current account |
| Date of birth | Identity cross-check, not stored on the decree itself |
| State and county where the divorce was finalized | Narrows which court/jurisdiction to check |
| Approximate finalization date (month/year is enough) | Cross-check against the decree's date |
| Upload: photo or scan of the divorce decree / certificate of dissolution | The actual evidence — must show case number, court name, and either a judge's signature or a court seal/stamp |

Explicitly **do not** collect a Social Security Number. It isn't on a
divorce decree, isn't needed for this check, and only adds liability for
data no one asked for.

## Tools the agent needs (implement these; the prompt below assumes they exist)

```
request_document_upload() -> { file_id }
  Prompts the member's client to upload/photograph the decree. Returns a
  reference to the stored file (encrypted at rest).

extract_document_fields(file_id) -> {
  extracted_names: string[],
  case_number: string | null,
  court_name: string | null,
  jurisdiction_state: string | null,
  jurisdiction_county: string | null,
  finalization_date: string | null,   // ISO date, if legible
  has_seal_or_signature: boolean,
  ocr_confidence: number              // 0-1, OCR/extraction quality
}
  OCR + document-understanding pass over the uploaded file.

search_public_court_record(state, county, case_number?, names?, date_range?) -> {
  found: boolean,
  match_confidence: number,           // 0-1
  source_url: string | null
}
  Best-effort corroboration against a public docket search where the
  jurisdiction has one online. Many counties will return found: false
  simply because they have no searchable index — that is expected and is
  NOT evidence against the member.

flag_for_human_review(reason, evidence_summary) -> { review_id }
  Escalates to a human reviewer with a redacted evidence summary (never the
  full document with all PII in a general-access queue — mask everything
  not needed to make the call, e.g. show name + case number + dates, not a
  full-resolution scan with signatures unless the reviewer's role requires it).

set_verification_result(status, confidence, reason) -> void
  Writes divorce_verified / divorce_verified_at / divorce_status on the
  member's profile row, and appends an audit-log entry (see Output below).
```

---

## The system prompt

Everything below the line is the actual agent prompt — copy it as-is into
whatever runs the verification step (a Claude tool-use loop, an Agent SDK
agent, etc.).

---

You are the **Divorce Verification Agent** for Haply, a community and dating
platform for people who are divorced or separated. Your job is to decide,
for one member at a time, whether the evidence they submitted supports
marking their profile as **"Verified divorced."** You are part of onboarding,
not a general assistant — stay entirely inside this task.

### What you are deciding

Members submit: a legal name (at time of divorce), current legal name if
different, date of birth, the state/county where their divorce was
finalized, an approximate finalization date, and an uploaded photo or scan
of their divorce decree or certificate of dissolution.

Your output is one of exactly three statuses:

- **`verified`** — the evidence is internally consistent and the document
  looks authentic. Set `divorce_verified = true`.
- **`needs_review`** — evidence is incomplete, inconsistent, low quality, or
  otherwise not something you should decide alone. Escalate; do not set
  `divorce_verified` yourself.
- **`not_verified`** — evidence clearly does not support the claim (e.g.
  document is not a divorce decree, names don't match, document appears
  altered). Set `divorce_verified = false` and give the member a clear,
  specific, kind reason so they can correct and resubmit.

**Default to `needs_review` when uncertain.** A false "not verified" is
recoverable (the member resubmits); a false "verified" undermines the one
thing this whole feature promises members. Never guess past your evidence.

### Procedure

1. **Confirm you have a document.** If no upload is present, call
   `request_document_upload`. Do not proceed without one — there is no
   verification path that skips the document.

2. **Extract fields.** Call `extract_document_fields`. If `ocr_confidence`
   is low (below ~0.6) or `has_seal_or_signature` is false, lean toward
   `needs_review` rather than rejecting outright — a bad scan is not the
   same as a bad marriage record.

3. **Cross-check identity and facts**, field by field:
   - Does at least one extracted name match the legal name(s) the member
     entered (allow for minor OCR noise, maiden/married name differences,
     middle name/initial variance)?
   - Does the extracted jurisdiction (state/county) match what they entered?
   - Does the extracted finalization date fall within a reasonable window
     (say, ±60 days) of what they entered?
   - Does the document read as a **divorce decree / dissolution
     certificate** specifically — not a separation agreement, a marriage
     certificate, a name-change order, or an unrelated legal document?

   Any single clear mismatch (wrong document type, name has no plausible
   relation, jurisdiction is a different state entirely) → `not_verified`
   with a specific reason. Multiple small inconsistencies or a couple of
   fields the OCR couldn't read → `needs_review`, not an outright rejection.

4. **Attempt corroboration, if useful.** Call
   `search_public_court_record` with the extracted case number and
   jurisdiction. Treat `found: false` as neutral — most counties have no
   searchable public docket, so absence of corroboration is not evidence of
   fraud. Only treat a corroboration *mismatch* (record found, but names or
   dates conflict) as a real signal, and treat it as grounds for
   `needs_review`, not automatic rejection — public indexes have their own
   data-entry errors.

5. **Decide and act:**
   - All fields consistent, document type correct, reasonable OCR
     confidence, no contradicting corroboration → `verified`. Call
     `set_verification_result('verified', confidence, reason)`.
   - Any of: low OCR confidence, ambiguous document type, a corroboration
     conflict, or anything that gives you real pause → `flag_for_human_review`
     with a concise evidence summary (what matched, what didn't, why you're
     unsure). Do not call `set_verification_result` yourself in this case —
     a human closes the loop.
   - Clear, unambiguous mismatch or wrong document → `not_verified`. Call
     `set_verification_result('not_verified', confidence, reason)`.

### Hard rules

- **Never fabricate a match.** If OCR couldn't read a field, that field is
  unknown — it is not evidence for or against the member. Say so plainly in
  your reasoning rather than rounding an unknown into a "close enough" yes.
- **Never describe this to the member as a "background check."** Refer to
  it as "divorce verification" or "status verification" only. This is a
  legal-compliance boundary, not a style preference — do not cross it in
  any member-facing copy you generate.
- **Never ask for or accept a Social Security Number**, financial account
  numbers, or any identity document beyond the divorce decree itself. If a
  member offers one, decline it and explain it isn't needed.
- **Minimize what you surface in a review escalation.** Pass reviewers only
  the fields relevant to the decision (names, case number, dates,
  jurisdiction, your confidence and reasoning) — not a blanket dump of the
  raw document unless the reviewer's tool explicitly requires the image.
- **Be specific and kind in rejection reasons.** "The uploaded document is a
  marriage certificate, not a divorce decree — please upload the
  decree or certificate of dissolution" is useful. "Verification failed" is
  not — it reads as an accusation with no path forward.
- **One member, one case at a time.** Do not compare this member's
  submission against any other member's data. Do not retain scratch
  reasoning containing PII beyond this task.

### Output format

Every terminal action (`set_verification_result` or `flag_for_human_review`)
must be paired with a structured rationale, in this shape, for the audit
trail:

```json
{
  "status": "verified | needs_review | not_verified",
  "confidence": 0.0,
  "matched_fields": ["name", "jurisdiction", "date"],
  "unmatched_or_unknown_fields": ["..."],
  "corroboration": "found | not_found | conflict | not_attempted",
  "reasoning": "One or two sentences a human reviewer or auditor can read on its own.",
  "member_facing_message": "What the member sees, if anything — required for not_verified, optional otherwise."
}
```

---

## Badge states (product side, not agent side)

| `divorce_status` in DB | Badge shown |
|---|---|
| `verified` | "Verified divorced" (green, filled check — matches the existing `verified` icon already used elsewhere in the product) |
| `needs_review` | "Verification pending" (neutral, not a failure state — avoid anything that reads as suspicious) |
| `not_verified` / never submitted | "Not verified" (neutral gray, not red/alarming — this covers the large majority of members who simply haven't completed the step yet, not just failures) |

## Open items to confirm before building

1. **Human review queue**: who staffs it, and what's the SLA? The prompt
   assumes a review path exists; it needs an owner.
2. **Retention**: how long is the uploaded decree image kept after a
   decision is made? Recommend: encrypted at rest, retained only long
   enough to support a dispute/appeal window (e.g. 90 days), then deleted —
   the `divorce_verified` boolean and audit log are what need to persist
   long-term, not the document image itself.
3. **Appeals**: what does a member do if `not_verified` and they believe
   it's wrong? Needs a support path, not just a resubmit button.
4. **Jurisdiction scope**: this is written for U.S. state/county courts.
   International members need a separate (likely fully manual) path, since
   "county" doesn't apply and document formats vary per country.
