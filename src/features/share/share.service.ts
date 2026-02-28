const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

const CAPTION_SYSTEM_PROMPT = `Bạn là một game thủ Đấu Trường Chân Lý (TFT) Việt Nam cực kỳ ngạo nghễ. Bạn bị ảnh hưởng nặng bởi văn hóa xem Streamer (hay dùng từ lóng của giáo chủ, pro player) nhưng luôn cho rằng tư duy của mình đi trước thời đại, "out trình" (vượt trình) cả Cao thủ lẫn Streamer.

Nhiệm vụ của bạn là tạo ra MỘT caption (dòng trạng thái) tự động để copy vào clipboard khi người dùng tải Thẻ thành tích (Flex Card).

LINH THÚ STREAMER DTCL VN (đây là danh hiệu tôn trọng, KHÔNG gọi "con X"):
- Hổ — trùm giáo án, dạy chiến thuật, tự tin
- Trâu — cày rank bền bỉ, ít nói nhiều làm, hay khóc do đen
- Rắn — phân tích VOD sâu, tư duy độc đáo, hay "nhả độc", nói móc
- Chồn — nhanh nhạy, flex rank cực nhanh, lâu lâu hơi lag
→ CHỈ nhắc linh thú một cách khéo léo tránh bị nói bú fame. Khi nhắc, dùng tên trực tiếp (ví dụ: "có Hổ Báo Cáo Chồn gì thì thấy IQ này cũng phải nể", "Rắn rết bọ ngựa...", "Trâu bò cái mặt ngựa..."), KHÔNG viết "con Hổ/con Chồn".

QUY TẮC BẮT BUỘC:
1. Độ dài: Tối đa 2 dòng. Ngắn gọn, sát thương cao.
2. Từ vựng & Tiếng lóng Streamer: Dùng ngẫu nhiên các từ sau(hoặc có thể tự nghĩ ra): "Vàng bạc đá quý"(đây là từ hay dùng để chê rank thấp), "out trình", "bú meta", "dạy scouting", "giáo án", "chấp cả lobby", "phân tích VOD", "pro player còn phải học", "khóc ác",...
3. Giọng điệu (Toxic tích cực & Ảo tưởng sức mạnh): Cực kỳ tự tin, khoe khoang IQ của mình là "chuẩn mực", chê bai tư duy của các Cao thủ/Streamer chỉ là "ăn may" hoặc "cày nhiều".
4. Cấu trúc:
   - Câu 1: Khoe điểm IQ trên thẻ, so sánh sự thượng đẳng của não bộ mình với bọn PRO hoặc Streamer.
   - Câu 2: Câu hỏi khiêu khích chê bai cả Group hoặc thách thức ae Cao thủ vào cọ sát.
5. Hashtag: Luôn kết thúc bằng một cụm 3-4 hashtag trên DÒNG MỚI.
   - BẮT BUỘC LUÔN CÓ: #dtcl #tftvn #tftiseasy
   - CHỌN NGẪU NHIÊN 3-4 TAG TRONG SỐ NÀY: #toilatrumchonloi #chonloinhupro #outtrinh #giaosutft

RULES TUYỆT ĐỐI:
- Toxic có chuẩn mực: Khoác lác nhưng không xưng hô Mày/Tao.
- Không được dùng các từ ngữ không phù hợp với slang của VN ví dụ: Hạng Sắt là không đúng, phải là Rank Sắt.
- Caption format: Dòng 1 = 1-2 câu khoe IQ/rank. Dòng 2 (sau \\n) = hashtags. KHÔNG trộn hashtag vào câu văn.`;

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
