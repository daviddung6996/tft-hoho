# AGENTS.md - Developer Rules & Standards

> **STATUS: MANDATORY**
> Tệ liệu này chứa các quy tắc nghiêm ngặt. Tất cả AI Agent và Developer BUỘC PHẢI TUÂN THEO không có ngoại lệ.

## 1. Nguyên Tắc Cốt Lõi (NON-NEGOTIABLE)

1.  **Tuân Thủ Design System**: Không được tự ý sáng tạo style mới. Phải dùng đúng màu sắc, font, và kích thước quy định trong "Design System Rules".
2.  **Không Hover Effect**: Tuyệt đối **KHÔNG** thêm hiệu ứng hover (màu mè, scale, slide) trừ khi được yêu cầu. Giao diện phải tĩnh và ổn định như Client Game thật.
3.  **Không AI Icon**: Không dùng các icon mặc định của AI (robot, sparkle stars...). Chỉ dùng icon thuộc bộ Assets hoặc Simple Geometric Shapes.
4.  **Pattern Matching**: Trước khi code component mới, **PHẢI** tìm xem có component nào tương tự chưa (Modal, Button, Input). Nếu có, phải copy style của nó.
5.  **Fixed Ratio Layout**: App chạy trong container 16:9 cố định. Mọi kích thước **PHẢI** dùng đơn vị `cqw`.
6.  **No Native Alerts**: Tuyệt đối **KHÔNG** dùng `alert()`, `confirm()`, hoặc `prompt()`. Phải dùng Modal component (`AdminDeleteModal`, `AdminEditModal`) hoặc Toast notification.

---

## 2. Design System Rules (Hextech Theme)

### 🎨 Color Palette (Bắt buộc dùng biến hoặc mã màu này)

| Thành phần | Màu sắc / Giá trị | Ghi chú |
| :--- | :--- | :--- |
| **Panel Background** | `linear-gradient(180deg, #153a3e 0%, #051c1e 100%)` | Dùng cho tất cả Modal, Popup, Admin Panel |
| **Button Background (Special)** | `linear-gradient(180deg, rgba(21, 58, 62, 0.9) 0%, rgba(5, 28, 30, 0.95) 100%)` | Chỉ dùng cho nút đặc biệt (Augment button) |
| **Border Chính** | `#c8aa6e` (Gold) | Border cơ bản cho Panel, Input, Button, Card |
| **Border Hover** | `#d4b876` (Bright Gold) | Border khi hover - sáng hơn một chút |
| **Text Heading** | `#c8aa6e` (Gold) hoặc `#F0F6FC` (White) | Font: `Spectral` (Serif) |
| **Text Body** | `#94A3B8` (Blue Grey) | Font: `Inter` (Sans-serif) |
| **Text Light** | `#F0E6D2` (Light Cream) | Cho button text và UI chính |
| **Shadow/Glow** | `0 0 1.5cqw rgba(200, 170, 110, 0.25)` | Glow effect chuẩn cho panel |
| **Hover Glow** | `0 0 0.8cqw rgba(200, 170, 110, 0.3)` | Glow effect khi hover (nhẹ hơn) |

### 🧩 UI Components Standard

#### A. Modals & Panels (Admin & Game)
Mọi cửa sổ bật lên (Edit, Delete, Settings...) phải tuân theo CSS sau:
```css
.panel-standard {
    background: linear-gradient(180deg, #153a3e 0%, #051c1e 100%);
    border: 0.1cqw solid #c8aa6e;
    box-shadow: 0 0 1.5cqw rgba(200, 170, 110, 0.25);
    backdrop-filter: blur(8px);
    color: #F0F6FC;
}
```

#### B. Buttons (Nút Bấm)
*   **Standard Button (Hex Button)**:
    *   Background: `transparent`
    *   Border: `0.1cqw solid #c8aa6e`
    *   Color: `#F0E6D2`
    *   Hover: `border-color: #d4b876; box-shadow: 0 0 0.8cqw rgba(200, 170, 110, 0.3);`
    *   **KHÔNG** transform/movement
*   **Special Button (Augment)**:
    *   Background: `linear-gradient(180deg, rgba(21, 58, 62, 0.9) 0%, rgba(5, 28, 30, 0.95) 100%)`
    *   Border: `0.15cqw solid #c8aa6e`
    *   Color: `#F0E6D2`
    *   Hover: Chỉ glow, không di chuyển
*   **Close Button (X)**:
    *   Background: `rgba(0, 0, 0, 0.3)`
    *   Border: `#c8aa6e`
    *   Size: `2cqw` x `2cqw`

#### C. Typography
*   **Tiêu đề (Headings)**: Font `Spectral`, in hoa (UPPERCASE), màu Vàng (#c8aa6e).
*   **Nội dung**: Font `Inter`, màu Trắng/Xám.

---

## 3. Implementation Rules (Coding)

### 📏 Đơn Vị Đo Lường (Unit System)
*   ❌ **CẤM**: `px`, `rem`, `em`, `vh`, `vw` (cho kích thước layout chính).
*   ✅ **BẮT BUỘC**: `cqw` (Container Query Width).
    *   Lý do: App scale theo khung hình 16:9, `px` sẽ bị vỡ layout khi resize.
    *   Công thức: `100cqw` = Chiều rộng toàn màn hình app.

### 🎮 Game Objects (Hexagon)
Kích thước chuẩn cho các ô cờ (Hexagon) trên bàn cờ và hàng chờ:
*   `width`: **5.0cqw**
*   `height`: **5.2cqw**
*   `gap`: **0.8cqw**

### 🖼️ Layout Philosophy
*   **Fixed Position**: Các phần tử không được "nhảy" (reflow) khi thêm bớt nội dung. Vị trí phải cố định (absolute hoặc grid cứng).
*   **Overlay**: Các Modal luôn nằm đè lên trên (z-index cao), nền tối `rgba(0,0,0,0.6)`.

---

## 4. Workflow Cho AI Dev

1.  **Đọc File Này Đầu Tiên**: Mỗi khi bắt đầu task, kiểm tra lại các rule ở đây.
2.  **Kiểm Tra Skills**: Xem thư mục `.agent/skills/` để biết cách tạo UI đúng chuẩn (đặc biệt là `hextech-ui-builder`).
3.  **Refactor Ngay**: Nếu thấy code cũ dùng `px` hoặc màu sai, hãy tự động sửa lại về `cqw` và đúng mã màu `#153a3e`.
4.  **Giữ Code Sạch**: Xóa các file thừa trong `.tmp` sau khi xong việc.
5.  **Không Tạo File Rác**: Không được tạo các file markdown báo cáo kiểu `COMPLETED_TASK.md` trong source code. Update tiến độ vào artifacts hoặc chat log.

---

> **GHI NHỚ**: Mục tiêu là giao diện **Premium, Hextech, Tĩnh (Static)**. Không làm kiểu web thông thường.
