/**
 * The guides — the only pages on this site a search engine can actually read.
 *
 * Everything else is a React app rendered in the browser. Google will sometimes
 * execute that and sometimes not; Bing, Facebook's link checker, and most of the
 * crawlers that now feed answer engines will not. So the pages meant to be found
 * by a stranger are written here as plain content and rendered to static HTML at
 * build time (see staticPages.ts), where there is nothing to execute.
 *
 * What these are for: someone typing "is he really divorced" at 11pm is asking a
 * question we can genuinely answer, and is exactly the person this product is
 * for. That is worth far more than ranking for "dating site", which we would
 * lose to companies spending millions.
 *
 * Two rules for adding to this file:
 *
 *  1. Answer the question. A page that withholds the answer to push a signup is
 *     the thing everyone hates about search results, and it does not rank
 *     anyway. The pitch goes at the bottom, after the reader has been helped.
 *  2. Nothing here may claim more than the product does. The Terms are explicit
 *     that a verified badge means one narrow thing — a reviewed document — and
 *     is not an identity or background check. Marketing copy that quietly
 *     upgrades that claim is how a trust product stops being one.
 *
 * Legal-adjacent statements ("records are usually public") are hedged on
 * purpose: divorce procedure is state and county law, it genuinely varies, and
 * every guide carries a not-legal-advice line for that reason.
 */

export interface FaqItem {
  q: string;
  a: string;
}

export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'h2'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'note'; heading: string; text: string }
  | { kind: 'faq'; items: FaqItem[] };

export interface Article {
  slug: string;
  /** <h1> and the sitemap/index label. */
  title: string;
  /** <title> — may differ from the h1 to fit the SERP line. */
  metaTitle: string;
  description: string;
  /** ISO date. Shown to readers and emitted in Article schema. */
  published: string;
  updated: string;
  /** Standfirst under the h1. */
  dek: string;
  /** One line for the guides index. */
  cardLine: string;
  blocks: Block[];
}

const p = (text: string): Block => ({ kind: 'p', text });
const h2 = (text: string): Block => ({ kind: 'h2', text });
const h3 = (text: string): Block => ({ kind: 'h3', text });
const ul = (...items: string[]): Block => ({ kind: 'ul', items });
const ol = (...items: string[]): Block => ({ kind: 'ol', items });
const note = (heading: string, text: string): Block => ({ kind: 'note', heading, text });
const faq = (...items: FaqItem[]): Block => ({ kind: 'faq', items });

const NOT_LEGAL_ADVICE =
  'This is general information, not legal advice. Divorce is governed by state and county law and the details vary a lot from one place to the next. For anything that affects your own case, talk to a family-law attorney licensed where you live.';

// ---------------------------------------------------------------------------

const isHeReallyDivorced: Article = {
  slug: 'is-he-really-divorced',
  title: 'How to tell if someone is really divorced',
  metaTitle: 'How to Tell if Someone Is Really Divorced | Haply',
  description:
    'What "divorced" can actually mean, how to look up a divorce record yourself in most US states, the questions that get a straight answer, and the real warning signs.',
  published: '2026-08-03',
  updated: '2026-08-03',
  dek: 'Separated, filed, legally separated, and divorced are four different things, and people use the same word for all of them. Here is how to find out which one you are dealing with.',
  cardLine: 'What "divorced" actually means, how to check a court record, and the questions that get a straight answer.',
  blocks: [
    p(
      'If you are reading this, someone has told you they are divorced and something did not sit right — a vague answer about dates, a wedding ring tan line, a phone turned face down. You are not being paranoid. This is one of the most common things people lie about, or shade, in early dating, and it is worth ten minutes of your time to settle.'
    ),
    p('The good news is that in most of the United States, the answer is a matter of public record, and you can usually check it yourself for free.'),

    h2('First: "divorced" means five different things'),
    p(
      'A lot of the confusion here is not deception. It is that people say "divorced" the moment the marriage is over emotionally, which can be years before it is over legally. These are genuinely different situations, with different consequences for you:'
    ),
    h3('1. Still married, still living together'),
    p(
      'The marriage is unhappy and possibly finished in every way that matters to them, but nothing has changed legally or practically. Some people describe this as "basically divorced." It is not divorced.'
    ),
    h3('2. Separated (informally)'),
    p(
      'They have moved out, or one of them has. In most states this has no legal status at all — no filing, no court, no paperwork. They are married. Property and debt accumulated during this period may still be marital property depending on the state.'
    ),
    h3('3. Legally separated'),
    p(
      'A real court status in many (not all) states. A judge has entered an order dividing property, and often setting support and custody, but the marriage still legally exists and neither person can remarry. Some couples stop here permanently for insurance, religious, or tax reasons.'
    ),
    h3('4. Divorce filed / pending'),
    p(
      'A petition has been filed and the case is open. Depending on the state and how contested it is, this can take anywhere from a couple of months to several years. They are still married until a judge signs the final judgment.'
    ),
    h3('5. Divorced'),
    p(
      'A judge has signed a final judgment — usually called a Judgment of Dissolution of Marriage, Decree of Dissolution, or Final Decree of Divorce depending on the state. The marriage is over. This is the only one of the five that is actually divorced.'
    ),
    note(
      'Why the distinction is practical, not pedantic',
      'Someone in stages one through four is legally married. That can affect property you build together, it can matter in their divorce case in a handful of states that still consider fault, and — most commonly — it means a reconciliation is still on the table in a way it is not once a judgment is signed. You are allowed to decide that any of these is fine. You are not in a position to decide until you know which one it is.'
    ),

    h2('How to look up a divorce record yourself'),
    p(
      'In most US states, the existence of a divorce case is public: the names of the parties, the case number, the filing date, and the date of the final judgment. What is usually sealed or restricted is the sensitive interior — financial affidavits, custody evaluations, and anything involving children. So you can typically confirm that a divorce happened and when, without reading anything private.'
    ),
    ol(
      'Find the county. Divorce is filed where one of the spouses lived at the time, so you need the county, not just the state. If they mentioned where they lived when it happened, that is your county.',
      'Search that county\'s court records portal. Search for the county name plus "circuit clerk case search" or "clerk of court records search". Most counties now have one, and most are free to search even where copies cost money.',
      'Try the statewide portal too. A number of states run a single case-search site covering all counties, which saves guessing.',
      'Search by last name. You are looking for a case type listed as dissolution of marriage, divorce, or domestic relations, with both spouses named.',
      'Read the dates. The filing date and the final judgment date are the two that matter, and the gap between them is often surprising.'
    ),
    p(
      'A few states restrict online access to family cases and require you to request records in person or by mail from the clerk, and vital-records offices in most states will issue a certified copy of a divorce certificate — but usually only to the parties themselves or their attorneys. If your county is one of the restricted ones, the phone call to the clerk\'s office is short and they will tell you what is available.'
    ),
    note(
      'One thing not to do',
      'Do not pay one of the "background check" sites that advertise against these searches. They mostly resell scraped public data, they are frequently out of date, they are easy to confuse with people of the same name, and several will quietly enroll you in a monthly subscription. The county clerk is the primary source and is usually free.'
    ),

    h2('The questions that get a straight answer'),
    p(
      'You do not have to run an interrogation. You are just asking specific questions instead of general ones, because specific questions are hard to answer vaguely without it being obvious.'
    ),
    ul(
      '"When was it final?" A divorced person knows this to the month, and usually the day, because it was one of the more memorable days of their life. Fuzziness here is the single strongest signal on this page.',
      '"Which county was it in?" Instant, unremarkable answer if true.',
      '"How long did it take?" People who have been through it tell this story readily, usually with feeling about it.',
      '"How are you filing taxes this year?" Filing jointly means married. This is a completely normal question between people getting serious.',
      '"Is the house sorted out?" A finished divorce has divided the property. An unfinished one has not, and this usually surfaces it.'
    ),
    p(
      'What you are listening for is not a perfect answer. It is whether the answers are concrete and consistent, and whether the question itself makes them defensive. Someone who is genuinely divorced finds these boring.'
    ),

    h2('Warning signs worth taking seriously'),
    ul(
      'Vague or shifting dates for when it was final.',
      'You have never been to their home, or you have only been there when it was conspicuously tidy.',
      'Calls and texts are taken in another room, and the phone is always face down.',
      'Weekends, holidays, and evenings are systematically unavailable with thin explanations.',
      'They are still living with their ex "for the kids" or "until the house sells" — which is sometimes completely true, and is also the most common cover story.',
      'You have not met a single friend or family member.',
      'They discourage you from posting anything, anywhere.',
      '"We are basically divorced," "it is just paperwork at this point," or "it is being finalized" — used repeatedly, over months, with the finish line never arriving.'
    ),
    p(
      'Any one of these has an innocent explanation. Four of them together usually do not. Trust the pattern rather than the individual item, and trust your own unease — it is generally reacting to the pattern before you have consciously assembled it.'
    ),

    h2('What "verified" means on a dating app — including ours'),
    p(
      'Most dating apps offer some kind of verification badge. Almost all of them verify one thing: that the person in the photos is the person holding the account, usually by comparing a live selfie to the profile pictures. That is a real and useful check, and it says nothing whatsoever about marital status.'
    ),
    p(
      'A small number of services, including this one, let a member submit their divorce decree for review. Here is the honest scope of what that means on Haply, because we would rather you calibrate correctly than be impressed: an automated review looks at the document a member uploads and checks whether it appears to be a decree or certificate of dissolution and whether it is consistent with the details they typed in. That is the whole claim. It does not confirm their identity. It does not check the document against any court record. It does not mean they are currently unattached, and it is not a background check of any kind.'
    ),
    p(
      'So it is a real signal and a narrow one. It is much better than nothing, because someone who is still married generally cannot produce a decree in their own name — but it is one input to your own judgment, never a replacement for it.'
    ),

    h2('If you find out they are not divorced'),
    p(
      'You get to decide what to do with that, and there is no single right answer — plenty of good relationships started while a divorce was still grinding through court. What matters is that you decided with the facts, rather than finding out in eighteen months.'
    ),
    p(
      'If they lied about it, though, weigh that separately from the marital status itself. The status is a circumstance. The lie is information about how they handle inconvenient truths, and that does not usually stay confined to one topic.'
    ),

    faq(
      {
        q: 'Are divorce records public in the US?',
        a: 'Generally yes. In most states the case file — names of the parties, case number, filing date, and the date of the final judgment — is a public court record you can search through the county clerk. Sensitive contents such as financial affidavits and anything involving children are commonly sealed or restricted, and a few states limit online access to family cases entirely, requiring an in-person or mail request.'
      },
      {
        q: 'Can I look up someone\'s divorce for free?',
        a: 'Usually. Most county clerk of court and circuit clerk websites let you search case records at no charge, and many states run a free statewide portal. Obtaining certified copies normally costs a fee, and certified divorce certificates from a state vital-records office are typically issued only to the parties themselves or their attorneys.'
      },
      {
        q: 'What is the difference between separated and divorced?',
        a: 'Separated means living apart while still legally married — in most states this has no legal status at all. Legally separated is a court order dividing property and often setting support, but the marriage still exists and neither person may remarry. Divorced means a judge has signed a final judgment ending the marriage. Only the last one is actually divorced.'
      },
      {
        q: 'How long does a divorce usually take?',
        a: 'It varies enormously. An uncontested divorce in a state with a short waiting period can finish in a couple of months; a contested one involving property or custody disputes commonly runs one to three years. Many states also impose a mandatory waiting period between filing and final judgment. This is why "it is being finalized" can be true for a very long time — and also why it is a convenient thing to say.'
      },
      {
        q: 'Is it wrong to date someone who is separated but not divorced?',
        a: 'It is legal in the sense that dating is not a crime, but they are still married, and in a small number of states that still consider fault, a new relationship can become an issue in their divorce case. The practical risks are more common than the legal ones: unresolved property, an open reconciliation, and a case that can get harder because of you. Ask where things actually stand, and consider waiting until the judgment is signed.'
      }
    ),

    note('A note on this page', NOT_LEGAL_ADVICE)
  ]
};

// ---------------------------------------------------------------------------

const datingAfterDivorceAt50: Article = {
  slug: 'dating-after-divorce-at-50',
  title: 'Dating after divorce at 50',
  metaTitle: 'Dating After Divorce at 50: An Honest Guide | Haply',
  description:
    'Dating after divorce at 50 is not dating at 25 with worse knees. When you are actually ready, what to tell your kids, where people meet, and the risks nobody warns you about.',
  published: '2026-08-03',
  updated: '2026-08-03',
  dek: 'Nobody is starting over. You are starting from here, which is a different and mostly better thing.',
  cardLine: 'Readiness, kids, where people actually meet, and the risks specific to dating in your fifties.',
  blocks: [
    p(
      'The advice written for people dating in their twenties is close to useless at fifty, because almost none of the inputs are the same. You have a history that takes real time to explain. You may have children whose opinion carries weight. You have assets, and possibly a support order. You have a settled life that a new person would have to fit into rather than merge with. And you have something you did not have at twenty-five: a very clear sense of what you will not put up with again.'
    ),
    p('That last one is the actual advantage, and most of this guide is about not squandering it.'),

    h2('How long should you wait?'),
    p(
      'There is no correct number of months, and anyone who gives you one is guessing. The useful question is not how much time has passed but what you are looking for a new person to do.'
    ),
    p('Some honest signals that you are ready:'),
    ul(
      'You can tell the story of your marriage ending without needing the listener to take your side.',
      'An evening alone is sometimes fine, rather than something to be escaped.',
      'You are curious about other people, rather than mainly wanting to be chosen.',
      'You would still be all right if the first several attempts went nowhere.'
    ),
    p('Some honest signals that you are not, yet:'),
    ul(
      'Your ex comes up in the first hour, every time.',
      'You are dating primarily to demonstrate something — to them, to friends, or to yourself.',
      'The prospect of no one being interested feels unsurvivable rather than disappointing.',
      'You want the new person to fix the loneliness rather than join a life that already works.'
    ),
    p(
      'None of these are disqualifying and none are permanent. But going out while the second list is true tends to produce a specific and painful outcome: an intense few months with someone chosen for their availability rather than their suitability, followed by a second ending that hurts more than it should have.'
    ),

    h2('Telling your children'),
    p(
      'This is the part people most often get wrong, and it splits sharply by the children\'s age.'
    ),
    h3('Younger children'),
    p(
      'Do not introduce anyone until the relationship is serious and stable — months, not weeks. Young children attach quickly and grieve a departure they were not warned about. The first meeting should be brief, in a public place, framed as a friend, with no expectations attached.'
    ),
    h3('Adult children'),
    p(
      'Counterintuitively, this is often harder. Adult children may have a fixed narrative about the divorce, may feel protective of the other parent, and may have opinions about inheritance that they will express as opinions about your judgment. Tell them directly rather than letting them discover it, do not ask permission, and do not defend yourself. "I have met someone I like and I wanted you to hear it from me" is a complete sentence.'
    ),
    p(
      'Their first reaction is very often not their settled one. Give it a few months before concluding anything about how this will go.'
    ),

    h2('Where people actually meet at 50'),
    p(
      'Apps work, and they work differently than they do for younger people. The pool is smaller, so volume strategies fail; but intent is higher, so the conversations that do start tend to go somewhere.'
    ),
    ul(
      'Interest-first settings — a class, a hiking group, volunteering, a choir — remain the highest-yield route at this age, because they solve the hardest problem, which is having something to do together and something to talk about.',
      'Being visibly available to your existing network matters more than people expect. A great many introductions at this age come from friends who simply did not know you were open to it.',
      'General-purpose apps have the largest pool and the most noise. Apps and communities aimed at divorced or older daters have a smaller pool and much less explaining to do.',
      'Divorce-specific communities are worth a look even if you are not dating yet — the people there are in the same phase, and it is a low-stakes way to be around others who understand it.'
    ),

    h2('The risks specific to this age group'),
    h3('Romance scams'),
    p(
      'Divorced and widowed people over fifty are among the most heavily targeted groups for romance fraud, and the losses are frequently life-altering. The pattern is consistent enough to be worth memorising: they are unusually attractive and unusually attentive; they are working abroad, on an oil rig, in the military, or otherwise conveniently unreachable; they move to a private messaging app quickly; they always have a reason not to video call; declarations of love come implausibly fast; and eventually there is an emergency requiring money, or an investment opportunity that is doing very well.'
    ),
    p(
      'The single rule that defeats essentially all of it: never send money, cryptocurrency, or gift cards to someone you have not met in person, no matter how well you feel you know them or how urgent it sounds. Nobody legitimate will ever ask.'
    ),
    h3('People who are not actually divorced'),
    p(
      'Common enough at this age to be worth checking rather than assuming. Ask when it was final and which county — a divorced person answers instantly.'
    ),
    h3('Money and legal exposure'),
    p(
      'Two things worth knowing before it becomes relevant. In many states, spousal support obligations can end or be modified on remarriage, and in some states on cohabitation as well — meaning a decision about moving in together can have a real financial consequence. And anything you accumulate with a new partner without documentation can become genuinely difficult to untangle. Neither is a reason not to build a life with someone. Both are reasons to ask your attorney a couple of specific questions first, and to keep finances separate until you have decided deliberately not to.'
    ),
    h3('Moving too fast'),
    p(
      'At fifty there is a strong pull to accelerate — the sense of a shorter runway, the ease of two established people slotting together, the sheer relief of not being alone. Relationships formed at speed in the first year after a divorce have a high failure rate for a reason. Nothing is lost by taking a year.'
    ),

    h2('Health conversations'),
    p(
      'Two short, unglamorous points. Sexually transmitted infection rates among adults over fifty have risen substantially in many countries, and this is a cohort that largely stopped having the conversation decades ago. Have it, get tested, and treat it as ordinary rather than an accusation. Separately, mismatched expectations about sex — frequency, interest, the effect of medications and menopause — sink more relationships at this age than at any other, and the only fix is being able to talk about it plainly.'
    ),

    h2('What actually goes well'),
    p(
      'It is worth saying, because the guides tend to be relentlessly cautionary. Dating at fifty has real advantages. You can tell within one conversation whether someone is a serious person. You are not auditioning for a shared future you have to construct from nothing — you both already have lives, and the question is whether they fit. There is far less performance. And the people you meet have also been through something, which tends to produce a directness and a kindness that is genuinely rare in younger dating.'
    ),
    p('The bar is higher and the tolerance for nonsense is lower. That is a good trade.'),

    faq(
      {
        q: 'How long after a divorce should you wait before dating?',
        a: 'There is no fixed period, and the calendar is the wrong measure. A more useful test is whether you can talk about the marriage ending without needing the other person to take your side, whether time alone is sometimes fine rather than something to escape, and whether you would be all right if the first few attempts went nowhere. Many people find the first year is better spent rebuilding a life than looking for a partner.'
      },
      {
        q: 'When should I introduce a new partner to my children?',
        a: 'For younger children, not until the relationship is serious and stable — a matter of months, not weeks — and then briefly, in a public place, with no pressure attached. For adult children, tell them directly rather than letting them find out, do not ask permission, and expect that their first reaction may not be their settled one.'
      },
      {
        q: 'Is dating after 50 harder?',
        a: 'The pool is smaller and lives are more established, so it takes longer to meet someone suitable. But intent is much higher, the conversations are more direct, and most people at this age can tell within one meeting whether it is worth a second. Fewer options, less wasted time.'
      },
      {
        q: 'How do I avoid romance scams?',
        a: 'Watch for a fast-moving, unusually attentive person who cannot video call and cannot meet — typically working abroad, offshore, or overseas in the military — who moves you to a private messaging app early and eventually raises a financial emergency or an investment opportunity. The reliable rule is simply never to send money, cryptocurrency, or gift cards to anyone you have not met in person. A reverse image search of their photos also catches a large share of them.'
      },
      {
        q: 'Does dating affect alimony or spousal support?',
        a: 'It can. In many states support obligations end on remarriage, and in some they can be reduced or terminated on cohabitation with a new partner. The rules differ significantly by state and by what your own order says, so this is worth one specific question to a family-law attorney before you move in with someone rather than after.'
      }
    ),

    note('A note on this page', NOT_LEGAL_ADVICE)
  ]
};

// ---------------------------------------------------------------------------

const separatedButNotDivorced: Article = {
  slug: 'separated-but-not-divorced',
  title: 'Separated but not divorced: should you date them?',
  metaTitle: 'Separated but Not Divorced: Should You Date Them? | Haply',
  description:
    'What "separated" actually means legally, the questions to ask before you get involved, and how to tell a genuine in-progress divorce from one that is never going to finish.',
  published: '2026-08-03',
  updated: '2026-08-03',
  dek: 'Sometimes it is a technicality waiting on a court date. Sometimes it is a marriage with a story attached. Here is how to tell which.',
  cardLine: 'The legal difference, the questions to ask, and how to spot a divorce that is never going to finish.',
  blocks: [
    p(
      'Someone you like is separated. They are open about it, the marriage sounds genuinely over, and the divorce is "in progress." The question is whether that is a detail or a problem.'
    ),
    p(
      'The honest answer is that it is sometimes each, and the difference is usually knowable within one conversation.'
    ),

    h2('What "separated" actually means'),
    p('The word covers at least three quite different legal situations.'),
    h3('Informal separation'),
    p(
      'They live apart. Nothing has been filed and no court is involved. In most states this carries no legal weight at all: they are married, and depending on the state, property and debt accumulated during the separation may still be marital property. Some states do treat the date of separation as significant for dividing assets; many do not.'
    ),
    h3('Legal separation'),
    p(
      'A court order, available in many but not all states. A judge has divided property and often set support and custody. It looks a great deal like a divorce with one crucial difference: the marriage still exists, and neither spouse can remarry. Some couples stop here deliberately and permanently — for health insurance, religious reasons, or to preserve a benefit tied to a length of marriage — and have no intention of ever divorcing.'
    ),
    h3('Divorce filed and pending'),
    p(
      'A petition is in and the case is open. Timelines range from a couple of months in an uncontested case to several years in a contested one, and many states add a mandatory waiting period on top. They are married until a judge signs the final judgment.'
    ),
    note(
      'The distinction that matters most',
      'A pending divorce has a case number and an end. A legal separation with no petition filed may have neither. Both are described as "separated" in conversation, and they are not the same situation at all.'
    ),

    h2('What actually changes for you'),
    ul(
      'They are legally married. Whatever else is true, that is true.',
      'Their property and debt are not yet divided, so their financial picture can still change substantially — sometimes drastically.',
      'Reconciliation is still available in a way it is not after a judgment. A meaningful number of pending divorces are withdrawn.',
      'In the minority of states that still consider fault, a new relationship can become an issue in their case — occasionally affecting the settlement, more often just making the case nastier and slower.',
      'If children are involved, custody is often unresolved, and a new partner appearing during that process can genuinely complicate it.'
    ),
    p(
      'None of these makes it wrong. They are the actual contents of the situation, and you are entitled to know them before deciding.'
    ),

    h2('The questions to ask'),
    p('Ask these early, plainly, and without apology. Someone whose divorce is genuinely proceeding will answer them without difficulty.'),
    ul(
      '"Has a petition actually been filed?" This is the single most informative question on the page. Filed or not filed is a fact, not an opinion.',
      '"When was it filed, and what is the next court date?" A live case has dates attached to it.',
      '"Is it contested? What is the sticking point?" People in a real divorce know exactly what the fight is about.',
      '"Do you both have attorneys?" Not required, but a strong signal of how real it is.',
      '"Where are you each living?" Still under one roof happens for genuine financial reasons, and it also changes what you are stepping into.',
      '"What does your attorney say about you dating right now?" A serious answer here tells you they have thought about the consequences.'
    ),
    p(
      'The tell is specificity. A divorce that is really happening is a bureaucratic ordeal with dates, forms, costs and a named point of conflict, and people going through it describe it in that kind of detail — usually wearily. A divorce that is not happening is described in feelings and intentions.'
    ),

    h2('Signs it is genuinely in progress'),
    ul(
      'A case has been filed and they can tell you roughly when.',
      'They live separately, or there is a concrete plan with a date attached.',
      'They can name the specific unresolved issue — the house, the pension, the parenting schedule.',
      'They talk about their ex without heat, or with the flat weariness of someone in month fourteen.',
      'Their friends and family know the marriage is over.',
      'They are not asking you to be a secret.'
    ),

    h2('Signs to walk away from'),
    ul(
      'Nothing has been filed, and there is always a reason why not.',
      'The timeline has moved more than twice.',
      'They still live with their spouse and describe the arrangement as temporary, indefinitely.',
      'Your existence is a secret, and the reason keeps changing.',
      'The ex is described as an active enemy in the present tense, several times a week. Whatever that is, it is not finished.',
      'They want the relationship to move quickly. Somebody in the middle of a divorce who wants intensity right now is usually looking for anaesthetic.'
    ),

    h2('If you decide to go ahead'),
    p('Some of these situations are completely fine. If you are going ahead, a few things make it much less likely to go badly:'),
    ol(
      'Move slowly. There is no version of this improved by speed.',
      'Keep your finances entirely separate until the judgment is signed. No lending, no joint purchases, no co-signing.',
      'Do not move in together before it is final, if you can possibly avoid it — in some states this is a live issue in the case.',
      'Stay out of the divorce. Do not communicate with the spouse, do not appear in the litigation, and do not offer opinions about the settlement.',
      'Be careful about meeting the children while custody is unresolved.',
      'Set a private line for yourself — a date by which there should be visible progress — and pay attention if it passes.'
    ),

    h2('The uncomfortable version'),
    p(
      'A pending divorce is a reasonable thing to date around. An indefinitely pending divorce is usually a decision that has been made and not announced. If it has been two years, nothing has been filed, and the explanation changes each time you ask, the most likely reading is not that the paperwork is slow.'
    ),
    p(
      'You are allowed to want the finished version. That is not being demanding, and it costs nothing to say out loud.'
    ),

    faq(
      {
        q: 'Is it illegal to date while separated?',
        a: 'Dating while separated is not a crime anywhere in the US. But the person is still legally married, and in the minority of states that still consider fault in divorce, a new relationship can be raised in their case. More commonly the effect is practical rather than legal: it can make an already difficult case slower and more hostile.'
      },
      {
        q: 'What is the difference between legal separation and divorce?',
        a: 'A legal separation is a court order that can divide property and set support and custody, but the marriage still legally exists and neither spouse may remarry. A divorce ends the marriage entirely. Some couples choose legal separation permanently — for health insurance, religious reasons, or to preserve a benefit tied to length of marriage — and never intend to divorce at all.'
      },
      {
        q: 'How can I tell if their divorce is really happening?',
        a: 'Ask whether a petition has actually been filed, when, and what the next court date is. A live case has dates, costs, attorneys and a specific point of conflict, and people in one describe it in that concrete, weary detail. In most states you can also confirm that a case exists by searching the county court records portal yourself.'
      },
      {
        q: 'Should I wait until their divorce is final?',
        a: 'Waiting removes essentially every risk on this page and costs only time. If you do not want to wait, the practical protections are to keep finances entirely separate, avoid moving in together, stay completely out of the litigation, and be careful about meeting children while custody is unresolved.'
      },
      {
        q: 'Can dating during a divorce affect custody?',
        a: 'It can, though usually less than people fear. Courts are generally concerned with the children\'s stability rather than the parent\'s dating life, but introducing a new partner during an unresolved custody dispute can become a point of argument, and in some cases a court will address it directly. This is a question for their attorney, not for the internet.'
      }
    ),

    note('A note on this page', NOT_LEGAL_ADVICE)
  ]
};

export const ARTICLES: Article[] = [isHeReallyDivorced, separatedButNotDivorced, datingAfterDivorceAt50];
