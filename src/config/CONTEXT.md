# src/config — Agent Context

## monetization.ts

Controls whether the app runs in **Open Beta** (`'beta'`) or **Free/Pro paywall** (`'free-pro'`) mode.

`MONETIZATION_MODE` is resolved automatically from the current date against `betaWindow`.
`MONETIZATION_ENABLED` is `true` only in `'free-pro'` mode — all paywall gates check this flag.

### Bật OPEN BETA (tắt paywall)

Set `endsAt` to the real beta end date:

```ts
betaWindow: {
    startsAt: '2026-03-17T00:00:00.000Z',
    endsAt: '2026-04-16T23:59:59.999Z',  // ← real end date
},
```

### Simulate post-beta (bật paywall để test)

Set `endsAt` to a date in the past:

```ts
betaWindow: {
    startsAt: '2026-03-17T00:00:00.000Z',
    endsAt: '2026-03-16T23:59:59.999Z',  // TEMP: simulate post-beta — revert to 2026-04-16
},
```

> ⚠️ Luôn revert về `2026-04-16` sau khi test xong. Không commit TEMP override lên main.
