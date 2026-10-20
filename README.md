# GlyphGuard — Homograph & IDN Spoofing Detector

Công cụ web tiếng Việt dùng HTML, Tailwind CSS 4 và JavaScript ES modules. Phân tích hoàn toàn trong trình duyệt, không gọi website đích, không lưu lịch sử URL. Không có backend, khóa API hay dịch vụ CDN bắt buộc.

## Chạy bản có sẵn

Cần Python 3, mở terminal tại thư mục giải nén:

```bash
python -m http.server 8080 --directory dist
```

Mở http://localhost:8080. Trên Windows có thể dùng `py` thay cho `python`. Không mở trực tiếp file HTML bằng `file://` vì ES modules cần HTTP. Không cần npm để chạy bản trong dist.

## Chỉnh sửa / kiểm thử

Cần Node.js 20+:

```bash
npm ci
npm test
npm run build
npm start
```

- `dist/engine.mjs`: phân tách URL, bảo toàn hostname gốc, IDNA, Unicode inspection và đánh giá.
- `dist/app.mjs`: giao diện, mẫu thử, lọc, chọn ký tự, sao chép và xuất JSON.
- `dist/index.html`: bố cục và nội dung.
- `styles.input.css`: Tailwind và CSS giao diện, xuất thành `dist/styles.css`.
- `dist/unicode-data.js`: dữ liệu Unicode dựng sẵn, sử dụng cục bộ.
- `build-data.py`: tạo dữ liệu từ các file trong `data/`.
- `tests/`: kiểm thử phân tích và thao tác DOM.

## Thuật toán

1. Đọc authority / hostname gốc trước khi `URL` chuẩn hóa. Tách path, query, fragment, userinfo, port; xử lý HTTP(S), protocol-relative, IPv4, IPv6 và hostname mã phần trăm.
2. Sử dụng WHATWG `URL` của trình duyệt cho hostname ASCII/IDNA; dùng Punycode.js để giải mã từng nhãn xn-- thành Unicode.
3. Duyệt code point bằng `for...of` / spread, không duyệt UTF-16 code unit. Tra UnicodeData.txt cho tên, binary search Scripts.txt cho Script.
4. Kiểm tra Script khác nhau trong từng nhãn, loại Common và Inherited khỏi phép đếm. Đây là heuristic mixed-script theo nhãn, không phải toàn bộ thuật toán Script_Extensions/restriction levels của UTS #39.
5. Dùng Default_Ignorable_Code_Point, Cc, Cf để phát hiện ký tự ẩn / điều khiển trên đầu vào gốc, ngay cả khi IDNA xóa chúng.
6. Skeleton NFD → official confusables mapping → NFD để đối chiếu thị giác. Phát hiện các ký tự ngoài ASCII có skeleton ASCII. Không dùng skeleton để tạo URL đích.
7. Cảnh báo đỏ cho nhãn xn--, mixed-script, homoglyph đã biết, ký tự ẩn, hostname không hợp lệ hoặc thông tin trước @. IDN hợp pháp vẫn bị gắn cảnh báo theo chính sách kiểm tra thận trọng được yêu cầu.

Ví dụ chính xác: `аmazon.com` (U+0430) → `xn--mazon-3ve.com`.

## Giới hạn

- ASCII hợp lệ không đảm bảo website an toàn. Không kiểm tra phishing list, DNS, chủ sở hữu, chứng chỉ, nội dung, typosquatting, public suffix hoặc thương hiệu.
- Punycode không tự động đồng nghĩa với lừa đảo. Các domain ngôn ngữ bản địa hợp pháp cũng sử dụng xn--.
- Tên miền hiển thị bởi trình duyệt có thể khác theo chính sách IDN của trình duyệt.
- Unicode names và script/confusable tables là Unicode 17.0.0; property escape và IDNA dùng phiên bản Unicode tích hợp trong trình duyệt.
- Chưa kiểm thử giao diện trên trình duyệt thực trong môi trường dựng này; có kiểm thử engine và DOM.

## Dữ liệu và giấy phép bên thứ ba

Unicode 17.0.0:
- https://www.unicode.org/Public/17.0.0/ucd/UnicodeData.txt
- https://www.unicode.org/Public/17.0.0/ucd/Scripts.txt
- https://raw.githubusercontent.com/unicode-org/unicodetools/main/unicodetools/data/security/17.0.0/confusables.txt
- https://www.unicode.org/reports/tr39/
- Unicode License v3: https://www.unicode.org/license.txt (bản sao trong THIRD-PARTY-LICENSES nếu tải được)

Punycode.js — Mathias Bynens, MIT license; bản giấy phép kèm trong THIRD-PARTY-LICENSES.
Tailwind CSS — MIT license; mã CSS đã biên dịch đi kèm, không cần CDN.

## Push GitHub và tự deploy

Xem `HUONG-DAN-GIT-DEPLOY.md`. Workflow đi kèm tại `.github/workflows/deploy-pages.yml`; chọn Settings → Pages → Source: GitHub Actions sau lần push đầu.
