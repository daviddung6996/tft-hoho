# JSON Import cho Puzzle Builder

## Context & Yêu Cầu
Người dùng muốn có một nút bấm để Import puzzle thông qua file/văn bản JSON trong thẻ "Thông tin" (Meta tab) của tính năng Puzzle Builder. Điều này giúp khởi tạo hoặc cấu hình nhanh chóng thay vì nhập liệu thủ công toàn bộ. 

Yêu cầu đã thống nhất:
1. **Vị trí nút:** Cạnh tiêu đề "Thông tin trận đấu" ở thẻ Meta.
2. **Xử lý Validation:** Dùng `try/catch` để parse chuỗi JSON. Nếu không hợp lệ, báo lỗi qua `Toast`.
3. **Cơ chế tải:** Sẽ **Ghi đè** (overwrite) toàn bộ state hiện tại của Puzzle trên builder ngay lập tức.

## Research Findings
- State của PuzzleBuilder được quản lý thông qua hook `usePuzzleBuilderState` trong file `src/pages/Admin/PuzzleBuilder/hooks/usePuzzleBuilderState.ts`.
- Hook hiện tại chỉ cung cấp `updatePuzzle` dạng merge (ghép thêm/sửa đổi). Để ghi đè toàn phần, cần thêm một function `overwritePuzzle` vào hook này để set cứng state.
- Tab `Meta` nằm tại `src/pages/Admin/PuzzleBuilder/tabs/MetaTab.tsx`. Chỗ lý tưởng để đặt nút là component chứa `h3` có class `pb-section-title` với text "Thông tin trận đấu".
- Việc hiển thị lỗi có thể tận dụng state `toast` đã được quản lý sẵn trong `usePuzzleBuilderState.ts`, truyền hàm `showToast` (hoặc tương tự) xuống `MetaTab` khi import lỗi hoặc thành công.

## Danh sách Task (Tasks)

1. **Task 1: Cập nhật `usePuzzleBuilderState`**
   - Thêm function `overwritePuzzle(newPuzzle: PuzzleScenario)` để thay thế toàn bộ state `puzzle`.
   - Export thêm một hàm `setToastState(message, type)` hoặc dùng cấu trúc có sẵn để có thẻ gọi Toast từ bên ngoài.

2. **Task 2: Tạo Modal nhập JSON**
   - Tạo một modal UI đơn giản (giống form) cho phép dán (paste) nội dung JSON vào một `textarea`.
   - Bao gồm nút "Import" và "Hủy".
   - Có cơ chế check JSON `JSON.parse` và validation cơ bản.

3. **Task 3: Gắn nút Import vào `MetaTab`**
   - Đặt một nút icon/text "Import JSON" bên phải tiêu đề "Thông tin trận đấu".
   - Bấm vào nút sẽ mở modal từ trường nhập JSON ở trên.
   - Gắn sự kiện để sau khi parse JSON thành công thì đẩy xuống hàm `overwritePuzzle` và báo Toast thành công.

## Verification / Done When
- [ ] Có nút "Import JSON" trong tab Thông tin của Puzzle Builder.
- [ ] Bấm vào nút sẽ hiện ô nhập text.
- [ ] Paste JSON lỗi/bậy bạ -> Báo Toast màu đỏ (Lỗi JSON không hợp lệ).
- [ ] Paste JSON chuẩn của Puzzle -> Toàn bộ form và state từ Champion Board đến Player Info, Meta Data lập tức phản ánh thông tin mới nhất. Thấy thông báo Toast xanh (Thành công).

## Log
- [01:00] Task 1 complete ✅ — Added `overwritePuzzle` + `showToast` to `usePuzzleBuilderState.ts`
- [01:02] Task 2 complete ✅ — Created `JsonImportModal.tsx` + `JsonImportModal.css` (Hextech theme)
- [01:04] Task 3 complete ✅ — Wired Import button into MetaTab & PuzzleBuilder, passed props
- [01:06] Build verification ✅ — `tsc --noEmit` passes with zero errors
- [01:08] Fix: sanitize null/undefined values in `overwritePuzzle` → no more React warnings ✅

**Status: VERIFYING** — Build complete. Chạy `/check` để verify kết quả.
