---
name: context-export
description: Auto-packages project context when stuck or brainstorming, ready for copy-paste to ChatGPT/Grok/Gemini. Triggers automatically — no user command needed.
allowed-tools: Read, Glob, Grep
---

# Context Export — AI Context Packaging Protocol

> **PURPOSE:** Tự động đóng gói context khi AI bị stuck hoặc cần brainstorming, để user copy-paste sang model khác (ChatGPT, Grok, Gemini).

---

## 🔄 Auto-Trigger Rules

**Skill này KHÔNG cần user gõ command. AI tự kích hoạt khi phát hiện các pattern sau:**

| Trigger Pattern | Khi nào | Hành động |
|---|---|---|
| **Stuck Loop** | Cùng một lỗi sau 2-3 lần thử fix | ⚡ Tự đóng gói + đề xuất: _"Mang cái này hỏi model khác nhé?"_ |
| **Complex Brainstorm** | Vấn đề architecture/design nhiều trade-offs | 🧠 Đóng gói trade-offs + gợi ý prompt brainstorm |
| **User Signal** | User nói "hỏi thêm", "second opinion", "mang đi hỏi", "export context" | 📦 Đóng gói ngay lập tức |
| **Deep Debug** | Bug phức tạp, root cause chưa rõ sau khi đã trace | 🔍 Đóng gói debug trace + hypothesis |
| **Decision Paralysis** | Có 3+ options mà không rõ cái nào tốt nhất | 🤔 Đóng gói options + analysis cho model khác quyết |

### Trigger Detection Keywords

```
Stuck: "không hiểu", "vẫn lỗi", "thử rồi", "không biết sao", "stuck", "bó tay"
Brainstorm: "nên làm thế nào", "có cách nào", "ý kiến", "approach", "architecture"
External: "hỏi GPT", "hỏi Grok", "hỏi Gemini", "second opinion", "export"
```

---

## 📦 Context Packaging Protocol

### 4-Step Packaging (MANDATORY)

Khi trigger kích hoạt, AI **PHẢI** đóng gói theo format sau:

```markdown
---
## 🧠 Context Export — [Tên vấn đề ngắn gọn]
**Project:** [Tên dự án]
**Tech Stack:** [Framework, language, DB, etc.]
**Date:** [YYYY-MM-DD]
---

### 1. 🎯 Problem
[Mô tả vấn đề trong 2-3 câu. Rõ ràng, cụ thể.]

### 2. 📄 Relevant Code
```[language]
// file: [đường dẫn file]
[CHỈ code liên quan, KHÔNG dump nguyên file]
```

### 3. 🔄 What I've Tried
- **Attempt 1:** [Mô tả] → Result: [Kết quả]
- **Attempt 2:** [Mô tả] → Result: [Kết quả]
- **Attempt 3:** [Mô tả] → Result: [Kết quả]

### 4. ✅ Expected Outcome
[Kết quả mong muốn cụ thể]

### 5. 💭 My Current Hypothesis (optional)
[Giả thuyết hiện tại nếu có — giúp model khác có điểm bắt đầu]
```

---

## 🎯 Context Scope Rules

> **NGUYÊN TẮC SỐ 1: Briefing, Not Essay.**
> Context export là bản brief gọn để AI **tự suy luận** — KHÔNG phải bài báo cáo dài.
> Tin tưởng khả năng reasoning của model đích. Cho ít data, đặt câu hỏi đúng.

### ⚠️ Hard Length Limits (MANDATORY)

| Loại export | Max tổng | Lý do |
|---|---|---|
| **Bug/Debug** | ~100 dòng | Error + code snippet + hypothesis là đủ |
| **Brainstorm/Strategy** | ~120 dòng | Context + options + câu hỏi cụ thể |
| **Review** | ~80 dòng | Code + concerns |
| **Stuck** | ~60 dòng | State + blocking point |

**Vượt limit = FAIL.** Nếu context dài quá → tóm tắt bằng bullet points thay vì copy nguyên văn.

### Scope Rules

| Loại | PHẢI làm | CẤM |
|---|---|---|
| **Code** | Chỉ snippet 10-50 dòng liên quan trực tiếp | Dump nguyên file/module |
| **Architecture** | 1 đoạn 3-5 câu mô tả | Vẽ lại toàn bộ structure |
| **Plan/Feature list** | Tóm tắt bullet, KHÔNG copy nguyên plan | Paste nguyên file 600 dòng |
| **Data/Schema** | Chỉ tables/fields liên quan | Toàn bộ DB schema |
| **Dependencies** | Chỉ ghi: "React 18 + TS + Supabase" | Copy package.json |

### Tóm tắt vs Copy

```
❌ SAI: Copy nguyên SHIP-PLAN.md (600+ dòng) vào context
✅ ĐÚNG: Tóm tắt plan thành 10-15 bullet points, giữ essence

❌ SAI: Liệt kê hết tất cả feature đã build
✅ ĐÚNG: "Đã build xong: Puzzle engine, Board UI, Auth, Admin builder, Stats tracking"

❌ SAI: Paste nguyên T-Coin schema SQL
✅ ĐÚNG: "T-Coin economy: wallet → earn (puzzle/daily/streak) → spend (unlock premium puzzles)"
```

---

## 🤖 Dynamic Prompt Engineering Protocol

> **CRITICAL:** AI PHẢI tự generate instruction prompt chất lượng cao cho MỖI context export. KHÔNG dùng prompt generic.

### Prompt Structure (MANDATORY)

Mỗi context export PHẢI kết thúc bằng một `💡 PROMPT FOR AI` block gồm **5 thành phần**:

```markdown
💡 **PROMPT FOR AI**

**Role:** [Persona cụ thể, có kinh nghiệm, liên quan đến domain của vấn đề]
**Task:** [Mô tả rõ AI cần làm gì với context ở trên]
**Format:** [Cấu trúc output mong muốn — bảng, bullet, numbered list, SWOT, etc.]
**Constraints:** [Giới hạn: tech stack, team size, budget, timeline, language]
**Tone:** [Giọng điệu mong muốn — mentor, co-founder phản biện, senior dev, etc.]
```

### Element Generation Rules

#### 1. ROLE — Chọn persona dựa trên loại vấn đề

| Template Type | Role Examples |
|---|---|
| 🐛 Bug | "Senior [language] developer với 10 năm kinh nghiệm debug [framework]" |
| 🧠 Brainstorm | "Tech lead / Product strategist chuyên [domain]" |
| 🔍 Review | "Staff engineer chuyên code review và system design" |
| 🤯 Stuck | "Mentor kỹ thuật kiên nhẫn, giỏi giải thích concept phức tạp" |

**Rule:** KHÔNG dùng role generic "You are a helpful assistant." — PHẢI specific.

#### 2. TASK — Dùng action verbs cụ thể

```
❌ "Hãy phân tích và đưa ra gợi ý"
✅ "Phân tích root cause của bug này. Liệt kê 3 hypothesis xếp theo khả năng cao nhất. Cho mỗi hypothesis, đề xuất cách verify trong 5 phút."
```

#### 3. FORMAT — Chọn format phù hợp loại vấn đề

| Vấn đề | Format tốt nhất |
|---|---|
| Bug/Debug | Step-by-step diagnosis → Root cause → Fix → Prevention |
| Architecture | SWOT table → Options comparison matrix → Recommendation |
| Feature planning | Impact × Effort matrix → Prioritized list → Effort estimates |
| Code review | Severity-ranked list (Critical → High → Medium → Low) |
| Strategy/Business | SWOT → Gap analysis → Actionable recommendations |

**Rule:** LUÔN yêu cầu format có cấu trúc. KHÔNG để AI trả lời free-form.

#### 4. CONSTRAINTS — Tự extract từ project context

```
AI PHẢI tự thêm constraints dựa trên thông tin đã biết:
- Tech stack hiện tại (từ package.json, config files)
- Team size (thường solo dev nếu không nói khác)
- Ngôn ngữ trả lời (match với ngôn ngữ user đang dùng)
- Timeline/budget nếu đã được đề cập
- "Không gợi ý thay đổi stack trừ khi được hỏi"
```

#### 5. TONE — Match với tình huống

| Situation | Tone |
|---|---|
| Stuck lâu, frustrated | Supportive mentor — giải thích rõ, không phán xét |
| Brainstorm chiến lược | Co-founder phản biện — thẳng thắn, nói thẳng điểm yếu |
| Code review | Senior peer — constructive, khen trước rồi góp ý |
| Bug khẩn cấp | Pragmatic engineer — đi thẳng vào solution, không lý thuyết |

### Model-Specific Enhancements

Sau khi build prompt 5 elements, AI **bổ sung tip** cho model đích:

| Model | Enhance | Mode gợi ý |
|---|---|---|
| **ChatGPT** | Thêm "Think step by step" + chain-of-thought | Extended Thinking |
| **Gemini** | Thêm "Analyze from multiple angles" | Deep Think |
| **Grok** | Thêm "Be direct, no fluff" | Default |
| **Claude** | Thêm "Consider edge cases thoroughly" | Default |

### Example: Auto-Generated Prompt

```markdown
💡 **PROMPT FOR AI**

**Role:** Bạn là một senior Next.js developer với 8 năm kinh nghiệm, 
chuyên về Supabase real-time và performance optimization.

**Task:** Phân tích đoạn code trên và xác định tại sao real-time 
subscription bị memory leak. Đề xuất 3 cách fix, xếp hạng theo 
độ an toàn (ít side-effect nhất lên đầu).

**Format:**
1. Root cause analysis (2-3 câu)
2. 3 solutions — mỗi cái gồm: code snippet, pros/cons, effort (S/M/L)
3. Recommendation: chọn solution nào và tại sao

**Constraints:**
- Stack: Next.js 14 App Router + Supabase JS v2 + TypeScript
- Solo dev, ưu tiên solution đơn giản nhất
- Trả lời bằng tiếng Việt, code comments giữ tiếng Anh

**Tone:** Senior peer review — thẳng thắn nhưng constructive.
```

---

## 📋 Output Delivery Rules

1. **Format**: Luôn output dưới dạng một markdown code block duy nhất — user chỉ cần copy 1 lần
2. **Brevity**: Toàn bộ block PHẢI ≤ 120 dòng. Nếu dài hơn → cắt bớt, tóm tắt
3. **Language**: Phần mô tả viết bằng ngôn ngữ user đang dùng (VN hoặc EN)
4. **Code comments**: Giữ tiếng Anh
5. **Trust AI reasoning**: KHÔNG over-specify format output (ví dụ: "trả lời dạng bảng 7 phần"). Đặt 1-2 câu hỏi chính, để AI tự quyết format. Extended thinking models hoạt động tốt nhất khi prompt ngắn gọn.
6. **Announce**: Khi auto-trigger, announce rõ ràng:
   ```
   🔄 Context đóng gói sẵn — copy paste vào [Model] ([Mode]):
   
   [context block]
   ```
7. **No interruption**: Nếu AI đang giải quyết tốt, KHÔNG trigger — chỉ trigger khi thực sự stuck

---

## ⚠️ Anti-Patterns

| ❌ Don't | ✅ Do |
|---|---|
| Dump toàn bộ file | Chỉ extract phần liên quan |
| Đóng gói khi chưa thử đủ | Thử ít nhất 2 lần trước khi trigger |
| Quên tech stack context | Luôn ghi rõ framework/language/DB |
| Output nhiều block riêng lẻ | Gộp thành 1 block copy-paste duy nhất |
| Trigger khi vấn đề đơn giản | Chỉ trigger khi thực sự complex/stuck |
| Viết mô tả quá dài | Ngắn gọn, cụ thể, đi thẳng vấn đề |
