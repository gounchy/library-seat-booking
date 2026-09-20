# Library Seat Booking (Đặt chỗ ngồi thư viện)

English: [README.md](README.md)

Ứng dụng di động đặt chỗ ngồi học ở thư viện trước mùa thi (môn Lập trình Mobile, lớp TH7011101, checkpoint Ngày 01-08).

Sinh viên: Nguyễn Vũ Ngọc Huy — MSSV 1923050808

Repository: <[repository URL](https://github.com/gounchy/library-seat-booking)>

## Ứng dụng làm gì

Sinh viên đăng nhập, xem danh sách ghế trong thư viện (lọc theo zone, tìm theo mã ghế), mở chi tiết một ghế và đặt một khung giờ. Ứng dụng từ chối các lượt đặt chồng giờ nhau, cho biết mỗi zone hiện đang đông đến mức nào, và vẫn dùng được khi mất mạng.

## Yêu cầu môi trường

- Node.js 20.19.4 trở lên 
- Git
- Android Studio có Android emulator
- Expo SDK `57` 

## Cài đặt và chạy

```bash
git clone <https://github.com/gounchy/library-seat-booking>
cd library-seat-booking
npm ci
npx expo start
```

Hãy bật Android emulator trước, sau đó nhấn phím `a` trong terminal. Expo CLI sẽ mở ứng dụng bằng Expo Go trên emulator.

Không dùng bản web. `expo-secure-store` không chạy trên web, và dự án chỉ được thử trên Android.

## Tài khoản mock

"Server" ở đây là bản giả (mock) nằm trong bộ nhớ (`src/api`), không phải backend thật.

| Mã sinh viên | Mật khẩu |
|---|---|
| 1923050808 | library123 |
| 1923050001 | library123 |

Mật khẩu được viết thẳng trong mã nguồn một cách có chủ ý: đây là server giả để bất kỳ ai cũng đăng nhập được. Server thật sẽ lưu mật khẩu đã băm (hash).

## Tính năng 

| Yêu cầu | Nằm ở đâu |
|---|---|
| Đăng nhập / đăng xuất, phiên còn sau khi khởi động lại app, đăng xuất kết thúc phiên thật sự | `src/store/auth-store.ts`, `src/lib/secure-storage.ts`, `src/app/_layout.tsx` |
| Ghế lấy từ mock API, tạo và sửa được trong app | `src/api/seats-api.ts`, `src/app/seat/new.tsx`, `src/app/seat/[id]/edit.tsx` |
| Màn danh sách và màn chi tiết, lọc theo zone, tìm theo mã ghế | `src/app/(tabs)/index.tsx`, `src/app/seat/[id].tsx`, `src/lib/filter-seats.ts` |
| Đặt ghế theo khung giờ, ghế hiện "đã có người đặt" ngay lập tức | `src/app/book/[seatId].tsx`, `src/features/bookings/` |
| Từ chối lượt đặt chồng giờ (không chỉ trùng y hệt) | `src/lib/overlap.ts`, kiểm tra ở form và kiểm tra lại ở `src/api/bookings-api.ts` |
| Tỷ lệ lấp đầy theo zone, tính từ booking hôm nay, không lưu | `src/lib/occupancy.ts`, `src/app/(tabs)/occupancy.tsx` |
| Offline: hiển thị lần tải thành công gần nhất kèm banner, thay đổi lúc offline không bị mất | `src/lib/network.ts`, `src/lib/query-client.ts`, `src/store/outbox-store.ts`, `src/features/offline/` |
| Đủ các trạng thái loading, empty, error (Retry hoạt động thật) và content | `src/components/query-state.tsx` |
| Giao diện sáng và tối từ một file token | `src/constants/theme.ts`, `src/hooks/use-theme.ts` |
| Accessibility: role và label, vùng chạm 44 x 44, tương phản 4.5:1 | xem mục "Accessibility" bên dưới |

## Kiến trúc

```
src/
  app/          Các màn hình của Expo Router (route theo tên file; (tabs) là route group; [id] là route động)
  api/          Server giả: cơ sở dữ liệu trong bộ nhớ, mô phỏng độ trễ và lỗi
  store/        Các store Zustand (auth, bộ lọc, outbox offline), luôn đọc qua selector
  features/     Hook TanStack Query (ghế, booking) cùng hàng đợi offline và phát lại
  lib/          Logic thuần (overlap, occupancy, validation, contrast) có unit test
  components/   Thành phần giao diện dùng chung (AppButton, AppTextInput, QueryState, banner...)
  constants/    theme.ts: file duy nhất chứa giá trị màu
```

Mỗi loại dữ liệu nằm ở đâu:

| Dữ liệu | Nằm ở | Vì sao |
|---|---|---|
| Ghế và booking | TanStack Query | Dữ liệu của server: có thể cũ, cần cache, retry và refetch |
| Nội dung tìm kiếm, zone đang chọn, người dùng hiện tại, outbox | Zustand | Dữ liệu chỉ tồn tại trong app |
| Phiên đăng nhập (token) | Chỉ SecureStore | Đây là bí mật; SecureStore được mã hoá, AsyncStorage thì không |
| Cache truy vấn, các mục trong outbox | AsyncStorage | Không phải bí mật; cần để dùng được sau khi khởi động lại lúc đang offline |
| Danh sách ghế đã lọc, phần trăm lấp đầy | Không lưu | Được suy ra từ ghế, booking và thời điểm hiện tại |

## Các quyết định thiết kế 

- Một khung giờ là `{ start: "HH:mm", end: "HH:mm" }`. Giờ kết thúc là loại trừ, nên 14:00-16:00 và 16:00-18:00 không xung đột.
- Ghế được coi là "đang có người đặt" khi có một booking bao phủ thời điểm hiện tại. Booking cho giờ khác vẫn hiện trong danh sách booking của ghế đó.
- Không cho đặt vào ngày đã qua. Những giờ đã qua của hôm nay thì vẫn được phép.
- File token là `src/constants/theme.ts` (giữ từ template Expo) thay vì `src/theme/tokens.ts`.
- `app.json` có hai giá trị màu (nền splash và nền icon). Cấu hình build native không đọc được file token, nên đây là những màu duy nhất nằm ngoài `theme.ts`. Lệnh `npm run check:colors` quét thư mục `src/`.
- Ngôn ngữ giao diện là tiếng Anh.

## Hoạt động khi offline

- Cache của TanStack Query được lưu vào AsyncStorage và khôi phục khi mở app, nên lần tải thành công gần nhất vẫn hiển thị dù không có kết nối. Một banner thông báo điều đó.
- Khi offline, việc tạo hoặc sửa ghế và đặt ghế được lưu vào outbox (Zustand có persist vào AsyncStorage) và được áp dụng vào cache để hiện ngay lập tức.
- Khi có mạng lại, outbox được phát lại theo đúng thứ tự. Nếu server từ chối một mục (ví dụ trong lúc đó người khác đã đặt khung giờ này), mục đó vẫn nằm trong outbox cùng lý do, và người dùng xem lại và xoá (Discard) ở màn hình "Pending changes".
- Đăng xuất khi còn thay đổi chưa đồng bộ sẽ hỏi xác nhận, rồi xoá các thay đổi đó.

## Công cụ dev

Khi phát triển (`npx expo start`), màn hình danh sách có một bảng "Show dev tools" thu gọn. Bảng này không tồn tại trong bản build phát hành.

| Nút | Tác dụng |
|---|---|
| Simulate offline | Làm app hoạt động như thể thiết bị không có kết nối |
| Simulate server errors | Mọi request đều lỗi cho đến khi tắt (để xem trạng thái lỗi và Retry) |
| Fail the next request | Chỉ request kế tiếp bị lỗi |
| Clear seats cache and reload | Xoá cache danh sách ghế để xem lại trạng thái loading |
| Server: another student books B03 15:00-17:00 | Thêm một booking thẳng vào server giả, để thử conflict khi phát lại |

## Accessibility

- Nút và ô nhập được dựng từ `AppButton` và `AppTextInput`, hai component này bắt buộc có nhãn ở mức kiểu TypeScript. Vùng chạm dùng `MinTouchTarget` (44).
- Độ tương phản được kiểm tra tự động cho mọi cặp chữ và nền ở cả hai giao diện (`src/lib/contrast.test.ts`).
- `scripts/audit-a11y.js` kiểm tra nhãn và kích thước vùng chạm trên Android emulator đang chạy: `adb shell uiautomator dump /sdcard/ui.xml`, `adb pull /sdcard/ui.xml ui.xml`, rồi `node scripts/audit-a11y.js ui.xml <density>` (lấy density từ `adb shell wm density`).

## Kiểm thử

```bash
npm run check
```

chạy lần lượt: `tsc --noEmit` (TypeScript strict), `expo lint`, kiểm tra màu ghi cứng, và các unit test Jest. Lệnh này chạy qua trên một bản clone mới (`npm ci` rồi `npm run check`).



## Hạn chế đã biết

- Server giả giữ dữ liệu trong bộ nhớ, nên khởi động lại app sẽ đặt lại dữ liệu (ghế và booking tạo trong một phiên sẽ biến mất khỏi "server").
- Thay đổi chỉ được xếp hàng đợi khi thiết bị báo offline. Một lỗi mạng ngẫu nhiên lúc đang online sẽ hiện lỗi và giữ nguyên form, nhưng không xếp hàng đợi.
- Nếu danh sách ghế được tải lại trước khi phát lại xong, một thay đổi đang chờ có thể biến mất rồi hiện lại trong chốc lát.
- Khi banner offline hiện, các màn hình có thanh tiêu đề gốc có thể có thêm khoảng trống ở đầu.
- Token mock không được ký. Server thật sẽ ký token.
- Chỉ thử trên Android emulator. Chưa thử trên iOS và thiết bị thật.

## Stretch idea

"Bộ lọc thứ hai: Has outlet (chỉ hiện ghế có ổ cắm). Tôi chọn nó vì sinh viên học trước mùa thi thường cần sạc laptop. Nó rẻ để làm: chỉ lọc trên danh sách ghế đã có trong cache,dùng lại store bộ lọc Zustand và hàm lọc thuần, và có unit test."