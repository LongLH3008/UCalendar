# Dùng calendar khi offline

Serwist tạo Service Worker tại `/pwa/sw.js` trong production build. Khi cài thành công,
worker lưu trang `/calendar`, các file JS/CSS, font, manifest và icon. Dữ liệu lịch
âm/dương được tính trên thiết bị nên chuyển tháng không cần server.

## Trên điện thoại

1. Triển khai bản production lên HTTPS.
2. Mở `/calendar` khi có mạng và đợi ứng dụng tải xong, Service Worker cài thành công.
3. Thêm vào màn hình chính bằng Chrome trên Android hoặc Safari trên iPhone.
4. Đóng các cửa sổ calendar, mở lại ứng dụng để nhận worker mới nếu đã dùng bản cũ.
5. Bật chế độ máy bay, mở lại ứng dụng và thử chuyển tháng.

Ứng dụng cần được tải và cache thành công ít nhất một lần khi có mạng. Xóa dữ liệu
website sẽ xóa cache, khi đó cần mở lại khi có mạng. Việc cài icon không tự xác nhận
rằng quá trình cache đã hoàn tất.

## Chạy production ở máy phát triển

```powershell
pnpm build
pnpm start
```

Chỉ cần build lại khi code thay đổi. Khi khởi động lại cùng bản build, chạy
`pnpm start`; không cần cài lại dependencies. `pnpm dev` không đăng ký Service Worker.
`http://localhost` dùng được cho kiểm thử trên máy tính; điện thoại truy cập địa chỉ
HTTP trong LAN cần chuyển sang HTTPS để Service Worker hoạt động.

Worker cập nhật đợi các cửa sổ đang dùng phiên bản trước đóng rồi mới kích hoạt,
giúp trang HTML và các file JS/CSS thuộc cùng một build. Trang lịch cache được thay
theo mỗi build mới.

## Kiểm thử offline bằng Chromium

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $PWD '.cache/playwright'
pnpm exec playwright install chromium
pnpm build
pnpm test:offline
```

Chỉ cài Chromium lần đầu. Kiểm thử tự chạy production server tại cổng 3100 và kiểm tra:

- Refresh và mở trang mới khi offline; response được trả bởi Service Worker.
- Chuyển tháng tới/lùi khi offline.
- URL `/calendar/` từ manifest cũ và giao diện tiếng Việt.

Tham khảo tích hợp Turbopack: https://serwist.pages.dev/docs/next/turbo
