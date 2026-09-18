# Kế hoạch thông báo sự kiện lúc 09:00

Ngày lập: 18/09/2026. Đã triển khai bản Capacitor Android/iOS; xem
[hướng dẫn mobile](./mobile-reminders.md) để build, cấp quyền và kiểm tra trên máy thật.
Bản triển khai gộp sự kiện cùng ngày vào một thông báo và đặt trước tối đa 60 ngày
có sự kiện trong phạm vi 730 ngày. Các mục bên dưới lưu lại kế hoạch ban đầu;
hướng dẫn mobile mô tả hành vi đang áp dụng.
Dùng danh mục `src/core/calendar-events/vietnam-events.ts` và resolver trong
[plan sự kiện](./vietnam-calendar-events-plan.md).

## 1. Mục tiêu và khả năng thực hiện

Mỗi sự kiện có thông báo vào **09:00 ngày diễn ra, theo Asia/Ho_Chi_Minh (UTC+7)**,
kể cả sự kiện âm lịch. Người dùng ở múi giờ khác vẫn nhận theo giờ Việt Nam.
Mỗi sự kiện/ngày thông báo một lần trên một thiết bị; không phụ thuộc tháng đang xem.

| Trạng thái thiết bị | PWA hiện tại có thể bổ sung | Bản mobile dùng local notifications |
| --- | --- | --- |
| Offline, lịch đang mở và JS được chạy | Kiểm tra thời gian và hiện thông báo/nhắc trong app | Có thể đặt lịch tại hệ điều hành |
| Offline, app ở nền hoặc màn hình khóa | Không bảo đảm JS tiếp tục chạy đúng 09:00 | Có thể hiện lịch đã đặt, tùy quyền và chính sách OS |
| Offline, app đã đóng bình thường | Không có bộ hẹn giờ nền đáng tin cậy | OS xử lý thông báo đã đặt mà không cần server |
| Online, app đã đóng | Có thể dùng Web Push từ server; có thể trễ | Local notifications không cần server |

Service Worker có thể bị trình duyệt dừng, nên `setTimeout`/`setInterval` trong
worker không tạo được alarm hằng ngày. Notification Triggers API đã ngừng phát
triển; không chọn API thử nghiệm này làm giải pháp production.
Nguồn: [Vòng đời Service Worker](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation),
[Thông báo ngừng Notification Triggers](https://developer.chrome.com/docs/web-platform/notification-triggers).

**Để đáp ứng offline + app đóng, hướng đề xuất là bản Android/iOS dùng local
notifications, có thể qua Capacitor.** PWA vẫn giữ khả năng dùng lịch offline,
nhưng tính năng nhắc của PWA có phạm vi hẹp hơn; không mô tả là alarm nền offline.
[Capacitor Local Notifications](https://capacitorjs.com/docs/apis/local-notifications).

## 2. Quy tắc nghiệp vụ chung

- Giờ cố định `09:00`, không thêm giờ vào từng event.
- Mặc định chọn toàn bộ nhóm sự kiện sau khi người dùng bật nhắc; có thể tắt nhóm
  hoặc tắt từng event.
- Có nhiều sự kiện cùng ngày: mỗi event có reminder riêng, không bỏ sự kiện trùng ngày.
- Không gửi trước 09:00. Với PWA, mở lại sau 09:00 thì nhắc muộn một lần trong
  cùng ngày Việt Nam; không gửi lại các ngày đã qua.
- Bật tính năng sau 09:00 cũng áp dụng quy tắc nhắc trong ngày, không gửi lịch sử.
- Quy tắc âm lịch/tháng nhuận và `validFrom` dùng chung resolver với calendar.
- Không dùng lịch nghỉ bù hoặc ngày làm bù để tự tạo event mới.
- Tắt tính năng: ngừng kiểm tra, hủy mọi lịch native chưa đến hạn của tính năng này.
- Permission chưa có hoặc bị từ chối: hiển thị nhắc trong ứng dụng khi đang mở,
  không coi đây là system notification đã gửi.

## 3. Object cấu hình và reminder dự kiến

Các object sau là thiết kế; chưa thêm vào runtime:

```ts
type EventReminderSettings = {
  enabled: boolean;
  timeZone: "Asia/Ho_Chi_Minh";
  hour: 9;
  minute: 0;
  categories: CalendarEventDefinition["category"][];
  excludedEventIds: string[];
};

type EventReminder = {
  key: string;             // eventId@dateString@09:00@Asia/Ho_Chi_Minh
  eventId: string;
  dateString: string;      // ngày dương xảy ra sự kiện, YYYY-MM-DD
  scheduledAt: string;     // ISO instant, ví dụ ...T09:00:00+07:00
  title: string;
  body: string;
  url: string;             // /calendar?date=YYYY-MM-DD&event=eventId
};
```

Tên/bản dịch lấy từ event và locale hiện tại. Đổi locale thì cập nhật nội dung
các reminder native chưa đến hạn. Không thay đổi `CalendarEventDefinition` để
thêm cấu hình nhắc cho từng event; cài đặt người dùng nằm riêng.

Lưu settings và ledger trong IndexedDB. Ledger chứa `key`, `channel`, `status`,
`requestedAt`, `nativeId` nếu có. Phân biệt `scheduled` (OS đã nhận lịch),
`show-requested` (API đã nhận yêu cầu hiển thị), `in-app-shown` và `failed`.
Không suy ra người dùng đã nhìn thấy thông báo chỉ từ Promise thành công.

## 4. Bộ tính reminder chung

Tạo `src/core/calendar-events/reminders.ts` với hàm thuần nhận:
`events`, `settings`, khoảng ngày và `now`, trả danh sách reminder.

1. Duyệt ngày dương trong khoảng được yêu cầu, chuyển sang ngày âm bằng hàm local
   đang có, rồi dùng resolver sự kiện.
2. Áp dụng `validFrom`, quy tắc tháng nhuận, nhóm đã chọn và event bị loại.
3. Dựng instant 09:00 trong `Asia/Ho_Chi_Minh` bằng Temporal; không dùng múi giờ
   mặc định của điện thoại và không dùng ngày UTC làm ngày sự kiện.
4. Tạo `key` ổn định để kiểm tra trùng. Không đưa locale hoặc version dữ liệu vào
   key, tránh thông báo lại cùng event/ngày khi đổi ngôn ngữ hoặc cập nhật app.
5. Không gọi generator giao diện để tính reminder: tháng đang xem, grid và logger
   không liên quan đến lịch nhắc của thiết bị.

## 5. Nhánh PWA: offline khi ứng dụng chạy

File dự kiến:

- `src/components/pwa/EventReminderSettings.tsx`: bật/tắt, chọn nhóm, thông báo thử.
- `src/app/(pwa)/calendar/_hooks/useEventReminders.ts`: kiểm tra khi mở app,
  `visibilitychange`, `focus`, `pageshow`, và hẹn kiểm tra gần mốc tiếp theo.
- `src/core/calendar-events/reminder-storage.ts`: settings và ledger IndexedDB.
- `src/app/sw.ts`: xử lý `notificationclick`; giữ nguyên Serwist offline cache.

Luồng:

1. Người dùng bấm bật nhắc. Kiểm tra API và secure context rồi xin permission;
   không tự xin quyền ngay khi tải trang.
2. Nếu được cấp quyền và có worker active, gọi
   `ServiceWorkerRegistration.showNotification(title, options)` khi reminder đến hạn.
3. Dùng `tag = reminder.key`, `renotify = false`, icon local đã precache,
   `data = { eventId, dateString, url }`. Không fetch dữ liệu để dựng nội dung.
4. Các tab cùng origin dùng transaction IndexedDB để giành quyền xử lý key.
   Có trạng thái pending và thời hạn giữ quyền để khôi phục sau lỗi; dùng tag ổn
   định hạn chế trùng nếu app dừng giữa lúc hiện thông báo và ghi ledger.
5. Kiểm tra lại `now` khi timer chạy và khi app quay lại foreground. Timer là
   phương tiện đánh thức lúc JS còn chạy, không bảo đảm mốc giờ khi app bị suspend.
6. Nhấn notification: focus cửa sổ lịch đang có hoặc mở URL lịch. Trang đọc query,
   chuyển đến tháng/ngày sự kiện, kể cả offline. Cần thêm phần đọc query này vào UI;
   hiện calendar chưa có chức năng mở ngày từ notification.
7. Không mở được IndexedDB: báo không thể lưu trạng thái nhắc và chỉ dùng nhắc
   trong app; không hứa chống trùng qua các lần khởi động.

Trên iPhone/iPad, kiểm tra hỗ trợ thực tế; Web Push được hỗ trợ cho Home Screen
web apps từ iOS/iPadOS 16.4 và quyền phải được yêu cầu từ tương tác người dùng.
Điều này không tạo khả năng đặt alarm offline khi app đóng.
[WebKit: Web Push cho Home Screen web apps](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/).

## 6. Nhánh mobile: đáp ứng offline khi app đóng

1. Tạo bản mobile Android/iOS dùng Capacitor và local-notifications; chia sẻ
   dữ liệu event, resolver và bộ tính reminder với web.
2. Làm một entry calendar client có tài nguyên đóng gói trong app. Project Next.js
   hiện đọc cookie và metadata ở server nên chưa thể coi toàn bộ project là static
   webDir của Capacitor. Kiểm tra phương án tách entry hoặc chuyển phần phụ thuộc
   server trước khi đóng gói; không chỉ trỏ wrapper vào website online.
3. Sau khi người dùng bật tính năng và cấp quyền, tính trước các occurrence tương
   lai, đưa instant 09:00 và nội dung/icon local cho OS. Không dùng Web Push cho
   lịch nhắc local này.
4. Dùng mapping bền vững `reminder.key -> nativeId` dạng integer; tránh collision
   và chỉ hủy các ID thuộc UCalendar event reminders.
5. Thiết kế hàng đợi có giới hạn: nạp các reminder gần nhất theo dung lượng pending
   mà OS/plugin hỗ trợ. Kiểm tra giới hạn iOS/Android trước khi chốt kích thước,
   không đặt vô hạn các năm tương lai.
6. Mỗi lần mở/resume app, đổi settings/locale hoặc dữ liệu sự kiện được cập nhật:
   đối chiếu `getPending()`, hủy lịch không còn hợp lệ và nạp thêm lịch tương lai.
   Hiển thị ngày cuối đã đặt lịch để người dùng biết cần mở app trước khi hàng
   đợi hết; không phụ thuộc background task để tự nạp vô hạn khi app luôn đóng.
7. Android: kiểm tra quyền notification và quyền exact alarm nếu cần nhắm đúng
   09:00. Thiếu quyền exact alarm thì nêu giờ có thể trễ; không báo lịch là chính xác.
8. Kiểm tra foreground/background presentation, Focus/DND, tiết kiệm pin, reboot,
   cập nhật app và force-stop trên thiết bị thật. Local scheduling không đồng nghĩa
   OS sẽ luôn phát âm thanh hay hiện banner đúng giây trong mọi trạng thái.
9. Mở từ notification dùng cùng `eventId/dateString` để chọn ngày trong UI.

Nguồn: [Local Notifications và quyền exact alarm trên Android](https://capacitorjs.com/docs/apis/local-notifications),
[Apple: đặt lịch notification local](https://developer.apple.com/documentation/usernotifications/scheduling-a-notification-locally-from-your-app).

## 7. Web Push: chỉ là nhánh online bổ sung

Nếu cần giữ PWA và nhắc khi app đóng nhưng thiết bị có mạng: thêm backend lưu
subscription, scheduler 09:00 Việt Nam và push handler trong Service Worker.
Server dùng resolver chung, VAPID private key chỉ lưu server, loại subscription
hết hạn và áp dụng cùng reminder key để giảm trùng giữa foreground và push.

Đây là nhánh tùy chọn, không đáp ứng offline vào lúc 09:00. Push có thể đến muộn
khi kết nối lại; xử lý TTL và quá hạn, không hứa đúng giờ.
[Chrome: mạng và tiết kiệm pin có thể trì hoãn Push](https://developer.chrome.com/docs/web-platform/notification-triggers).

## 8. Kiểm thử và tiêu chí nghiệm thu

- 08:59:59 chưa gửi; 09:00 đến hạn theo Việt Nam; timezone điện thoại khác không đổi lịch.
- Ngày không có event không gửi; nhiều event cùng ngày giữ đủ reminder.
- Tết/giao thừa năm có tháng Chạp 29 ngày, tháng nhuận, `validFrom` đều khớp resolver.
- Reload, hai tab, đổi locale, resume sau 09:00 không tạo thông báo lặp không cần thiết.
- Permission denied/unsupported và lỗi storage không làm hỏng calendar offline.
- Bật lúc 10:00 chỉ nhắc event hôm nay; không gửi ngày hôm qua.
- PWA offline foreground: kiểm tra nội dung, API hiển thị và mở đúng ngày từ click.
- PWA offline app đóng: ghi nhận không có alarm nền, không đánh dấu bài này là đạt.
- Mobile: đặt lịch trước, bật máy bay, đóng app bình thường, khóa màn hình; kiểm tra
  notification tại 09:00 trên Android/iPhone thật. Kiểm tra riêng force-stop/reboot
  và chế độ tiết kiệm pin để xác định giới hạn thực tế.
- Tắt tính năng hủy toàn bộ pending thuộc tính năng; mở lại không tự bật nhắc.
- Kiểm tra đối chiếu/nạp hàng đợi khi hết hạn, event đổi ngày hoặc bị xóa.

Unit tests dùng `now` giả lập; browser tests dùng permission/click offline.
Kiểm thử trình duyệt không thay thế kiểm thử alarm native lúc thiết bị khóa/đóng app.

## 9. Thứ tự thực hiện

1. Hoàn thành resolver sự kiện trong plan trước; tách hàm tính ngày khỏi grid.
2. Bộ tính reminder 09:00, cấu hình, lưu settings/ledger và kiểm tra logic thời gian.
3. PWA foreground reminders + notification click + fallback trong app.
4. Nếu giữ yêu cầu offline khi app đóng: bản mobile và adapter local scheduling,
   đóng gói tài nguyên offline, kiểm tra trên thiết bị thật.
5. Web Push chỉ triển khai nếu cần thêm kênh PWA online khi đóng app.

Không thêm `holidayPolicy` trở lại. Các thay đổi trên chỉ sử dụng event và cài đặt
nhắc riêng, không phụ thuộc chế độ nghỉ của người lao động.
