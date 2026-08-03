// Draft legal copy for the Terms of Service, Privacy Policy, and the
// divorce-verification-specific consent shown before document upload.
//
// IMPORTANT: this is AI-drafted copy. It has NOT been reviewed by a licensed
// attorney and is not a substitute for one. Have counsel review before launch,
// particularly the liability, dispute-resolution, and retention sections, which
// vary by jurisdiction — and note there is no arbitration or governing-law
// clause here at all yet.
//
// Two rules for editing this file:
//
//  1. Only describe what the code actually does. Every statement here is a
//     representation to a consumer about how their data is handled; a promise
//     the system does not keep is worse than no promise. The 90-day deletion
//     claim, for example, is backed by supabase/functions/purge-verification-docs
//     and its cron schedule — if that job is removed, this copy must change too.
//  2. Bump VERIFICATION_CONSENT_VERSION (src/haply/backend.ts) and add the new
//     value to KNOWN_CONSENT_VERSIONS (supabase/functions/verify-divorce) on any
//     material change to VERIFICATION_CONSENT, so consent records stay tied to
//     the exact wording each member was shown.

export interface LegalSection {
  heading: string;
  body: string;
}

/**
 * Where members exercise data rights and request human review of an automated
 * decision. This address is quoted in the Terms, the Privacy Policy, the consent
 * screen, and the support chat's system prompt — it must be a real, monitored
 * inbox. Promising a route to a person and not staffing it is worse than not
 * offering one.
 */
export const SUPPORT_EMAIL = 'support@happilyeverafteragain.com';

/**
 * Shown on the public /terms and /privacy pages and in the in-app modal.
 *
 * Bump this whenever the text below changes materially — a policy with no date
 * is one a reader cannot tell has been revised, and the Terms promise that
 * material changes are "reflected in an updated version date". Keep it in step
 * with TERMS_VERSION in backend.ts, which is what gets recorded against each
 * member's acceptance.
 */
export const LEGAL_LAST_UPDATED = 'July 2026';

export const TERMS_OF_SERVICE: LegalSection[] = [
  {
    heading: 'Who can use Haply',
    body: 'Haply is for people 21 or older who are divorced or legally separated. You confirm this when you join. Some areas of Haply (dating, and any feature carrying a "Verified" badge) may require additional confirmation, including uploading a document as described in our divorce-verification consent, before they unlock.'
  },
  {
    heading: 'Your account',
    body: "You're responsible for the accuracy of what you submit and for keeping your login credentials secure. You may not create an account on behalf of someone else, misrepresent your identity, age, or relationship status, or share your account."
  },
  {
    heading: 'Community conduct',
    body: 'Haply is a community for people navigating divorce or separation. Harassment, hate speech, solicitation, impersonation, and sharing another member\'s contact information without consent are not allowed. We may remove content, suspend, or terminate accounts that violate this, with or without notice, at our discretion.'
  },
  {
    heading: 'What a "Verified" badge does and does not mean',
    body: 'Haply offers an optional feature where you may submit details about your divorce or legal separation, along with a photo or scan of your decree or certificate of dissolution, for review. A "Verified" badge means one narrow thing: an automated review found that the document a member uploaded appeared to be a divorce decree or certificate of dissolution and was consistent with the details that member typed in. It does NOT mean we confirmed the member\'s identity, that the document is authentic or was checked against any court record, that the member is currently single or unmarried, or that the member is safe to meet. We do not confirm that the person holding the account is the person named on the document. Treat a badge as one small signal among many, never as a substitute for your own judgment.'
  },
  {
    heading: 'We do not conduct criminal background screenings',
    body: 'Haply does NOT conduct criminal background screenings, sex-offender registry checks, or identity checks on its members. Divorce verification is not a background check of any kind. It is not a consumer report or investigative consumer report, is not performed by a consumer reporting agency, and is not governed by the Fair Credit Reporting Act. Members who have committed crimes, including violent or sexual offenses, may be on this service, and a member displaying a "Verified" badge may be among them. Always meet in public, tell someone where you are going, and do not send money to anyone you have not met.'
  },
  {
    heading: 'Automated decisions and your right to human review',
    body: 'Verification decisions are made by an automated system using AI, without a person reviewing your submission first, and the support chat that follows a declined result is also AI. You may request that a person review any verification decision about you, at any time and without giving a reason, using the "Request human review" option in the verification screen or by emailing us. We record every such request. You may also withdraw your consent to verification and ask us to delete your submission at any time; withdrawing consent removes any badge but does not otherwise affect your account.'
  },
  {
    heading: 'No warranty',
    body: 'Haply is provided "as is." We do not guarantee compatibility with any other member, the accuracy of any member\'s claims (verified or not), or that the service will be uninterrupted or error-free.'
  },
  {
    heading: 'You are responsible for your own safety',
    body: 'Haply does not screen members for criminal history and does not vet anyone for safety. You are solely responsible for your interactions with other members, online and in person. You assume all risk of communicating with, and meeting, anyone you encounter through Haply. Never send money, share financial account details, or share identifying documents with another member — no legitimate member will ask. Report concerning behavior to us, and report anything criminal to law enforcement.'
  },
  {
    heading: 'Limitation of liability',
    body: "To the fullest extent permitted by law, Haply and its operators are not liable for indirect, incidental, special, or consequential damages arising from your use of the service, your interactions with other members whether online or in person, any member's conduct, or your reliance on a verification badge or any other member's statements. Our total liability for any claim is limited to the greater of the amount you paid us in the 12 months before the claim arose, or one hundred U.S. dollars. Some jurisdictions do not allow these limits, so parts of this section may not apply to you, and nothing here limits liability that cannot be limited by law."
  },
  {
    heading: 'Changes',
    body: 'We may update these Terms from time to time. Material changes will be reflected in an updated version date, and continued use after a change means you accept the update.'
  }
];

export const PRIVACY_POLICY: LegalSection[] = [
  {
    heading: 'What we collect',
    body: 'Account information (name, email), profile details you choose to share (age, city, interests, intro), community posts and comments, and — if you use divorce verification — the details you enter (claimed status, legal name(s), date of birth, jurisdiction, approximate finalization date) and the document you upload.'
  },
  {
    heading: 'How AI is used',
    body: "Haply uses Anthropic's Claude API to: (1) help you draft your profile intro from a conversation, (2) review a divorce-verification submission by comparing the document you upload against what you entered, and (3) power a support conversation if a verification result needs follow-up. Submitted verification documents and conversation content are sent to Anthropic for this processing under its API terms; Anthropic does not use this data to train its models under those terms. We do not use your data to train our own models."
  },
  {
    heading: 'Verification documents and sensitive information',
    body: "A divorce decree is sensitive, and it usually contains information about people other than you — your former spouse, and often children. Please black out anything not needed to show the court, the parties' names, and the date before you upload: Social Security numbers, financial account numbers, home addresses, and children's names and dates of birth. Our automated review is instructed not to transcribe or reason about those details, and the short rationale we keep is written to avoid repeating any contents of your document. Your uploaded file is stored encrypted in a private location, is not readable by other members or by you after upload, and only the automated review process can access it. It is deleted automatically 90 days after a decision — the window exists so a declined result can still be revisited. You can ask us to delete it sooner at any time."
  },
  {
    heading: 'How long we keep things',
    body: 'Verification document: deleted 90 days after a decision, or sooner on request. Verification decision record (the outcome, a short de-identified rationale, and the record of your consent): kept while your account exists, because it is what your badge rests on. Account and profile data: kept while your account exists. When you delete your account we delete your profile, your verification records, and any remaining uploaded document, except anything we are required to keep by law.'
  },
  {
    heading: 'What other members see',
    body: 'Your display name, age, city, interests, intro, and community posts/comments are visible to other members. Your verification badge status (verified or not) is visible to other members — that visibility is the point of the feature. Your uploaded document, legal name at time of divorce (if different from your display name), date of birth, and exact address are never shown to other members. Your document is not read by our staff as part of an ordinary verification — that decision is automated. A member of our team can open it only where you have asked us to review a decision, or where the automated check could not resolve it and the submission was referred for review; every such access is logged against the individual reviewer.'
  },
  {
    heading: 'Your rights',
    body: `You may ask us to: give you a copy of the data we hold about you; correct it; delete your account and its data; delete your verification document immediately; withdraw a consent you previously gave; or have a person review an automated verification decision. Email ${SUPPORT_EMAIL} and we will act on the request. We will not treat you differently for exercising any of these rights. Depending on where you live you may have additional rights under laws such as the California Consumer Privacy Act or the GDPR, including the right to complain to your data protection authority.`
  },
  {
    heading: 'Automated decision-making',
    body: 'Verification decisions are made automatically by an AI system with no human reviewing your submission beforehand, and the follow-up support chat is also AI, not a person. You can ask for a human to review any decision about you at any time, without giving a reason — see Your rights above.'
  },
  {
    heading: 'Security',
    body: 'We use row-level access controls so that, by default, members can only read their own private data, and verification documents are stored in a private location no member (including you) can browse directly. No system is perfectly secure, and we cannot guarantee absolute security.'
  },
  {
    heading: 'We do not sell your data',
    body: "We don't sell your personal information to third parties."
  }
];

export const VERIFICATION_CONSENT: LegalSection[] = [
  {
    heading: 'Black out anything we do not need',
    body: "Before you upload, please cover or black out Social Security numbers, financial account numbers, home addresses, and the names and dates of birth of any children. We only need to see that the document is a decree or dissolution certificate, the names of the parties, the court, and the date. Your decree also contains information about your former spouse, who has not agreed to this — please share no more of it than the review needs."
  },
  {
    heading: 'An AI makes this decision, not a person',
    body: "The details you enter and the document you upload are sent to an AI system (Anthropic's Claude API), which decides whether they are consistent. No person reviews your submission first. If you disagree with the result you can ask for a human to review it, at any time, without giving a reason. This is not a background check and involves no public-records or court-record lookup."
  },
  {
    heading: 'What the badge claims — and what it does not',
    body: 'If approved, a "Verified divorced" or "Verified legally separated" badge appears on your profile, visible to other members. It represents only that an automated review found your uploaded document consistent with what you entered. It is not confirmation of your identity, not proof the document is genuine, and not a safety or background check of you or anyone else. If your submission is not approved, your profile simply shows as not verified — most members have not completed this optional step, so it reads as neutral, not as a failure.'
  },
  {
    heading: 'Your document is deleted after 90 days',
    body: `Your uploaded document is stored encrypted, is not visible to other members or to you after upload, and is deleted automatically 90 days after a decision. You can ask us to delete it sooner, or withdraw this consent entirely, by emailing ${SUPPORT_EMAIL}. We keep the outcome and a short rationale on your account for as long as your badge does.`
  }
];
