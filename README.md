# 💰 App Tiết Kiệm — HA TIKI

Webapp quản lý tiền tiết kiệm (heo đất tiền mặt) — HTML + CSS + JS thuần,
lưu trữ **Firebase Realtime Database**, triển khai **GitHub Pages**.

## ✨ Tính năng

- 🏠 **Dashboard**: tổng tiền, số tờ, số ngày đã tiết kiệm, trung bình theo tuần/tháng/năm, tuần hiện tại của chu kỳ 9 tuần
- 💰 **Nạp tiền** / 💸 **Rút tiền**: nút to nổi bật, ngày tháng (mặc định hôm nay), mệnh giá (500k → 1k), số lượng, nguồn tiền / mục đích chi
- 📊 **Biểu đồ bar** tiết kiệm theo tuần → tháng → năm (xếp dọc theo hàng)
- 📋 **Chi tiết**: toàn bộ giao dịch, lọc theo loại/ngày/từ khóa, sửa & xóa
- 📈 **Báo cáo tổng hợp**: theo tuần/tháng/năm, thẻ tuần này/tháng này/năm nay
- 📧 **Gửi báo cáo email** (mailto), 📋 sao chép, ⬇️ xuất CSV, 🖨️ in báo cáo
- 🔒 Đăng nhập Firebase Email/Password + Realtime Database Rules
- 📱 Responsive mobile/desktop

## 🚀 Chạy local

Chỉ cần mở `index.html` bằng trình duyệt, hoặc:

```bash
npx http-server -p 8080
# mở http://localhost:8080
```

> ⚠️ Chưa kết nối Firebase: app chạy **chế độ demo** (MockStore) — dữ liệu lưu trong
> `localStorage` của trình duyệt, có sẵn bảng kiểm kê ngày 01/11/2026 (6.442.000 ₫ · 83 tờ).

## 🔥 Kết nối Firebase (bắt buộc để lưu trữ thật)

1. Vào [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → đặt tên (vd: `app-tietkiem`).
2. **Build → Realtime Database → Create Database** → chọn vùng gần nhất (Singapore) → **Start in test mode** (sẽ thay Rules ở bước 5).
3. **Build → Authentication → Get started → Email/Password → Enable** → **Add user** → nhập email + mật khẩu của bạn.
4. **Project settings (⚙️) → General → Your apps → Web (`</>`)** → đăng ký app → copy object `firebaseConfig` (phải có `databaseURL`).
5. Mở `js/firebase-config.js`, dán config vào. Thêm dòng vào `<head>` của `index.html` nếu thiếu... *không cần* — mọi thứ đã sẵn sàng.
6. **Realtime Database → Rules** → dán nội dung sau → **Publish** (đổi email nếu cần):

```json
{
  "rules": {
    ".read": "auth != null && auth.token.email == 'huyhoanghp@gmail.com'",
    ".write": "auth != null && auth.token.email == 'huyhoanghp@gmail.com'"
  }
}
```

7. Reload app → hiện màn hình đăng nhập → đăng nhập bằng email/mật khẩu đã tạo ở bước 3.
8. Dữ liệu trống → bấm **"Khởi tạo dữ liệu kiểm kê"** để nạp bảng kiểm kê 01/11/2026.

> Lưu ý: nếu Firebase Console bắt xác thực khu vực (App Check / billing), bỏ qua App Check —
> Rules ở bước 6 đã đủ bảo vệ dữ liệu cho app cá nhân.

## 🌐 Triển khai GitHub Pages

```bash
git init
git add .
git commit -m "feat: webapp tiet kiem"
gh repo create app-ha-tiki --public --source=. --push
gh api repos/<username>/app-ha-tiki/pages -X POST -f "source[branch]=main" -f "source[path]=/"
```

App chạy tại: `https://<username>.github.io/app-ha-tiki/`

## 🗂️ Cấu trúc

```
├── index.html            # 1 trang, 4 tab + modal
├── css/style.css         # theme xanh lá - vàng đồng, responsive, print
├── js/
│   ├── firebase-config.js  # ← dán Firebase config vào đây
│   ├── app.js              # state, data layer (Mock/Firebase), thống kê, seed
│   ├── charts.js           # 3 biểu đồ Chart.js
│   ├── report.js           # báo cáo, CSV, email, copy
│   ├── ui.js               # render, sự kiện, modal, auth
│   └── main.js             # entry point
└── Chat_app_HA_TIKI.md   # nhật ký tương tác với ND
```

## 📐 Sơ đồ dữ liệu (Realtime Database)

```json
{
  "settings": {
    "owner": "NGUYỄN HOÀNG HẢI ANH",
    "cycleWeeks": 9,
    "startDate": "2026-11-01",
    "sources": ["Kiểm kê đầu kỳ", "Tiền lương", "..."],
    "purposes": ["Mua sắm", "..."]
  },
  "transactions": {
    "<push-id>": {
      "type": "nap | rut",
      "date": "2026-11-01",
      "denom": 500000,
      "qty": 4,
      "amount": 2000000,
      "source": "Kiểm kê đầu kỳ",
      "purpose": "(chỉ giao dịch rút)",
      "note": "Kiểm kê tiền mặt 1-11-26 (Tuần 8)",
      "createdAt": "2026-11-01T00:00:00.000Z"
    }
  }
}
```
