# GlyphGuard

Công cụ hỗ trợ phát hiện dấu hiệu giả mạo tên miền bằng ký tự Unicode, Homograph và IDN Spoofing.

## Tính năng

- Phân tích URL hoặc tên miền ngay khi nhập.
    
- Hiển thị hostname Unicode và dạng ASCII/Punycode.
    
- Tra cứu mã Unicode, tên ký tự và bảng chữ cái.
    
- Đánh dấu ký tự ẩn, ký tự dễ nhầm và dấu hiệu trộn bảng chữ cái.
    
- Cung cấp mẫu thử và xuất kết quả phân tích dưới dạng JSON.
    

## Cách sử dụng

1. Nhập hoặc dán URL/tên miền cần kiểm tra.
    
2. Chọn **Phân tích ngay** hoặc chờ kết quả tự động.
    
3. Đối chiếu hostname máy đọc và kiểm tra các ký tự được đánh dấu.
    

Quá trình phân tích diễn ra trong trình duyệt, không truy cập website đích và không lưu lịch sử URL.

## Phạm vi đánh giá

Kết quả phản ánh dấu hiệu bất thường trong cấu trúc và ký tự tên miền, không xác nhận website an toàn hay độc hại.

Tên miền quốc tế sử dụng Punycode có thể hợp pháp. Tên miền chỉ chứa ASCII vẫn có thể được sử dụng để lừa đảo.

## Công nghệ

HTML · Tailwind CSS · JavaScript · Unicode