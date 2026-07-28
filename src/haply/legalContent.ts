// Draft legal copy for the Terms of Service, Privacy Policy, and the
// divorce-verification-specific consent shown before document upload.
//
// IMPORTANT: this is AI-drafted boilerplate written to be functionally
// complete for the consent flow (versioned, gated, logged) — it has not been
// reviewed by a licensed attorney and should not be treated as sufficient
// legal protection on its own. Replace with attorney-reviewed copy before
// relying on it, especially the arbitration/liability and data-retention
// sections, which vary by jurisdiction.

export interface LegalSection {
  heading: string;
  body: string;
}

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
    heading: 'Divorce verification is not a background check',
    body: 'Haply offers an optional feature where you may submit details about your divorce or legal separation, along with a photo or scan of your decree or certificate of dissolution, for review. That review uses an AI system (see our Privacy Policy) to compare what you submitted against the document you provided, and may be followed by a support conversation if the result is unclear. This is a self-attestation check of a document you provide about yourself — it is not a consumer report, credit report, or formal background check, is not performed by a Consumer Reporting Agency, and is not governed by the Fair Credit Reporting Act. A "Verified" badge means Haply reviewed the document you submitted and it was internally consistent with what you entered; it is not a guarantee, and Haply is not liable for reliance on a badge status by you or any other member.'
  },
  {
    heading: 'No warranty',
    body: 'Haply is provided "as is." We do not guarantee compatibility with any other member, the accuracy of any member\'s claims (verified or not), or that the service will be uninterrupted or error-free.'
  },
  {
    heading: 'Limitation of liability',
    body: "To the fullest extent permitted by law, Haply and its operators are not liable for indirect, incidental, or consequential damages arising from your use of the service, interactions with other members, or reliance on a verification badge. Our total liability for any claim is limited to the amount you paid us, if any, in the 12 months before the claim arose."
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
    heading: 'Verification documents',
    body: "Your uploaded decree/certificate is stored encrypted and is not readable by other members or by you after upload — only the automated review process can access it. It is retained for up to 90 days after a decision (to support a possible follow-up or appeal), then deleted. The decision itself (verified or not) and our reasoning are kept as part of your account record."
  },
  {
    heading: 'What other members see',
    body: 'Your display name, age, city, interests, intro, and community posts/comments are visible to other members. Your verification badge status (verified or not) is visible to other members — that visibility is the point of the feature. Your uploaded document, legal name at time of divorce (if different from your display name), date of birth, and exact address are never shown to other members.'
  },
  {
    heading: 'Data retention & deletion',
    body: 'You can request deletion of your account and associated data at any time by contacting support. Verification documents are deleted automatically after the 90-day window described above regardless of whether you request it.'
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
    heading: 'What happens when you submit',
    body: "The details you enter and the document you upload are sent to an AI system (Anthropic's Claude API) that compares them and decides whether they're consistent. This is not a background check and does not involve a live public-records database lookup — see our Terms for what this review does and doesn't mean."
  },
  {
    heading: 'Your badge is shown to other members',
    body: 'If your submission is approved, a "Verified divorced" or "Verified legally separated" badge appears on your profile and posts, visible to other members. If it is not approved, your profile will show as not verified — this is neutral, not a public flag of failure, since most members simply haven\'t completed this optional step.'
  },
  {
    heading: 'Your document',
    body: "Your uploaded document is stored encrypted, is not visible to other members or to you after upload, is retained up to 90 days after a decision, and is then deleted."
  }
];
