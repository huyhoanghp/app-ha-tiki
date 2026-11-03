# 📝 NHẬT KÝ TƯƠNG TÁC — APP TIẾT KIỆM (App_HA_TIKI)

> File này ghi lại toàn bộ nội dung trao đổi giữa Người Dùng (ND) và CoDev,
> các quyết định kỹ thuật và báo cáo tiến độ của từng phiên làm việc.
>
> **Cấu trúc file:**
> - **PHẦN A** — Tổng hợp toàn bộ yêu cầu của ND + trạng thái thực hiện
> - **PHẦN B** — Lịch sử các phiên 1 → 4
> - **PHẦN C** — Phiên đang diễn ra (phiên 5)
> - **PHẦN D** — Ghi chú kỹ thuật & quy ước dự án

---

# 🅰️ PHẦN A — TỔNG HỢP YÊU CẦU & TRẠNG THÁI

## A1. Nền tảng & lưu trữ

| # | Yêu cầu | Phiên | Trạng thái |
|---|---|---|---|
| 1 | Webapp HTML+CSS+JS thuần (bỏ ý định AppSheet) | 1 | ✅ |
| 2 | Firebase Realtime Database + Auth Email/Password | 1–2 | ✅ project `apptietkiem` (Singapore) |
| 3 | Deploy GitHub Pages, repo `app-ha-tiki` | 1 | ✅ |
| 4 | File log trao đổi `Chat_app_HA_TIKI.md` | 1 | ✅ |

## A2. Dashboard & thống kê

| # | Yêu cầu | Phiên | Trạng thái |
|---|---|---|---|
| 1 | Tổng tiền, số tờ, số ngày tiết kiệm, TB tuần/tháng/năm | 1 | ✅ |
| 2 | Chủ sở hữu "NGUYỄN HOÀNG HẢI ANH", tùy chỉnh được | 1 | ✅ |
| 3 | Tuần X của chu kỳ (mặc định 9 tuần) | 1 | ✅ |
| 4 | 3 biểu đồ bar theo tuần/tháng/năm — **xếp dọc theo hàng** | 1 | ✅ |
| 5 | **Xu hướng ↑↓** so kỳ này vs kỳ trước (tuần/tháng/năm) | 5 | ✅ thẻ ▲▼ xanh/đỏ |

## A3. Nhập liệu (Nạp / Rút)

| # | Yêu cầu | Phiên | Trạng thái |
|---|---|---|---|
| 1 | Nút Nạp/Rút to nổi bật ở Dashboard + tab Nhập liệu | 1 | ✅ |
| 2 | Nạp: ngày, mệnh giá, số tờ, nguồn tiền; Rút: … mục đích chi | 1 | ✅ |
| 3 | Tự tính thành tiền, lưu cloud ngay | 1 | ✅ |
| 4 | **Droplist tự xây** (mệnh giá/nguồn/mục đích) + "✏️ Nhập khác…" — không dùng control mặc định | 5 | ✅ |
| 5 | **Lịch chọn ngày tự xây** (modal tháng, T2→CN) — không dùng date picker OS | 5 | ✅ |
| 6 | Gợi ý nguồn/mục đích tự học (nhập mới → tự thêm vào danh sách) | 1 | ✅ |

## A4. Chi tiết & lọc

| # | Yêu cầu | Phiên | Trạng thái |
|---|---|---|---|
| 1 | Bảng mọi giao dịch + sửa/xóa (có xác nhận) | 1 | ✅ |
| 2 | Lọc loại / từ ngày–đến ngày / từ khóa | 1 | ✅ |
| 3 | Placeholder ngày **"Từ ngày" / "Đến ngày"** | 5 | ✅ |
| 4 | Mobile: bảng vừa màn hình (ẩn bớt cột) | 4 | ✅ |

## A5. Báo cáo

| # | Yêu cầu | Phiên | Trạng thái |
|---|---|---|---|
| 1 | Tổng hợp tuần/tháng/năm + bảng chi tiết có dòng Tổng | 1 | ✅ |
| 2 | 📧 Gửi email (mailto), 📋 Sao chép, ⬇️ CSV | 1 | ✅ |
| 3 | **3 biểu đồ ngay trong tab Báo cáo** | 5 | ✅ |
| 4 | **📊 Xuất XLSX "đẹp"** (ExcelJS: tiêu đề xanh, viền, numFmt ₫, ảnh chart nhúng) | 5 | ✅ |
| 5 | **🖨️ In đẹp**: header riêng (tên/ngày xuất/tổng tiền), tự chuyển theme sáng khi in | 5 | ✅ |

## A6. Tài khoản & bảo mật

| # | Yêu cầu | Phiên | Trạng thái |
|---|---|---|---|
| 1 | Đăng nhập email/mật khẩu, Rules giới hạn email | 1–2 | ✅ |
| 2 | Tài khoản phụ `anhnhh150612@gmail.com` / `123456` | 3 | ✅ |
| 3 | Đổi mật khẩu ngay trong app (⚙️ Cài đặt) | 3 | ✅ |
| 4 | Đăng nhập sinh trắc học (WebAuthn) | 3 | ✅ |
| 5 | **Fix sinh trắc lỗi trên Android (Redmi/Xiaomi)** → fallback **PIN nhanh 4–6 số** tự tạo trong app | 5 | ✅ |
| 6 | Nút đăng nhập nhanh: "👆 Đăng nhập nhanh (sinh trắc / PIN)" | 5 | ✅ |
| 7 | **Tự động đăng xuất khi rời app > 5 phút** (chọn phương án "rời app" sau khi CoDev hỏi lại) | 5 | ✅ |
| 8 | **Đa user — mỗi user 1 CSDL riêng biệt** + màn đăng ký có duyệt + admin panel 👥 | 5 | ✅ |

## A7. Giao diện & PWA

| # | Yêu cầu | Phiên | Trạng thái |
|---|---|---|---|
| 1 | Đẹp, khoa học, màu chuẩn | 1 | ✅ |
| 2 | Theme sáng/tối, nhớ lựa chọn | 3 | ✅ |
| 3 | PWA: cài lên màn hình chính, offline được | 4 | ✅ SW `tietkiem-v2` |
| 4 | Tự kiểm tra + tối ưu mobile | 4 | ✅ |
| 5 | Hướng dẫn sử dụng cho người mới | 4 | ✅ `HUONG_DAN_SU_DUNG.md` |
| 6 | **Trang hướng dẫn đọc được trên điện thoại** (`huong-dan.html`, có style, dark-mode aware) | 5 | ✅ |
| 7 | **Popup/droplist/datepicker đồng bộ style app — không dùng control mặc định OS** | 5 | ✅ |

## A8. Vận hành

| # | Yêu cầu | Phiên | Trạng thái |
|---|---|---|---|
| 1 | Email báo cáo hàng tháng / bấm nút là gửi | 1 | ✅ bấm nút |
| 2 | **Tái cấu trúc file chat**: Phần A yêu cầu tổng hợp / B lịch sử / C phiên hiện tại / D ghi chú | 5 | ✅ chính là file này |

---

# 🅱️ PHẦN B — LỊCH SỬ PHIÊN 1 → 4

## PHIÊN 1 (01/11/2026): Khởi tạo WebApp Tiết Kiệm

**Yêu cầu:** ND ban đầu muốn app AppSheet → đổi sang WebApp. Dữ liệu kiểm kê ngày Chủ nhật 01-11-2026
("mỗi 9 tuần tính lại ^^", "Tuần 8 ✓") — **83 tờ / 6.442.000 ₫**:

| Mệnh giá | Số tờ | Thành tiền | Mệnh giá | Số tờ | Thành tiền |
|---:|---:|---:|---:|---:|---:|
| 500k | 4 | 2.000k | 20k | 12 | 240k |
| 200k | 10 | 2.000k | 10k | 5 | 50k |
| 100k | 12 | 1.200k | 5k | 6 | 30k |
| 50k | 18 | 900k | 2k | 6 | 12k |
| | | | 1k | 10 | 10k |

**Kỹ thuật ND chọn:** HTML+CSS+JS thuần 1 trang · CDN Chart.js + Firebase · Firebase RTDB ·
GitHub Pages miễn phí · email báo cáo chỉ nút thủ công (`mailto:`) · mật khẩu KHÔNG lưu repo.

**Đã làm:** 4 tab Dashboard/Nhập liệu/Chi tiết/Báo cáo · hero + nút to · 6 thẻ thống kê ·
MockStore/FirebaseStore · seed đúng bảng kiểm kê · auth + RTDB Rules · 3 bar chart xếp dọc ·
báo cáo + CSV + mailto + copy + in · README hướng dẫn Firebase.
**Kiểm thử:** Playwright 26/26 PASS · deploy live HTTP 200.
**ND cần làm tiếp:** tạo Firebase project + dán config (bước B6).

## PHIÊN 2 (01/11/2026): CoDev tự làm bước B6 qua Playwright

ND ủy quyền — CoDev đăng nhập Google bằng Chrome thật (ND bấm **Yes** trên điện thoại
Redmi Note 12 khi Google gửi xác minh 2 bước):

| Việc | Kết quả |
|---|---|
| Tạo project `apptietkiem` (tắt Analytics) | ✅ |
| RTDB tại Singapore (asia-southeast1) | ✅ |
| Auth Email/Password + user `huyhoanghp@gmail.com` | ✅ |
| Web App + trích `firebaseConfig` (shadow DOM) | ✅ |
| Publish Rules (chỉ email chủ app) | ✅ |
| Dán config → push → Pages build | ✅ |
| E2E trên bản live: seed → nạp 60k → xóa → về đúng 6.442.000 ₫ | ✅ 9/9 PASS |

## PHIÊN 3 (01/11/2026): Tài khoản phụ + đổi mật khẩu + theme + sinh trắc

**Yêu cầu:** (1) tài khoản phụ `anhnhh150612@gmail.com`/`123456`; (2) đổi mật khẩu trong app;
(3) theme sáng/tối chuẩn màu; (4) đăng nhập sinh trắc học.

**Đã làm:** tạo user phụ bằng Firebase REST API · Rules cho phép cả 2 email ·
toàn bộ CSS sang biến `:root`/`html[data-theme="dark"]` + nút 🌙/☀️ (lưu localStorage theo
thiết bị + đồng bộ theo tài khoản) · đổi mật khẩu qua `reauthenticateWithCredential` +
`updatePassword` (xử lý đủ lỗi) · WebAuthn platform authenticator + lưu mật khẩu obfuscated
(XOR key + base64) trong localStorage.

**Kiểm thử:** 18/20 PASS (2 "FAIL" do kịch bản test quên theme lưu theo thiết bị — thực tế đúng).
Dark mode xem ảnh chụp: card/bảng/charts/toast/modal đều chuẩn màu.

## PHIÊN 4 (01/11/2026): Mobile audit + PWA + hướng dẫn sử dụng

**Yêu cầu:** (1) self-check mobile; (2) PWA; (3) hướng dẫn người mới.

**Mobile fixes:** ẩn cột 3/4/6/7 bảng Chi tiết trên <640px (hết tràn ngang) · input 16px (chống
iOS zoom) · tap target 44px · `viewport-fit=cover` + safe-area · `touch-action: manipulation`.

**PWA:** icon 192/512 (Canvas render) · `manifest.webmanifest` (standalone, maskable) ·
`sw.js` precache app shell, HTML/CSS/JS network-first, CDN cache-first, xem offline ·
verify live: SW ACTIVE, manifest hợp lệ.

**Hướng dẫn:** `HUONG_DAN_SU_DUNG.md` (8 mục) + link footer. **Kiểm thử 8/8 PASS.**

---

# 🆎 PHẦN C — PHIÊN 5 (01/11/2026): ĐANG DIỄN RA

## C1. 7 yêu cầu mới của ND

1. **Fix sinh trắc học trên Android** — máy Redmi Note 12 báo
   *"An unknown error occurred while talking to the credential manager"* (Chrome/Xiaomi chặn WebAuthn)
   → cần phương án dự phòng đăng nhập nhanh.
2. **Hướng dẫn sử dụng đọc được trên điện thoại** — file .md khó xem, cần trang HTML đẹp mobile.
3. **Droplist tự xây** cho mệnh giá/nguồn/mục đích + bộ lọc loại — dropdown mặc định của trình duyệt xấu, không đồng bộ style.
4. **Xu hướng tăng/giảm** trên Dashboard — so kỳ này với kỳ trước (tuần/tháng/năm).
5. **Placeholder ngày** "Từ ngày"/"Đến ngày" cho bộ lọc.
6. **Popup đồng nhất** — ngày tháng cũng dùng lịch tự vẽ, không dùng picker mặc định của OS.
7. **Tab Báo cáo nâng cấp**: thêm 3 biểu đồ · **xuất XLSX trình bày đẹp** (kèm ảnh chart) · **in bản đẹp** (có header báo cáo).
8. *(kèm theo)* **Tái cấu trúc file chat** này thành 4 phần A/B/C/D.

## C2. Cách triển khai

| Hạng mục | Giải pháp |
|---|---|
| Sinh trắc + PIN | WebAuthn thử 3 biến thể options (rp.id hostname, bỏ authenticatorAttachment, chỉ uv) → nếu fail → **modal PIN tự xây**: chế độ `setup` (nhập 2 lần, 4–6 số) / `login`; lưu `{credId, pwd, pin}` trong `tk_biocreds`; nút đăng nhập nhanh thử WebAuthn → fail → hỏi PIN |
| Droplist | Component `.combo`: input readonly + nút ▾ + menu absolute (item click chọn, `✏️ Nhập khác…` mở khóa input để gõ, outside-click đóng); giá trị lưu `data-value`; event `combochange` |
| Lịch | Modal `#modal-date`: ◀▶ đổi tháng, lưới T2→CN, đánh dấu hôm nay + ngày chọn, nút Hôm nay/Xóa (chỉ field tùy chọn)/Đóng; giá trị lưu `data-iso`, hiển thị `dd/mm/yyyy`; event `datechange` |
| Trend | `renderTrends()`: 3 thẻ Tuần/Tháng/Năm — net kỳ này (sumPeriod) so net kỳ trước (lastNPeriods[type,2]) → ▲ xanh / ▼ đỏ / ⏱️ bằng, kèm "+xxk vs kỳ trước" |
| Báo cáo | 3 canvas `chart-*-r` render khi tab active (refactor `buildBar`) · **exportXLSX** lazy-load ExcelJS 4.4.0 từ CDN: sheet "Bao cao" — tiêu đề nền xanh #15803D chữ trắng 18 bold, khối thông tin, bảng XU HƯỚNG + 3 bảng tuần/tháng/năm (header xanh, viền, numFmt `#,##0 "₫"`, dòng chẵn `#F0FDF4`, dòng Tổng `#DCFCE7`), **nhúng ảnh chart** từ `canvas.toBase64Image()` · **In**: `#print-header` (tên/ngày xuất/tổng tiền) chỉ hiện khi in; bấm In tự chuyển theme sáng rồi restore qua `afterprint` |
| Hướng dẫn | `huong-dan.html`: dùng lại `style.css` + CSS riêng, 9 mục dạng card, tối ưu 390px, dark-mode aware, nút về app; footer app trỏ sang đây |
| Service Worker | Cache bump `tietkiem-v1` → `tietkiem-v2` + precache `huong-dan.html` |

## C3. Bug đã phát hiện & sửa trong phiên 5

**Label activation behavior**: `<label>` bọc combo — click vào item trong menu, Chrome
**default event handler của label** vẫn synth click về input (bỏ qua `stopPropagation`) →
menu vừa đóng tự mở lại, che các field bên dưới. **Fix gốc**: thay `<label>` bằng
`<div class="field">` cho các field combo/date + `preventDefault()` ở item click.

## C4. Kiểm thử phiên 5 (Playwright, local = Firebase thật, 30+ phép thử — ALL PASS)

- ✅ Đăng nhập → hero 6.442.000 ₫ · 3 thẻ trend với mũi tên ▲ + "+6,4tr vs tuần trước"
- ✅ Lịch: mở từ ô ngày, tiêu đề "Tháng 11/2026", 30 ngày, chọn 15/11 → `data-iso=2026-11-15`, hiển thị 15/11/2026, tự đóng
- ✅ Combo mệnh giá: 9 mục, chọn 200.000 → `data-value=200000` · nhập 2 tờ → thành tiền 400.000 ₫ tự tính
- ✅ Combo nguồn: 5 gợi ý + "✏️ Nhập khác…" → gõ "Test nhập khác" → `data-value` đúng
- ✅ Lưu giao dịch nạp 400k → toast 💰 · lọc tìm thấy 1 dòng · xóa test tx → dữ liệu về đúng 6.442.000 ₫/83 tờ
- ✅ Filter: chọn loại "Nạp" → `data-value=nap` · lịch "Từ ngày" → chọn Hôm nay → lọc đúng · "Xóa lọc" reset sạch, placeholder quay lại
- ✅ Báo cáo: canvas 1016×300 render · print-meta điền đúng tên + ngày xuất + tổng tiền
- ✅ XLSX: tải file `bao-cao-tiet-kiem_2026-11-01.xlsx` (42 KB) — ExcelJS load CDN OK, có ảnh chart
- ✅ `huong-dan.html`: 9 mục, không tràn ngang mobile 390px
- ✅ Mobile app 390px: không tràn, trend card hiện, cột 3 bảng Chi tiết ẩn đúng
- ✅ Service Worker active · **0 console error**

## C5. Lưu ý phát hiện thêm

⚠️ Đăng nhập `huyhoanghp@gmail.com` bằng mật khẩu `huyhoang*12` bị Firebase trả
`INVALID_LOGIN_CREDENTIALS` — **ND đã tự đổi mật khẩu tài khoản chính** (có thể trên điện thoại).
Để ND xác nhận mật khẩu mới; nếu quên, chủ app có thể reset trong Firebase Console.

## C6. Bổ sung giữa phiên: Tự động đăng xuất khi rời app > 5 phút

**Yêu cầu ND:** "khi user tắt app trong vòng 5 phút thì tự động signout".
CoDev hỏi rõ → ND chọn phương án **"Rời app > 5 phút"** (không phải idle-timeout).

**Cách làm (js/main.js — `initSessionGuard`):**
- Mốc thời gian hoạt động lưu `localStorage['tk_last_active']` (`touchSession`): cập nhật khi
  app bị ẩn (`visibilitychange` → hidden), mỗi 30s khi app đang mở, và khi đóng trang
  (`pagehide`/`beforeunload`).
- **Quay lại app** (visibilitychange → visible) hoặc **mở lại app sau khi tắt**: nếu
  `Date.now() - mốc > 5 phút` → `store.signOut()` + toast "🔒 Bạn đã rời app quá 5 phút —
  vui lòng đăng nhập lại" + đóng mọi modal đang mở.
- Phân biệt **đăng nhập thủ công** (flag `__freshLogin`, reset mốc) với **khôi phục phiên tự động**
  của Firebase khi mở app (chỉ kiểm tra hết hạn, không reset mốc) — tránh vòng lặp đăng xuất.
- Sau khi bị đăng xuất: màn hình đăng nhập hiện kèm nút **👆 Đăng nhập nhanh (sinh trắc / PIN)**
  nên vào lại app vẫn chỉ mất 2 giây.

**Kiểm thử (Playwright — 5/5 PASS):** đăng nhập → mô phỏng rời 6 phút quay lại → tự đăng xuất
+ toast đúng · đăng nhập lại OK · reload trong 5 phút → vẫn đăng nhập · restore-path với mốc
7 phút cũ → tự đăng xuất · 0 console error. *(Lưu ý test: reload thật sẽ restamp mốc qua
visibilitychange của trang cũ — đúng hành vi production; test restore-path bằng cách gọi lại
`onAuthChanged()` với `__authChecked=false`.)*

## C7. Làm rõ của ND: Xóa bản ghi nạp/rút ảnh hưởng tổng tiền thế nào?

**Cơ chế:** App **KHÔNG lưu số dư riêng** — tổng tiền trong ví luôn được tính lại tức thời từ
danh sách giao dịch (`computeStats()`: tổng = Σ nạp − Σ rút; số tờ = Σ tờ nạp − Σ tờ rút).

| Thao tác | Ảnh hưởng đến tổng tiền ví | Số tờ |
|---|---|---|
| 🗑️ Xóa bản ghi **NẠP** 200.000 ₫ (2 tờ 100k) | **Giảm 200.000 ₫** (như tiền chưa từng bỏ vào) | Giảm 2 tờ |
| 🗑️ Xóa bản ghi **RÚT** 50.000 ₫ (1 tờ 50k) | **Tăng lại 50.000 ₫** (tiền "quay lại" ví) | Tăng 1 tờ |
| ✏️ Sửa bản ghi | Tổng recalc theo số tiền mới | Recalc |

- Ví dụ với dữ liệu hiện tại 6.442.000 ₫ / 83 tờ: xóa 1 bản ghi nạp 200k → còn **6.242.000 ₫ / 81 tờ**.
- Mọi thứ cập nhật **ngay lập tức và đồng bộ mọi thiết bị** qua Firebase: hero tổng tiền,
  thẻ thống kê, thẻ xu hướng ▲▼, 3+3 biểu đồ, bảng báo cáo, file XLSX/CSV/email xuất sau đó.
- "Số ngày đã tiết kiệm" = đếm số ngày **có giao dịch nạp** — xóa bản ghi nạp duy nhất của
  một ngày thì ngày đó không còn được tính.
- ⚠️ **Xóa là vĩnh viễn, không có undo** — app có hộp thoại xác nhận trước khi xóa, nhưng nếu
  xóa nhầm thì phải tạo lại giao dịch thủ công (ngày + mệnh giá + số tờ + nguồn/mục đích).

---


## C8. Bổ sung giữa phiên: Đa user — mỗi user 1 CSDL riêng + đăng ký chờ duyệt

**Yêu cầu ND:** "cho phép tạo nhiều user, mỗi user là 1 CSDL riêng biệt".
ND chốt: (1) data hiện tại **giữ cho cả 2 user đang có**, user mới bắt đầu trống;
(2) thêm **màn đăng ký nhưng ND phải duyệt**; (3) chủ app là **admin**.

### Kiến trúc mới (RTDB)

```
/users/{uid}/settings          ← CSDL riêng của từng user
/users/{uid}/transactions/{id}
/approvals/{uid}               ← sổ duyệt: {email, name, status: pending|approved|denied, createdAt, decidedAt}
/ (legacy root data)           ← chỉ admin đọc (backup, đã copy xong)
```

**Rules:** `/users/$uid` = `auth.uid === $uid` (cách ly tuyệt đối, thêm user mới KHÔNG cần sửa rules) ·
`/approvals/$uid` = user tự tạo 1 lần khi đăng ký (không sửa/xóa được), admin đọc+sửa toàn bộ ·
root = chỉ `huyhoanghp@gmail.com` (admin).

### Đã làm

| Việc | Chi tiết |
|---|---|
| Migrate data | Copy `/` → `/users/{uid-huyhoanghp}` + `/users/{uid-anhnhh150612}` (REST, token chủ app). ⚠️ lần 1 PUT bị **hỏng encoding tiếng Việt** (PS 5.1 gửi body Latin-1) — đã re-migrate bằng UTF-8 bytes, verify chuẩn. Dọn rác "Test nhập khác" khỏi sources khi migrate |
| Rules | Publish qua Playwright console (session gcp-state.json); verify bằng REST: user A đọc path user B → **401 BLOCKED**, tự đọc/ghi path mình → 200 |
| Code | `FirebaseStore`: mọi path thêm `users/{uid}/` + fix bug off() sai path khi đăng xuất (stale listener) · thêm `signUp/getApproval/listApprovals/setApprovalStatus` · `state.accessGranted` gate chặn render khi chưa duyệt |
| UI | Login screen: view Đăng ký (họ tên/email/mật khẩu×2) + notice "📨 Đã gửi yêu cầu" · màn hình **⏳ chờ duyệt / ⛔ bị từ chối** (nút Kiểm tra lại + Đăng xuất) · **👥 Quản lý người dùng** (chỉ admin): bảng xếp chờ-duyệt lên đầu, nút ✅ Duyệt / ❌ Từ chối / ✅ Chấp nhận lại / ❌ Thu hồi |
| SW | bump `tietkiem-v4` |

### Kiểm thử (Playwright — S1→S8 ALL PASS, 0 console error)

- ✅ Chủ app: data nguyên vẹn 6.392.000 ₫/10 tx · nút 👥 hiện; tài khoản phụ: data copy y hệt, nút 👥 ẩn
- ✅ **Cách ly**: acc2 nạp 100k → hero acc2 6.492.000 ₫, path chủ app VẪN 6.392.000 ₫/10 tx (REST verify)
- ✅ Đăng ký user mới → bản ghi `pending` trong /approvals → đăng nhập → màn "⏳ chờ duyệt", app bị chặn
- ✅ Admin duyệt qua UI 👥 → user đăng nhập lại → **CSDL TRỐNG 0 ₫** + banner khởi tạo → seed → 6.442.000 ₫
- ✅ Admin từ chối → user đăng nhập → "⛔ Yêu cầu bị từ chối", không vào được
- ✅ Panel admin hiển thị đúng 3 trạng thái; cleanup test user sạch sẽ (data + approvals + Auth account)
- ✅ Data thật cuối phiên: cả 2 user đều 6.392.000 ₫ / 82 tờ / 10 tx

### Cách tạo/duyệt user từ giờ

1. **Người mới tự đăng ký** ở màn login (📝 Đăng ký tài khoản mới) → chờ.
2. **ND đăng nhập** `huyhoanghp@gmail.com` → bấm **👥** → ✅ Duyệt (hoặc ❌ Từ chối).
3. Người được duyệt đăng nhập lại → CSDL riêng trống → tự bấm "Khởi tạo dữ liệu kiểm kê" nếu muốn.


# 📌 PHẦN D — GHI CHÚ KỸ THUẬT & QUY ƯỢC

## D1. Thông tin kết nối

| Hạng mục | Giá trị |
|---|---|
| Webapp live | https://huyhoanghp.github.io/app-ha-tiki/ |
| Repo | https://github.com/huyhoanghp/app-ha-tiki (branch `master`, public, GitHub Pages) |
| Firebase project | `apptietkiem` |
| RTDB | `https://apptietkiem-default-rtdb.asia-southeast1.firebasedatabase.app` (asia-southeast1) |
| Auth | Email/Password: `huyhoanghp@gmail.com` (chủ, mật khẩu ND tự quản) + `anhnhh150612@gmail.com` (`123456` mặc định) |
| RTDB Rules | `.read`/`.write`: `auth != null && auth.token.email in ['huyhoanghp@gmail.com','anhnhh150612@gmail.com']` |
| GCP session | `C:\Users\NGUYEN~1\AppData\Local\Temp\codev\gcp-state.json` (storageState Playwright, dùng lại cho console) |

## D2. Kiến trúc

- **File**: `index.html` · `css/style.css` (biến theme + dark + mobile <640px + print) ·
  `js/firebase-config.js` (config thật + ALLOWED_EMAIL) · `js/app.js` (state, DENOMS, seed,
  MockStore/FirebaseStore, computeStats/groupBy/lastNPeriods/sumPeriod) · `js/charts.js`
  (`buildBar(canvasId, entries)` + `renderCharts` dashboard + `renderReportCharts` báo cáo) ·
  `js/report.js` (bảng báo cáo, mailto/CSV/copy, `exportXLSX` ExcelJS lazy, `fillPrintMeta`) ·
  `js/ui.js` (render, combo, lịch, PIN/bio, tabs, toast/confirm, bindUI) · `js/main.js` (initApp + SW) ·
  `sw.js` (cache `tietkiem-v2`) · `manifest.webmanifest` · `icons/` · `huong-dan.html`
- **Pattern UI tự xây**: `.combo` (input readonly + `data-value` + menu) · `.date-wrap`/`.date-field`
  (readonly + `data-iso` + placeholder) · modal `#modal-date` / `#modal-pin` / `#modal-tx` /
  `#modal-settings` / `#modal-confirm` · toast — **không dùng control native** (select/date/prompt).
- **Sinh trắc/PIN**: `tk_biocreds` (localStorage) `{email: {credId, pwd: XOR-base64, pin}}`;
  WebAuthn 3 variants → PIN fallback; đổi mật khẩu → tự cập nhật pwd trong bio creds.
- **PWA**: HTML/CSS/JS network-first (deploy lên tay ngay), CDN cache-first; **bump CACHE_NAME
  mỗi lần đổi asset** để client cập nhật.
- **ExcelJS**: lazy-load từ jsDelivr chỉ khi bấm Xuất XLSX; ảnh chart nhúng từ canvas 620px width.

## D3. Quy trình deploy

1. Sửa code → test local: `node C:\Users\NGUYEN~1\AppData\Local\Temp\codev\static-server.js "D:\PHAN MEM\TOOL_HOANG\TOOL_BUILDING\CoDEV\App_HA_TIKI"` → http://localhost:8123
2. Test Playwright: `node run.js <script.js>` trong `C:\Users\NGUYEN HUY HOANG\.claude\skills\playwright`
   — nhớ `{ headless: false, channel: 'chrome', ignoreDefaultArgs: ['--enable-automation'] }`
3. `git add -A && git commit -m "..." && git push origin master` → Pages tự build ~40–60s → verify live.

## D4. Quy ước

- Mật khẩu/tài khoản KHÔNG lưu vào repo (chỉ dùng trong phiên).
- Giao thức trao đổi: tiếng Việt; code không thêm comment (giữ banner section như hiện có).
- Dữ liệu gốc: kiểm kê 01/11/2026 — 6.442.000 ₫ / 83 tờ / 9 giao dịch `source: "Kiểm kê đầu kỳ"`.
- Khi test CRUD trên Firebase thật: **tạo giao dịch TEST rồi xóa ngay**, kiểm tra tổng về lại 6.442.000 ₫.
- Mỗi phiên kết thúc: cập nhật Phần C → dồn vào Phần B, mở Phần C mới cho phiên kế tiếp.

---

*(Phiên 5 đang thực hiện — cập nhật tiếp bên dưới)*
