/**
 * Game Info Data - Set 17 featured paths & modifiers
 * These are lightweight Set 17-flavored scouting hints used by the current UI.
 */

const base = import.meta.env.BASE_URL || '/';
const cleanBase = base.endsWith('/') ? base : `${base}/`;
const LOCAL_SET17_ICON = `${cleanBase}tft-assets/tft17_emblem.png`;

export interface IoniaPath {
    id: string;
    name: string;
    nameVi: string;
    description: string;
    breakpoints: {
        level: 3 | 5 | 7;
        stats: string;
    }[];
}

export const IONIA_PATHS: IoniaPath[] = [
    {
        id: 'nova-flex',
        name: 'N.O.V.A. Flex',
        nameVi: 'Khung N.O.V.A.',
        description: 'Giữ hướng đánh xoay quanh N.O.V.A. với front line chắc và carry tầm xa linh hoạt.',
        breakpoints: [
            { level: 3, stats: 'Ưu tiên giữ khung rẻ và đồ thủ' },
            { level: 5, stats: 'Bổ sung carry phụ hoặc khống chế' },
            { level: 7, stats: 'Chốt bài với tanker + backline chủ lực' }
        ]
    },
    {
        id: 'anima-pressure',
        name: 'Anima Pressure',
        nameVi: 'Khung Anima',
        description: 'Đẩy nhịp đấu sớm với tướng Anima rẻ, tận dụng chuỗi thắng và giữ đồ sát thương.',
        breakpoints: [
            { level: 3, stats: 'Giữ máu và tempo đầu trận' },
            { level: 5, stats: 'Ưu tiên bổ sung sát thương tuyến sau' },
            { level: 7, stats: 'Chuyển bài nếu lobby tranh quá mạnh' }
        ]
    },
    {
        id: 'timebreaker-tempo',
        name: 'Timebreaker Tempo',
        nameVi: 'Khung Timebreaker',
        description: 'Đánh theo nhịp nâng cấp, ghép đồ sớm cho carry tốc đánh và giữ đội hình cân bằng.',
        breakpoints: [
            { level: 3, stats: 'Ưu tiên ổn định bàn cờ' },
            { level: 5, stats: 'Hoàn thiện cặp chống chịu + gây sát thương' },
            { level: 7, stats: 'Chốt carry chính và nâng cấp tuyến trước' }
        ]
    },
    {
        id: 'fateweaver-scaling',
        name: 'Fateweaver Scaling',
        nameVi: 'Khung Fateweaver',
        description: 'Giữ bàn an toàn để lên cấp mượt, tích lũy sức mạnh dần cho giai đoạn giữa trận.',
        breakpoints: [
            { level: 3, stats: 'Ổn định bàn với tướng rẻ dễ nâng cấp' },
            { level: 5, stats: 'Thêm utility và giữ máu' },
            { level: 7, stats: 'Mở chỗ cho carry 4 vàng' }
        ]
    },
    {
        id: 'bastion-bulwark',
        name: 'Bastion Bulwark',
        nameVi: 'Khung Bastion',
        description: 'Dồn tài nguyên cho tuyến trước Bastion để câu giờ cho carry Set 17 xả sát thương.',
        breakpoints: [
            { level: 3, stats: 'Ưu tiên đồ thủ và giữ máu' },
            { level: 5, stats: 'Ghép thêm utility hoặc hồi phục' },
            { level: 7, stats: 'Chốt bài quanh tanker 2 sao và carry sau lưng' }
        ]
    }
];

export interface VoidMod {
    id: string;
    name: string;
    nameVi: string;
    description: string;
    icon: string;
    recommended?: string;
}

export const VOID_MODS: VoidMod[] = [
    {
        id: 'tempo-surge',
        name: 'Tempo Surge',
        nameVi: 'Nhịp Độ Cao',
        description: 'Ưu tiên các nâng cấp giúp mạnh ngay để giữ chuỗi thắng và snowball Set 17.',
        icon: LOCAL_SET17_ICON,
        recommended: 'N.O.V.A., Anima, Timebreaker'
    },
    {
        id: 'frontline-anchor',
        name: 'Frontline Anchor',
        nameVi: 'Neo Tuyến Trước',
        description: 'Tập trung tài nguyên cho tanker chủ lực để bảo kê carry trong lobby nhiều sát thương.',
        icon: LOCAL_SET17_ICON,
        recommended: 'Bastion, front line 2 sao'
    },
    {
        id: 'backline-overclock',
        name: 'Backline Overclock',
        nameVi: 'Quá Tải Tuyến Sau',
        description: 'Đẩy tối đa hiệu suất carry tầm xa với đồ tốc đánh, SMPT hoặc xuyên thủng phù hợp.',
        icon: LOCAL_SET17_ICON,
        recommended: 'Caitlyn, Ezreal, các carry Set 17'
    },
    {
        id: 'econ-window',
        name: 'Econ Window',
        nameVi: 'Cửa Sổ Kinh Tế',
        description: 'Giữ mốc vàng và chọn thời điểm roll hợp lý để lên cấp mượt, không mất quá nhiều máu.',
        icon: LOCAL_SET17_ICON,
        recommended: 'Các khung cần lên cấp ổn định'
    },
    {
        id: 'flex-pivot',
        name: 'Flex Pivot',
        nameVi: 'Chuyển Bài Linh Hoạt',
        description: 'Giữ đồ và khung trung tính để xoay nhanh sang bài Set 17 ít bị tranh hơn trong lobby.',
        icon: LOCAL_SET17_ICON,
        recommended: 'Lobby tranh mạnh, cần xoay carry'
    }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a random Ionia Path (called at start of each game)
 */
export const getRandomIoniaPath = (): IoniaPath => {
    const randomIndex = Math.floor(Math.random() * IONIA_PATHS.length);
    return IONIA_PATHS[randomIndex];
};

/**
 * Get 3 random Void Mods (called at start of each game)
 */
export const getRandomVoidMods = (count: number = 3): VoidMod[] => {
    const shuffled = [...VOID_MODS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
};

/**
 * Get Ionia Path by ID
 */
export const getIoniaPathById = (id: string): IoniaPath | undefined => {
    return IONIA_PATHS.find(path => path.id === id);
};

/**
 * Get Void Mod by ID
 */
export const getVoidModById = (id: string): VoidMod | undefined => {
    return VOID_MODS.find(mod => mod.id === id);
};
