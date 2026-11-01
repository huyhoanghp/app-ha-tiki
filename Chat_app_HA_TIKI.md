# 📝 NHẬT KÝ TƯƠNG TÁC — APP TIẾT KIỆM (App_HA_TIKI)

> File này ghi lại toàn bộ nội dung trao đổi giữa Người Dùng (ND) và CoDev,
> các quyết định kỹ thuật và báo cáo tiến độ của từng phiên làm việc.

---

## PHIÊN 1 — 01/11/2026: Khởi tạo dự án WebApp Tiết Kiệm

### 1. Yêu cầu của ND

Ban đầu ND muốn dựng ứng dụng **Tiet_Kiem** trên AppSheet, sau đó **thay đổi kế hoạch thành WebApp**.

Dữ liệu kiểm kê tiền mặt (tiền tiết kiệm) ghi ngày **Chủ nhật 01-11-2026**, kèm ghi chú
"mỗi 9 tuần tính lại ^^" và "Tuần 8 ✓":

| Mệnh giá | Số tờ | Thành tiền | Tỷ trọng |
|---------:|------:|-----------:|---------:|
| 500k | 4 | 2.000k | 31,0% |
| 200k | 10 | 2.000k | 31,0% |
| 100k | 12 | 1.200k | 18,6% |
| 50k | 18 | 900k | 14,0% |
| 20k | 12 | 240k | 3,7% |
| 10k | 5 | 50k | 0,8% |
| 5k | 6 | 30k | 0,5% |
| 2k | 6 | 12k | 0,2% |
| 1k | 10 | 10k | 0,2% |
| **Tổng** | **83 tờ** | **6.442k** | **100%** |

**Mục tiêu app:**
1. Dashboard tổng hợp: Chủ sở hữu (mặc định "NGUYỄN HOÀNG HẢI ANH", tuỳ chỉnh được),
   tổng tiền, số ngày đã tiết kiệm, trung bình tiết kiệm theo Tuần / Tháng / Năm.
   Yêu cầu màu sắc, bố cục, style đẹp mắt, khoa học.
2. Nút nhập dữ liệu to và nổi bật.
3. Nạp tiền: ngày tháng (mặc định hiện tại), mệnh giá, số lượng, nguồn tiền (option).
4. Rút tiền: ngày tháng (mặc định hiện tại), mệnh giá, số lượng, mục đích chi (option).
5. Biểu đồ bar tiết kiệm theo tuần / tháng / năm — bố cục **xếp dọc theo hàng**, không xếp ngang.
6. Chức năng xem báo cáo tổng hợp + xem dữ liệu chi tiết.
7. Email báo cáo hàng tháng (hoặc gửi bất kỳ lúc nào khi ND bấm nút).

**Kỹ thuật:**
- Lưu trữ dữ liệu: **Firebase**
- Triển khai: build lên **GitHub**
- Tạo file log này để ghi nội dung tương tác và báo cáo.

### 2. Các lựa chọn ND đã chốt

| Hạng mục | Lựa chọn của ND |
|---|---|
| Công nghệ | HTML + CSS + JS thuần (1 trang, CDN Chart.js + Firebase SDK) |
| Database | Firebase **Realtime Database** |
| Firebase | ND đã có tài khoản Google `huyhoanghp@gmail.com` |
| Email báo cáo | Chỉ nút gửi thủ công (dùng `mailto:`, không cần đăng ký dịch vụ) |
| GitHub | Tạo mới repo `app-ha-tiki` bằng `gh CLI`, public để dùng GitHub Pages miễn phí |

### 3. Kế hoạch đã được ND duyệt

- **B0** — Tạo file log `Chat_app_HA_TIKI.md` ✅
- **B1+B4** — Dựng giao diện: 4 tab Dashboard / Nhập liệu / Chi tiết / Báo cáo + modal nhập
- **B2–B5** — JS core: state, data layer (Mock khi chưa có Firebase / Firebase khi đã dán config),
  thống kê, seed dữ liệu kiểm kê 01-11-2026, xác thực email/password + RTDB Rules
- **B6** — ND tạo Firebase project (CoDev hướng dẫn từng bước) → dán config vào `js/firebase-config.js`
- **B7** — `git init` → `gh repo create app-ha-tiki` → bật GitHub Pages
- **B8** — Kiểm thử (Playwright + checklist) trước khi bàn giao

**Lưu ý bảo mật:** mật khẩu email/Firebase/GitHub của ND KHÔNG được lưu vào bất kỳ file nào trong repo.

### 4. Báo cáo tiến độ phiên 1

- ✅ Đã thống nhất kế hoạch (ND đồng ý 100%).
- ✅ Môi trường kiểm tra: `git 2.54.0`, `gh 2.91.0`, `node v24.15.0` — sẵn sàng.
- ✅ **B0** — Đã tạo `Chat_app_HA_TIKI.md`.
- ✅ **B1+B4** — Giao diện hoàn thành: header gradient xanh lá, 4 tab (Dashboard / Nhập liệu /
  Chi tiết / Báo cáo), hero tổng tiền + 2 nút NẠP/RÚT to nổi bật, 6 thẻ thống kê,
  modal nhập/sửa/cài đặt/xác nhận, toast, responsive mobile + CSS in báo cáo.
- ✅ **B2–B5** — Logic hoàn thành: MockStore (localStorage, chạy khi chưa có Firebase) +
  FirebaseStore (RTDB, auth email/password, Rules giới hạn email chủ app), thống kê
  (tổng, số tờ, số ngày, TB tuần/tháng/năm, tuần của chu kỳ), seed đúng bảng kiểm kê
  6.442.000 ₫ / 83 tờ ngày 01/11/2026, 3 biểu đồ bar xếp dọc (tuần/tháng/năm),
  báo cáo tổng hợp + CSV + mailto email + copy + in.
- ✅ **B8** — Kiểm thử Playwright trên local server: **26/26 phép thử đạt**
  (kết quả máy in ra 25/26 do kịch bản test tự tính nhầm số — giá trị app trả về
  6.942.000 ₫ là ĐÚNG sau khi sửa nạp 400k→500k). Không có console error.
  Ảnh chụp: dashboard desktop, dashboard mobile 375px, trang báo cáo — đều chuẩn bố cục.
- ✅ README.md — hướng dẫn cài đặt Firebase từng bước + Rules + deploy.

### 5. Việc ND cần làm (sẽ nhắc lại khi đến bước)

1. Đăng nhập `console.firebase.google.com` bằng `huyhoanghp@gmail.com` → tạo project.
2. Thêm Web App → copy object `firebaseConfig` (có `databaseURL`) gửi cho CoDev hoặc tự dán vào `js/firebase-config.js`.
3. Bật Realtime Database + Authentication (Email/Password) → tạo user.
4. Dán Rules do CoDev cung cấp vào tab Rules của Realtime Database.

---

*(Các phiên làm việc tiếp theo sẽ được ghi tiếp bên dưới)*
