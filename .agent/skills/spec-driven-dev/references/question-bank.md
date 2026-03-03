# Domain-Specific Question Bank

Use these as **inspiration**, not templates. Generate questions dynamically based on the actual request.

---

## By Domain

### Frontend / UI
| Priority | Question Pattern | Why It Matters |
|----------|-----------------|----------------|
| P0 | What should happen on [state]? (empty, loading, error) | Prevents missing states |
| P0 | Mobile responsive or desktop-only? | Affects layout approach |
| P1 | Follow existing design pattern or new? | Consistency vs innovation |
| P1 | Animation/transition preferences? | Affects complexity |
| P2 | Accessibility requirements? | Scope of a11y work |

### Backend / API
| Priority | Question Pattern | Why It Matters |
|----------|-----------------|----------------|
| P0 | Who calls this? (frontend, other service, cron) | Affects auth, format |
| P0 | Expected data volume? | Affects pagination, indexing |
| P1 | Error handling strategy? (retry, fail fast, queue) | Affects reliability |
| P1 | Need real-time updates or polling OK? | WebSocket vs REST |
| P2 | Logging/monitoring needs? | Observability scope |

### Database
| Priority | Question Pattern | Why It Matters |
|----------|-----------------|----------------|
| P0 | What queries will be most frequent? | Index strategy |
| P0 | Relationships: 1:1, 1:N, N:M? | Schema design |
| P1 | Soft delete or hard delete? | Data retention |
| P1 | Need audit trail / history? | Table structure |

### Refactoring
| Priority | Question Pattern | Why It Matters |
|----------|-----------------|----------------|
| P0 | What's the pain point? (performance, readability, bugs) | Focus of refactor |
| P0 | Can we break things temporarily? | Migration strategy |
| P1 | Tests exist for this area? | Safety net |
| P1 | Keep same API/interface or redesign? | Breaking changes |

### Bug Fix
| Priority | Question Pattern | Why It Matters |
|----------|-----------------|----------------|
| P0 | Steps to reproduce? | Find root cause |
| P0 | When did it start? (recent change?) | Narrow scope |
| P1 | Does it happen consistently or intermittently? | Race condition? |
| P1 | Any error messages / console output? | Direct clues |

---

## By Complexity Detection

### Signals: Use `/spec` (complex)
- Mentions 3+ files
- Keywords: "refactor", "redesign", "migrate", "new feature", "build"
- User is uncertain about approach
- Involves database schema changes
- Affects auth/security

### Signals: Use `/quick` (simple)
- Single file change
- Keywords: "fix", "tweak", "update text", "change color"
- User already knows exact change
- No architectural decisions
