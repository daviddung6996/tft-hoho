import { puzzleService } from '../services/puzzleService';
import { PuzzleScenario, OpponentData, AugmentPath } from '../data/puzzleScenarios';
import { supabase } from '../lib/supabase';

// ─── CDN helpers ───────────────────────────────────────────
const champImg = (id: string) =>
    `https://raw.communitydragon.org/latest/game/assets/characters/${id.toLowerCase()}/hud/${id.toLowerCase()}_square.tft_set16.png`;
const augIcon = (name: string) =>
    `https://raw.communitydragon.org/pbe/game/assets/maps/tft/icons/augments/hexcore/${name}.tft_set16.png`;

// ─── Augment catalog ───────────────────────────────────────
type Aug = { id: string; title: string; description: string; icon: string; tier: 1 | 2 | 3 };
const A: Record<string, Aug> = {
    // Tier 1
    clearMind:     { id: 'TFT6_Augment_ClearMind',           title: 'Clear Mind',           description: 'Bench trống → +3g/round.',       icon: augIcon('clearmind'),         tier: 2 },
    carvePath:     { id: 'TFT_Augment_ComponentQuestSword',  title: 'Carve a Path',         description: 'Nhận BF Sword. +5 AD/round.',    icon: augIcon('carveapath'),        tier: 1 },
    celestial1:    { id: 'TFT6_Augment_CelestialBlessing1',  title: 'Celestial Blessing I', description: 'Hồi 15% damage dealt.',          icon: augIcon('celestialblessing1'),tier: 1 },
    backupBows:    { id: 'TFT_Augment_ComponentQuestBow',     title: 'Backup Bows',         description: 'Nhận Recurve Bow. +5% AS.',      icon: augIcon('backupbows'),        tier: 1 },
    efficientShop: { id: 'TFT_Augment_EfficientShopper',      title: 'Efficient Shopper',   description: 'Nhận 5g. Shop cost cao hơn.',    icon: augIcon('efficientshopper'),  tier: 1 },
    onARoll:       { id: 'TFT_Augment_Waverider',             title: 'On a Roll',           description: 'Win streak +1g/round.',           icon: augIcon('onaroll'),           tier: 1 },
    bandThieves1:  { id: 'TFT7_Augment_BandOfThieves1',       title: 'Band of Thieves',     description: 'Nhận 2 component items.',        icon: augIcon('bandofthieves1'),    tier: 1 },
    dummify:       { id: 'TFT_Augment_Dummify',               title: 'Dummify',             description: 'Nhận Target Dummy.',             icon: augIcon('dummify'),           tier: 1 },
    findCenter:    { id: 'TFT_Augment_FindYourCenter',        title: 'Find Your Center',    description: 'Unit trung tâm +30 AP.',         icon: augIcon('findyourcenter'),    tier: 1 },
    glassCannon1:  { id: 'TFT_Augment_GlassCannonI',          title: 'Glass Cannon I',      description: '+25% dmg, -15% max HP.',         icon: augIcon('glasscannon1'),      tier: 1 },
    pandora:       { id: 'TFT6_Augment_PandorasItems',        title: "Pandora's Items",     description: 'Items biến đổi mỗi round.',     icon: augIcon('pandorasitems'),     tier: 1 },
    ironAssets:    { id: 'TFT9_Augment_IronAssets',            title: 'Iron Assets',         description: 'Component + 10% AS, +10 AP.',   icon: augIcon('ironassets'),        tier: 1 },
    smallForge:    { id: 'TFT_Augment_ComponentGrabBag',       title: 'Component Grab Bag', description: 'Nhận 2 random components.',       icon: augIcon('componentgrabbag'),  tier: 1 },
    tinylords:     { id: 'TFT_Augment_TinyTitans',            title: 'Tiny Titans',         description: '+100 HP.',                       icon: augIcon('tinytitans'),        tier: 1 },
    tradeKnow:     { id: 'TFT_Augment_TradeKnowledge',        title: 'Trade Knowledge',     description: 'Nhận 2 XP. +Free reroll.',      icon: augIcon('tradeknowledge'),    tier: 1 },
    marchOfProg:   { id: 'TFT_Augment_MarchOfProgress',       title: 'March of Progress',   description: '+3 XP/round. Không thể mua XP.',icon: augIcon('marchofprogress'),   tier: 1 },
    lategameSpec:  { id: 'TFT_Augment_LateGameSpecialist',     title: 'Late Game Specialist',description: 'Nhận 5g. +3g nếu level 8+.',   icon: augIcon('lategamespecialist'),tier: 1 },
    richGetRich:   { id: 'TFT_Augment_RichGetRicher',          title: 'Rich Get Richer',    description: 'Nhận 12g. Max interest 7g.',    icon: augIcon('richgetricher'),     tier: 1 },
    // Tier 2
    calcLoss:      { id: 'TFT6_Augment_CalculatedLoss',       title: 'Calculated Loss',     description: 'Thua → +3g và +3 XP.',           icon: augIcon('calculatedloss'),    tier: 2 },
    arcaneViktory: { id: 'TFT_Augment_ArcaneViktory',         title: 'Arcane Viktor-y',     description: 'Nhận Viktor. +50 AP.',           icon: augIcon('arcaneviktory'),     tier: 2 },
    advLoan:       { id: 'TFT_Augment_AdvancedLoan',          title: 'Advanced Loan',       description: 'Nhận 20g, trả 5g/round.',       icon: augIcon('advancedloan'),      tier: 2 },
    glassCannon2:  { id: 'TFT_Augment_GlassCannonII',         title: 'Glass Cannon II',     description: '+40% dmg, -20% max HP.',         icon: augIcon('glasscannon2'),      tier: 2 },
    ascension:     { id: 'TFT6_Augment_Ascension',            title: 'Ascension',           description: 'Sau 15s, +75% damage.',          icon: augIcon('ascension'),         tier: 2 },
    advLoanPlus:   { id: 'TFT_Augment_AdvancedLoanPlus',      title: 'Advanced Loan+',      description: 'Nhận 30g, trả 5g/round.',       icon: augIcon('advancedloanplus'),  tier: 2 },
    bwEmblem:      { id: 'TFT16_Item_BilgewaterEmblemItem',    title: 'Bilgewater Crown',    description: 'Nhận BW Emblem.',                icon: augIcon('bilgewateremblem'),  tier: 2 },
    epicRolldown:  { id: 'TFT_Augment_EpicRolldown',          title: 'Epic Rolldown',       description: 'Nhận 12g. Free reroll.',         icon: augIcon('epicrolldown'),      tier: 2 },
    bodyguard:     { id: 'TFT_Augment_BodyguardTraining',      title: 'Bodyguard Training',  description: '+20 Armor toàn team.',           icon: augIcon('bodyguardtraining'), tier: 2 },
    celestial2:    { id: 'TFT6_Augment_CelestialBlessing2',   title: 'Celestial Blessing II',description: 'Hồi 25% damage dealt.',        icon: augIcon('celestialblessing2'),tier: 2 },
    firstAid:      { id: 'TFT_Augment_FirstAidKit',           title: 'First Aid Kit',       description: '+25 Armor, +25 MR.',            icon: augIcon('firstaidkit'),       tier: 2 },
    twinTerror:    { id: 'TFT_Augment_TwinTerror',             title: 'Twin Terror',        description: 'Clone unit cost cao nhất.',     icon: augIcon('twinterror'),        tier: 2 },
    // Tier 3
    hedgeFund:     { id: 'TFT9_Augment_HedgeFund',            title: 'Hedge Fund',          description: 'Nhận 15g. Lãi suất max +3.',    icon: augIcon('hedgefund'),         tier: 3 },
    holdLine:      { id: 'TFT_Augment_HoldTheLine',           title: 'Hold the Line',       description: 'Frontline +30 AR, +30 MR.',     icon: augIcon('holdtheline'),       tier: 3 },
    coronation:    { id: 'TFT_Augment_Coronation',            title: 'Coronation',          description: 'Unit cost cao nhất nhận item.', icon: augIcon('coronation'),        tier: 3 },
    bandThieves2:  { id: 'TFT6_Augment_BandOfThieves2',       title: 'Band of Thieves II',  description: 'Nhận 2 full items.',             icon: augIcon('bandofthieves2'),    tier: 3 },
    forgedStrength:{ id: 'TFT_Augment_ForgedInStrength',       title: 'Forged in Strength',  description: '3★ units +60 AD, +60 AP.',      icon: augIcon('forgedinstrength'),  tier: 3 },
    goldenTicket:  { id: 'TFT_Augment_GoldenTicket',           title: 'Golden Ticket',      description: 'Free rerolls vĩnh viễn.',      icon: augIcon('goldenticket'),      tier: 3 },
};

// ─── Unit & opponent helpers ───────────────────────────────
type U = { cid: string; n: string; r: number; c: number; cost: number; s: number; itm?: string[] };
const mkUnit = (u: U) => ({
    id: `${u.n}-${u.r}-${u.c}`, name: u.n, cost: u.cost, stars: u.s,
    row: u.r, col: u.c, image: champImg(u.cid), items: u.itm || [],
});
const mkOpp = (id: string, name: string, hp: number, gold: number, level: number, board: U[]): OpponentData => ({
    id, name, state: { hp, gold, level, xp: 0 }, board: board.map(mkUnit), bench: [],
});

// ─── 7 opponents per puzzle (reusable pools) ───────────────
const earlyOpps = (hp: number[]): OpponentData[] => [
    mkOpp('opp-1', 'Soju小辉', hp[0], 5, 3, [
        { cid: 'TFT16_Illaoi', n: 'Illaoi', r: 0, c: 3, cost: 1, s: 2 },
        { cid: 'TFT16_Sona', n: 'Sona', r: 0, c: 4, cost: 1, s: 1 },
        { cid: 'TFT16_Kennen', n: 'Kennen', r: 1, c: 3, cost: 1, s: 1 },
    ]),
    mkOpp('opp-2', 'MilkCha', hp[1], 4, 3, [
        { cid: 'TFT16_Garen', n: 'Garen', r: 0, c: 3, cost: 1, s: 2 },
        { cid: 'TFT16_Annie', n: 'Annie', r: 0, c: 4, cost: 1, s: 1 },
    ]),
    mkOpp('opp-3', 'BoxBox', hp[2], 3, 3, [
        { cid: 'TFT16_Briar', n: 'Briar', r: 0, c: 3, cost: 1, s: 1 },
        { cid: 'TFT16_Rumble', n: 'Rumble', r: 0, c: 4, cost: 1, s: 1 },
        { cid: 'TFT16_Graves', n: 'Graves', r: 1, c: 3, cost: 1, s: 1 },
    ]),
    mkOpp('opp-4', 'Frodan', hp[3], 6, 3, [
        { cid: 'TFT16_Shen', n: 'Shen', r: 0, c: 3, cost: 2, s: 1 },
        { cid: 'TFT16_Viego', n: 'Viego', r: 0, c: 4, cost: 2, s: 1 },
    ]),
    mkOpp('opp-5', 'Kiyoon', hp[4], 5, 3, [
        { cid: 'TFT16_Garen', n: 'Garen', r: 0, c: 2, cost: 1, s: 1 },
        { cid: 'TFT16_Illaoi', n: 'Illaoi', r: 0, c: 4, cost: 1, s: 1 },
    ]),
    mkOpp('opp-6', 'Bebe872', hp[5], 4, 3, [
        { cid: 'TFT16_Kennen', n: 'Kennen', r: 0, c: 3, cost: 1, s: 1 },
        { cid: 'TFT16_Briar', n: 'Briar', r: 1, c: 3, cost: 1, s: 2 },
    ]),
    mkOpp('opp-7', 'Keane', hp[6], 3, 3, [
        { cid: 'TFT16_Sona', n: 'Sona', r: 0, c: 3, cost: 1, s: 1 },
        { cid: 'TFT16_Rumble', n: 'Rumble', r: 0, c: 4, cost: 1, s: 1 },
    ]),
];

const midOpps = (hp: number[]): OpponentData[] => [
    mkOpp('opp-1', 'Wasion', hp[0], 20, 6, [
        { cid: 'TFT16_Shen', n: 'Shen', r: 0, c: 2, cost: 2, s: 2 },
        { cid: 'TFT16_Viego', n: 'Viego', r: 0, c: 3, cost: 2, s: 2 },
        { cid: 'TFT16_Illaoi', n: 'Illaoi', r: 0, c: 4, cost: 1, s: 2 },
        { cid: 'TFT16_Jinx', n: 'Jinx', r: 1, c: 3, cost: 3, s: 1, itm: ['GuinsoosRageblade'] },
    ]),
    mkOpp('opp-2', 'Soju小辉', hp[1], 18, 6, [
        { cid: 'TFT16_Draven', n: 'Draven', r: 0, c: 3, cost: 4, s: 1, itm: ['InfinityEdge'] },
        { cid: 'TFT16_Braum', n: 'Braum', r: 0, c: 2, cost: 2, s: 2 },
        { cid: 'TFT16_Garen', n: 'Garen', r: 1, c: 3, cost: 1, s: 2 },
    ]),
    mkOpp('opp-3', 'MilkCha', hp[2], 15, 5, [
        { cid: 'TFT16_Briar', n: 'Briar', r: 0, c: 3, cost: 1, s: 2 },
        { cid: 'TFT16_Kennen', n: 'Kennen', r: 0, c: 4, cost: 1, s: 2 },
        { cid: 'TFT16_Rumble', n: 'Rumble', r: 1, c: 3, cost: 1, s: 2 },
        { cid: 'TFT16_Graves', n: 'Graves', r: 1, c: 4, cost: 1, s: 2 },
    ]),
    mkOpp('opp-4', 'BoxBox', hp[3], 22, 6, [
        { cid: 'TFT16_Gangplank', n: 'Gangplank', r: 0, c: 3, cost: 3, s: 2, itm: ['HandOfJustice'] },
        { cid: 'TFT16_Graves', n: 'Graves', r: 0, c: 4, cost: 1, s: 2 },
        { cid: 'TFT16_Shen', n: 'Shen', r: 1, c: 3, cost: 2, s: 2 },
    ]),
    mkOpp('opp-5', 'Kiyoon', hp[4], 12, 5, [
        { cid: 'TFT16_Annie', n: 'Annie', r: 0, c: 3, cost: 1, s: 2 },
        { cid: 'TFT16_Sona', n: 'Sona', r: 0, c: 4, cost: 1, s: 2 },
        { cid: 'TFT16_Gwen', n: 'Gwen', r: 1, c: 3, cost: 3, s: 1 },
    ]),
    mkOpp('opp-6', 'Bebe872', hp[5], 25, 6, [
        { cid: 'TFT16_Aphelios', n: 'Aphelios', r: 0, c: 3, cost: 4, s: 1, itm: ['GuinsoosRageblade'] },
        { cid: 'TFT16_Diana', n: 'Diana', r: 0, c: 2, cost: 2, s: 2 },
        { cid: 'TFT16_JarvanIV', n: 'Jarvan IV', r: 1, c: 2, cost: 2, s: 2 },
    ]),
    mkOpp('opp-7', 'Frodan', hp[6], 16, 6, [
        { cid: 'TFT16_Darius', n: 'Darius', r: 0, c: 3, cost: 3, s: 1 },
        { cid: 'TFT16_Braum', n: 'Braum', r: 0, c: 2, cost: 2, s: 2 },
        { cid: 'TFT16_Illaoi', n: 'Illaoi', r: 1, c: 3, cost: 1, s: 2 },
    ]),
];

// ─── Interface ─────────────────────────────────────────────
interface PuzzleDef {
    pro: string; rank: string; stage: string; tier: 'free' | 'advanced' | 'rare';
    title: string; patch: string; date: string; server: string; explanation: string;
    // Augment rolls
    firstRoll: Aug[]; reroll: Aug[]; secondRoll: Aug[];
    proRerollIdx: number[]; proSecondRerollIdx: number[];
    pick: Aug; pickRound: 0 | 1; pickIndex: number;
    // Board
    board: U[]; state: { hp: number; gold: number; level: number };
    bench?: U[]; items: { id: string; name: string }[];
    opps: OpponentData[];
    // V2
    v2?: { streak: boolean[]; cnt: number; path: AugmentPath; reason: string; diff: string };
}

// ─── 10 Puzzles ────────────────────────────────────────────
const DEFS: PuzzleDef[] = [
    // ══ P1: 2-1 FREE — Dishsoap Econ ══
    {
        pro: 'Dishsoap', rank: 'Challenger', stage: '2-1', tier: 'free',
        title: 'Dishsoap — Econ hay Item?', patch: '16.4', date: '2026-02-15', server: 'NA',
        explanation: 'Clear Mind sớm = econ cực mạnh. Bench trống +3g/round compound interest. Carve a Path chỉ giá trị khi đã có carry AD rõ ràng.',
        firstRoll: [A.clearMind, A.carvePath, A.celestial1],
        reroll:    [A.efficientShop, A.onARoll, A.backupBows],
        secondRoll: [], proRerollIdx: [], proSecondRerollIdx: [],
        pick: A.clearMind, pickRound: 0, pickIndex: 0,
        board: [
            { cid: 'TFT16_Shen', n: 'Shen', r: 0, c: 3, cost: 2, s: 1 },
            { cid: 'TFT16_Rumble', n: 'Rumble', r: 0, c: 4, cost: 1, s: 1 },
            { cid: 'TFT16_Viego', n: 'Viego', r: 1, c: 3, cost: 2, s: 1 },
        ],
        state: { hp: 100, gold: 5, level: 3 },
        items: [{ id: 'TFT_Item_ChainVest', name: 'Chain Vest' }, { id: 'TFT_Item_FreeBFSword', name: 'B.F. Sword' }],
        opps: earlyOpps([100, 100, 100, 100, 100, 100, 100]),
    },
    // ══ P2: 2-1 ADVANCED — Soju Reroll ══
    {
        pro: 'Soju', rank: 'Grandmaster', stage: '2-1', tier: 'advanced',
        title: 'Soju — Item cho Reroll hay Econ?', patch: '16.4', date: '2026-02-18', server: 'NA',
        explanation: 'Backup Bows cho Recurve Bow ngay — ghép Guinsoo để reroll carry. On a Roll chỉ giá trị nếu board đủ mạnh win streak sớm.',
        firstRoll: [A.backupBows, A.efficientShop, A.onARoll],
        reroll:    [A.bandThieves1, A.dummify, A.findCenter],
        secondRoll: [], proRerollIdx: [], proSecondRerollIdx: [],
        pick: A.backupBows, pickRound: 0, pickIndex: 0,
        board: [
            { cid: 'TFT16_Briar', n: 'Briar', r: 0, c: 3, cost: 1, s: 2 },
            { cid: 'TFT16_Kennen', n: 'Kennen', r: 0, c: 4, cost: 1, s: 1 },
            { cid: 'TFT16_Annie', n: 'Annie', r: 1, c: 3, cost: 1, s: 1 },
        ],
        state: { hp: 100, gold: 3, level: 3 },
        bench: [{ cid: 'TFT16_Garen', n: 'Garen', r: -1, c: 0, cost: 1, s: 1 }],
        items: [{ id: 'TFT_Item_FreeBFSword', name: 'B.F. Sword' }, { id: 'TFT_Item_GiantsBelt', name: "Giant's Belt" }],
        opps: earlyOpps([100, 100, 97, 100, 100, 97, 100]),
    },
    // ══ P3: 2-1 RARE — Pengu Prismatic ══
    {
        pro: 'Pengu', rank: 'Challenger', stage: '2-1', tier: 'rare',
        title: 'Pengu — Prismatic Econ Dream', patch: '16.4', date: '2026-02-20', server: 'KR',
        explanation: 'Hedge Fund ở 2-1 = 15g + lãi suất max 8g/round. Compound interest quá mạnh. Hold the Line chỉ tốt mid-game.',
        firstRoll: [A.hedgeFund, A.holdLine, A.coronation],
        reroll:    [A.bandThieves2, A.forgedStrength, A.goldenTicket],
        secondRoll: [], proRerollIdx: [], proSecondRerollIdx: [],
        pick: A.hedgeFund, pickRound: 0, pickIndex: 0,
        board: [
            { cid: 'TFT16_Garen', n: 'Garen', r: 0, c: 2, cost: 1, s: 1 },
            { cid: 'TFT16_Sona', n: 'Sona', r: 0, c: 4, cost: 1, s: 1 },
        ],
        state: { hp: 100, gold: 4, level: 3 },
        items: [{ id: 'TFT_Item_FreeBFSword', name: 'B.F. Sword' }, { id: 'TFT_Item_ChainVest', name: 'Chain Vest' }, { id: 'TFT_Item_GiantsBelt', name: "Giant's Belt" }],
        opps: earlyOpps([100, 100, 100, 100, 100, 100, 100]),
    },
    // ══ P4: 2-1 FREE — k3soju Items ══
    {
        pro: 'k3soju', rank: 'Challenger', stage: '2-1', tier: 'free',
        title: 'k3soju — 2 Items miễn phí hay AP boost?', patch: '16.4', date: '2026-02-22', server: 'NA',
        explanation: 'Band of Thieves cho 2 components — flexibility tối đa ghép item. Dummify niche, Find Your Center yêu cầu positioning cụ thể.',
        firstRoll: [A.bandThieves1, A.dummify, A.findCenter],
        reroll:    [A.smallForge, A.tinylords, A.tradeKnow],
        secondRoll: [], proRerollIdx: [], proSecondRerollIdx: [],
        pick: A.bandThieves1, pickRound: 0, pickIndex: 0,
        board: [
            { cid: 'TFT16_Illaoi', n: 'Illaoi', r: 0, c: 3, cost: 1, s: 2 },
            { cid: 'TFT16_Sona', n: 'Sona', r: 0, c: 5, cost: 1, s: 1 },
            { cid: 'TFT16_Viego', n: 'Viego', r: 1, c: 4, cost: 2, s: 1 },
        ],
        state: { hp: 100, gold: 2, level: 3 },
        items: [{ id: 'TFT_Item_FreeBFSword', name: 'B.F. Sword' }],
        opps: earlyOpps([100, 97, 100, 100, 100, 100, 100]),
    },
    // ══ P5: 2-1 ADVANCED — Ramblinnn ══
    {
        pro: 'Ramblinnn', rank: 'Challenger', stage: '2-1', tier: 'advanced',
        title: 'Ramblinnn — Glass Cannon hay Iron Assets?', patch: '16.4', date: '2026-02-25', server: 'NA',
        explanation: 'Iron Assets cho component linh hoạt + buff AS/AP. Glass Cannon quá rủi ro tại 2-1 khi chưa có frontline.',
        firstRoll: [A.glassCannon1, A.pandora, A.ironAssets],
        reroll:    [A.marchOfProg, A.lategameSpec, A.richGetRich],
        secondRoll: [], proRerollIdx: [], proSecondRerollIdx: [],
        pick: A.ironAssets, pickRound: 0, pickIndex: 2,
        board: [
            { cid: 'TFT16_Shen', n: 'Shen', r: 0, c: 3, cost: 2, s: 1 },
            { cid: 'TFT16_Rumble', n: 'Rumble', r: 0, c: 4, cost: 1, s: 1 },
        ],
        state: { hp: 100, gold: 4, level: 3 },
        items: [{ id: 'TFT_Item_ChainVest', name: 'Chain Vest' }, { id: 'TFT_Item_GiantsBelt', name: "Giant's Belt" }, { id: 'TFT_Item_FreeBFSword', name: 'B.F. Sword' }],
        opps: earlyOpps([100, 100, 100, 97, 100, 100, 100]),
    },
    // ══ P6: 3-2 FREE — Wasion V2 (econ) ══
    {
        pro: 'Wasion', rank: 'Challenger', stage: '3-2', tier: 'free',
        title: 'Wasion 3-2 — Econ Intent', patch: '16.4', date: '2026-02-15', server: 'KR',
        explanation: 'Win streak 3, board strong. Clear Mind + bench trống = 3g/round. Econ path đúng vì đang thắng, cần compound interest.',
        firstRoll: [A.clearMind, A.carvePath, A.calcLoss],
        reroll:    [A.celestial2, A.firstAid, A.twinTerror],
        secondRoll: [], proRerollIdx: [], proSecondRerollIdx: [],
        pick: A.clearMind, pickRound: 0, pickIndex: 0,
        board: [
            { cid: 'TFT16_Shen', n: 'Shen', r: 0, c: 3, cost: 2, s: 2 },
            { cid: 'TFT16_Rumble', n: 'Rumble', r: 0, c: 4, cost: 1, s: 2, itm: ['GuinsoosRageblade'] },
            { cid: 'TFT16_Viego', n: 'Viego', r: 1, c: 3, cost: 2, s: 2 },
            { cid: 'TFT16_Illaoi', n: 'Illaoi', r: 1, c: 4, cost: 1, s: 2 },
            { cid: 'TFT16_Garen', n: 'Garen', r: 0, c: 2, cost: 1, s: 2 },
        ],
        state: { hp: 82, gold: 20, level: 5 },
        items: [{ id: 'TFT_Item_FreeBFSword', name: 'B.F. Sword' }, { id: 'TFT_Item_ChainVest', name: 'Chain Vest' }],
        opps: midOpps([85, 78, 72, 90, 68, 95, 80]),
        v2: { streak: [true, true, true, false, true], cnt: 1, path: 'econ', reason: 'Board mạnh, win streak 3 trước đó. Econ để hit level 7 nhanh, compound interest.', diff: 'straightforward' },
    },
    // ══ P7: 3-2 ADVANCED — Becca (item) ══
    {
        pro: 'Becca', rank: 'Grandmaster', stage: '3-2', tier: 'advanced',
        title: 'Becca 3-2 — Item cho Jinx carry', patch: '16.4', date: '2026-02-20', server: 'NA',
        explanation: 'Jinx carry chỉ có 1 IE. Recurve Bow ghép Guinsoo = power spike lớn. Item path vì carry thiếu trang bị.',
        firstRoll: [A.backupBows, A.arcaneViktory, A.advLoan],
        reroll:    [A.epicRolldown, A.bodyguard, A.ascension],
        secondRoll: [], proRerollIdx: [], proSecondRerollIdx: [],
        pick: A.backupBows, pickRound: 0, pickIndex: 0,
        board: [
            { cid: 'TFT16_Jinx', n: 'Jinx', r: 0, c: 3, cost: 3, s: 2, itm: ['InfinityEdge'] },
            { cid: 'TFT16_Shen', n: 'Shen', r: 0, c: 2, cost: 2, s: 2 },
            { cid: 'TFT16_Kennen', n: 'Kennen', r: 1, c: 2, cost: 1, s: 2 },
            { cid: 'TFT16_Rumble', n: 'Rumble', r: 1, c: 3, cost: 1, s: 2 },
            { cid: 'TFT16_Illaoi', n: 'Illaoi', r: 0, c: 1, cost: 1, s: 2 },
        ],
        state: { hp: 68, gold: 12, level: 6 },
        items: [{ id: 'TFT_Item_FreeBFSword', name: 'B.F. Sword' }, { id: 'TFT_Item_GiantsBelt', name: "Giant's Belt" }],
        opps: midOpps([70, 82, 65, 88, 60, 92, 75]),
        v2: { streak: [false, false, true, true, false], cnt: -1, path: 'item', reason: 'Jinx carry thiếu AS item. Backup Bows cho Recurve Bow ngay + scaling AS.', diff: 'straightforward' },
    },
    // ══ P8: 3-2 RARE — Milk (combat) ══
    {
        pro: 'Milk', rank: 'Challenger', stage: '3-2', tier: 'rare',
        title: 'Milk 3-2 — Combat hay Econ khi low HP?', patch: '16.4', date: '2026-02-22', server: 'NA',
        explanation: '55 HP, cần combat power ngay. Ascension +75% dmg sau 15s — Draven carry scale cực mạnh. Glass Cannon rủi ro khi HP thấp.',
        firstRoll: [A.glassCannon2, A.ascension, A.advLoanPlus],
        reroll:    [A.celestial2, A.epicRolldown, A.bodyguard],
        secondRoll: [], proRerollIdx: [], proSecondRerollIdx: [],
        pick: A.ascension, pickRound: 0, pickIndex: 1,
        board: [
            { cid: 'TFT16_Draven', n: 'Draven', r: 0, c: 3, cost: 4, s: 2, itm: ['InfinityEdge', 'Bloodthirster'] },
            { cid: 'TFT16_Shen', n: 'Shen', r: 0, c: 1, cost: 2, s: 2 },
            { cid: 'TFT16_JarvanIV', n: 'Jarvan IV', r: 0, c: 2, cost: 2, s: 2 },
            { cid: 'TFT16_Braum', n: 'Braum', r: 1, c: 1, cost: 2, s: 1 },
            { cid: 'TFT16_Darius', n: 'Darius', r: 1, c: 2, cost: 3, s: 1 },
            { cid: 'TFT16_Graves', n: 'Graves', r: 1, c: 4, cost: 1, s: 2 },
        ],
        state: { hp: 55, gold: 8, level: 7 },
        items: [],
        opps: midOpps([72, 85, 60, 78, 55, 90, 68]),
        v2: { streak: [false, false, false, true, true], cnt: 2, path: 'combat', reason: 'HP thấp (55), cần power spike gấp. Draven đã có IE+BT, Ascension cho +75% dmg late fight.', diff: 'close_call' },
    },
    // ══ P9: 3-2 ADVANCED — Guubums (emblem) ══
    {
        pro: 'Guubums', rank: 'Grandmaster', stage: '3-2', tier: 'advanced',
        title: 'Guubums 3-2 — Emblem cho Bilgewater', patch: '16.4', date: '2026-02-25', server: 'EUW',
        explanation: 'GP carry + Graves = 2 Bilgewater. Thêm Emblem = 3 BW bonus trait mạnh. Emblem path vì synergy value lớn hơn raw items.',
        firstRoll: [A.bwEmblem, A.epicRolldown, A.bodyguard],
        reroll:    [A.ascension, A.advLoan, A.celestial2],
        secondRoll: [], proRerollIdx: [], proSecondRerollIdx: [],
        pick: A.bwEmblem, pickRound: 0, pickIndex: 0,
        board: [
            { cid: 'TFT16_Gangplank', n: 'Gangplank', r: 0, c: 3, cost: 3, s: 2, itm: ['HandOfJustice'] },
            { cid: 'TFT16_Graves', n: 'Graves', r: 0, c: 4, cost: 1, s: 2 },
            { cid: 'TFT16_Illaoi', n: 'Illaoi', r: 1, c: 2, cost: 1, s: 2 },
            { cid: 'TFT16_Shen', n: 'Shen', r: 1, c: 3, cost: 2, s: 2 },
        ],
        state: { hp: 72, gold: 15, level: 6 },
        items: [{ id: 'TFT_Item_ChainVest', name: 'Chain Vest' }],
        opps: midOpps([78, 80, 66, 85, 62, 88, 70]),
        v2: { streak: [true, false, true, true, true], cnt: 3, path: 'emblem', reason: 'GP+Graves = 2 BW. Crown cho 3 BW breakpoint. Synergy value > raw item/econ.', diff: 'counter_intuitive' },
    },
    // ══ P10: 3-2 RARE — Frodan (item prismatic) ══
    {
        pro: 'Frodan', rank: 'Challenger', stage: '3-2', tier: 'rare',
        title: 'Frodan 3-2 — Prismatic Items cho Aphelios', patch: '16.4', date: '2026-03-01', server: 'NA',
        explanation: 'Aphelios carry chỉ có 1 Guinsoo. Band of Thieves II = 2 full items instant. Hedge Fund ở 3-2 quá muộn cho econ.',
        firstRoll: [A.bandThieves2, A.hedgeFund, A.forgedStrength],
        reroll:    [A.goldenTicket, A.coronation, A.holdLine],
        secondRoll: [], proRerollIdx: [], proSecondRerollIdx: [],
        pick: A.bandThieves2, pickRound: 0, pickIndex: 0,
        board: [
            { cid: 'TFT16_Aphelios', n: 'Aphelios', r: 0, c: 3, cost: 4, s: 2, itm: ['GuinsoosRageblade'] },
            { cid: 'TFT16_Braum', n: 'Braum', r: 0, c: 1, cost: 2, s: 2 },
            { cid: 'TFT16_JarvanIV', n: 'Jarvan IV', r: 0, c: 2, cost: 2, s: 2 },
            { cid: 'TFT16_Gwen', n: 'Gwen', r: 1, c: 3, cost: 3, s: 1 },
            { cid: 'TFT16_Diana', n: 'Diana', r: 1, c: 2, cost: 2, s: 2 },
            { cid: 'TFT16_Sona', n: 'Sona', r: 1, c: 4, cost: 1, s: 2 },
        ],
        state: { hp: 62, gold: 10, level: 7 },
        items: [],
        opps: midOpps([80, 75, 58, 82, 52, 88, 65]),
        v2: { streak: [true, false, false, false, true], cnt: 1, path: 'item', reason: 'Aphelios carry thiếu items — chỉ có 1 Guinsoo. Band of Thieves II = 2 full items instant power spike.', diff: 'straightforward' },
    },
];

// ─── Build PuzzleScenario ──────────────────────────────────
const build = (d: PuzzleDef): PuzzleScenario => {
    const scenario: PuzzleScenario = {
        id: crypto.randomUUID(),
        title: d.title, proPlayer: d.pro, rank: d.rank, stage: d.stage, tier: d.tier as any,
        patch: d.patch, date: d.date, server: d.server, explanation: d.explanation,

        // Augment data — fully populated
        augments: d.firstRoll,
        rerollAugments: d.reroll,
        secondRerollAugments: d.secondRoll.length > 0 ? d.secondRoll : undefined,
        hasExtraReroll: d.secondRoll.length > 0,
        proFirstRoll: d.firstRoll,
        proSecondRoll: d.reroll, // pro's second roll = what they see after reroll
        proRerollIndices: d.proRerollIdx,
        proSecondRerollIndices: d.proSecondRerollIdx,
        proPickIndex: d.pickIndex,
        proFinalPick: d.pick,
        proPickRound: d.pickRound,

        // Board — fully populated
        playerBoard: d.board.map(mkUnit),
        playerBench: (d.bench || []).map((u, i) => ({ ...mkUnit(u), benchIndex: i })),
        playerState: { ...d.state, xp: 0 },
        opponents: d.opps,
        startingItems: d.items as any,
    };

    // V2 fields
    if (d.v2) {
        scenario.streakHistory = d.v2.streak;
        scenario.streakCount = d.v2.cnt;
        scenario.proPickPath = d.v2.path;
        scenario.proReasoningIntent = d.v2.reason;
        scenario.difficulty = d.v2.diff as any;
    }
    return scenario;
};

// ─── Exported seed function ────────────────────────────────
export const seedCompletePuzzles = async () => {
    console.log('🗑️ Deleting all existing puzzles...');
    try {
        // Delete dependent records first
        const { data: existingPuzzles } = await supabase.from('puzzles').select('id');
        if (existingPuzzles && existingPuzzles.length > 0) {
            const ids = existingPuzzles.map(p => p.id.toString());
            await supabase.from('user_puzzle_history').delete().in('puzzle_id', ids);
        }
        await supabase.from('puzzles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        console.log('✓ All existing puzzles deleted.');
    } catch (e) {
        console.error('✗ Failed to delete existing puzzles:', e);
    }

    console.log('🎲 Seeding 10 complete puzzles (5x 2-1, 5x 3-2)...');
    const puzzles = DEFS.map(build);
    let ok = 0;
    for (const p of puzzles) {
        try {
            await puzzleService.save(p);
            console.log(`✓ [${p.stage}] ${(p.tier || 'free').toUpperCase()} — ${p.proPlayer}: ${p.title}`);
            ok++;
        } catch (e) { console.error(`✗ Failed: ${p.proPlayer}`, e); }
    }
    console.log(`✅ Seeding complete: ${ok}/${puzzles.length} puzzles created.`);
};
