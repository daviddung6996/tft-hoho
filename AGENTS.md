# AGENTS.md - Developer Rules & Standards

> **STATUS: MANDATORY**
> Tệ liệu này chứa các quy tắc nghiêm ngặt. Tất cả AI Agent và Developer BUỘC PHẢI TUÂN THEO không có ngoại lệ.

## 0. Ngôn Ngữ App (LANGUAGE)

**App này là App TIẾNG VIỆT, dành cho cộng đồng gamer TFT Việt Nam.**
- Tất cả UI text, label, button, placeholder, thông báo, toast **PHẢI** viết bằng tiếng Việt.
- **KHÔNG** dùng tiếng Anh cho bất kỳ text nào hiển thị cho người dùng, trừ thuật ngữ game quốc tế (ví dụ: "Augment", tên tướng, tên item gốc).
- Khi thêm component mới hoặc sửa text, **PHẢI** đảm bảo text là tiếng Việt.

## 1. Triết Lý Thiết Kế: Hextech Premium (DESIGN PHILOSOPHY)

> App này KHÔNG phải website. App này là **Game Client**. Mọi thiết kế phải tạo cảm giác đang ở trong Client League of Legends.

### 5 Nguyên Tắc Cốt Lõi

1. **Atmosphere First (Không Gian Trước Tiên)**
   - Nền KHÔNG bao giờ là màu phẳng. Luôn dùng **layered radial gradients** tạo chiều sâu.
   - Background overlay: `radial-gradient(ellipse at 50% 30%, rgba(200, 170, 110, 0.08), transparent 60%)` lên trên `linear-gradient(180deg, #051c1e, #000)`.
   - Ambient particles (gold sparkle dots) cho các màn hình quan trọng (Login, Review).
   - Không gian "thở" — padding tối thiểu `3cqw`, để atmosphere làm việc thay cho content.

2. **Section-Based Composition (Bố Cục Theo Phân Đoạn)**
   - UI KHÔNG phải là "card nổi trên nền". UI là các **section nối liền nhau** bằng border chung.
   - Mỗi section có vai trò riêng: Hero → CTA → Options → Detail.
   - Border trái/phải chạy liên tục giữa các section, tạo cảm giác **một khối thống nhất**.
   - Dùng **Corner Accent Frame** (đường L ở 4 góc) thay vì clip-path cho toàn bộ panel.

3. **Progressive Disclosure (Tiết Lộ Dần Dần)**
   - Hiển thị ít, hành động rõ. Không bao giờ show hết mọi thứ cùng lúc.
   - Form phức tạp (email/password) ẩn sau một click. Mặc định chỉ show CTA chính.
   - Animation chỉ cho transition nội dung (slide-in 0.3s), KHÔNG cho hover.

4. **Hero-CTA Pattern (Mẫu Trang Đích)**
   - Mọi màn hình fullscreen phải có: **Hero** (giá trị / context) → **CTA** (hành động chính) → **Secondary** (tùy chọn phụ).
   - CTA chính: Nút vàng gold lớn với **hextech chamfer** (clip-path bát giác) và **glow sweep animation**.
   - CTA phụ: Border mỏng, nền trong suốt, cùng hàng ngang.

5. **Guided Attention (Dẫn Dắt Ánh Nhìn)**
   - Chỉ **MỘT** phần tử có animation tại mỗi thời điểm (glow sweep trên CTA chính).
   - Mọi thứ khác TĨNH. Chỉ `border-color` và `box-shadow` thay đổi khi hover.
   - Visual hierarchy: Badge nhỏ → Title lớn → Tagline → Feature pills → CTA → Divider → Options.

### CSS Atmosphere Template
```css
/* Nền không gian chuẩn cho overlay/fullscreen */
.hextech-atmosphere {
    background:
        radial-gradient(ellipse at 50% 30%, rgba(200, 170, 110, 0.08) 0%, transparent 60%),
        radial-gradient(ellipse at 50% 80%, rgba(21, 58, 62, 0.4) 0%, transparent 50%),
        linear-gradient(180deg, rgba(5, 28, 30, 0.92) 0%, rgba(0, 0, 0, 0.96) 100%);
}

/* Corner Accent Frame cho section */
.corner-accent {
    position: absolute;
    width: 1.8cqw;
    height: 1.8cqw;
    border-color: #c8aa6e;
    border-style: solid;
    opacity: 0.5;
}

/* Gold CTA button chuẩn */
.hextech-cta {
    background: linear-gradient(180deg, #C89B3C 0%, #A07828 100%);
    border: 0.1cqw solid #c8aa6e;
    clip-path: polygon(1cqw 0, calc(100% - 1cqw) 0, 100% 1cqw, 100% calc(100% - 1cqw), calc(100% - 1cqw) 100%, 1cqw 100%, 0 calc(100% - 1cqw), 0 1cqw);
    overflow: hidden;
}

/* Glow sweep animation cho CTA */
.hextech-cta .glow-sweep {
    position: absolute;
    top: 0; left: -100%; width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    animation: sweep 3s ease-in-out infinite;
}
@keyframes sweep { 0%,100% { left: -60%; } 50% { left: 100%; } }
```

---

## 2. Nguyên Tắc Bắt Buộc (NON-NEGOTIABLE)

1. **Tuân Thủ Design System**: Dùng đúng màu sắc, font, kích thước trong "Design System Rules".
2. **Không Hover Animation**: **KHÔNG** thêm hiệu ứng hover (scale, slide, transform). Chỉ `border-color` + `box-shadow` glow.
3. **Không Icon AI**: **KHÔNG** dùng icon Unicode symbols (⚔★◆), emoji, hoặc icon AI-generated. Chỉ dùng **SVG inline tối giản** hoặc **icon từ assets Riot chính thức**.
4. **Pattern Matching**: Trước khi code component mới, tìm component tương tự đã có. Copy style.
5. **Fixed Ratio Layout**: Container 16:9 cố định. Mọi kích thước dùng `cqw`.
6. **No Native Alerts**: Dùng `Toast` hoặc Modal thay vì `alert()`, `confirm()`, `prompt()`.
7. **Tiếng Việt**: Mọi text hiển thị cho người dùng **PHẢI** bằng tiếng Việt (mục 0).

---

## 3. Design System Rules (Hextech Theme)

### Color Palette

| Thành phần | Giá trị | Ghi chú |
| :--- | :--- | :--- |
| **Atmosphere BG** | Layered radial gradients (xem template trên) | Cho overlay, fullscreen |
| **Panel BG** | `linear-gradient(180deg, #153a3e 0%, #051c1e 100%)` | Cho section, modal content |
| **Section BG (subtle)** | `rgba(5, 28, 30, 0.8)` đến `rgba(5, 28, 30, 0.95)` | Cho section giữa/dưới |
| **CTA Button** | `linear-gradient(180deg, #C89B3C 0%, #A07828 100%)` | Nút hành động chính |
| **Border** | `#c8aa6e` (Gold) | 0.06-0.1cqw |
| **Border subtle** | `rgba(200, 170, 110, 0.15)` | Cho section borders |
| **Text Heading** | `#c8aa6e` (Gold) hoặc `#F0E6D2` (Cream) | Font: Spectral |
| **Text Body** | `#94A3B8` (Blue Grey) | Font: Inter |
| **Text Light** | `#F0E6D2` (Light Cream) | UI text chính |
| **Text Muted** | `rgba(200, 170, 110, 0.45)` | Divider text, hint |
| **Glow** | `0 0 1.5cqw rgba(200, 170, 110, 0.25)` | Panel glow |
| **CTA Text** | `#051c1e` (Dark) | Text trên nút gold |

### Typography

| Vai trò | Font | Weight | Màu |
| :--- | :--- | :--- | :--- |
| Title lớn | Spectral | 700 | #F0E6D2 |
| Subtitle | Inter | 500 | rgba(200, 170, 110, 0.6) |
| Heading | Spectral | 700, UPPERCASE | #c8aa6e |
| Tagline | Inter | 400 | rgba(240, 230, 210, 0.8) |
| Body | Inter | 400-500 | #94A3B8 |
| Badge | Inter | 600, UPPERCASE | #c8aa6e |
| Button CTA | Spectral | 700, UPPERCASE | #051c1e |
| Button Secondary | Inter | 500 | rgba(240, 230, 210, 0.8) |

### UI Components

#### A. Section Panel (Mới - Section-based)
```css
.section-panel {
    width: 100%;
    padding: 2cqw 3cqw;
    background: linear-gradient(180deg, rgba(21, 58, 62, 0.5) 0%, rgba(5, 28, 30, 0.8) 100%);
    border: 0.06cqw solid rgba(200, 170, 110, 0.15);
}
```

#### B. Nút CTA Chính (Gold Chamfer)
```css
.cta-primary {
    background: linear-gradient(180deg, #C89B3C 0%, #A07828 100%);
    border: 0.1cqw solid #c8aa6e;
    color: #051c1e;
    font-family: 'Spectral', serif;
    font-weight: 700;
    text-transform: uppercase;
    clip-path: polygon(1cqw 0, calc(100% - 1cqw) 0, 100% 1cqw, 100% calc(100% - 1cqw), calc(100% - 1cqw) 100%, 1cqw 100%, 0 calc(100% - 1cqw), 0 1cqw);
}
```

#### C. Nút Secondary (Ghost)
```css
.btn-secondary {
    background: rgba(200, 170, 110, 0.04);
    border: 0.06cqw solid rgba(200, 170, 110, 0.2);
    color: rgba(240, 230, 210, 0.8);
    font-family: 'Inter', sans-serif;
}
```

#### D. Divider
```css
.hex-divider {
    height: 0.04cqw;
    background: linear-gradient(90deg, transparent, rgba(200, 170, 110, 0.2), transparent);
}
```

---

## 4. Implementation Rules (Coding)

### Đơn Vị
- **BẮT BUỘC**: `cqw` cho tất cả layout. `100cqw` = Full Width.
- **CẤM**: `px`, `rem`, `em`, `vh`, `vw`.

### Game Objects (Hexagon)
- `width`: 5.0cqw | `height`: 5.2cqw | `gap`: 0.8cqw

### Layout
- **Fixed Position**: Không reflow. Absolute hoặc grid cứng.
- **Overlay**: z-index cao, nền atmosphere (KHÔNG dùng rgba đen phẳng).

---

## 5. Workflow Cho AI Dev

1. **Đọc AGENTS.md** trước mỗi task.
2. **Kiểm tra** `.agent/skills/hextech-core/` cho design tokens và components.
3. **Pattern match**: Tìm component tương tự trước khi tạo mới.
4. **Refactor ngay**: Code cũ dùng `px` hoặc màu sai → sửa về `cqw` + đúng palette.
5. **Không tạo file rác**: Không tạo COMPLETED_TASK.md hay report files.

---

> **GHI NHỚ**: Mục tiêu là **Game Client Premium** — KHÔNG PHẢI website. Nếu trông giống Bootstrap/Tailwind template → **THẤT BẠI**. Nếu trông giống League Client → **ĐÚNG**.
