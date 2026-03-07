/// <reference path="../types.d.ts" />

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

const SYSTEM_PROMPT = `Viet 1 caption Flex Card cho game thu DTCL VN bang tieng Viet co dau tu nhien. Chi tra text thuan, khong markdown.

Phong cach:
- Ngong, toxic tich cuc, tu tin out trinh pro va streamer.
- Dung slang tu nhien, khong xung may/tao.

Noi dung bat buoc:
- Doan 1 phai flex IQ score hoac rank va nghe nhu pro con phai hoc.
- Doan 2 dung de khieu khich nhe group/cao thu/streamer.
- Co it nhat 1 cum tu trong nhom nay: out trinh, giao an, day scouting, phan tich VOD, vang bac da quy, chap ca lobby, khoc ac.
- Co the nhac toi da 1-2 linh thu streamer: Ho=trum giao an, Trau=cay rank hay khoc, Ran=phan tich VOD, Chon=flex rank nhanh. Khong duoc viet "con X".

Format output:
- Chi tra duy nhat 1 caption, khong dua nhieu lua chon, khong danh so, khong them tieu de.
- 2 doan ngan, sat thuong cao.
- Dong cuoi chi la hashtag.
- Hashtag bat buoc: #dtcl #tftvn #tftiseasy
- Them 1-2 hashtag trong nhom: #toilatrumchonloi #chonloinhupro #outtrinh #thachdaureal`;

const MODEL_CHAIN = [
  'gemini-3.1-flash-lite-preview',
  'gemini-flash-lite-latest',
];

const CAPTION_REQUEST_TIMEOUT_MS = 3500;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { iqScore, iqRank, topPercentVN } = await req.json();

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const userPrompt = [
      'Du lieu flex card:',
      `IQ: ${iqScore}`,
      `Rank: ${iqRank}`,
      `Top server: ${topPercentVN}%`,
      'Hay viet caption nghe nhu nguoi choi nay dang out trinh ca lobby.',
    ].join('\n');

    const requestBody = JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        maxOutputTokens: 256,
        temperature: 0.85,
        topP: 0.8,
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
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: requestBody,
            signal: controller.signal,
          },
        );

        clearTimeout(timeoutId);

        if (response.status === 429 || response.status === 403) {
          continue;
        }

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        const caption = extractCaptionText(data);

        if (!caption) {
          continue;
        }

        return new Response(
          JSON.stringify({ caption }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      } catch (err) {
        clearTimeout(timeoutId);
        if (err instanceof DOMException && err.name === 'AbortError') {
          continue;
        }
      }
    }

    return new Response(
      JSON.stringify({ error: 'Caption generation failed on all models' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});

function extractCaptionText(data: any): string {
  const parts = data.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return '';
  }

  return parts
    .map((part) => (typeof part?.text === 'string' ? part.text : ''))
    .join('')
    .trim();
}
