# Ảnh tượng trưng cho sự kiện

Đã rà toàn bộ 36 định nghĩa sự kiện và chọn một ảnh riêng cho từng event.
Ảnh được tìm trên Wikipedia/Wikimedia Commons, kiểm tra mô tả và giấy phép,
lưu nguyên bản thumbnail vào `public/event`. Metadata nguồn đầy đủ ở
`public/event/sources.json`; dữ liệu sử dụng trong app ở `event-images.ts`.

Ảnh tư liệu ghi đúng bối cảnh; ảnh biểu tượng được chú thích rõ là tượng trưng.
Không coi ảnh lễ ở nước khác là ảnh lễ tổ chức tại Việt Nam. Các ví dụ chọn theo
phong tục: bánh trôi cho Hàn thực, cơm rượu cho Đoan Ngọ, bánh Trung thu Việt Nam,
tranh Đông Hồ ông Táo và hoa hồng cho nghi thức bông hồng cài áo của Vu Lan.

Đối chiếu biểu tượng Vu Lan: [Ủy ban Nhà nước về người Việt Nam ở nước ngoài](https://scov.gov.vn/van-hoc-nghe-thuat/tan-van/tan-man-mua-vu-lan.html).
Ngày Văn hóa Việt Nam 24/11 và mốc hiệu lực vẫn theo [Nghị quyết 28/2026/QH16](https://xaydungchinhsach.chinhphu.vn/toan-van-nghi-quyet-so-28-2026-qh16-ve-phat-trien-van-hoa-viet-nam-119260508142130402.htm).

Dialog hiển thị ảnh; chú thích nằm trong alt, tác giả, nguồn và giấy phép được lưu trong dữ liệu ảnh. Dùng
`object-contain` để giữ nguyên nội dung cờ, tranh, áp phích và ảnh dọc. Next.js
precache các ảnh trong public qua Serwist; Vite dùng chung publicDir để đóng
gói ảnh vào Android/iOS. Không cần tải ảnh từ Wikimedia khi mở Dialog.

| Event ID | Nội dung ảnh | Giấy phép | Nguồn |
| --- | --- | --- | --- |
| valentines-day | Thiệp Valentine với biểu tượng tình yêu | Public domain | [Commons](<https://commons.wikimedia.org/wiki/File:Antique_Valentine_1909_01.jpg>) |
| international-day-of-happiness | Khuôn mặt cười tượng trưng cho Ngày Quốc tế Hạnh phúc | Public domain | [Commons](<https://commons.wikimedia.org/wiki/File:Smiley.svg>) |
| april-fools-day | Trò đùa báo chí trong ngày Cá tháng Tư | Public domain | [Commons](<https://commons.wikimedia.org/wiki/File:Aprilsnar_2001.png>) |
| world-environment-day | Đôi tay nâng cây non tượng trưng cho việc bảo vệ môi trường | CC BY-SA 3.0 | [Commons](<https://commons.wikimedia.org/wiki/File:Ecologia.jpg>) |
| halloween | Đèn bí ngô đặc trưng của Halloween | CC BY-SA 2.5 | [Commons](<https://commons.wikimedia.org/wiki/File:Jack-o%27-Lantern_2003-10-31.jpg>) |
| christmas-eve | Tranh đêm Giáng sinh năm 1878 | Public domain | [Commons](<https://commons.wikimedia.org/wiki/File:ChristmasEve1878.jpg>) |
| christmas-day | Trang trí Giáng sinh tái hiện cảnh Chúa giáng sinh | CC BY-SA 2.0 | [Commons](<https://commons.wikimedia.org/wiki/File:NativityChristmasLights2.jpg>) |
| new-years-eve | Pháo hoa đón giao thừa Dương lịch | CC BY-SA 4.0 | [Commons](<https://commons.wikimedia.org/wiki/File:Fireworks_on_New_Year%27s_Eve_in_a_small_Swabian_village_(1),_brightened.jpg>) |
| new-year | Pháo hoa mừng năm mới Dương lịch tại Mexico City | CC BY 2.0 | [Commons](<https://commons.wikimedia.org/wiki/File:Mexico_City_New_Years_2013!_(8333128248).jpg>) |
| communist-party-founding | Biểu tượng búa liềm của Đảng Cộng sản Việt Nam | Public domain | [Commons](<https://commons.wikimedia.org/wiki/File:Communist_Party_of_Vietnam_flag_logo.svg>) |
| doctors-day | Ống nghe y tế tượng trưng cho nghề thầy thuốc | Public domain | [Commons](<https://commons.wikimedia.org/wiki/File:Stethoscope-2.png>) |
| international-womens-day | Áp phích Ngày Quốc tế Phụ nữ năm 1914 | Public domain | [Commons](<https://commons.wikimedia.org/wiki/File:Frauentag_1914_Heraus_mit_dem_Frauenwahlrecht.jpg>) |
| youth-union-founding | Cờ Đoàn Thanh niên Cộng sản Hồ Chí Minh | Public domain | [Commons](<https://commons.wikimedia.org/wiki/File:Flag_of_HCM_Communist_Youth_Union.svg>) |
| reunification-day | Băng rôn kỷ niệm ngày thống nhất đất nước | CC BY-SA 3.0 de | [Commons](<https://commons.wikimedia.org/wiki/File:Reunification_day_banner.jpg>) |
| labor-day | Hoạt động hưởng ứng Ngày Quốc tế Lao động | CC BY-SA 2.0 | [Commons](<https://commons.wikimedia.org/wiki/File:1.Mai_2013_(8697603319).jpg>) |
| dien-bien-phu-victory | Hình ảnh chiến thắng Điện Biên Phủ | Public domain | [Commons](<https://commons.wikimedia.org/wiki/File:Victory_in_Battle_of_Dien_Bien_Phu.jpg>) |
| ho-chi-minh-birthday | Chân dung Chủ tịch Hồ Chí Minh năm 1946 | Public domain | [Commons](<https://commons.wikimedia.org/wiki/File:Ho_Chi_Minh_-_1946_Portrait_(cropped).jpg>) |
| childrens-day | Trẻ em Việt Nam vui chơi trên bãi biển | CC BY 2.0 | [Commons](<https://commons.wikimedia.org/wiki/File:Vietnamese_children_playing_on_a_beach_(26583299808).jpg>) |
| family-day | Bữa ăn chung tượng trưng cho sự gắn kết gia đình | Public domain | [Commons](<https://commons.wikimedia.org/wiki/File:Family_eating_a_meal_(1).jpg>) |
| war-invalids-and-martyrs | Hoạt động Ngày Thương binh - Liệt sĩ tại Quận 3 | Public domain | [Commons](<https://commons.wikimedia.org/wiki/File:Ng%C3%A0y_Th%C6%B0%C6%A1ng_Binh_Li%E1%BB%87t_S%C4%A9_t%E1%BA%A1i_qu%E1%BA%ADn_3.JPG>) |
| august-revolution | Ảnh tư liệu Cách mạng tháng Tám | Public domain | [Commons](<https://commons.wikimedia.org/wiki/File:C%C3%A1ch_m%E1%BA%A1ng_th%C3%A1ng_8_b.jpg>) |
| national-day | Quảng trường Ba Đình ngày 2 tháng 9 năm 1945 | Public domain | [Commons](<https://commons.wikimedia.org/wiki/File:Ba_Dinh_Square_September_2nd,_1945.jpg>) |
| vietnamese-womens-day | Phụ nữ Việt Nam trong tà áo dài truyền thống | CC BY-SA 2.0 | [Commons](<https://commons.wikimedia.org/wiki/File:White_Ao_Dai_-_8431_-_FLICKR_(cropped).jpg>) |
| teachers-day | Thầy và trò Trường Mỹ thuật Đông Dương năm 1926, tượng trưng cho truyền thống tôn sư trọng đạo | Public domain | [Commons](<https://commons.wikimedia.org/wiki/File:Teachers_and_students_of_the_%C3%89cole_Sup%C3%A9rieure_des_Beaux_Arts_de_l%27Indochine,_1926.jpg>) |
| vietnam-culture-day | Múa rối nước, loại hình nghệ thuật truyền thống Việt Nam | CC BY-SA 3.0 | [Commons](<https://commons.wikimedia.org/wiki/File:Thang_Long_Water_Puppet_Theatre2.JPG>) |
| army-and-national-defense-day | Quân hiệu Quân đội nhân dân Việt Nam | Public domain | [Commons](<https://commons.wikimedia.org/wiki/File:Emblem_VPA.svg>) |
| tet | Đường hoa Nguyễn Huệ trong dịp Tết Nguyên đán | CC BY 3.0 | [Commons](<https://commons.wikimedia.org/wiki/File:Xuan_2016_Binh_Than,_duong_nguyen_hue,_phuong_ben_nghe,_Qu%E1%BA%ADn_1,_TPHCM,_Vi%E1%BB%87t_Nam_-_panoramio.jpg>) |
| nguyen-tieu | Trăng tròn tượng trưng cho Rằm tháng Giêng | CC0 | [Commons](<https://commons.wikimedia.org/wiki/File:Pournami.jpg>) |
| han-thuc | Bánh trôi đặc trưng trong Tết Hàn thực | Public domain | [Commons](<https://commons.wikimedia.org/wiki/File:Banhtroi.JPG>) |
| hung-kings | Lăng Vua Hùng tại khu di tích Đền Hùng | Public domain | [Commons](<https://commons.wikimedia.org/wiki/File:Mausoleum_of_Hung_King.JPG>) |
| phat-dan | Nghi thức tắm Phật trong lễ Phật đản tại Indonesia | CC BY-SA 4.0 | [Commons](<https://commons.wikimedia.org/wiki/File:Indonesia_Buddhists_Vesak_Day.jpg>) |
| doan-ngo | Cơm rượu, món ăn truyền thống trong Tết Đoan Ngọ | CC BY 2.0 | [Commons](<https://commons.wikimedia.org/wiki/File:Comruou.jpg>) |
| vu-lan | Hoa hồng tượng trưng cho nghi thức bông hồng cài áo trong lễ Vu Lan | CC BY 4.0 | [Commons](<https://commons.wikimedia.org/wiki/File:Red_rose_in_Mykolaiv.jpg>) |
| mid-autumn | Bánh Trung thu Việt Nam | CC BY-SA 4.0 | [Commons](<https://commons.wikimedia.org/wiki/File:Different_flavours_of_Vietnamese_mid-Autumn_festival_moon_cakes_(2017).jpg>) |
| kitchen-gods | Tranh Đông Hồ ông Táo | Public domain | [Commons](<https://commons.wikimedia.org/wiki/File:Tranh_%C4%90%C3%B4ng_H%E1%BB%93_%C3%94ng_T%C3%A1o.jpg>) |
| lunar-new-years-eve | Mâm lễ Tết tại Huế tượng trưng cho lễ tất niên và đón năm mới âm lịch | CC BY 2.0 | [Commons](<https://commons.wikimedia.org/wiki/File:Tet_offerings,_Hue_2011.jpg>) |

Tổng dung lượng: 7.34 MiB.
