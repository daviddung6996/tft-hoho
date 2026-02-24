# Backend Features

This directory contains domain-driven feature modules. 
To prevent the backend from becoming a "garbage bin logic" area, each feature should be self-contained.

## Proposed Structure
```text
backend/
└── features/
    ├── users/
    │   ├── routes.ts
    │   ├── controllers.ts
    │   └── services.ts
    ├── matches/
    │   ├── routes.ts
    │   └── ...
    └── shared/
```
