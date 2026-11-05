# Kết quả kiểm thử - Đề BW08

Kiểm thử giao diện trên bản chạy qua HTTP; dùng dữ liệu XML/JSON trong
`datasets/`. Kết quả chi tiết này cũng được đóng gói trong
[`test-cases.docx`](./test-cases.docx) để nộp cùng mã nguồn.

| Câu | Hạng mục | Kết quả |
|---|---|---|
| 1 | Đọc sản phẩm XML bằng DOM; dùng JSON khách hàng/nhân viên và hóa đơn XML; tạo XML từ API | Đạt; XML hợp lệ, thao tác tạo XML được kiểm thử với phản hồi API mẫu |
| 2 | Semantic HTML5, form tìm kiếm nâng cao, validation khoảng giá | Đạt; tìm kiếm lọc theo từ khóa, giá, màu, rating, danh mục và tồn kho |
| 3 | CSS Grid responsive và skeleton loading | Đạt; 4 cột desktop, 2 tablet, 1 mobile; hiển thị skeleton trước dữ liệu |
| 4 | Event delegation cho lựa chọn biến thể, thêm giỏ, xem nhanh, rating | Đạt; sự kiện gắn trên container danh sách |
| 5 | DOMParser reviews.xml, trung bình rating và Rating Detail | Đạt; sản phẩm có nhiều đánh giá hiển thị trung bình và danh sách người đánh giá |
| 6 | State giỏ hàng bằng object, mini-cart, LocalStorage, tồn kho | Đạt; thêm, tăng số lượng, tính tổng, xóa giỏ, xóa sản phẩm và khôi phục giỏ sau khi tải lại |
| 7 | Validation form thanh toán bằng Regex, đơn giả lập và LocalStorage | Đạt; 4 trường sai bị chặn, dữ liệu đúng tạo đơn |
| 8 | Đăng nhập admin, quản lý đơn và dashboard thống kê | Đạt; 4 thẻ thống kê, 8 sản phẩm bán chạy, 4 thanh doanh thu danh mục, xem chi tiết đơn |
| 9 | Entry point GitHub Pages | Sẵn sàng; `index.html` đặt ở root, cần đưa lên repository và bật Pages |

## Kết quả tương tác đã chạy

- Tải trang chủ: hiển thị 20 sản phẩm.
- Lọc giá tối thiểu 500: hiển thị đúng 3 sản phẩm phù hợp; reset khôi phục danh sách.
- Thêm sản phẩm, tăng số lượng mini-cart: số lượng cập nhật từ 1 lên 2.
- Tổng mini-cart đổi chính xác từ `$109.95` sang `$219.90`; xóa toàn bộ giỏ đưa số lượng về 0.
- Thanh toán hợp lệ: lưu một đơn vào `localStorage.orders`, dashboard admin hiển thị đơn.
- Thanh toán không hợp lệ: bốn trường sai đều hiện thông báo và không lưu đơn.
- Rating Detail: sản phẩm có đánh giá hiển thị trung bình và danh sách đánh giá XML.
- Responsive: 1440px = 4 cột; 800px = 2 cột; 390px = 1 cột.
- Công cụ Câu 1: XML mẫu parse thành công; HTTP 503 hiển thị lỗi, không cho tải XML cũ.
- Dashboard admin: 4 thẻ thống kê, bảng 8 sản phẩm bán chạy, 4 danh mục doanh thu và dòng chi tiết hóa đơn hoạt động.
- Kiểm tra dữ liệu: products.xml 20 sản phẩm; reviews.xml 64 đánh giá;
  carts.xml 12 hóa đơn; JSON nhân viên 4 bản ghi, khách hàng 6 bản ghi.

## Lưu ý xuất bản

Chưa thể xác nhận website đã được xuất bản công khai vì thư mục làm việc chưa
được kết nối với GitHub repository. Cần tạo/đẩy repository và bật GitHub Pages
để hoàn thành bước triển khai.
