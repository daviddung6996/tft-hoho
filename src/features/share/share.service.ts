const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

const CAPTION_SYSTEM_PROMPT = `Game thủ DTCL VN ngạo nghễ, dùng slang Streamer, tự cho mình "out trình" cả Pro lẫn Streamer. Tạo 1 caption cho Flex Card.

LINH THÚ STREAMER (nhắc khéo, KHÔNG gọi "con X"): Hổ=trùm giáo án, Trâu=cày rank bền bỉ/hay khóc do đen, Rắn=phân tích VOD/nhả độc, Chồn=flex rank nhanh.
VD nhắc: "Hổ Báo Cáo Chồn gì thấy IQ này cũng nể", "Rắn rết bọ ngựa..."

QUY TẮC:
1. Tối đa 2 dòng, ngắn gọn, sát thương cao.
2. Slang ngẫu nhiên: "vàng bạc đá quý"(chê rank thấp), "out trình", "bú meta", "dạy scouting", "giáo án", "chấp cả lobby", "phân tích VOD", "pro player còn phải học", "khóc ác".
3. Giọng: Toxic tích cực, ảo tưởng sức mạnh, IQ mình là "chuẩn mực", Cao thủ/Streamer chỉ "ăn may"/"cày nhiều".
4. Câu 1: Khoe IQ/rank, so sánh thượng đẳng hơn Pro/Streamer. Câu 2: Khiêu khích/thách thức ae Cao thủ hoặc chê Group.
5. Hashtag trên DÒNG MỚI, KHÔNG trộn vào câu văn. BẮT BUỘC: #dtcl #tftvn #tftiseasy. Thêm 1-2 từ: #toilatrumchonloi #chonloinhupro #outtrinh #giaosutft

RULES: Khoác lác nhưng KHÔNG Mày/Tao. Nói "Rank Sắt" KHÔNG "Hạng Sắt".`;

// Model fallback chain: premium → free → lite
const MODEL_CHAIN = [
    'gemini-3-flash-preview',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
];

function buildApiUrl(model: string): string {
    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
}

export async function generateFlexCaption(
    iqScore: number,
    iqRank: string,
    topPercentVN: number,
): Promise<string | null> {
    if (!GEMINI_API_KEY) {
        console.warn('VITE_GEMINI_API_KEY not set — caption generation skipped');
        return null;
    }

    const userPrompt = [
        `Điểm IQ Cờ Lõi: ${iqScore}`,
        `Hạng hiện tại: ${iqRank}`,
        `Top Server: ${topPercentVN}%`,
    ].join('\n');

    const requestBody = JSON.stringify({
        system_instruction: { parts: [{ text: CAPTION_SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: {
            temperature: 1.0,
            topP: 0.9,
            maxOutputTokens: 4096,
        },
    });

    for (const model of MODEL_CHAIN) {
        try {
            console.log(`[FlexCaption] Trying model: ${model}`);
            const res = await fetch(buildApiUrl(model), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: requestBody,
            });

            // 429 = rate limit, 403 = quota exceeded → try next model
            if (res.status === 429 || res.status === 403) {
                console.warn(`[FlexCaption] ${model} quota/rate limited (${res.status}), falling back...`);
                continue;
            }

            if (!res.ok) {
                console.error(`[FlexCaption] ${model} error:`, res.status, await res.text());
                continue;
            }

            const json = await res.json();
            const finishReason = json.candidates?.[0]?.finishReason;
            const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            console.log(`[FlexCaption] ✅ ${model} raw:`, rawText, '| finishReason:', finishReason);
            const caption = rawText.trim();

            if (!caption) continue;

            return postProcessCaption(caption);
        } catch (err) {
            console.error(`[FlexCaption] ${model} failed:`, err);
            continue;
        }
    }

    console.error('[FlexCaption] All models exhausted');
    return null;
}

function postProcessCaption(caption: string): string {
    // Extract ALL hashtags, strip from body, re-append on last line
    const hashtagRegex = /#\w+/g;
    const foundTags = caption.match(hashtagRegex) || [];
    // Remove hashtags from body text
    let body = caption.replace(hashtagRegex, '').replace(/\n{2,}/g, '\n').trim();
    // Remove trailing punctuation from stripped text
    body = body.replace(/[\s,]+$/, '').trim();

    // Build unique hashtag line
    const requiredTags = ['#dtcl', '#tftvn', '#tftiseasy'];
    const allTags = [...new Set([...requiredTags, ...foundTags])];
    const hashtagLine = allTags.join(' ');

    return body ? `${body}\n\n${hashtagLine}` : caption;
}
