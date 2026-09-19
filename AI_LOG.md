Me : Copy nội dung của bài kiểm tra sau đó nói với claude "Could u help me explain this homework and how to do this in mobile app learning"
Clade : 
1. Bài tập nói gì (giải thích đơn giản)

Bạn sẽ xây dựng một ứng dụng di động cho sinh viên xem các chỗ ngồi trong thư viện, đặt chỗ theo khung giờ và kiểm tra mỗi khu vực đang đông đến mức nào. Checkpoint này thực chất kiểm tra xem bạn có kết hợp được các kỹ năng của Ngày 1-8 hay không:

Kỹ năng	Xuất hiện ở đâu
Expo Router (điều hướng)	Màn hình danh sách, chi tiết seat/[id], đăng nhập, các form
Zustand (client state)	Phiên đăng nhập/người dùng, bộ lọc, hàng đợi offline (outbox)
TanStack Query (server state)	Tải ghế và lượt đặt, mutation, thử lại (retry)
SecureStore	Lưu token xác thực
Theme và khả năng truy cập	Một file token, sáng/tối, vùng chạm 44px, nhãn
Xử lý offline	Dữ liệu cache, banner và các chỉnh sửa được xếp hàng đợi
TypeScript strict và lint	tsc --noEmit và expo lint đều sạch lỗi

Phần kiểm tra chồng chéo (overlap) là phần bài tập cảnh báo. Nó là bài toán logic, không phải bài toán giao diện.

2. Các ý tưởng chính

Server state và client state. Ghế và lượt đặt nằm trên "server" (thật hoặc mock), nên đặt trong TanStack Query. Những thứ như người dùng đang đăng nhập, bộ lọc khu vực đang chọn và nội dung tìm kiếm thuộc về ứng dụng, nên đặt trong Zustand. Đừng đưa dữ liệu ghế lấy từ server vào Zustand.

Tính toán, không lưu trữ. Phần trăm lấp đầy (occupancy) phải được tính lại mỗi lần từ các lượt đặt của hôm nay. Đừng tạo trường occupancy ở bất kỳ đâu.

Bí mật chỉ nằm trong SecureStore. Token xác thực lưu ở đó. AsyncStorage dùng được cho cache offline nhưng tuyệt đối không dùng cho token.

3. Cấu trúc đề xuất
app/
  _layout.tsx            // providers, khôi phục phiên, chặn route
  sign-in.tsx
  (tabs)/
    _layout.tsx
    index.tsx            // danh sách ghế + lọc khu vực + tìm kiếm
    occupancy.tsx        // % theo khu vực
  seat/
    [id].tsx             // route động: chi tiết + lượt đặt + nút Book
    new.tsx              // tạo ghế
    [id]/edit.tsx        // sửa ghế
  book/[seatId].tsx      // form đặt chỗ
src/
  theme/tokens.ts        // TẤT CẢ màu sắc nằm ở đây
  api/                   // API mock hoặc thật
  store/                 // các Zustand store
  features/              // hooks (useSeats, useBookings...)
  lib/overlap.ts, lib/occupancy.ts

Cấu trúc này cho bạn hơn bốn màn hình, trong đó có route động. Hãy kiểm tra tài liệu của phiên bản Expo SDK bạn dùng để biết chính xác API của router và layout, vì những chi tiết như chặn route đã thay đổi giữa các phiên bản.

4. Phần khó: phát hiện chồng chéo thời gian

Đổi giờ sang số phút tính từ nửa đêm. Hai khoảng thời gian chồng nhau khi mỗi khoảng bắt đầu trước lúc khoảng kia kết thúc:

ts
type Slot = { start: number; end: number }; // phút, ví dụ 14:00 = 840

export const overlaps = (a: Slot, b: Slot) =>
  a.start < b.end && b.start < a.end;

export function hasConflict(
  existing: { seatId: string; date: string; start: number; end: number }[],
  candidate: { seatId: string; date: string; start: number; end: number },
) {
  return existing.some(
    (b) =>
      b.seatId === candidate.seatId &&
      b.date === candidate.date &&
      overlaps(b, candidate),
  );
}

Các test case nên viết:

14:00-16:00 và 15:00-17:00: xung đột
14:00-16:00 và 14:00-16:00: xung đột (trùng hoàn toàn)
14:00-16:00 và 16:00-18:00: không xung đột (liền kề nhau thì được, vì giờ kết thúc là loại trừ)
14:00-18:00 và 15:00-16:00: xung đột (một khoảng chứa khoảng kia)
Cùng giờ nhưng khác ghế hoặc khác ngày: không xung đột

Đây là ứng viên rất tốt cho bài test tự động tùy chọn của bạn.

Hãy kiểm tra thêm start < end trong form. Chạy việc kiểm tra xung đột cả ở UI (để hiện thông báo thân thiện) lẫn trong hàm tạo của mock API (vì "server" cũng phải từ chối xung đột).

5. Tính phần trăm lấp đầy theo khu vực

Ở đây, occupancy là tỷ lệ số ghế trong một khu vực có lượt đặt bao phủ thời điểm hiện tại:

ts
export function occupancyByZone(seats, bookings, now = new Date()) {
  const today = toDateString(now);           // "2026-09-19"
  const minutes = now.getHours() * 60 + now.getMinutes();
  const busy = new Set(
    bookings
      .filter((b) => b.date === today && b.start <= minutes && minutes < b.end)
      .map((b) => b.seatId),
  );
  const zones: Record<string, { total: number; taken: number }> = {};
  for (const s of seats) {
    zones[s.zone] ??= { total: 0, taken: 0 };
    zones[s.zone].total++;
    if (busy.has(s.id)) zones[s.zone].taken++;
  }
  return Object.entries(zones).map(([zone, z]) => ({
    zone,
    percent: Math.round((z.taken / z.total) * 100),
  }));
}

Dùng useMemo với ghế và lượt đặt làm dependency.

6. "Đánh dấu đã có người đặt ngay lập tức"

Sau khi mutation đặt chỗ thành công, hãy invalidate query bookings, hoặc tốt hơn là cập nhật cache trực tiếp bằng queryClient.setQueryData. Cập nhật lạc quan (optimistic update: cập nhật UI trước, hoàn tác nếu lỗi) cũng là một ý tưởng nâng cao (stretch) rất hay.

7. Đăng nhập tồn tại sau khi khởi động lại app
Khi đăng nhập, lưu token bằng SecureStore.setItemAsync.
Khi mở app, hiện trạng thái loading, đọc token, rồi đưa người dùng vào Zustand. Chỉ sau đó mới quyết định hiện màn hình đăng nhập hay ứng dụng chính.
Khi đăng xuất, xóa token, xóa user trong Zustand, và xóa cache của TanStack Query. "Kết thúc thật sự" nghĩa là không còn dữ liệu nào sót lại từ phiên trước.
Chuyển hướng người dùng chưa đăng nhập ra khỏi các màn hình được bảo vệ trong _layout.tsx gốc.
8. Hoạt động offline

Có ba phần riêng biệt:

Hiển thị lần tải gần nhất: lưu bền vững cache của TanStack Query (ví dụ với @tanstack/react-query-persist-client và AsyncStorage).
Banner hiển thị rõ: dùng @react-native-community/netinfo và hiển thị banner "Offline: đang hiển thị dữ liệu đã lưu".
Chỉnh sửa không bị mất âm thầm: xếp hàng đợi các chỉnh sửa offline trong một "outbox" Zustand được lưu bền vững và phát lại khi có mạng, hoặc dùng paused mutations của TanStack Query. Dù cách nào, hãy cho người dùng thấy các thay đổi đang chờ xử lý, và xử lý xung đột khi phát lại (trong lúc đó, khung giờ có thể đã bị người khác đặt).

Cách đơn giản và đáng tin cậy nhất là dùng outbox, vì bạn kiểm soát được nó và dễ giải thích khi bị hỏi trực tiếp.

9. Theme, token và khả năng truy cập

src/theme/tokens.ts là file duy nhất được chứa mã màu hex:

ts
export const tokens = {
  light: { bg: '#FFFFFF', text: '#1A1A1A', primary: '#1D4ED8', ... },
  dark:  { bg: '#0F172A', text: '#F1F5F9', primary: '#93C5FD', ... },
};

Tạo hook useTheme() dùng useColorScheme(). Để kiểm tra không có màu nào "rò rỉ" ra ngoài:

bash
grep -rEn "#[0-9a-fA-F]{3,8}\b" app src --include=*.ts --include=*.tsx | grep -v tokens.ts

Checklist khả năng truy cập cho mọi control:

accessibilityRole="button" (hoặc link, search, v.v.) và accessibilityLabel
minHeight: 44, minWidth: 44 (dùng hitSlop cho các icon nhỏ)
Kiểm tra các cặp màu chữ/nền ở cả hai theme bằng công cụ kiểm tra độ tương phản; tỷ lệ phải đạt ít nhất 4.5:1
10. Bốn trạng thái trên mọi màn hình

Hãy tạo một mẫu dùng chung để không phải lặp lại code:

tsx
if (query.isPending) return <Loading />;
if (query.isError)   return <ErrorView onRetry={query.refetch} />;
if (!query.data.length) return <Empty />;
return <Content data={query.data} />;

Nút Retry phải thật sự gọi refetch.

11. Lịch làm việc đề xuất (để các commit trải đều qua nhiều ngày)
Ngày	Mục tiêu
1	Tạo project Expo với TS strict, Router và lint. Thiết lập tokens.ts và theme. Commit đầu tiên.
2	Mock API cùng TanStack Query. Danh sách ghế với bốn trạng thái.
3	Route chi tiết seat/[id], lọc theo khu vực, tìm theo id.
4	Form tạo và sửa ghế.
5	Đăng nhập/đăng xuất với SecureStore và khôi phục phiên.
6	Form đặt chỗ, logic overlap và bài test của nó.
7	Màn hình occupancy, sau đó là banner offline và outbox.
8	Rà soát accessibility, tsc và lint sạch, README, AI_LOG, nén zip.

Hãy commit sau mỗi phần việc với thông điệp commit rõ ràng.

12. Checklist nộp bài
URL repo (GitHub) hoặc file zip tên 1923050808_Checkpoint.zip không có node_modules
README có yêu cầu cài đặt, cách cài, cách chạy và cách đăng nhập bằng tài khoản mock
AI_LOG.md do chính bạn viết: bạn đã hỏi gì, chấp nhận gì, từ chối gì và vì sao
npx tsc --noEmit và npx expo lint đều sạch lỗi
Tùy chọn: video quay màn hình 1-2 phút, và ý tưởng nâng cao được giải thích trong README

Me : Sau đó tôi bảo GPT Promt lệnh trên 
Tiếp theo : Hãy thực hiện từng bước theo promt này và hướng dẫn + giải thích chi tiết cho tôi 
Bước 1.1: Kiểm tra công cụ

Mở PowerShell và chạy:

powershell
node -v
npm -v
git --version

Kết quả mong đợi là ba dòng số phiên bản, không có lỗi "not recognized". Nếu thiếu git, hãy cài Git for Windows trước khi đi tiếp.

Bước 1.2: Chuẩn bị Android emulator

Expo cần biết chỗ adb (công cụ giao tiếp với emulator) trong Android SDK.

Mở Android Studio → More Actions → Virtual Device Manager (hoặc Tools → Device Manager).
Tạo một máy ảo (ví dụ Pixel) với system image Android mới (API 36 hoặc mới hơn). Changelog SDK 56 nêu Android API level 36 được hỗ trợ.
Bấm ▶ để khởi động emulator và đợi tới màn hình chính.
Đặt biến môi trường ANDROID_HOME. Đường dẫn SDK mặc định thường là C:\Users\<tên bạn>\AppData\Local\Android\Sdk. Bạn có thể xem đường dẫn thật trong Android Studio → Settings → Languages & Frameworks → Android SDK.
Thêm thư mục platform-tools (nằm trong thư mục SDK) vào biến Path.
Đóng và mở lại PowerShell, rồi kiểm tra:
powershell
adb --version
adb devices

Kết quả mong đợi: adb in ra phiên bản, và adb devices liệt kê một thiết bị dạng emulator-5554 device. Nếu adb không nhận ra thì Path chưa đúng. Nếu thiết bị hiện offline, hãy đợi emulator khởi động xong.

Bước 1.3: Tạo project

Chọn một thư mục làm việc không có dấu cách hay tiếng Việt có dấu trong đường dẫn (ví dụ C:\dev), rồi chạy:

powershell
cd C:\dev
npx create-expo-app@latest library-seat-booking
cd library-seat-booking

npx chạy công cụ create-expo-app mà không cần cài toàn cục. @latest đảm bảo bạn lấy bản mới nhất, tức template khớp với SDK hiện tại.

Kiểm tra SDK: mở package.json và tìm dòng "expo": "...". Số chính phải ≥ 56 (dự kiến là 57).

Bước 1.4: Đọc cấu trúc template

Chạy:

powershell
dir
dir app

Nếu app không tồn tại, thử dir src\app. Ta cần biết template đặt route ở đâu. Nếu là src/app, ta sẽ đặt các file route ở đó và không tự ý di chuyển, vì Expo Router hỗ trợ cả hai chỗ.

Mở luôn tsconfig.json và xem có "strict": true (hoặc extends từ expo/tsconfig.base kèm strict) hay chưa. Ta kiểm tra thực tế, không đoán.

Bước 1.5: Chạy thử

Đảm bảo emulator đang chạy, rồi:

powershell
npx expo start

Khi Metro bundler hiện menu trong terminal, nhấn phím a. Expo CLI sẽ cài Expo Go lên emulator (vì Expo Go SDK mới không có trên Play Store) và mở app.

Kết quả mong đợi là màn hình ứng dụng mẫu của template hiện trên emulator. Đừng chạy --web để kiểm tra, vì sau này SecureStore không chạy trên web.

Nếu lỗi, hãy chụp màn hình hoặc copy log terminal gửi tôi. Tôi sẽ phân tích theo format 7 bước mà bạn yêu cầu.

Bước 1.6: Baseline TypeScript và lint

Nhấn Ctrl+C để dừng Metro (hoặc mở terminal mới), rồi chạy:

powershell
npx tsc --noEmit
npx expo lint
tsc --noEmit chỉ kiểm tra kiểu, không tạo file JS. Đây là lệnh đề dùng để chấm.
expo lint chạy ESLint theo cấu hình Expo. Nếu nó hỏi cài thêm package ESLint, bạn đồng ý và ghi lại việc đó.

Kết quả mong đợi là cả hai lệnh không báo lỗi trên project chưa sửa gì. Nếu có lỗi, ta biết chắc nó đến từ template, không phải do bạn.

Bước 1.7: Git và commit đầu tiên
powershell
git status
Nếu báo not a git repository: chạy git init. (create-expo-app thường đã tự khởi tạo repo.)
Kiểm tra .gitignore có dòng node_modules/.
Nếu Git chưa biết bạn là ai:
powershell
git config --global user.name "Nguyen Vu Ngoc Huy"
git config --global user.email "email-cua-ban@example.com"

Sau đó commit:

powershell
git add .
git commit -m "feat: initialize expo router project"

Rồi tạo một repo trống trên GitHub (đừng tick thêm README hay .gitignore), và làm theo hướng dẫn "push an existing repository" mà GitHub hiển thị:

powershell
git remote add origin <URL-repo-của-bạn>
git branch -M main
git push -u origin main

Hãy commit theo từng ngày làm việc thực tế, đừng chỉnh ngày commit.

Me : Tôi đã xong các bước đầu để chuẩn bị rồi bạn có thể hướng dẫn tôi tiếp theo bước 2 
Mục tiêu: một file tokens.ts chứa toàn bộ màu (light và dark), một hook useTheme() để đọc màu theo giao diện hệ thống, và vài component cơ bản đã đạt yêu cầu accessibility.

Template của bạn đã có sẵn hệ thống theme riêng, gồm:

src/constants/theme.ts
src/hooks/use-color-scheme.ts
src/hooks/use-color-scheme.web.ts
src/hooks/use-theme.ts
src/components/themed-text.tsx
src/components/themed-view.tsx

Đề yêu cầu chỉ một file token chứa mã hex, còn template có thể đã rải màu ở nhiều chỗ. Vì bạn muốn sửa trên cấu trúc hiện có thay vì tạo lại, tôi cần xem chúng trước để quyết định:

Dùng lại constants/theme.ts làm file token duy nhất, hay thay bằng theme/tokens.ts như kiến trúc ta đã vẽ?
File nào chứa hex cần dọn?
useTheme của template trả về gì, và ta cần thêm token nào (primary, border, error, card, muted...)?

Hãy chạy hai lệnh sau rồi gửi tôi kết quả:

powershell
grep -rEn "#[0-9a-fA-F]{3,8}\b" src app --include=*.ts --include=*.tsx --include=*.css

Nếu PowerShell báo không có grep, dùng lệnh tương đương:

powershell
Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx,*.css | Select-String -Pattern "#[0-9a-fA-F]{3,8}\b"

Sau đó gửi thêm nội dung của src/constants/theme.ts, src/hooks/use-theme.ts và src/hooks/use-color-scheme.ts.

Me : tiếp nhận sau đó trả lời claude bằng các file như trên 
Cladue : useColorScheme() hoạt động thế nào
Nó hỏi hệ điều hành đang ở chế độ sáng hay tối và trả về 'light' hoặc 'dark'.
Nó là hook nên gây re-render: khi người dùng đổi giao diện trong Settings, mọi component gọi hook sẽ vẽ lại với màu mới. Không cần code thêm gì.
Đôi khi giá trị là 'unspecified', nên useTheme() của template có dòng scheme === 'unspecified' ? 'light' : scheme. Đó là phương án dự phòng.
Nhờ as const và kiểu ThemeColor = keyof light & keyof dark, TypeScript bắt lỗi nếu bạn thêm màu vào light mà quên dark. Đây là câu trả lời hay khi giảng viên hỏi "làm sao đảm bảo hai scheme đủ token".
5. Kiểm tra bước này
powershell
npx tsc --noEmit
npx expo lint

Kết quả mong đợi: cả hai không in lỗi. Bạn có thể tự thử để hiểu: xoá tạm dòng error trong dark, chạy tsc, rồi xem chỗ nào báo lỗi (thường là nơi dùng theme.error, nhưng hiện chưa ai dùng nên có thể chưa báo). Sau đó khôi phục lại. Nếu không lỗi thì commit:

powershell
git add .
git commit -m "feat: add theme tokens"
6. Dark mode có thật sự chạy không?

Hãy kiểm tra hai thứ, vì đây là lỗi kinh điển làm useColorScheme() luôn trả về light:

Trong app.json, tìm "userInterfaceStyle". Nó cần là "automatic", không phải "light". Trên Android, tài liệu Expo còn nói tới package expo-system-ui, nên nếu dark mode không phản hồi, hãy tra docs "Color schemes" của Expo.
Đổi giao diện emulator bằng lệnh (thay cho việc vào Settings):
powershell
adb shell "cmd uimode night yes"
adb shell "cmd uimode night no"

Chưa có màn hình nào để nhìn sự thay đổi (màn mẫu của template chưa dùng token mới của ta), nên bài kiểm tra bằng mắt sẽ nằm ở bước tiếp theo.

Các bước còn lại của Phase 2
Bước	Nội dung
2.3	Dọn hex còn sót ngoài theme.ts (cần kết quả lệnh grep của bạn)
2.4	Tạo AppButton có accessibilityRole, accessibilityLabel, minHeight: MinTouchTarget, dùng token; hiển thị thử trên màn hình để đổi light/dark bằng mắt
2.5	Quyết định xử lý code demo của template
4. Bước 2.4: component AppButton

Đề yêu cầu mọi control có role và label, cùng vùng chạm 44 × 44. Nếu mỗi nút tự lo, bạn sẽ quên ở đâu đó. Vì vậy ta viết một nút chuẩn và dùng khắp app.

Giải thích trước khi có code:

Dùng Pressable (component bấm được cơ bản của React Native), không dùng TouchableOpacity. Pressable là API hiện hành và cho phép style thay đổi theo trạng thái pressed.
accessibilityRole="button" báo cho screen reader (TalkBack trên Android) đây là nút. Nó đọc "Đặt ghế, button". Thiếu role, người dùng chỉ nghe chữ như một đoạn văn thường.
accessibilityLabel là nội dung được đọc. Với nút có chữ, label = chữ trên nút. Nút chỉ có icon thì label là thứ duy nhất mô tả nó.
accessibilityState={{ disabled }} để screen reader nói "dimmed/disabled" khi nút bị vô hiệu.
minHeight và minWidth = MinTouchTarget (44) từ token.
Màu lấy hết từ useTheme(), không có hex nào trong file. Nút phụ (secondary) có viền border để vẫn thấy được trên nền.
Ta đặt tên file theo quy ước kebab-case của template (themed-text.tsx...), nên là app-button.tsx. Các component sau (như "4 trạng thái") cũng theo quy ước này.
5. Bạn gửi lại cho tôi

Để dọn code demo và sửa themed-text.tsx mà không làm hỏng app, tôi cần xem nội dung:

src/components/themed-text.tsx
src/app/_layout.tsx
src/components/app-tabs.tsx
src/app/index.tsx

Me : Đưa code cho AI và tôi đã hoàn thành các công đoạn ở phía trước , bạn hãy hướn dẫn cho tôi phần tiếp theo 
Bước 2.6: Sửa themed-text.tsx

Ý tưởng: bỏ hex khỏi StyleSheet, và chọn màu ngay từ đầu bằng token. Nếu type là linkPrimary và người gọi không truyền themeColor, thì dùng primary.

Sửa phần thân component:

tsx
export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const color = theme[themeColor ?? (type === 'linkPrimary' ? 'primary' : 'text')];

  return (
    <Text
      style={[
        { color },
        type === 'default' && styles.default,
        // ... các dòng type khác giữ nguyên ...
        style,
      ]}
      {...rest}
    />
  );
}

Và trong StyleSheet.create, xoá dòng color: '#3c87f7', khỏi linkPrimary:

tsx
linkPrimary: {
  lineHeight: 30,
  fontSize: 14,
},

Những chỗ còn lại giữ nguyên. Vì primary có trong cả light và dark, TypeScript chấp nhận theme['primary']. Contrast của primary trên background đã tính ở Phase 2: khoảng 6.7:1 ở light và 11.7:1 ở dark, theo phép tính tay của tôi.

Lưu ý accessibility: ThemedText chỉ là chữ, nó không tự thành link. Khi bạn dùng nó để bấm được, phải tự thêm accessibilityRole="link" ở nơi dùng.
Me : TÔi đã thực hiện xong phần 2 và tiếp đến tôi cần bạn hướng dẫn rôi phần 3
Phase 3: Types và Mock API

Bạn nhớ phần này là nền cho mọi thứ sau. Ta làm theo từng bước nhỏ.

Bước 3.1: Data model

Đề gợi ý hai kiểu: Seat (id, zone, hasOutlet) và Booking (id, seatId, date, timeSlot, studentName). Ta bám sát, không thêm field.

Các quyết định (đề chưa quy định, tôi đề xuất):

Vấn đề	Đề xuất	Lý do
zone	string	Form tạo ghế có thể nhập zone mới, và ta không cố định danh sách trước
date	"YYYY-MM-DD" (string)	So sánh bằng === đơn giản, tránh lỗi múi giờ
timeSlot	{ start: "HH:mm"; end: "HH:mm" }	Khớp ví dụ 14:00-16:00 và 15:00-17:00 của đề. Ta đổi sang phút khi tính
User	{ studentName: string }	Đề không có kiểu này, nhưng cần cho sign-in và cho studentName của booking

Seat.id sinh ra thế nào (người dùng nhập hay mock server tự sinh) tôi sẽ chốt ở bước 3.3 khi viết createSeat.
Bước 3.3: Mock API

Mục tiêu: một "máy chủ giả" trong bộ nhớ, hành xử giống server thật ở bốn điểm: có độ trễ, có thể lỗi mạng, tự kiểm tra dữ liệu, và trả về bản sao chứ không đưa thẳng dữ liệu nội bộ. Bước này làm phần seats. Auth và bookings làm sau.

Quy ước tên file: template dùng kebab-case (themed-text.tsx), nên từ giờ ta cũng dùng mock-db.ts, seats-api.ts, auth-store.ts... thay cho tên camelCase trong kiến trúc ở Bước C.

Các quyết định thiết kế
Vấn đề	Quyết định	Lý do
Seat.id do ai tạo?	Người dùng nhập (ví dụ "A07"), server kiểm tra trùng	Số ghế là nhãn dán thật trên bàn. Ngoài ra khi tạo ghế lúc offline, client đã biết sẵn id nên không phải thay id tạm ở Phase 12
Lỗi có phân loại	ApiError có code	Khi replay outbox, lỗi NETWORK thì thử lại, còn CONFLICT thì báo người dùng. Không phân loại được thì không xử lý khác nhau được
Khi nào chạy logic server?	Sau khi hết độ trễ	Thay đổi dữ liệu xảy ra lúc "yêu cầu tới server", giống thật
Trả bản sao	{ ...seat }	Nếu trả chính object trong db, UI có thể sửa nhầm "database" mà không qua API

Giải thích:

ApiError extends Error thêm trường code. Ở UI ta sẽ viết error instanceof ApiError && error.code === 'CONFLICT'. Trong test ở dưới sẽ có một dòng in ra instanceof để xác nhận nó hoạt động trên môi trường của bạn.
simulateRequest nhận một hàm handler, chờ latencyMs, rồi chạy nó. Vì async, throw bên trong tự thành Promise bị reject, và TanStack Query bắt được điều đó (isError).
failNext dùng để bạn ép một request lỗi, bấm retry là request sau thành công. Đây chính là cách kiểm tra nút Retry ở "4 trạng thái" của đề.
Ta bọc trạng thái mô phỏng sau hàm setSimulation thay vì để UI sửa trực tiếp object, để code ngoài có một điểm vào rõ ràng.
Thông báo lỗi tạm viết tiếng Anh. Ngôn ngữ giao diện đề chưa quy định, ta sẽ chốt ở Phase 4 khi làm màn hình lỗi.

File 2: src/api/mock-db.ts
typescript
import { toDateString } from '@/lib/time';
import type { Booking, Seat } from '@/types';

const ZONES = ['A', 'B', 'C'] as const;
const SEATS_PER_ZONE = 6;

type Database = {
  seats: Seat[];
  bookings: Booking[];
  nextBookingNumber: number;
};

function createSeedSeats(): Seat[] {
  return ZONES.flatMap((zone) =>
    Array.from({ length: SEATS_PER_ZONE }, (_, index) => ({
      id: `${zone}${String(index + 1).padStart(2, '0')}`,
      zone,
      hasOutlet: index % 2 === 0,
    })),
  );
}

function createSeedBookings(): Booking[] {
  const today = toDateString(new Date());
  return [
    { id: 'b1', seatId: 'A01', date: today, timeSlot: { start: '08:00', end: '12:00' }, studentName: 'Tran Van B' },
    { id: 'b2', seatId: 'A02', date: today, timeSlot: { start: '13:00', end: '17:00' }, studentName: 'Le Thi C' },
    { id: 'b3', seatId: 'B01', date: today, timeSlot: { start: '09:00', end: '18:00' }, studentName: 'Pham Van D' },
    { id: 'b4', seatId: 'B02', date: today, timeSlot: { start: '14:00', end: '16:00' }, studentName: 'Vo Thi E' },
  ];
}

/**
 * "Cơ sở dữ liệu" của server giả, nằm trong bộ nhớ.
 * Chỉ các file trong src/api được import file này. UI không được import trực tiếp.
 * Tắt hẳn app rồi mở lại thì dữ liệu về trạng thái ban đầu.
 */
export const db: Database = {
  seats: createSeedSeats(),
  bookings: createSeedBookings(),
  nextBookingNumber: 5,
};

Giải thích:

Dữ liệu mẫu: 3 zone × 6 ghế = 18 ghế (A01..A06, B01..B06, C01..C06). Ghế thứ chẵn trong zone (A01, A03, A05...) có ổ cắm.
Booking mẫu dùng toDateString(new Date()), tức ngày hôm nay. Nếu ghi ngày cố định thì ngày mai occupancy sẽ về 0 và bạn không biết vì sao. Booking b4 (B02, 14:00-16:00) khớp đúng ví dụ trong đề, nên sau này bạn thử đặt B02 15:00-17:00 sẽ thấy nó bị chặn.
nextBookingNumber để server sinh id booking (b5, b6...). Ta dùng sau ở Phase 10.
File 3: src/api/seats-api.ts
typescript
import { ApiError, simulateRequest } from '@/api/client';
import { db } from '@/api/mock-db';
import type { Seat, SeatInput } from '@/types';

const copySeat = (seat: Seat): Seat => ({ ...seat });

function findSeat(id: string): Seat {
  const seat = db.seats.find((s) => s.id === id);
  if (!seat) {
    throw new ApiError('NOT_FOUND', `Seat ${id} not found.`);
  }
  return seat;
}

export function getSeats(): Promise<Seat[]> {
  return simulateRequest(() => db.seats.map(copySeat));
}

export function getSeat(id: string): Promise<Seat> {
  return simulateRequest(() => copySeat(findSeat(id)));
}

export function createSeat(seat: Seat): Promise<Seat> {
  return simulateRequest(() => {
    const id = seat.id.trim().toUpperCase();
    const zone = seat.zone.trim();
    if (!id || !zone) {
      throw new ApiError('VALIDATION', 'Seat id and zone are required.');
    }
    if (db.seats.some((s) => s.id === id)) {
      throw new ApiError('CONFLICT', `Seat ${id} already exists.`);
    }
    const created: Seat = { id, zone, hasOutlet: seat.hasOutlet };
    db.seats.push(created);
    return copySeat(created);
  });
}

export function updateSeat(id: string, input: SeatInput): Promise<Seat> {
  return simulateRequest(() => {
    const seat = findSeat(id);
    const zone = input.zone.trim();
    if (!zone) {
      throw new ApiError('VALIDATION', 'Zone is required.');
    }
    seat.zone = zone;
    seat.hasOutlet = input.hasOutlet;
    return copySeat(seat);
  });
}

Giải thích:

Mỗi hàm trả về Promise. Code phía UI sẽ await chúng qua TanStack Query, và đổi sang API thật sau này thì chỉ sửa trong src/api/.
createSeat chuẩn hoá id bằng trim().toUpperCase(), nên "a07" và "A07" là cùng một ghế. Server kiểm tra lại dù UI cũng sẽ kiểm tra, vì không được tin dữ liệu từ client (cùng tinh thần "conflict phải kiểm tra ở cả hai tầng" của đề).
updateSeat(id, input) không cho đổi id: id là tham số riêng, còn SeatInput không có trường id. Đây là lý do ta đã tạo Omit<Seat, 'id'> ở bước 3.1.
Trùng id trả CONFLICT. Đây cũng là lỗi cần xử lý khi replay outbox tạo ghế lúc offline.

Me : LOG  getSeats OK 18
 LOG  took ms 619
 LOG  getSeat A01 OK {"hasOutlet": true, "id": "A01", "zone": "A"}
 LOG  getSeat Z99 ERROR ApiError NOT_FOUND
 LOG  createSeat d01 OK {"hasOutlet": false, "id": "D01", "zone": "D"}
 LOG  createSeat d01 again ERROR ApiError CONFLICT
 LOG  updateSeat D01 OK {"hasOutlet": true, "id": "D01", "zone": "D"}
 LOG  getSeats forced fail ERROR ApiError NETWORK
 LOG  getSeats after fail OK 19
Đây là output và 2 lẫn 3 đều oke tsc lint ko có lỗi và 3 cx ko có lỗi

Me : Đã chạy thử ổn r bây h tới phần tiếp theo nhé
Bước 3.4: Auth API và đọc bookings

Mục tiêu: có "server" để đăng nhập (trả về token) và xác minh token. Kèm hàm getBookings chỉ để đọc. createBooking cần hasConflict, nên để Phase 10.

Một cái bẫy phải xử lý trước khi viết code

mock-db nằm trong bộ nhớ, nên tắt app rồi mở lại thì mọi thứ trên "server" reset. Nếu server lưu danh sách token đang hợp lệ trong db, thì sau khi restart token trong SecureStore không còn được server nhận ra, và session sẽ không khôi phục được. Đề yêu cầu chính xác điều này ("session surviving an app restart").

Nên ta cho token tự mang thông tin, giống ý tưởng của JWT, và server chỉ giải mã ra để tìm user:

token = "mock-token:" + username

Server thật sẽ ký token bằng chữ ký mật mã để không ai giả mạo được. Mock của ta thì không cần, và ta ghi rõ điều đó là giới hạn của mock trong README.

Từ đây có thêm một hệ quả cần biết: seat bạn tạo (như D01) cũng biến mất khi restart app, vì db.seats chỉ ở trong bộ nhớ. Ở Phase 12, cache offline có thể còn ghế mà "server" đã mất nó. Bạn nên ghi điều này vào README (mục known limitations).

Các quyết định
Vấn đề	Quyết định	Lý do
Đăng nhập bằng gì?	username + password, đề chưa quy định	Đơn giản, giống app thật
Tài khoản mock	2 tài khoản (xem code)	Có người thứ hai để thử kịch bản "User B đặt trước"
Server trả gì?	{ token, user }, không bao giờ trả password	Đúng như server thật
Sign out	Xoá phía client (SecureStore, Zustand, cache)	Token không trạng thái nên server không có gì để huỷ. Server thật sẽ thu hồi token
Mật khẩu thô trong code	Chấp nhận, vì đây là mock	Server thật lưu hash. Ghi vào README

Giải thích:

signIn kiểm tra rỗng (VALIDATION) trước khi so khớp, và sai thông tin trả UNAUTHORIZED. UI sẽ phân biệt hai lỗi này để hiện thông báo phù hợp.
Cùng một thông báo "Wrong username or password" cho cả trường hợp sai username lẫn sai password: server thật cũng làm vậy để kẻ tấn công không dò được username nào tồn tại.
getCurrentUser(token) sẽ được gọi ở Phase 8, khi app mở lại: đọc token từ SecureStore, hỏi server "token này của ai", rồi đưa user vào Zustand. Nếu token sai hoặc hết hạn thì bị UNAUTHORIZED và app chuyển về sign-in.
studentName của booking sau này lấy từ user.studentName, khớp field studentName mà đề đưa vào Booking.

Ý tưởng chính của Phase 4

TanStack Query quản lý server state: dữ liệu nằm ở nơi khác (server), app chỉ giữ bản sao có thể lỗi thời. Nó lo hộ ba việc mà nếu tự làm bằng useState + useEffect bạn sẽ phải viết lại ở mỗi màn hình:

Việc	Nếu tự làm	Với TanStack Query
Trạng thái loading/error	3 biến useState	isPending, isError, error
Cache	tự giữ object	tự cache theo queryKey
Thử lại	tự viết	retry và refetch()

Ba khái niệm bạn cần nói được:

queryKey: "địa chỉ" của dữ liệu trong cache. Ta dùng dạng phân cấp: ['seats'] cho danh sách, ['seats', 'A01'] cho một ghế. Khi gọi invalidateQueries({ queryKey: ['seats'] }), mọi key bắt đầu bằng ['seats'] bị đánh dấu cũ, cả danh sách lẫn từng ghế. Đây là lý do ta thiết kế key như vậy.
staleTime: bao lâu dữ liệu còn "tươi". Trong thời gian này, mở lại màn hình sẽ dùng cache mà không gọi API. Ta chọn 30 giây.
retry: số lần tự thử lại khi lỗi. Mặc định là 3 lần với thời gian chờ tăng dần, nghĩa là màn hình lỗi phải đợi vài giây mới hiện. Ta đặt 1.

src/components/query-state.tsx

Giải thích trước khi đọc code:

Component nhận kết quả của useQuery và một hàm children nhận dữ liệu đã chắc chắn tồn tại. Nhờ vậy màn hình nào cũng chỉ cần viết phần "content", còn ba trạng thái kia dùng chung.
Ta kiểm tra data === undefined thay vì chỉ isPending. Lý do liên quan trực tiếp đến đề: khi refetch thất bại (ví dụ mất mạng) nhưng đã có dữ liệu cũ, ta phải tiếp tục hiển thị dữ liệu cũ chứ không bật màn hình lỗi. Đó là yêu cầu "last successful load is shown" ở Phase 12.
Nút Retry gọi query.refetch() thật, đúng yêu cầu của đề.
Loading có accessibilityRole="progressbar" và nhãn "Loading", để screen reader đọc được. Lỗi có accessibilityRole="alert" để được đọc ngay khi xuất hiện.

Sau Phase 4
Phase 12 sẽ nối onlineManager với thư viện đo mạng (NetInfo). Tài liệu TanStack cho React Native hướng dẫn nối nó với NetInfo hoặc expo-network, và nối focusManager với AppState, vì các cơ chế phát hiện mạng/focus mặc định của web không có trong React Native. Trang tài liệu React Native của TanStack Query đưa ví dụ cấu hình onlineManager qua NetInfo và cập nhật focusManager qua sự kiện thay đổi AppState. Ta chưa làm bây giờ. 
TanStack
gcTime (thời gian giữ cache không dùng) phải được chỉnh khi bật lưu cache bền vững, nếu không cache sẽ bị dọn trước khi kịp khôi phục. Ta sẽ xử lý ở Phase 12.

Me : Kết quả đúng với những gì bạn dự đoán , tiếp theo tôi cần làm gì 
Claude : Ý tưởng chính: client state và server state
Dữ liệu	Ở đâu	Vì sao
Danh sách ghế	TanStack Query (đã làm)	Thuộc về server, có thể lỗi thời
searchText, selectedZone	Zustand	Chỉ tồn tại trong app, không có "bản gốc" nào trên server
Danh sách ghế đã lọc	Không lưu ở đâu cả	Tính từ hai thứ trên mỗi lần render
Danh sách zone để hiện nút	Không lưu, tính từ seats	Thêm ghế zone "D" thì nút "D" tự xuất hiện

Nguyên tắc là mỗi dữ liệu chỉ có một nguồn sự thật. Nếu bạn copy ghế vào Zustand để lọc, bạn phải tự đồng bộ hai bản mỗi lần tạo/sửa ghế, và sớm muộn chúng lệch nhau.

Selectors là hàm chọn đúng phần state mà component cần:

ts
const searchText = useFilterStore((s) => s.searchText);   // chỉ re-render khi searchText đổi
const everything = useFilterStore();                       // re-render khi BẤT KỲ thứ gì đổi

Đề yêu cầu "store with selectors", nên ta luôn dùng dạng đầu. Ta chọn từng trường một vì chúng là giá trị nguyên thủy (string, null). Tài liệu cộng đồng lưu ý một cái bẫy ở Zustand v5: selector trả về object/mảng mới mỗi lần có thể gây lỗi "Maximum update depth exceeded". Khi cần lấy nhiều trường một lúc, phải bọc bằng useShallow. Ta tránh bẫy này bằng cách gọi selector riêng cho từng trường.
Bước 5.3: Logic lọc thuần (src/lib/filter-seats.ts)

Logic thuần (không dính React) đặt trong lib/ để dễ test và dễ giải thích.

typescript
import type { Seat } from '@/types';

/** Lọc theo zone và tìm theo id (không phân biệt hoa/thường, khớp một phần). */
export function filterSeats(seats: Seat[], searchText: string, zone: string | null): Seat[] {
  const query = searchText.trim().toLowerCase();
  return seats.filter((seat) => {
    const matchesZone = zone === null || seat.zone === zone;
    const matchesId = query === '' || seat.id.toLowerCase().includes(query);
    return matchesZone && matchesId;
  });
}

/** Danh sách zone không trùng, sắp xếp theo thứ tự chữ cái. */
export function getZones(seats: Seat[]): string[] {
  return [...new Set(seats.map((seat) => seat.zone))].sort();
}

Hai điều kiện dùng &&, nghĩa là ghế phải thoả cả zone lẫn từ khoá. Ô tìm kiếm rỗng và zone null đều là "không lọc". Set loại trùng lặp.

Me : Tôi đã xong phần này rồi và nó gặp 1 lỗi ko hiện đc button clear 
Claude : Cách sửa (nếu đúng là layout)

DevPanel là công cụ của lập trình viên nhưng đang chiếm chỗ cố định. Ta cho nó thu gọn mặc định, mở khi cần. Bạn sẽ cần nó ở Phase 10 và 12, nên không xoá. Nó còn giúp màn hình gọn hơn khi bạn demo cho giảng viên.

Thay toàn bộ src/components/dev-panel.tsx:

tsx
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { setSimulation } from '@/api/client';
import { AppButton } from '@/components/app-button';
import { Spacing } from '@/constants/theme';
import { seatKeys } from '@/features/seats/use-seats';
import { queryClient } from '@/lib/query-client';

export function DevPanel() {
  const [expanded, setExpanded] = useState(false);
  const [failAll, setFailAll] = useState(false);

  if (!__DEV__) {
    return null;
  }

  const toggleFailAll = () => {
    setSimulation({ failAll: !failAll });
    setFailAll(!failAll);
  };

  return (
    <View style={styles.container}>
      <AppButton
        variant="secondary"
        label={expanded ? 'Hide dev tools' : 'Show dev tools'}
        onPress={() => setExpanded(!expanded)}
      />
      {expanded ? (
        <>
          <AppButton
            variant="secondary"
            label={`Simulate server errors: ${failAll ? 'ON' : 'OFF'}`}
            onPress={toggleFailAll}
          />
          <AppButton
            variant="secondary"
            label="Clear seats cache and reload"
            onPress={() => void queryClient.resetQueries({ queryKey: seatKeys.all })}
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
});

Me : TÔi đã sửa đc lỗi rồi hãy sang phần tiếp theo
Phase 6: Màn hình chi tiết ghế (seat/[id])

Tôi đã kiểm tra tài liệu Expo Router: useLocalSearchParams và Link với href dạng object vẫn là API hiện hành. Ở phần "typed routes", tài liệu nói rõ rằng với route động, href phải là object có params đúng tên, viết dạng chuỗi "/user/[id]" sẽ bị TypeScript báo lỗi.

Ý tưởng chính

Dynamic route. File src/app/seat/[id].tsx có tên trong ngoặc vuông nghĩa là "một đoạn đường dẫn thay đổi được". Đường dẫn /seat/A01 chạy file này với id = "A01", còn /seat/B05 chạy cùng file với id = "B05". Một file phục vụ mọi ghế. Trong màn hình, bạn lấy giá trị bằng hook useLocalSearchParams.

Vì sao là Local chứ không phải Global. Trong stack, có thể có nhiều màn hình chồng nhau. useLocalSearchParams chỉ trả tham số của màn hình đang hiển thị (màn hình chứa hook), còn bản Global cập nhật theo cả màn hình khác. Tài liệu khuyên dùng bản Local trong stack.

Hai query chạy song song. Màn hình cần ghế và các booking. Ta gọi cả hai hook ở đầu màn hình để chúng bắt đầu cùng lúc. Nếu gọi useBookings sâu bên trong phần hiển thị ghế, nó chỉ chạy sau khi ghế tải xong, tổng thời gian chờ thành 600 + 600 ms thay vì 600 ms. Hiện tượng này gọi là waterfall và là câu hỏi hay gặp.

Query và mutation. useQuery đọc dữ liệu và tự chạy khi màn hình mở. useMutation ghi dữ liệu và chỉ chạy khi bạn gọi .mutate(...). Mutation cho bạn isPending (đang gửi), error (nếu lỗi) và mặc định không tự thử lại.

Sau khi ghi, cache phải được làm mới. Sau khi tạo/sửa ghế, dữ liệu trong cache đã lỗi thời. Ta gọi invalidateQueries({ queryKey: ['seats'] }), nó đánh dấu mọi query có key bắt đầu bằng ['seats'] là cũ (cả danh sách lẫn từng chi tiết ghế, nhờ cách ta đặt key ở Phase 4), và refetch những query đang hiển thị. Ta trả về Promise đó từ onSuccess, nên mutation giữ isPending cho đến khi dữ liệu mới tải xong. Vì vậy khi form đóng lại, danh sách đã cập nhật đúng.

Validation hai lớp, cùng tinh thần với conflict ở Phase 9: form kiểm tra để báo lỗi thân thiện, và mock server cũng kiểm tra lại. Ta dùng chung một hàm kiểm tra vì cả hai đều là code của ta. Ở hệ thống thật, server có bản kiểm tra riêng.

Vì sao chỉ cho phép chữ, số và dấu gạch ngang trong id. Id nằm trong URL (/seat/A01). Một id có dấu / hoặc dấu cách sẽ làm hỏng route.
Bước 7.4: Form dùng chung

Giải thích trước khi có code:

Form giữ giá trị đang gõ bằng useState. Đây là state cục bộ của form (chưa gửi đi đâu cả), nên không đặt trong Zustand hay TanStack Query.
Lỗi chỉ hiện sau lần bấm nút đầu tiên (submitted). Nếu hiện ngay từ đầu, người dùng chưa gõ gì đã thấy chữ đỏ. Sau khi đã bấm một lần, lỗi cập nhật theo từng ký tự gõ.
Ở chế độ sửa, id chỉ hiển thị, không cho nhập, vì updateSeat không cho đổi id.
Lỗi từ server (submitError, ví dụ trùng id) hiển thị bằng describeError, có accessibilityRole="alert" để screen reader đọc ngay.
Công tắc ổ cắm dùng Switch, nằm trong một hàng cao tối thiểu 44 dp. Màu lấy từ token.

Me : Sau khi thử thì đã thành công theo lời bạn nói , bây h hãy hướng dẫn tiếp giúp tôi
Phase 7 xong. Tôi đã đối chiếu tài liệu hiện hành cho ba thứ Phase 8 phụ thuộc vào:

Route được bảo vệ: dùng Stack.Protected với prop guard (từ SDK 53). Khi màn hình bị chặn, router đưa người dùng về route neo (anchor) hoặc màn hình đầu tiên còn khả dụng. Khi guard chuyển từ true sang false, toàn bộ lịch sử điều hướng của các màn hình đó bị xoá. 
expo
SecureStore: vẫn là ba hàm bất đồng bộ setItemAsync, getItemAsync (trả string | null) và deleteItemAsync.
Splash: preventAutoHideAsync() giữ splash và hideAsync() tắt nó, đúng mẫu ta cần.
Phase 8: Đăng nhập, đăng xuất, route được bảo vệ
Ý tưởng chính
Vì sao SecureStore, không phải AsyncStorage
	AsyncStorage	SecureStore
Lưu ở đâu	File thường trên thiết bị	Mã hoá bằng Keychain (iOS) hoặc Keystore (Android)
Đọc được khi	Máy root/jailbreak, bản sao lưu	Rất khó nếu không mở khoá thiết bị
Dùng cho	Cache, cài đặt	Token, mật khẩu, thông tin nhạy cảm

Đề yêu cầu "Secrets in SecureStore only", nên token tuyệt đối không được vào AsyncStorage. Điều này kéo theo hai quy tắc: không bọc auth-store bằng persist của Zustand (vì nó lưu vào AsyncStorage), và store không giữ token trong state, chỉ giữ user. Token nằm trong SecureStore, và khi server thật cần token thì đọc ra lúc gọi API.

Ba trạng thái, không phải hai

Nếu chỉ có "đã đăng nhập / chưa", lúc mở app trạng thái mặc định là "chưa", và màn hình đăng nhập nháy lên trước khi session được khôi phục. Ta thêm trạng thái thứ ba:

restoring  ──(đọc SecureStore xong)──►  signedIn   hoặc   signedOut

Trong lúc restoring, splash screen vẫn che, ta chưa vẽ gì.

Luồng dữ liệu
Sign in:   form → signIn() → mock API → { token, user }
                                          ├─► SecureStore.setItemAsync   (bền vững)
                                          └─► Zustand { status: 'signedIn', user }
                                                  └─► Stack.Protected đổi guard → tự chuyển màn hình

Mở app:    splash → SecureStore.getItemAsync → getCurrentUser(token)
                      ├─ không có token           → signedOut
                      ├─ server nói UNAUTHORIZED   → xoá session → signedOut
                      ├─ server thành công         → signedIn (user mới nhất)
                      └─ lỗi mạng                  → signedIn (dùng user đã lưu)  ← cho phép dùng offline

Sign out:  xoá SecureStore + xoá cache TanStack Query + reset bộ lọc + user = null

Nhánh "lỗi mạng" quan trọng vì đề yêu cầu app chạy được offline. Nếu ta coi mọi lỗi khi xác minh token là "hết phiên", người dùng mở app lúc mất mạng sẽ bị đá ra ngoài. Vì vậy ta lưu cả user cùng token trong SecureStore, để có tên hiển thị khi không liên lạc được server.

"Truly ending" khi đăng xuất

Đề yêu cầu phiên "kết thúc thật sự". Ta xoá đủ ba nơi: SecureStore (không còn khôi phục được), cache TanStack Query (không còn dữ liệu của người trước), bộ lọc Zustand. Khi Phase 12 thêm cache bền vững và outbox, hai thứ đó cũng phải bị xoá ở đây. Tôi ghi lại để ta không quên.

