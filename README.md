# Mini Shop - Đề BW08

Website bán hàng giả lập thực hiện theo đề BW08, dùng HTML5, CSS Grid/Flexbox,
JavaScript thuần, XML, JSON và LocalStorage. Giao diện sử dụng tông vàng gà con
và phông Times New Roman.

## Cấu trúc thư mục

```text
test/
|-- index.html                 Trang chủ, cũng là entry point GitHub Pages
|-- admin.html                 Đăng nhập và dashboard quản trị
|-- css/
|   |-- main.css               Giao diện cửa hàng và responsive
|   `-- admin.css              Giao diện quản trị
|-- datasets/
|   |-- products.xml           Sản phẩm, màu, kích cỡ, tồn kho
|   |-- employees.json         Tài khoản nhân viên và vai trò
|   |-- customers.json         Dữ liệu khách hàng
|   |-- carts.xml              Hóa đơn mẫu cho dashboard
|   `-- reviews.xml            Lịch sử đánh giá XML
|-- js/
|   |-- common.js              Tiện ích tải và xử lý XML/JSON
|   |-- main.js                Tìm kiếm, lưới sản phẩm, event delegation
|   |-- review.js              Phân tích XML đánh giá
|   |-- cart.js                Trạng thái giỏ hàng
|   |-- checkout.js            Kiểm tra form và tạo đơn hàng
|   `-- admin.js               Đăng nhập, quản lý đơn và thống kê
|-- tools/
|   `-- build-products-xml.html Tạo products.xml từ Fake Store API
`-- docs/
    |-- test-cases.docx        Kết quả kiểm thử để nộp cùng source
    `-- test-cases.md          Bản kiểm thử dạng văn bản
```

## Chạy website

Mở thư mục này bằng VS Code và chạy `index.html` với Live Server. Không mở
trực tiếp bằng `file://`, vì trình duyệt cần HTTP để tải dữ liệu XML/JSON.

- Cửa hàng: `index.html`
- Quản trị: chọn **Quản trị (Admin)** hoặc mở `admin.html`
- Tài khoản quản trị thử nghiệm: `admin` / `admin123`
- Công cụ tạo dữ liệu Câu 1: `tools/build-products-xml.html`

Các đơn hàng thanh toán và trạng thái giỏ được lưu trong LocalStorage của trình
duyệt. Dữ liệu sản phẩm, nhân viên, khách hàng, hóa đơn mẫu và đánh giá được
lưu trong `datasets/`.

## Đưa lên GitHub Pages

Đưa nội dung thư mục `test` vào thư mục gốc của repository GitHub, sau đó vào
**Settings → Pages**, chọn **Deploy from a branch**, nhánh cần xuất bản và
thư mục `/ (root)`. GitHub Pages sẽ dùng `index.html` làm trang mặc định.
