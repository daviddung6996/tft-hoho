/**
 * Game Info Data - Ionia Paths & Void Mods
 * Pro players check these at the start of every match
 */

// ============================================================================
// IONIA PATHS (5 Đạo)
// ============================================================================

export interface IoniaPath {
    id: string;
    name: string;           // English name
    nameVi: string;         // Vietnamese name
    description: string;    // Vietnamese description
    breakpoints: {
        level: 3 | 5 | 7;
        stats: string;
    }[];
}

export const IONIA_PATHS: IoniaPath[] = [
    {
        id: 'blades',
        name: 'Path of Blades',
        nameVi: 'Đạo Kiếm',
        description: 'Đòn đánh có tỉ lệ kích hoạt đòn tấn công phụ và gây thêm sát thương vật lý.',
        breakpoints: [
            { level: 3, stats: '30% tỉ lệ, +3 sát thương' },
            { level: 5, stats: '38% tỉ lệ, +8 sát thương' },
            { level: 7, stats: '45% tỉ lệ, +15 sát thương' }
        ]
    },
    {
        id: 'enlightened',
        name: 'Path of the Enlightened',
        nameVi: 'Đạo Khai Sáng',
        description: 'Tướng Ionia nhận Sức Mạnh Công Kích và Sức Mạnh Phép Thuật, tăng theo cấp người chơi. Sau mỗi giao tranh người chơi, nhận thêm XP.',
        breakpoints: [
            { level: 3, stats: '10 AD/AP + 2/cấp, 1 XP' },
            { level: 5, stats: '15 AD/AP + 3/cấp, 2 XP' },
            { level: 7, stats: '20 AD/AP + 4/cấp, 4 XP' }
        ]
    },
    {
        id: 'prosperous',
        name: 'Path of the Prosperous',
        nameVi: 'Đạo Phú Quý',
        description: 'Nhận 1 vàng với mỗi 3 lần tướng Ionia tham gia hạ gục. Tướng Ionia nhận thêm Sức Mạnh Công Kích và Sức Mạnh Phép Thuật, tăng thêm 2% với mỗi vàng nhận được theo cách này.',
        breakpoints: [
            { level: 3, stats: '10 AD/AP + 2%/vàng' },
            { level: 5, stats: '25 AD/AP + 2%/vàng' },
            { level: 7, stats: '40 AD/AP + 2%/vàng' }
        ]
    },
    {
        id: 'spirits',
        name: 'Path of Spirits',
        nameVi: 'Đạo Linh Hồn',
        description: 'Tướng Ionia nhận Máu cộng thêm. Mỗi lần một tướng Ionia thi triển, tất cả tướng Ionia nhận cộng dồn Sức Mạnh Công Kích và Sức Mạnh Phép Thuật.',
        breakpoints: [
            { level: 3, stats: '20% Máu, 3 AD/AP' },
            { level: 5, stats: '25% Máu, 4 AD/AP' },
            { level: 7, stats: '35% Máu, 5 AD/AP' }
        ]
    },
    {
        id: 'transcendent',
        name: 'Path of the Transcendent',
        nameVi: 'Đạo Siêu Việt',
        description: 'Tướng Ionia nhận thêm máu và gây thêm sát thương phép. Tướng Ionia 3 sao nhận thêm 100% nữa.',
        breakpoints: [
            { level: 3, stats: '10% Máu, +22% sát thương phép' },
            { level: 5, stats: '15% Máu, +28% sát thương phép' },
            { level: 7, stats: '20% Máu, +33% sát thương phép' }
        ]
    }
];

// ============================================================================
// VOID MODS (6 Mô-đun Hư Không)
// ============================================================================

export interface VoidMod {
    id: string;
    name: string;           // English name
    nameVi: string;         // Vietnamese name
    description: string;    // Vietnamese description
    icon: string;           // Icon URL
    recommended?: string;   // Recommended champions (Vietnamese)
}

export const VOID_MODS: VoidMod[] = [
    {
        id: 'royal_protection',
        name: 'Royal Protection',
        nameVi: 'Bảo Hộ Hoàng Gia',
        description: 'Nhận 200 Máu. Khi xuống dưới 50% Máu, triệu hồi 1 Bọ Hư Không có 30% Máu của tướng đó.',
        icon: 'https://ap.tft.tools/img/items_s14/16Void_RoyalHusk.png?w=32',
        recommended: "Cho'Gath, Sứ Giả"
    },
    {
        id: 'toxic_spines',
        name: 'Toxic Spines',
        nameVi: 'Gai Phun Độc',
        description: 'Sau khi gây 1000 sát thương, bắn gai vào 2 kẻ địch gần nhất gây 100 sát thương vật lý.',
        icon: 'https://ap.tft.tools/img/items_s14/16Void_SpitterSpines.png?w=32',
        recommended: "Rek'Sai, Malzahar, Kai'Sa"
    },
    {
        id: 'leeching_nucleus',
        name: 'Leeching Nucleus',
        nameVi: 'Hạch Hút Hạ',
        description: 'Hồi máu cho đồng minh thấp máu nhất bằng 15% sát thương gây ra. Đòn đánh đánh cắp 2% SMCK/SMPT từ mục tiêu (tối đa 15 cộng dồn).',
        icon: 'https://ap.tft.tools/img/items_s14/16Void_LeechingNucleus.png?w=32',
        recommended: "Kog'Maw, Malzahar, Kai'Sa"
    },
    {
        id: 'adrenaline_modules',
        name: 'Adrenaline Modules',
        nameVi: 'Mô-đun Adrenaline',
        description: 'Nhận 15% Khuếch đại sát thương, tăng thêm 1% sau mỗi 3 đòn đánh.',
        icon: 'https://ap.tft.tools/img/items_s14/16Void_AdrenalineModules.png?w=32',
        recommended: "Bel'Veth, Kai'Sa"
    },
    {
        id: 'armored_plating',
        name: 'Armored Plating',
        nameVi: 'Thiết Giáp',
        description: 'Nhận 200 Máu tối đa. Nhận Giáp và Kháng Phép tương đương 0.6% Máu tối đa.',
        icon: 'https://ap.tft.tools/img/items_s14/16Void_IronCarapace.png?w=32',
        recommended: "Cho'Gath, Sứ Giả"
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
