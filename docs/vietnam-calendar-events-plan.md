# Kế hoạch ngày lễ và sự kiện Việt Nam

Plan tiếp theo: [Thông báo sự kiện lúc 09:00 và giới hạn offline](./calendar-event-notifications-plan.md).

Ngày đối chiếu: 18/09/2026. Dữ liệu nền đã lưu ở
`src/core/calendar-events/vietnam-events.ts`; type ở `calendar-event.types.ts`.
Danh mục có 36 sự kiện thường gặp, đã nối vào calendar generator, UI và lịch nhắc
native. Chưa bao gồm toàn bộ ngày truyền thống ngành nghề, ngày quốc tế và lễ hội địa phương.

## 1. Cấu trúc dữ liệu

Chọn `.ts` để kiểm tra type bằng `satisfies`. Nội dung là object thuần, có thể xuất
sang JSON. Mỗi object có `id`, `name.vi/en`, `category`, `date`, `sourceIds`;
`validFrom`, `notes` chỉ dùng khi cần. Danh mục sự kiện không lưu chính sách
hay số ngày nghỉ hưởng lương; lịch nghỉ cụ thể theo năm được quản lý riêng.

- `date.calendar = solar`: `solar: { month, day }`.
- `date.calendar = lunar`: `lunar: { month, day, isLeapMonth: false }`.
- `date.calendar = lunar-new-year-offset`: ngày trước Tết, `offsetDays: -1`.

Các key ngày/tháng và cờ nhuận tham khảo `CalendarDay.solar/lunar`. Không lưu `year`,
`dateString`, `dateOfWeek`, `isCurrentMonth` trong quy tắc lặp hằng năm: các trường này
chỉ xác định khi sự kiện được gắn vào một ngày cụ thể. Type core không import hook
hoặc `CalendarDay` vì `CalendarDay` đang suy ra từ generator; import ngược sẽ tạo
phụ thuộc vòng khi generator được bổ sung `events`.

Ví dụ:

```ts
{
  id: "hung-kings",
  name: { vi: "Giỗ Tổ Hùng Vương", en: "Hung Kings Commemoration Day" },
  category: "public-holiday",
  date: { calendar: "lunar", lunar: { month: 3, day: 10, isLeapMonth: false } },
  sourceIds: ["laborCode"],
}
```

## 2. Phạm vi danh mục ban đầu

| Nhóm | Ngày/sự kiện |
| --- | --- |
| Lễ được nghỉ hưởng lương | 01/01; Tết Nguyên đán; 10/03 âm lịch; 30/04; 01/05; 02/09 và ngày liền kề theo lịch nghỉ; 24/11 từ năm 2026 |
| Kỷ niệm Việt Nam | 03/02; 27/02; 26/03; 07/05; 19/05; 28/06; 27/07; 19/08; 20/10; 20/11; 22/12 |
| Ngày quốc tế thường dùng tại Việt Nam | Valentine 14/02; 08/03; Quốc tế Hạnh phúc 20/03; Cá tháng Tư 01/04; 01/06; Môi trường Thế giới 05/06; Halloween 31/10; đêm Giáng sinh 24/12; Giáng sinh 25/12; giao thừa Dương lịch 31/12 |
| Lễ truyền thống theo âm lịch | Nguyên tiêu 15/01; Hàn thực 03/03; Phật đản 15/04; Đoan Ngọ 05/05; Vu Lan 15/07; Trung thu 15/08; ông Công ông Táo 23/12; ngày cuối năm âm lịch |

Theo Điều 112 Bộ luật Lao động 2019, số ngày nghỉ lễ là 11: 1 + 5 + 1 + 1 + 1 + 2.
Nghị quyết 28/2026/QH16 bổ sung Ngày Văn hóa Việt Nam 24/11, hiệu lực 01/07/2026.
Danh mục hiện hành vì vậy có thêm một ngày nghỉ; không áp dụng ngày mới cho năm 2025.

Nguồn: [Bộ luật Lao động 2019, Điều 112](https://datafiles.chinhphu.vn/cpp/files/vbpq/2019/12/45.signed.pdf),
[Nghị quyết 28/2026/QH16](https://xaydungchinhsach.chinhphu.vn/toan-van-nghi-quyet-so-28-2026-qh16-ve-phat-trien-van-hoa-viet-nam-119260508142130402.htm).
Nguồn từng sự kiện nằm trong `vietnamEventSources`.

## 3. Gắn sự kiện vào CalendarDay

Tạo resolver ở core, nhận ngày dương/âm đã tính và trả `events[]`:

1. So sánh `solar.month/day` cho quy tắc dương lịch.
2. So sánh `lunar.month/day/isLeapMonth` cho quy tắc âm lịch. Quy ước danh mục:
   chỉ gắn lễ vào tháng thường, không lặp thêm ở tháng nhuận; đây là chính sách ứng
   dụng, cần điều chỉnh riêng nếu có nguồn lễ hội/tôn giáo yêu cầu khác.
3. Với ngày cuối năm: tính ngày dương kế tiếp rồi kiểm tra âm lịch là mùng 1 tháng 1.
   Không hardcode 30/12 vì tháng Chạp có thể chỉ có 29 ngày.
4. Kiểm tra `validFrom` bằng `dateString` theo ngày dương Việt Nam.
5. Giữ nhiều sự kiện cùng ngày; sắp xếp lễ được nghỉ trước, tiếp theo lễ truyền thống
   và kỷ niệm; dùng `id` để loại trùng và làm React key.
6. Thêm `events` vào object được sinh trong `generateMonthCalendar`. Làm cả các ô
   tháng trước/sau xuất hiện trong grid. `CalendarDay` sẽ tự suy ra field mới.

Một sự kiện chỉ cần giữ object định nghĩa ở `events[]`; ngày xảy ra đã nằm trong
`CalendarDay`. Tách danh sách nguồn khỏi dữ liệu UI để không đưa URL nguồn vào
client bundle nếu không hiển thị nguồn.

## 4. Lịch nghỉ cụ thể theo năm

Tạo file `vietnam-holiday-schedules/<year>.ts` chứa object có `year`, `verifiedAt`,
`dates: AnnualHolidayDate[]`. Mỗi ngày có `dateString`, `eventId`, `kind`,
`appliesTo`, `sourceUrl`. Chỉ thêm ngày khi có thông báo/lịch của đối tượng áp dụng.

- Tết: mùng 1 là mốc lễ; 5 ngày nghỉ không mặc định là mùng 1–5.
- Quốc khánh: 2/9 và một ngày liền kề trước hoặc sau; không đánh dấu cả 1/9 lẫn 3/9.
- Ngày nghỉ bù phụ thuộc ngày nghỉ hằng tuần, ngày hoán đổi và lịch đơn vị.
- Lịch cán bộ/công chức không áp dụng tự động cho tất cả doanh nghiệp.
- Ngày hoán đổi và ngày làm bù phải có `kind` riêng.
- Khi chưa có lịch một năm, vẫn hiển thị mốc lễ và ghi chưa có lịch nghỉ cụ thể.
- Tại 18/09/2026, phương án hoán đổi dịp 24/11/2026 vẫn đang lấy ý kiến;
  chưa đưa phương án đề xuất thành lịch chính thức.

Nguồn tình trạng đề xuất:
[Bộ Nội vụ lấy ý kiến lịch nghỉ Ngày Văn hóa Việt Nam](https://xaydungchinhsach.chinhphu.vn/ngay-24-11-hang-nam-la-ngay-van-hoa-viet-nam-nguoi-lao-dong-duoc-nghi-huong-nguyen-luong-119260113152642414.htm).

## 5. Hiển thị và offline

- `CalendarDayCell` đọc `day.events`, hiển thị dấu chấm hoặc nhãn ngắn; chọn ngày
  để xem toàn bộ tên, nhóm sự kiện và thông tin nghỉ nếu đã có lịch cụ thể.
- Phân biệt ngày kỷ niệm với ngày nghỉ thực tế; không tô mọi sự kiện thành ngày nghỉ.
- Tên hỗ trợ tiếng Việt/Anh theo locale hiện tại.
- Import dữ liệu tĩnh vào resolver chạy tại client; không cần fetch API hoặc
  IndexedDB cho bộ lễ cố định. Các dữ liệu import sẽ vào JS được Serwist precache.
- Mỗi lần cập nhật danh mục cần production build mới; cache mới kích hoạt theo
  cơ chế cập nhật hiện có khi các cửa sổ ứng dụng cũ đóng.

## 6. Kiểm tra khi triển khai resolver/UI

- Ngày dương cố định không dịch do timezone.
- Tết 2026 là 17/02/2026; giao thừa là 16/02/2026, ngày 29 tháng Chạp.
- Giỗ Tổ, Trung thu xuất hiện một lần trong năm âm lịch; không trùng tháng nhuận.
- Một ô chứa đủ các sự kiện khi ngày dương và ngày âm trùng nhau.
- 24/11/2025 chưa có Ngày Văn hóa; 24/11/2026 có.
- Không suy ra nghỉ bù hoặc ngày làm bù khi thiếu lịch theo năm.
- Grid tháng giáp năm vẫn gắn đúng sự kiện và lunar.year.
- Sau build, bật offline, mở lại lịch rồi chuyển tháng: tên và dấu sự kiện vẫn có.

## 7. Thứ tự triển khai tiếp

1. Resolver + thêm `events[]` vào generator + kiểm tra các trường hợp ở mục 6.
2. Dấu sự kiện trong ô ngày và phần chi tiết ngày được chọn.
3. Lịch nghỉ theo năm, theo nhóm người dùng.
4. Mở rộng danh mục sau khi xác minh: 21/04, 13/10, 09/11, 23/11;
   lễ hội địa phương và ngày truyền thống ngành nghề có phạm vi riêng. Tiết Thanh
   minh cần tính theo tiết khí, không hardcode thành 03/03 âm lịch hoặc một ngày
   05/04 cố định cho mọi năm.

Định nghĩa hiện tại mô tả bộ quy tắc đang áp dụng. Chưa xây dựng toàn bộ lịch sử
hiệu lực của từng ngày kỷ niệm/chế độ nghỉ cho mọi năm quá khứ; khi cần chức năng
đó phải bổ sung các phiên bản chính sách theo thời gian.
