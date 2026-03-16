export const VALID_COACH_IDS = ['visian', 'dit_sap', 'one_by_one', 'buffalow', 'tftiseasy'] as const;
export type CoachId = (typeof VALID_COACH_IDS)[number];

export const DEFAULT_COACH_ID: CoachId = 'visian';

export const COACH_NOTEBOOK_IDS: Record<CoachId, string> = {
  visian: '2c208255-a880-48db-924d-f106cd340256',
  dit_sap: '87d04732-612e-4000-8d67-599a2fafd700',
  one_by_one: 'cb28f7a2-cf9b-4ec4-b39b-162b2707ea55',
  buffalow: 'c348c743-20c5-421e-b909-9a1b82873e28',
  tftiseasy: '06f9ca46-d3bc-4040-8d57-3afe462a362d',
};

const OUTPUT_RULE = [
  'Tra loi dung 2 dong, khong markdown, khong tu gioi thieu, khong them next step.',
  'Dong 1: Pick: <ten lua chon>.',
  'Dong 2: Giai thich: <2-4 cau ngan gon, di thang vao ly do>.',
  'Khong dung Tai sao, Why, hay muc khac.',
].join(' ');

const COACH_PROMPTS: Record<CoachId, string> = {
  visian: 'Uu tien suc manh round hien tai va giu mau.',
  dit_sap: 'Uu tien nuoc mo nhieu huong choi nhung khong tu khoa bai qua som.',
  one_by_one: 'Uu tien nuoc dung nhat voi board va item hien tai.',
  buffalow: 'Uu tien nuoc on dinh, giu mau, de top 4.',
  tftiseasy: 'Uu tien nuoc de choi, de hieu, de chuyen bai.',
};

export interface GameContext {
  stage?: string;
  comp?: string;
  gold?: number;
  level?: number;
  hp?: number;
  decisionType?: 'augment' | 'path' | 'plan';
  decisionLabel?: string;
  proChoiceId?: string;
  proChoiceLabel?: string;
  currentDecisionOptions?: Array<{ title?: string | null; subtitle?: string | null }>;
  currentAugments?: string[];
  currentAugmentOptions?: Array<{ title?: string | null }>;
  chosenAugments?: string[];
  synergies?: string[];
  boardChampions?: string[];
  items?: string[];
}

function cleanString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function compactList(values: unknown, limit: number): string[] {
  if (!Array.isArray(values)) return [];

  return values
    .map(cleanString)
    .filter((value): value is string => value !== null)
    .slice(0, limit);
}

function compactCurrentAugments(ctx: GameContext): string[] {
  const directValues = compactList(ctx.currentAugments, 3);
  if (directValues.length > 0) return directValues;

  if (!Array.isArray(ctx.currentAugmentOptions)) return [];
  return ctx.currentAugmentOptions
    .map((option) => cleanString(option?.title))
    .filter((value): value is string => value !== null)
    .slice(0, 3);
}

function compactDecisionOptions(ctx: GameContext): string[] {
  if (Array.isArray(ctx.currentDecisionOptions)) {
    const decisionValues = ctx.currentDecisionOptions
      .map((option) => cleanString(option?.title))
      .filter((value): value is string => value !== null)
      .slice(0, 4);

    if (decisionValues.length > 0) {
      return decisionValues;
    }
  }

  return compactCurrentAugments(ctx);
}

function normalizeCacheToken(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function slugToken(value: string | null): string | null {
  if (!value) return null;
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || null;
}

function pushStringPart(parts: string[], label: string, value: unknown) {
  const cleanValue = cleanString(value);
  if (cleanValue) {
    parts.push(`${label}=${cleanValue}`);
  }
}

function pushNumberPart(parts: string[], label: string, value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    parts.push(`${label}=${value}`);
  }
}

function pushListPart(parts: string[], label: string, values: string[]) {
  if (values.length > 0) {
    parts.push(`${label}=${values.join(', ')}`);
  }
}

function buildDecisionInstruction(decisionType?: GameContext['decisionType']): string {
  if (decisionType === 'path') {
    return 'Chot huong augment tot nhat tu cac lua chon dang co.';
  }

  if (decisionType === 'plan') {
    return 'Chot ke hoach tot nhat tu cac lua chon dang co.';
  }

  return 'Chot lua chon augment tot nhat tu cac option dang co.';
}

function getStageBucket(stage?: string): 'early' | 'mid' | 'late' | 'unknown' {
  if (!stage) return 'unknown';
  const match = stage.match(/^(\d+)-/);
  const round = match ? Number.parseInt(match[1], 10) : Number.NaN;

  if (!Number.isFinite(round)) return 'unknown';
  if (round <= 2) return 'early';
  if (round <= 4) return 'mid';
  return 'late';
}

export function buildCoachSourceGroups(coachId: CoachId, gameContext: GameContext | null): string[] {
  const groups: string[] = [];
  const pushGroup = (value: string | null) => {
    if (!value || groups.includes(value)) return;
    groups.push(value);
  };

  const decisionType = cleanString(gameContext?.decisionType) ?? 'augment';
  const stage = cleanString(gameContext?.stage);
  const stageBucket = getStageBucket(stage ?? undefined);
  const compSlug = slugToken(cleanString(gameContext?.comp));

  pushGroup(`coach:${coachId}`);
  pushGroup('shared:coach');
  pushGroup(`shared:decision:${decisionType}`);
  pushGroup(`coach:${coachId}:decision:${decisionType}`);

  if (stage) {
    pushGroup(`shared:stage:${stage}`);
    pushGroup(`coach:${coachId}:stage:${stage}`);
  }

  if (stageBucket !== 'unknown') {
    pushGroup(`shared:stage-bucket:${stageBucket}`);
    pushGroup(`coach:${coachId}:stage-bucket:${stageBucket}`);
  }

  if (compSlug) {
    pushGroup(`shared:comp:${compSlug}`);
    pushGroup(`coach:${coachId}:comp:${compSlug}`);
  }

  return groups;
}

export function isValidCoachId(value: unknown): value is CoachId {
  return typeof value === 'string' && VALID_COACH_IDS.includes(value as CoachId);
}

export function resolveCoachId(value: unknown): CoachId {
  return isValidCoachId(value) ? value : DEFAULT_COACH_ID;
}

export function serializeCompactGameContext(ctx: GameContext | null): string {
  if (!ctx) return '';

  const parts: string[] = [];
  pushStringPart(parts, 'stage', ctx.stage);
  pushStringPart(parts, 'comp', ctx.comp);
  pushNumberPart(parts, 'gold', ctx.gold);
  pushNumberPart(parts, 'level', ctx.level);
  pushNumberPart(parts, 'hp', ctx.hp);
  pushStringPart(parts, 'decision', ctx.decisionType);
  pushListPart(parts, 'options', compactDecisionOptions(ctx));

  return parts.join(' | ');
}

export function serializeCoachCacheContext(ctx: GameContext | null): string {
  if (!ctx) return '';

  const parts: string[] = [];

  const stage = cleanString(ctx.stage);
  if (stage) {
    parts.push(`stage=${normalizeCacheToken(stage)}`);
  }

  const comp = cleanString(ctx.comp);
  if (comp) {
    parts.push(`comp=${normalizeCacheToken(comp)}`);
  }

  if (typeof ctx.gold === 'number' && Number.isFinite(ctx.gold)) {
    parts.push(`gold=${ctx.gold}`);
  }

  if (typeof ctx.level === 'number' && Number.isFinite(ctx.level)) {
    parts.push(`level=${ctx.level}`);
  }

  if (typeof ctx.hp === 'number' && Number.isFinite(ctx.hp)) {
    parts.push(`hp=${ctx.hp}`);
  }

  const decisionType = cleanString(ctx.decisionType);
  if (decisionType) {
    parts.push(`decision=${normalizeCacheToken(decisionType)}`);
  }

  const options = compactDecisionOptions(ctx)
    .map(normalizeCacheToken)
    .filter((value) => value.length > 0);

  if (options.length > 0) {
    parts.push(`options=${options.join(',')}`);
  }

  return parts.join('|');
}

export function buildCoachSelectQuery(coachId: CoachId, question: string, gameContext: GameContext | null): string {
  const prompt = [
    buildDecisionInstruction(gameContext?.decisionType),
    COACH_PROMPTS[coachId],
    OUTPUT_RULE,
  ].join('\n');
  const context = serializeCompactGameContext(gameContext);
  const normalizedQuestion = cleanString(question) ?? '';

  return [
    prompt,
    context ? `Ctx=${context}` : '',
    normalizedQuestion ? `Q=${normalizedQuestion}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildCoachExplainQuery(coachId: CoachId, question: string, gameContext: GameContext | null): string {
  const context = serializeCompactGameContext(gameContext);
  const normalizedQuestion = cleanString(question) ?? '';
  const proPick = cleanString(gameContext?.proChoiceLabel) ?? '';
  const prompt = [
    'Giai thich ngan vi sao lua chon da cho la dung nhat trong spot nay.',
    COACH_PROMPTS[coachId],
    `Khong doi lua chon. Khong neu option khac. Dong 1 bat buoc la Pick: ${proPick || '<ten lua chon da cho>'}. ` + OUTPUT_RULE,
  ].join('\n');

  return [
    prompt,
    proPick ? `ProPick=${proPick}` : '',
    context ? `Ctx=${context}` : '',
    normalizedQuestion ? `Q=${normalizedQuestion}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}
