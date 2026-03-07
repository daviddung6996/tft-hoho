const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

const CAPTION_SYSTEM_PROMPT = `Viet 1 caption Flex Card cho game thu DTCL VN bang tieng Viet co dau tu nhien.

Phong cach:
- Ngong, toxic tich cuc, tu tin "out trinh" pro va streamer.
- Dung slang tu nhien, khong giai thich, khong markdown, khong xung may/tao.

Noi dung bat buoc:
- Than doan 1: flex IQ/rank/top server, nghe nhu minh la chuan muc de pro phai hoc.
- Than doan 2: khieu khich nhe group/cao thu/streamer.
- Co it nhat 1 cum tu trong nhom nay: out trinh, giao an, day scouting, phan tich VOD, vang bac da quy, chap ca lobby, khoc ac.
- Co the nhac toi da 1-2 linh thu streamer: Ho=trum giao an, Trau=cay rank hay khoc, Ran=phan tich VOD, Chon=flex rank nhanh. Khong duoc viet "con X".

Format output:
- Chi tra duy nhat 1 caption, khong dua nhieu lua chon, khong danh so, khong them tieu de.
- 2 doan ngan, sat thuong cao.
- Dong cuoi chi la hashtag.
- Hashtag bat buoc: #dtcl #tftvn #tftiseasy
- Them 1-2 hashtag trong nhom: #toilatrumchonloi #chonloinhupro #outtrinh #giaosutft`;

const MODEL_CHAIN = [
    'gemini-3.1-flash-lite-preview',
    'gemini-flash-lite-latest',
];

const CAPTION_REQUEST_TIMEOUT_MS = 3500;
const CAPTION_CACHE = new Map<string, Promise<string | null>>();

function buildApiUrl(model: string): string {
    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
}

export async function generateFlexCaption(
    iqScore: number,
    iqRank: string,
    topPercentVN: number,
): Promise<string | null> {
    if (!GEMINI_API_KEY) {
        console.warn('VITE_GEMINI_API_KEY not set - caption generation skipped');
        return null;
    }

    const cacheKey = `${iqScore}|${iqRank}|${topPercentVN}`;
    const cachedCaption = CAPTION_CACHE.get(cacheKey);
    if (cachedCaption) {
        return cachedCaption;
    }

    const captionPromise = generateFlexCaptionUncached(iqScore, iqRank, topPercentVN);
    CAPTION_CACHE.set(cacheKey, captionPromise);
    const caption = await captionPromise;

    if (!caption) {
        CAPTION_CACHE.delete(cacheKey);
    }

    return caption;
}

async function generateFlexCaptionUncached(
    iqScore: number,
    iqRank: string,
    topPercentVN: number,
): Promise<string | null> {
    const userPrompt = [
        'Du lieu flex card:',
        `IQ: ${iqScore}`,
        `Rank: ${iqRank}`,
        `Top server: ${topPercentVN}%`,
        'Hay viet caption nghe nhu nguoi choi nay dang out trinh ca lobby.',
    ].join('\n');

    const requestBody = JSON.stringify({
        system_instruction: { parts: [{ text: CAPTION_SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
            temperature: 0.85,
            topP: 0.8,
            maxOutputTokens: 4096,
            responseMimeType: 'text/plain',
            thinkingConfig: {
                thinkingBudget: 0,
            },
        },
    });

    for (const model of MODEL_CHAIN) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CAPTION_REQUEST_TIMEOUT_MS);

        try {
            console.log(`[FlexCaption] Trying model: ${model}`);
            const res = await fetch(buildApiUrl(model), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: requestBody,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

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
            const rawText = extractCaptionText(json);
            console.log(`[FlexCaption] ${model} raw:`, rawText, '| finishReason:', finishReason);

            if (!rawText) {
                continue;
            }

            return postProcessCaption(rawText);
        } catch (err) {
            clearTimeout(timeoutId);

            if (err instanceof DOMException && err.name === 'AbortError') {
                console.warn(`[FlexCaption] ${model} timed out after ${CAPTION_REQUEST_TIMEOUT_MS}ms`);
                continue;
            }

            console.error(`[FlexCaption] ${model} failed:`, err);
        }
    }

    console.error('[FlexCaption] All models exhausted');
    return null;
}

function extractCaptionText(json: any): string {
    const parts = json.candidates?.[0]?.content?.parts;
    if (!Array.isArray(parts)) {
        return '';
    }

    return parts
        .map((part) => (typeof part?.text === 'string' ? part.text : ''))
        .join('')
        .trim();
}

function postProcessCaption(caption: string): string {
    const hashtagRegex = /#\w+/g;
    const foundTags = caption.match(hashtagRegex) || [];
    let body = caption.replace(hashtagRegex, '').replace(/\n{2,}/g, '\n').trim();
    body = body.replace(/[\s,]+$/, '').trim();

    const requiredTags = ['#dtcl', '#tftvn', '#tftiseasy'];
    const allTags = [...new Set([...requiredTags, ...foundTags])];
    const hashtagLine = allTags.join(' ');

    return body ? `${body}\n\n${hashtagLine}` : caption;
}
