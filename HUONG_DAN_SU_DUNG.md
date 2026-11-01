# 📖 HƯỚNG DẪN SỬ DỤNG — App Tiết Kiệm

> App quản lý heo đất tiền tiết kiệm của **NGUYỄN HOÀNG HẢI ANH**
> 🌐 Mở app: **https://huyhoanghp.github.io/app-ha-tiki/**

---

## 1. 🔐 Đăng nhập

- Mở link app, nhập **email + mật khẩu** → bấm **Đăng nhập**.
- Tài khoản có sẵn:
  | Tài khoản | Mật khẩu mặc định |
  |---|---|
  | `huyhoanghp@gmail.com` | (ND tự đặt) |
  | `anhnhh150612@gmail.com` | `123456` ⚠️ nên đổi ngay |
- **Đăng nhập bằng sinh trắc học**: đăng nhập 1 lần bằng mật khẩu → ⚙️ Cài đặt →
  tick 👆 *Đăng nhập bằng sinh trắc học* + nhập mật khẩu hiện tại → Lần sau chỉ cần
  quét vân tay / khuôn mặt / PIN (Windows Hello, Touch ID, Face ID).

## 2. 📱 Cài app lên điện thoại (dùng như app thật)

- **Android (Chrome)**: mở app → bấm biểu tượng **ⓘ / ⋮** trên thanh địa chỉ → **Thêm vào Màn hình chính** → **Cài đặt**.
- **iPhone (Safari)**: nút **Chia sẻ ⬆️** → **Thêm vào Màn hình chính** → **Thêm**.
- **Máy tính (Chrome/Edge)**: biểu tượng **⬇️ / ⊕** trên thanh địa chỉ → **Cài đặt**.
- Sau khi cài: app mở full màn hình, có icon riêng 💰, **vẫn xem được offline** (mở lần nào cũng tự cập nhật khi có mạng).

## 3. 💰 Nạp tiền / 💸 Rút tiền

1. Bấm nút to **＋ NẠP TIỀN** (xanh) hoặc **－ RÚT TIỀN** (đỏ) ngay trang chủ.
2. Điền:
   - **Ngày tháng** — mặc định là hôm nay, sửa được.
   - **Mệnh giá** — chọn 500k → 1k.
   - **Số lượng (tờ)** — app tự tính Thành tiền.
   - **Nguồn tiền** (khi nạp) hoặc **Mục đích chi** (khi rút) — chọn gợi ý hoặc gõ mới.
   - **Ghi chú** — tùy chọn.
3. Bấm **💾 Lưu** → dữ liệu lưu ngay lên cloud (Firebase).

## 4. 🏠 Dashboard

- **Tổng tiền** hiện có, số tờ, số ngày đã tiết kiệm.
- **Trung bình** tiết kiệm theo tuần / tháng / năm.
- 🔁 **Tuần X của chu kỳ 9 tuần** — tự đếm lại mỗi 9 tuần.
- 3 biểu đồ cột: **theo tuần → theo tháng → theo năm** (cuộn xuống để xem hết).

## 5. 📋 Xem & sửa dữ liệu

- Tab **Chi tiết**: danh sách mọi giao dịch, lọc theo Loại / Từ ngày–Đến ngày / từ khóa.
- Nút **✏️ Sửa** để chỉnh, **🗑️** để xóa (có hỏi lại trước khi xóa).

## 6. 📊 Báo cáo

- Tab **Báo cáo**: tổng hợp tuần này/tháng này/năm nay + bảng chi tiết theo tuần/tháng/năm.
- **📧 Gửi báo cáo email** — mở trình soạn thảo email có sẵn nội dung báo cáo, gửi cho ai tùy ý.
- **📋 Sao chép** nội dung báo cáo · **⬇️ Xuất CSV** mở bằng Excel · **🖨️ In**.

## 7. ⚙️ Cài đặt (nút bánh răng)

- **Chủ sở hữu**: đổi tên hiển thị.
- **Ngày bắt đầu** & **chu kỳ (số tuần)**: để đếm tuần chính xác.
- **Nguồn tiền / Mục đích chi**: sửa danh sách gợi ý (mỗi dòng một lựa chọn).
- **🔒 Đổi mật khẩu** cho tài khoản đang đăng nhập.
- **👆 Bật/tắt sinh trắc học** cho thiết bị này.

## 8. 🌗 Giao diện sáng/tối

- Nút **🌙 / ☀️** góc phải trên — đổi ngay, nhớ lựa chọn của bạn cho lần sau.

## ❓ Gặp vấn đề?

- **Quên mật khẩu** → báo chủ app tạo lại trong Firebase Console, hoặc dùng tài khoản phụ.
- **Số liệu chưa cập nhật** → kéo để tải lại trang (kéo xuống trên điện thoại, hoặc F5).
- **Mất mạng** → app vẫn mở được, dữ liệu mới sẽ lưu khi có mạng trở lại (đang dùng Firebase).
