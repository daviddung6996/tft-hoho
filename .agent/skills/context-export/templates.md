# Context Export Templates

> Mỗi template dưới đây là một **khung sẵn** cho từng loại vấn đề. AI chọn template phù hợp rồi fill data vào.

---

## 1. 🐛 BUG Template

**Trigger:** Lỗi cụ thể, đã thử fix 2-3 lần, root cause chưa rõ.

```markdown
## 🐛 Bug Report — [Tên bug ngắn gọn]
**Project:** [name] | **Stack:** [stack] | **Date:** [date]

### Error
```
[Full error message + stack trace]
```

### Reproduction
1. [Step 1]
2. [Step 2]
3. → Error occurs

### Code
```[lang]
// file: [path]
[Relevant code — max 100 lines]
```

### Tried
| # | Approach | Result |
|---|----------|--------|
| 1 | [what] | ❌ [why failed] |
| 2 | [what] | ❌ [why failed] |

### Environment
- Node: [v], OS: [os], Browser: [if relevant]
- Related packages: [name@version]

### Hypothesis
[Current best guess for root cause]
```

**Best model for bugs:** ChatGPT (Thinking mode) — tốt cho step-by-step debugging.

---

## 2. 🧠 BRAINSTORM Template

**Trigger:** Cần quyết định architecture, design pattern, hoặc approach.

```markdown
## 🧠 Brainstorm — [Tên quyết định]
**Project:** [name] | **Stack:** [stack] | **Date:** [date]

### Context
[Bối cảnh dự án + tại sao cần quyết định này — 3-4 câu]

### Decision Required
[Câu hỏi cụ thể cần trả lời]

### Options I See
| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A | [desc] | [+] | [-] |
| B | [desc] | [+] | [-] |
| C | [desc] | [+] | [-] |

### Constraints
- [Constraint 1: e.g., must work with existing DB schema]
- [Constraint 2: e.g., team size = 1, need simple solution]
- [Constraint 3: e.g., performance requirement]

### Current Architecture (if relevant)
```
[Brief diagram or description of current structure]
```

### What do you recommend and why?
```

**Best model for brainstorm:** Gemini (Deep Think) — phân tích multi-angle.

---

## 3. 🔍 REVIEW Template

**Trigger:** Cần second opinion về code quality, security, hoặc approach.

```markdown
## 🔍 Code Review Request — [Feature/Component]
**Project:** [name] | **Stack:** [stack] | **Date:** [date]

### What This Code Does
[1-2 sentence summary]

### Code
```[lang]
// file: [path]
[Code to review — max 150 lines]
```

### Specific Concerns
1. [Concern 1: e.g., "Is this approach performant enough?"]
2. [Concern 2: e.g., "Am I handling edge cases correctly?"]
3. [Concern 3: e.g., "Is there a simpler way to do this?"]

### Context
- This component is used by: [where/how]
- Expected load/scale: [if relevant]
- Will be extended for: [future plans if relevant]

### Please review for:
- [ ] Correctness
- [ ] Performance
- [ ] Security
- [ ] Maintainability
- [ ] Edge cases
```

**Best model for review:** Claude — careful analysis + edge case detection.

---

## 4. 🤯 STUCK Template

**Trigger:** Bị stuck chung chung, không rõ hướng đi tiếp theo.

```markdown
## 🤯 I'm Stuck — [Mô tả tình huống]
**Project:** [name] | **Stack:** [stack] | **Date:** [date]

### What I'm Trying To Do
[Goal cụ thể — 2-3 câu]

### Where I'm At
[Trạng thái hiện tại — cái gì hoạt động, cái gì không]

### What's Blocking Me
[Mô tả cụ thể chỗ bị block]

### Relevant Code
```[lang]
// file: [path]
[Code snippet showing the blocking point]
```

### What I've Tried
1. [Attempt 1] → [Result]
2. [Attempt 2] → [Result]

### Questions
1. [Specific question 1]
2. [Specific question 2]

### Help me understand what I'm missing and suggest a clear path forward.
```

**Best model for stuck:** Grok — direct, no-nonsense answers.

---

## Template Selection Logic

AI tự chọn template dựa trên context:

```
IF error message exists → BUG template
IF multiple options/approaches discussed → BRAINSTORM template
IF code written but uncertain about quality → REVIEW template
IF none of above / general confusion → STUCK template
```
