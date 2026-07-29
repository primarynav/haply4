/**
 * Where a member is in the divorce journey, and the co-parenting facts that
 * actually decide compatibility for this audience.
 *
 * Every mainstream app treats "divorced" as a checkbox on a profile. It isn't a
 * state, it's a passage — someone six weeks out of a separation and someone four
 * years past a decree want completely different things from the same product.
 * Stage is captured once at onboarding, is changeable at any time, and decides
 * what the app puts in front of you: dating stays closed until a member says
 * they're ready, and nobody is nudged toward it.
 */

export type DivorceStage = 'separated' | 'healing' | 'ready';

export interface StageMeta {
  value: DivorceStage;
  label: string;
  blurb: string;
  icon: string;
  /** Whether the dating side of the product is offered at this stage. */
  datingAvailable: boolean;
  /** What the dashboard leads with for someone at this stage. */
  leadWith: 'community' | 'dating';
}

export const STAGES: StageMeta[] = [
  {
    value: 'separated',
    label: 'Just separated',
    blurb: "It's recent. I'm still working out what daily life looks like.",
    icon: 'filter_drama',
    datingAvailable: false,
    leadWith: 'community'
  },
  {
    value: 'healing',
    label: 'Finding my feet',
    blurb: "Past the worst of it. Rebuilding, not looking to date yet.",
    icon: 'self_improvement',
    datingAvailable: false,
    leadWith: 'community'
  },
  {
    value: 'ready',
    label: 'Open to dating',
    blurb: "I'd like to meet someone when the right person comes along.",
    icon: 'favorite',
    datingAvailable: true,
    leadWith: 'dating'
  }
];

export const stageMeta = (s: DivorceStage | null | undefined): StageMeta | undefined => STAGES.find((x) => x.value === s);

/** Dating is opt-in and stage-gated: never offered to someone who said they aren't there yet. */
export const datingAvailableForStage = (s: DivorceStage | null | undefined): boolean => stageMeta(s)?.datingAvailable ?? false;

/* ------------------------------------------------------------------ */
/* Co-parenting                                                        */
/* ------------------------------------------------------------------ */

export type CustodySchedule = 'none' | 'full_time' | 'most_time' | 'half_time' | 'some_time' | 'long_distance';
export type WantsMoreKids = 'yes' | 'no' | 'open';
export type KidsAgeBand = 'under5' | 'primary' | 'teen' | 'grown';

export const CUSTODY_OPTIONS: { value: CustodySchedule; label: string; hint: string }[] = [
  { value: 'none', label: 'No children', hint: '' },
  { value: 'full_time', label: 'With me full time', hint: 'Primary caregiver' },
  { value: 'most_time', label: 'With me most of the time', hint: 'Majority custody' },
  { value: 'half_time', label: 'Roughly 50/50', hint: 'Shared custody' },
  { value: 'some_time', label: 'Every other weekend or so', hint: 'Minority custody' },
  { value: 'long_distance', label: 'Long distance', hint: 'Different city or state' }
];

export const KIDS_AGE_BANDS: { value: KidsAgeBand; label: string }[] = [
  { value: 'under5', label: 'Under 5' },
  { value: 'primary', label: '5–12' },
  { value: 'teen', label: '13–17' },
  { value: 'grown', label: '18+' }
];

export const WANTS_MORE_OPTIONS: { value: WantsMoreKids; label: string }[] = [
  { value: 'no', label: "I'm done having kids" },
  { value: 'open', label: 'Open to it' },
  { value: 'yes', label: "I'd like more" }
];

export interface CoParenting {
  kidsAtHome?: boolean;
  kidsAgeBands?: KidsAgeBand[];
  custodySchedule?: CustodySchedule;
  wantsMoreKids?: WantsMoreKids;
}

export const custodyLabel = (c: CustodySchedule | null | undefined): string => CUSTODY_OPTIONS.find((o) => o.value === c)?.label ?? '';
export const wantsMoreLabel = (w: WantsMoreKids | null | undefined): string => WANTS_MORE_OPTIONS.find((o) => o.value === w)?.label ?? '';

/**
 * How well two people's parenting lives fit. Deliberately not a score out of
 * 100 — it names the one thing that would matter on a first date, or says
 * nothing at all. A hard conflict is only ever about wanting more children,
 * which is the single question people most often discover too late.
 */
export function coParentingNote(mine: CoParenting, theirs: CoParenting): { text: string; conflict: boolean } | null {
  if (mine.wantsMoreKids && theirs.wantsMoreKids) {
    const iWant = mine.wantsMoreKids === 'yes';
    const theyWant = theirs.wantsMoreKids === 'yes';
    const iDont = mine.wantsMoreKids === 'no';
    const theyDont = theirs.wantsMoreKids === 'no';
    if ((iWant && theyDont) || (iDont && theyWant)) {
      return { text: 'You want different things about having more children', conflict: true };
    }
    if (iDont && theyDont) return { text: 'Neither of you wants more children', conflict: false };
    if (iWant && theyWant) return { text: 'You both want more children', conflict: false };
  }
  if (mine.custodySchedule && theirs.custodySchedule && mine.custodySchedule === theirs.custodySchedule && mine.custodySchedule !== 'none') {
    return { text: `You both have kids ${custodyLabel(mine.custodySchedule).toLowerCase()}`, conflict: false };
  }
  return null;
}
