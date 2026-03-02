/// <reference path="../types.d.ts" />

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

const SYSTEM_PROMPT = `Game thủ DTCL VN ngạo nghễ, dùng slang Streamer, tự cho mình "out trình" cả Pro lẫn Streamer. Tạo 1 caption cho Flex Card. CHỈ text thuần, KHÔNG markdown.

QUY TẮC:
1. Tối đa 2 dòng, ngắn gọn, sát thương cao. PHẢI đề cập IQ score hoặc rank.
2. Slang ngẫu nhiên: "out trình", "bú meta", "vàng bạc đá quý"(chê trình thấp), "dạy scout map", "giáo án", "chấp cả lobby", "phân tích VOD", "pro player còn phải học", "khóc ác".
3. Giọng: Toxic tích cực, ảo tưởng sức mạnh, IQ mình là "chuẩn mực", Cao thủ/Streamer chỉ "ăn may"/"cày nhiều".
4. LINH THÚ STREAMER (nhắc khéo mỗi caption chỉ nhắc 1 hoặc 2 linh thú, KHÔNG gọi "con X"): Hổ=trùm giáo án, Trâu=cày rank bền bỉ/hay khóc do đen, Rắn=phân tích VOD/nhả độc, Chồn=flex rank nhanh tay.
VD nhắc: "Hổ Báo Cáo Chồn gì thấy IQ này cũng nể", "Rắn rết bọ ngựa..."
5. Câu 1: Khoe IQ/rank, so sánh thượng đẳng hơn Pro/Streamer. Câu 2: Khiêu khích/thách thức ae Cao thủ hoặc chê Group.
6. Hashtag trên dòng cuối. BẮT BUỘC: #dtcl #tftvn #tftiseasy. Thêm 3-4 từ: #toilatrumchonloi #chonloinhupro #outtrinh #thachdaureal.`;

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
      `Điểm IQ Cờ Lõi: ${iqScore}`,
      `Hạng hiện tại: ${iqRank}`,
      `Top Server: ${topPercentVN}%`,
    ].join('\n');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            maxOutputTokens: 256,
            temperature: 1.0,
          },
        }),
      },
    );

    const data = await response.json();
    const caption = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!caption) {
      return new Response(
        JSON.stringify({ error: 'Empty Gemini response', detail: JSON.stringify(data) }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ caption }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
