# Đưa GlyphGuard lên GitHub và chạy GitHub Pages

Source gốc có HTML, JavaScript, Tailwind CSS nguồn, dữ liệu Unicode, các kiểm thử và bản dist đã dựng sẵn. Không cần Supabase, biến môi trường, API key hoặc backend. Mã ứng dụng giữ nguyên bản đã bàn giao; bổ sung workflow triển khai và script đóng gói source.

## 1. Giải nén

Ví dụ thư mục dự án: `B:\GLYPHGUARD\glyphguard`.
Mở đúng thư mục chứa `package.json`, `dist`, `.github`.
Để mở CMD tại thư mục này: bấm thanh địa chỉ trong File Explorer, gõ `cmd`, Enter.
Không upload nguyên file ZIP lên repository; cần giải nén các file bên trong.

## 2. Chạy thử trước khi đưa lên mạng

Nếu có Node.js 22 trở lên:

```bat
npm ci
npm test
npm run build
```

Có Python 3 thì chạy:

```bat
py -m http.server 8080 --directory dist
```

Mở http://localhost:8080. Thử amazon.com, mẫu Cyrillic, PayPal, Apple, ký tự ẩn, sao chép và xuất JSON. Ctrl+C để dừng server. Không mở index.html bằng cách nhấp đúp.
Chưa có Python có thể dùng Live Server của VS Code mở dist/index.html.

## 3. Tạo repository GitHub mới

- Mở https://github.com/new.
- Repository name: `GLYPHGUARD`.
- Chọn Public để dùng Pages với GitHub Free. Source trong repository sẽ công khai.
- Không thêm README, .gitignore hoặc License khi tạo; source đã có sẵn các file cần thiết.
- Chọn Create repository.
- Sao chép URL HTTPS của repository mới, ví dụ `https://github.com/HHMy293/GLYPHGUARD.git`. Thay username bằng tài khoản đang sử dụng nếu khác.

## 4. Push lần đầu

Trong CMD mở tại thư mục source:

```bat
git --version
git init
git branch -M main
git add .
git commit -m "Initial GlyphGuard source"
git remote add origin https://github.com/HHMy293/GLYPHGUARD.git
git push -u origin main
```

URL ở lệnh remote phải là URL repository của bạn.
Nếu Git báo chưa cấu hình danh tính, đặt riêng cho repository này rồi chạy lại commit và push:

```bat
git config user.name "TEN_GITHUB_CUA_BAN"
git config user.email "EMAIL_GITHUB_CUA_BAN"
```

Nếu có cửa sổ đăng nhập trình duyệt, đăng nhập đúng tài khoản sở hữu repository. Không dùng mật khẩu GitHub thông thường làm mật khẩu Git HTTPS.

## 5. Bật Pages

Trong repository GitHub:
1. Settings → Pages.
2. Build and deployment → Source → chọn GitHub Actions.
3. Mở tab Actions → Deploy GlyphGuard to GitHub Pages.
4. Nếu lần push đầu đã chạy trước khi Pages được bật và bị lỗi, chọn Run workflow → main → Run workflow, hoặc Re-run all jobs của lần chạy bị lỗi.
5. Chờ cả build và deploy hiển thị dấu tích xanh.
6. Settings → Pages → Visit site để mở URL chính thức.

Nếu username là HHMy293 và repo là GLYPHGUARD, URL thường là https://HHMy293.github.io/GLYPHGUARD/. URL GitHub trả về là giá trị chính xác cần sử dụng.
Có thể mất vài phút, theo GitHub tối đa khoảng 10 phút cho thay đổi xuất hiện.

Workflow có sẵn trong `.github/workflows/deploy-pages.yml` tự chạy khi push main:
- Cài dependency từ lockfile.
- Chạy kiểm thử engine và DOM.
- Biên dịch Tailwind.
- Tạo ZIP source cho nút Mã nguồn.
- Chỉ triển khai thư mục dist lên GitHub Pages.

## 6. Cập nhật các lần sau

Sửa source, chạy thử trên máy, sau đó:

```bat
git add .
git commit -m "Update GlyphGuard"
git push
```

Workflow sẽ dựng và deploy lại tự động. Không phải bật Pages lại.
Nếu sửa CSS, sửa `styles.input.css`; không chỉ sửa `dist/styles.css` vì nó được tạo lại khi build.

## Lỗi thường gặp

- `Author identity unknown`: cấu hình user.name/user.email như trên.
- `remote origin already exists`: chạy `git remote -v` để kiểm tra. Chỉ khi đang ở đúng dự án và cần đổi remote, dùng `git remote set-url origin URL_REPO_CUA_BAN`.
- `rejected / fetch first`: repository trên GitHub không trống. Không force push. Xem các file/commit trước khi hợp nhất; có thể tạo repo trống khác cho lần triển khai đầu.
- `Get Pages site failed` hoặc thông báo Pages chưa bật: chọn Settings → Pages → GitHub Actions, rồi chạy lại workflow.
- 404: kiểm tra URL có phần `/GLYPHGUARD/`, workflow deploy đã xanh và có `dist/index.html`.
- Giao diện cũ: thử Ctrl+F5 sau khi deploy hoàn tất.

## Tài liệu chính thức

- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

Cấu hình workflow đã đối chiếu tài liệu GitHub và kiểm tra cấu trúc. Chưa chạy thực tế trên repository GitHub của bạn.
