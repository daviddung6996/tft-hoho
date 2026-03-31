import type { CoachDecisionType, CoachId, CoachProfile } from './coachSelect.types';

export const DEFAULT_COACH_ID: CoachId = 'visian';
export const DEFAULT_COACH_QUESTION = 'Phân tích tình huống hiện tại và chốt cho tôi lựa chọn tốt nhất.';

export function getCoachQuestionForDecisionType(decisionType?: CoachDecisionType): string {
    if (decisionType === 'path') {
        return 'Phân tích board hiện tại và chốt cho tôi hướng augment hợp nhất.';
    }

    if (decisionType === 'plan') {
        return 'Phân tích spot hiện tại và chốt cho tôi kế hoạch đúng nhất trước khi ra augment.';
    }

    return DEFAULT_COACH_QUESTION;
}

const DEFAULT_POSE_HERO_PRESENTATION = {
    mode: 'pose' as const,
    scale: 1.04,
    xOffsetPx: 0,
    yOffsetPx: -8,
    bottomOverlapPx: 2,
    maxWidthPx: 420,
};

export const COACHES: CoachProfile[] = [
    {
        id: 'visian',
        displayName: 'Visian',
        accentColor: '#00D1C1',
        role: 'FLEX LORD',
        region: 'NA',
        avatarText: 'VI',
        imageSrc: '/coach-assets/visian-thumb.png',
        fallbackImageSrc: '/tft-assets/tft17_ryze.jpg',
        heroImageSrc: '/coach-assets/pose/visian-clean.png',
        heroFallbackImageSrc: '/tft-assets/tft17_ryze.jpg',
        heroPresentation: DEFAULT_POSE_HERO_PRESENTATION,
        tagline: 'Không cần mắt để thấy meta.',
        description: 'Visian đọc lobby theo nhiệt độ board và chốt augment dựa trên giá trị thật ở round hiện tại. Mục tiêu là pick an toàn nhất kèm một line flex để xoay bài.',
        stats: [
            { label: 'Độ chuẩn meta', value: 95 },
            { label: 'Tốc độ phân tích', value: 88 },
            { label: 'Độ mặn', value: 40 },
            { label: 'Hay khóc game', value: 15 },
        ],
        ability: {
            key: 'S',
            name: 'META SCAN',
            description: 'Quét augment pool, board state và econ rồi chốt lựa chọn có EV cao nhất trong lobby hiện tại.',
        },
    },
    {
        id: 'dit_sap',
        displayName: 'Dit Sap',
        accentColor: '#FF4655',
        role: 'WORLDS DIFF',
        region: 'VN',
        avatarText: 'DS',
        imageSrc: '/coach-assets/dit-sap-thumb.png',
        fallbackImageSrc: '/tft-assets/tft17_samira.jpg',
        heroImageSrc: '/coach-assets/pose/dit-sap-clean.png',
        heroFallbackImageSrc: '/tft-assets/tft17_samira.jpg',
        heroPresentation: DEFAULT_POSE_HERO_PRESENTATION,
        tagline: 'Rửa bát xong mới rửa lobby.',
        description: 'Dit Sap ưu tiên augment giúp thắng fight ngay lập tức. Khi board sắp vỡ, coach này chọn damage và tempo trước mọi bài học econ.',
        stats: [
            { label: 'Độ liều', value: 98 },
            { label: 'Sáng tạo comp', value: 92 },
            { label: 'Độ troll', value: 75 },
            { label: 'Số bát chưa rửa', value: 99 },
        ],
        ability: {
            key: 'S',
            name: 'ALL IN',
            description: 'Bỏ qua lý thuyết econ và đẩy sức mạnh board ngay, ưu tiên augment combat để stabilise trong 1 turn.',
        },
    },
    {
        id: 'one_by_one',
        displayName: '1by1',
        accentColor: '#8B5CF6',
        role: 'CON-TROLL',
        region: 'VN',
        avatarText: '11',
        imageSrc: '/coach-assets/1by1-thumb.png',
        fallbackImageSrc: '/tft-assets/tft17_shen.jpg',
        heroImageSrc: '/coach-assets/pose/1by1-clean.png',
        heroFallbackImageSrc: '/tft-assets/tft17_shen.jpg',
        heroPresentation: DEFAULT_POSE_HERO_PRESENTATION,
        tagline: 'Từng bước một, từng round một.',
        description: '1by1 phân tích từng option rồi loại dần các augment sai. Coach này hợp với spot cần kiểm soát tempo và giữ cửa pivot sạch.',
        stats: [
            { label: 'Kiên nhẫn', value: 99 },
            { label: 'Econ mastery', value: 94 },
            { label: 'Độ trâu', value: 90 },
            { label: 'Độ đen', value: 85 },
        ],
        ability: {
            key: 'S',
            name: 'PATIENCE WALL',
            description: 'Cắt nhỏ spot thành từng quyết định và chỉ ra augment nào hợp, augment nào nên loại ngay.',
        },
    },
    {
        id: 'buffalow',
        displayName: 'Buffalow',
        accentColor: '#F59E0B',
        role: 'LOSE STREAK',
        region: 'VN',
        avatarText: 'BF',
        imageSrc: '/coach-assets/buffalow-thumb.png',
        fallbackImageSrc: '/tft-assets/tft17_nautilus.jpg',
        heroImageSrc: '/coach-assets/pose/buffalow-clean.png',
        heroFallbackImageSrc: '/tft-assets/tft17_nautilus.jpg',
        heroPresentation: DEFAULT_POSE_HERO_PRESENTATION,
        tagline: 'Trâu không sợ chết, sợ không có comp.',
        description: 'Buffalow chú trọng HP và board strength. Nếu spot đang mỏng, coach này sẽ ưu tiên augment cứu máu, frontline và cửa top 4 trước.',
        stats: [
            { label: 'Chịu damage', value: 97 },
            { label: 'Board strength', value: 91 },
            { label: 'Độ cứng đầu', value: 96 },
            { label: 'Hay khóc game', value: 70 },
        ],
        ability: {
            key: 'S',
            name: 'TANK MODE',
            description: 'Khoá line giữ HP bằng augment cho frontline, tempo và khả năng ổn định board qua các round xấu.',
        },
    },
    {
        id: 'tftiseasy',
        displayName: 'TFTISEASY',
        accentColor: '#C8AA6E',
        role: 'PATCH DIFF',
        region: 'VN',
        avatarText: 'TF',
        imageSrc: '/coach-assets/tftiseasy-thumb.png',
        fallbackImageSrc: '/tft-assets/tft17_twistedfate.jpg',
        heroImageSrc: '/coach-assets/pose/tftiseasy-clean.png',
        heroFallbackImageSrc: '/tft-assets/tft17_twistedfate.jpg',
        heroPresentation: DEFAULT_POSE_HERO_PRESENTATION,
        tagline: 'TFT is easy. Nếu bạn biết cách.',
        description: 'TFTISEASY tổng hợp patch, pro VOD và data để đưa ra một câu chốt dễ hiểu, dễ flex và vận dụng về mặt meta.',
        stats: [
            { label: 'Tổng hợp meta', value: 93 },
            { label: 'Giải thích', value: 96 },
            { label: 'Cập nhật patch', value: 99 },
            { label: 'Không thiên vị', value: 88 },
        ],
        ability: {
            key: 'S',
            name: 'DATA CRUNCH',
            description: 'Tổng hợp data từ nhiều nguồn để đưa ra pick chính, backup và warning nếu spot đang dễ tilt.',
        },
    },
];

export const COACHES_BY_ID: Record<CoachId, CoachProfile> = COACHES.reduce((acc, coach) => {
    acc[coach.id] = coach;
    return acc;
}, {} as Record<CoachId, CoachProfile>);
