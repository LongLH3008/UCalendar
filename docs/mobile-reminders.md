# Calendar và thông báo offline trên điện thoại

Bản Android/iOS dùng Capacitor, đóng gói calendar vào app. Giao diện dùng chung
component, context, dữ liệu sự kiện và phép tính âm lịch với bản web. Không cần
server Next.js hay mạng để mở calendar hoặc nhận thông báo đã đặt lịch.

## Chạy trên điện thoại

```sh
pnpm install
pnpm mobile:sync
pnpm mobile:android
```

Cài Android Studio cùng SDK/JDK, mở project Android bằng lệnh cuối, chọn điện
thoại hoặc emulator rồi Run. Với iOS, thực hiện trên macOS có Xcode:

```sh
pnpm mobile:sync
pnpm mobile:ios
```

Chọn signing team và thiết bị trong Xcode, sau đó Run. Khi thay đổi mã nguồn,
chạy lại `pnpm mobile:sync` trước khi build native.

Nếu Gradle báo `JAVA_HOME is set to an invalid directory`, sửa `JAVA_HOME` trỏ
đến JDK thực tế hoặc chọn JDK đi kèm Android Studio trong Gradle settings.
Lần kiểm tra trên workspace này, đường dẫn `C:\Program Files\Java\jdk-17`
không tồn tại nên chưa tạo được APK. Bản iOS cần được build và ký trên macOS.

## Cách sử dụng

- Bật “Nhắc sự kiện lúc 9:00” trong app và cho phép thông báo.
- Android: cho phép hẹn giờ chính xác bằng nút trong app nếu có cảnh báo.
- Các sự kiện cùng ngày được gộp vào một thông báo lúc **09:00 giờ Việt Nam**,
  kể cả khi điện thoại đang ở múi giờ khác.
- App đặt trước tối đa 60 ngày có sự kiện, trong phạm vi 730 ngày. Màn hình
  hiển thị ngày cuối đã đặt lịch; mở app trước ngày đó để bổ sung lịch.
- Nếu bật lần đầu sau 09:00 trong ngày có sự kiện, app nhắc bù ngay trong ngày.
- Chạm thông báo sẽ mở tháng tương ứng và đánh dấu ngày sự kiện.
- Tắt nhắc sự kiện sẽ hủy các thông báo do tính năng này đặt lịch.

Lịch nhắc và lựa chọn bật/tắt được lưu trên thiết bị. Mở app hoặc quay lại app
sẽ đồng bộ lịch, cập nhật ngôn ngữ và khôi phục lịch tương lai còn thiếu.

## Kiểm tra trên thiết bị thật

1. Bật nhắc sự kiện, cấp quyền, gửi thông báo thử rồi đưa app về nền.
2. Bật chế độ máy bay và khóa màn hình; kiểm tra thông báo thử.
3. Kiểm tra một ngày có sự kiện lúc 09:00, chạm thông báo để mở ngày đó.
4. Kiểm tra sau khi khởi động lại máy; kiểm tra bật/tắt quyền hẹn giờ chính xác.
5. Kiểm tra tắt nhắc sự kiện, đổi ngôn ngữ và mở lại app.

Thông báo thử dự kiến sau 10 giây; nếu thiếu quyền hẹn giờ chính xác trên Android
thì có thể trễ. OS vẫn có thể hạn chế thông báo khi force-stop, tắt máy, bật Focus,
hoặc áp dụng chính sách tiết kiệm pin. Không cam kết sai số cố định.

Bản PWA trong trình duyệt tiếp tục dùng calendar offline; nhắc offline khi app
đóng là tính năng của bản native này.

## Kiểm tra tự động

```sh
node --test tests/reminders.test.mjs
pnpm exec tsc --noEmit
pnpm mobile:build
pnpm exec playwright test --config playwright.mobile.config.ts
```

Test kiểm tra lịch âm/dương, 09:00 UTC+7, nhắc bù, ID duy nhất và đồng bộ/hủy
alarm qua mock native. Test trình duyệt kiểm tra bundle calendar hoạt động khi
ngắt mạng. Các test này không thay thế kiểm tra giao nhận thông báo trên OS.

Tham khảo [Capacitor Local Notifications](https://capacitorjs.com/docs/apis/local-notifications).
