# 📌 Danh Sách Chức Năng Ứng Dụng Quản Lý Chi Tiêu Cá Nhân (my-finance-app)

Tài liệu này ghi nhận toàn bộ định hướng tính năng của ứng dụng **Quản lý chi tiêu cá nhân**, được chia theo lộ trình phát triển từ MVP đến Nâng cao và Tích hợp AI.

---

## 🚀 Giai Đoạn 1: Chức Năng Cốt Lõi (MVP)
> *Mục tiêu: Đảm bảo luồng quản lý tài chính cơ bản cho người dùng.*

### 1.1 Quản Lý Tài Khoản & Xác Thực (User & Auth)
- [x] Đăng ký / Đăng nhập bằng Email + Mật khẩu.
- [x] Quản lý thông tin cá nhân & đổi mật khẩu.

### 1.2 Quản Lý Ví & Tài Khoản Thanh Toán (Wallets / Accounts)
- [x] Quản lý 1 Ví cá nhân duy nhất (Ví chính) cố định đơn vị tiền tệ **VND**.
- [x] Thiết lập số dư ban đầu, chỉnh sửa tên ví, biểu tượng và màu sắc nhận diện.

### 1.3 Quản Lý Giao Dịch Thu - Chi (Transactions)
- [x] Thêm / Sửa / Xóa giao dịch Thu nhập và Chi tiêu (Tự động cập nhật số dư Ví chính).
- [x] Thông tin giao dịch chi tiết: Số tiền (VND), Ngày giờ, Danh mục, Ghi chú.
- [x] Bộ lọc & Tìm kiếm giao dịch nâng cao (theo từ khóa, loại thu/chi và danh mục).

### 1.4 Quản Lý Danh Mục Thu / Chi (Categories)
- [x] Tùy chỉnh danh mục Thu/Chi cá nhân: Thêm mới, chỉnh sửa và xóa tùy ý.
- [x] Bộ danh mục gợi ý hệ thống khởi tạo sẵn (Ăn uống, Đi lại, Mua sắm, Lương, Thưởng...).
- [x] Tùy biến Biểu tượng (Icon) và Màu sắc nhận diện cho từng danh mục.

### 1.5 Báo Cáo & Thống Kê Cơ Bản (Analytics & Reports)
- [x] Trang Tổng quan (Dashboard): Tổng thu, Tổng chi, Số dư tổng hợp.
- [x] Biểu đồ cơ cấu chi tiêu (Pie Chart / Donut Chart) theo danh mục.
- [x] Biểu đồ biến động Thu - Chi theo Tuần / Tháng / Năm.

---

## 📈 Giai Đoạn 2: Nâng Cao & Quản Lý Kế Hoạch (Advanced Features)
> *Mục tiêu: Hỗ trợ kiểm soát ngân sách, lập kế hoạch và nhắc nhở tự động.*

### 2.1 Lập Ngân Sách & Hạn Mức Chi Tiêu (Budgeting)
- [ ] Đặt hạn mức chi tiêu theo Tháng / Tuần cho toàn bộ hoặc từng danh mục cụ thể.
- [ ] Theo dõi phần trăm hoàn thành ngân sách theo thời gian thực.
- [ ] Cảnh báo thông báo (Notification) khi đạt mức 80%, 90% hoặc vượt ngân sách.

### 2.2 Thu Chi Định Kỳ & Hóa Đơn (Recurring Transactions & Bills)
- [ ] Thiết lập giao dịch tự động lặp lại (Tiền nhà, tiền điện, gói mạng, lương tháng...).
- [ ] Nhắc nhở lịch thanh toán hóa đơn sắp đến hạn.

### 2.3 Mục Tiêu Tiết Kiệm (Savings Goals)
- [ ] Tạo mục tiêu tiết kiệm (Mua xe, Du lịch, Quỹ khẩn cấp...).
- [ ] Ghi nhận số tiền nạp vào mục tiêu và theo dõi tiến độ %.

### 2.4 Quản Lý Nợ & Cho Vay (Debts & Loans)
- [ ] Quản lý khoản vay (Đi vay) và Cho mượn (Cho vay).
- [ ] Ghi nhận tiến độ trả nợ/thu nợ từng phần.
- [ ] Nhắc nhở lịch đòi nợ/trả nợ đúng hạn.

### 2.5 Báo Cáo Chuyên Sâu & Xuất Dữ Liệu (Import / Export)
- [ ] Xuất báo cáo dữ liệu tài chính ra định dạng **Excel (.xlsx)** hoặc **PDF**.
- [ ] So sánh xu hướng chi tiêu giữa các tháng/kỳ tài chính.

### 2.6 Đa Tiền Tệ & Tỷ Giá (Multi-Currency)
- [ ] Hỗ trợ nhiều loại tiền tệ (VND, USD, EUR...).
- [ ] Tự động chuyển đổi số dư theo tỷ giá thị trường.

---

## 🤖 Giai Đoạn 3: Tự Động Hóa & Trợ Lý Thông Minh (AI Features)
> *Mục tiêu: Nhập liệu nhanh chóng, phân tích thói quen và đưa ra khuyến nghị tài chính.*

### 3.1 Quét Hóa Đơn Bằng AI (OCR Invoice Scanning)
- [ ] Chụp ảnh hóa đơn/biên lai, AI tự nhận diện số tiền, ngày tháng, cửa hàng và gợi ý danh mục.

### 3.2 Nhập Liệu Bằng Giọng Nói / Chatbot AI
- [ ] Thêm giao dịch qua câu lệnh giọng nói hoặc tin nhắn chat (VD: *"Hôm nay ăn trưa 45k"*).

### 3.3 Trợ Lý Tài Chính Thông Minh (AI Financial Assistant)
- [ ] Phân tích thói quen tiêu dùng cá nhân.
- [ ] Đưa ra cảnh báo thông minh (VD: *"Bạn đang chi cho mua sắm gấp 2 lần bình thường tháng này"*).
- [ ] Gợi ý kế hoạch phân bổ dòng tiền (Quy tắc 50/30/20, 6 hũ tài chính...).

### 3.4 Quản Lý Chi Tiêu Nhóm / Gia Đình (Shared Household Budget)
- [ ] Tạo ví chung cho Vợ/Chồng hoặc Nhóm bạn.
- [ ] Phân quyền xem / chỉnh sửa / duyệt giao dịch trong ví chung.

---

## 🗄️ Mô Hình Dữ Liệu Tham Chiếu (Database Entities)
- **User**: Người dùng
- **Wallet**: Ví tiền / Tài khoản
- **Category**: Danh mục Thu/Chi
- **Transaction**: Giao dịch
- **Budget**: Ngân sách
- **Goal**: Mục tiêu tiết kiệm
- **DebtLoan**: Quản lý vay/nợ
