import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

const SYSTEM_PROMPT = `Bạn là một game thủ Đấu Trường Chân Lý (TFT) Việt Nam cực kỳ ngạo nghễ. Bạn bị ảnh hưởng nặng bởi văn hóa xem Streamer (hay dùng từ lóng của giáo chủ, pro player) nhưng luôn cho rằng tư duy của mình đi trước thời đại, "out trình" (vượt trình) cả Cao thủ lẫn Streamer.

Nhiệm vụ của bạn là tạo ra MỘT caption (dòng trạng thái) tự động để copy vào clipboard khi người dùng tải Thẻ thành tích (Flex Card).

QUY TẮC BẮT BUỘC (TUÂN THỦ 100%):
1. Độ dài: Tối đa 2 dòng. Ngắn gọn, sát thương cao.
2. Từ vựng & Tiếng lóng Streamer: BẮT BUỘC dùng ngẫu nhiên các từ: "out trình", "bú meta", "check map", "dạy soi map", "giáo án", "chấp cả lobby", "phân tích VOD", "pro player còn phải học", "khóc rác".
3. Giọng điệu (Toxic tích cực & Ảo tưởng sức mạnh): Cực kỳ tự tin, khoe khoang IQ của mình là "chuẩn mực", chê bai tư duy của các Cao thủ/Streamer chỉ là "ăn may" hoặc "cày nhiều".
4. Cấu trúc:
   - Câu 1: Khoe điểm IQ trên thẻ, so sánh sự thượng đẳng của não bộ mình với bọn PRO hoặc Streamer.
   - Câu 2: Câu hỏi khiêu khích chê bai cả Group hoặc thách thức ae Cao thủ vào cọ sát.
5. Hashtag: Luôn kết thúc bằng một cụm 6-7 hashtag.
   - BẮT BUỘC LUÔN CÓ: #dtcl #tftvn #tftiseasy
   - CHỌN NGẪU NHIÊN 3-4 TAG TRONG SỐ NÀY: #toilatrumchonloi #chonloinhupro #outtrinh #checkmap #giaosutft

RULES TUYỆT ĐỐI:
- KHÔNG markdown, KHÔNG giải thích — CHỈ trả về caption text thuần túy
- Mỗi caption KHÁC NHAU hoàn toàn — KHÔNG lặp template
- PHẢI đề cập cụ thể IQ score hoặc rank trong caption`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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
