/**
 * main.js - Trang bán hàng
 * Câu 1: đọc dữ liệu XML/JSON (products.xml, customers.json, reviews.xml)
 * Câu 2: tìm kiếm nâng cao (form trong <aside>)
 * Câu 3: render lưới sản phẩm + hiệu ứng Skeleton Loading
 * Câu 4: Event Delegation cho nút "Thêm vào giỏ" / "Xem nhanh"
 */

var productList = [];     // danh sách sản phẩm đọc từ products.xml
var customerList = [];    // danh sách khách hàng đọc từ customers.json
var reviewXMLText = "";   // nội dung reviews.xml (Câu 5 xử lý)

/* ====================== CÂU 1: ĐỌC DỮ LIỆU ====================== */

/**
 * Dùng mô hình DOM để đọc products.xml thành mảng đối tượng JS
 */
function readProducts(xmlText) {
    var xmlDoc = parseXML(xmlText);
    var nodes = xmlDoc.getElementsByTagName("product");
    var list = [];
    for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var colors = [];
        var colorNodes = n.getElementsByTagName("color");
        for (var c = 0; c < colorNodes.length; c++) {
            colors.push({ name: colorNodes[c].textContent, hex: colorNodes[c].getAttribute("hex") });
        }
        var sizes = [];
        var sizeNodes = n.getElementsByTagName("size");
        for (var s = 0; s < sizeNodes.length; s++) {
            sizes.push(sizeNodes[s].textContent);
        }
        list.push({
            id: n.getAttribute("id"),
            title: getText(n, "title"),
            price: parseFloat(getText(n, "price")),
            description: getText(n, "description"),
            category: getText(n, "category"),
            image: getText(n, "image"),
            rate: parseFloat(getText(n, "rate")),
            colors: colors,
            sizes: sizes,
            stock: parseInt(getText(n, "stock"))
        });
    }
    return list;
}

function findProduct(id) {
    for (var i = 0; i < productList.length; i++) {
        if (productList[i].id == id) { return productList[i]; }
    }
    return null;
}

function findCustomer(id) {
    for (var i = 0; i < customerList.length; i++) {
        if (customerList[i].id == id) { return customerList[i]; }
    }
    return null;
}

/* ====================== CÂU 3: SKELETON + RENDER LƯỚI ====================== */

/** Hiển thị các khối skeleton trước khi dữ liệu được tải về */
function showSkeleton(count) {
    var grid = document.getElementById("productGrid");
    grid.innerHTML = "";
    for (var i = 0; i < count; i++) {
        var card = el("div", "skeleton-card");
        card.appendChild(el("div", "sk sk-img"));
        card.appendChild(el("div", "sk sk-line"));
        card.appendChild(el("div", "sk sk-line short"));
        card.appendChild(el("div", "sk sk-btn"));
        grid.appendChild(card);
    }
}

/** Tạo thẻ <article> cho 1 sản phẩm */
function createProductCard(p) {
    var card = el("article", "product");
    card.setAttribute("data-id", p.id);

    // Ảnh (span đánh giá sao sẽ được chèn vào đây ở Câu 5)
    var thumb = el("div", "thumb");
    var img = document.createElement("img");
    img.src = p.image;
    img.alt = p.title;
    img.loading = "lazy";
    img.onerror = function () { this.onerror = null; this.src = "data:image/svg+xml;utf8," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='100%' height='100%' fill='#eee'/><text x='50%' y='50%' text-anchor='middle' fill='#999' font-size='14'>No image</text></svg>"); };
    thumb.appendChild(img);
    if (p.stock <= 0) { thumb.appendChild(el("span", "badge-out", "Hết hàng")); }
    card.appendChild(thumb);

    card.appendChild(el("h3", "p-title", p.title));
    card.appendChild(el("p", "p-price", formatMoney(p.price)));

    // Chip chọn màu
    var colorBox = el("div", "chips");
    p.colors.forEach(function (c, idx) {
        var b = el("button", "chip color" + (idx == 0 ? " active" : ""));
        b.type = "button";
        b.style.background = c.hex;
        b.title = c.name;
        b.setAttribute("data-action", "pick-color");
        b.setAttribute("data-value", c.name);
        colorBox.appendChild(b);
    });
    card.appendChild(colorBox);

    // Chip chọn size
    var sizeBox = el("div", "chips");
    p.sizes.forEach(function (s, idx) {
        var b = el("button", "chip size" + (idx == 0 ? " active" : ""), s);
        b.type = "button";
        b.setAttribute("data-action", "pick-size");
        b.setAttribute("data-value", s);
        sizeBox.appendChild(b);
    });
    card.appendChild(sizeBox);

    card.appendChild(el("p", "p-stock" + (p.stock <= 5 ? " low" : ""),
        p.stock > 0 ? "Còn " + p.stock + " sản phẩm" : "Tạm hết hàng"));

    // 2 nút thao tác: chỉ mang data-id và data-variant, KHÔNG gắn sự kiện trực tiếp
    var actions = el("div", "actions");
    var btnAdd = el("button", "btn btn-add", "Thêm vào giỏ");
    btnAdd.type = "button";
    btnAdd.setAttribute("data-action", "add-cart");
    btnAdd.setAttribute("data-id", p.id);
    btnAdd.setAttribute("data-variant", p.colors[0].name + "|" + p.sizes[0]);
    if (p.stock <= 0) { btnAdd.disabled = true; }
    var btnView = el("button", "btn btn-view", "Xem nhanh");
    btnView.type = "button";
    btnView.setAttribute("data-action", "quick-view");
    btnView.setAttribute("data-id", p.id);
    var btnDetails = el("a", "btn btn-view", "Chi tiết");
    btnDetails.href = "product-detail.html?id=" + encodeURIComponent(p.id);
    actions.appendChild(btnAdd);
    actions.appendChild(btnView);
    actions.appendChild(btnDetails);
    card.appendChild(actions);
    return card;
}

/** Vẽ danh sách sản phẩm vào lưới */
function renderGrid(list) {
    var grid = document.getElementById("productGrid");
    grid.innerHTML = "";
    document.getElementById("resultCount").textContent = "Hiển thị " + list.length + " / " + productList.length + " sản phẩm";
    if (list.length == 0) {
        grid.appendChild(el("p", "empty", "Không tìm thấy sản phẩm phù hợp."));
        return;
    }
    list.forEach(function (p) { grid.appendChild(createProductCard(p)); });
    // Câu 5: chèn số sao trung bình lên ảnh
    if (typeof showAverageRatings == "function") { showAverageRatings(); }
}

/* ====================== CÂU 4: EVENT DELEGATION ====================== */

/**
 * CHỈ MỘT Event Listener gắn trên container #productGrid.
 * Mọi click của các nút bên trong (kể cả phần tử tạo động sau này) đều nổi bọt lên đây.
 */
function initGridEvents() {
    var grid = document.getElementById("productGrid");
    grid.addEventListener("click", function (e) {
        var target = e.target.closest("[data-action]");
        if (!target || !grid.contains(target)) { return; }
        var action = target.getAttribute("data-action");
        var card = target.closest("article.product");

        if (action == "pick-color" || action == "pick-size") {
            // Đánh dấu chip đang chọn và cập nhật data-variant của nút Thêm vào giỏ
            var siblings = target.parentNode.children;
            for (var i = 0; i < siblings.length; i++) { siblings[i].classList.remove("active"); }
            target.classList.add("active");
            var color = card.querySelector(".chip.color.active").getAttribute("data-value");
            var size = card.querySelector(".chip.size.active").getAttribute("data-value");
            card.querySelector("[data-action='add-cart']").setAttribute("data-variant", color + "|" + size);

        } else if (action == "add-cart") {
            var id = target.getAttribute("data-id");                    // trích data-id
            var variant = target.getAttribute("data-variant").split("|"); // trích data-variant: "Màu|Size"
            var result = cart.add(findProduct(id), variant[0], variant[1]);
            showToast(result.msg);

        } else if (action == "quick-view") {
            showQuickView(target.getAttribute("data-id"));

        } else if (action == "rating-detail") {
            // Câu 5: bấm vào số sao để xem danh sách khách hàng đánh giá
            showRatingDetail(target.getAttribute("data-id"));
        }
    });
}

/* ====================== MODAL DÙNG CHUNG ====================== */

function openModal(title, bodyNode) {
    document.getElementById("modalTitle").textContent = title;
    var body = document.getElementById("modalBody");
    body.innerHTML = "";
    body.appendChild(bodyNode);
    document.getElementById("modal").classList.add("open");
}
function closeModal() {
    document.getElementById("modal").classList.remove("open");
}

function showQuickView(id) {
    var p = findProduct(id);
    var wrap = el("div", "qv");
    var img = document.createElement("img");
    img.src = p.image;
    img.alt = p.title;
    wrap.appendChild(img);
    var info = el("div", "qv-info");
    info.appendChild(el("h3", "", p.title));
    info.appendChild(el("p", "p-price", formatMoney(p.price)));
    info.appendChild(el("p", "", p.description));
    info.appendChild(el("p", "", "Danh mục: " + p.category));
    info.appendChild(el("p", "", "Màu: " + p.colors.map(function (c) { return c.name; }).join(", ")));
    info.appendChild(el("p", "", "Kích cỡ: " + p.sizes.join(", ")));
    info.appendChild(el("p", "", "Tồn kho: " + p.stock));
    wrap.appendChild(info);
    openModal("Xem nhanh sản phẩm", wrap);
}

/* ====================== CÂU 2: TÌM KIẾM NÂNG CAO ====================== */

/** Nạp danh mục và màu sắc vào các dropdown từ dữ liệu XML */
function fillFilterOptions() {
    var catSelect = document.getElementById("selCategory");
    var colorSelect = document.getElementById("selColor");
    var cats = [], colors = [];
    productList.forEach(function (p) {
        if (cats.indexOf(p.category) < 0) { cats.push(p.category); }
        p.colors.forEach(function (c) { if (colors.indexOf(c.name) < 0) { colors.push(c.name); } });
    });
    cats.forEach(function (c) {
        var o = document.createElement("option"); o.value = c; o.textContent = c; catSelect.appendChild(o);
    });
    colors.forEach(function (c) {
        var o = document.createElement("option"); o.value = c; o.textContent = c; colorSelect.appendChild(o);
    });
}

function applyFilter() {
    var f = document.getElementById("frmSearch");
    var keyword = f.txtKeyword.value.trim().toLowerCase();
    var minPrice = f.numMin.value == "" ? 0 : parseFloat(f.numMin.value);
    var maxPrice = f.numMax.value == "" ? Infinity : parseFloat(f.numMax.value);
    var color = f.selColor.value;
    var category = f.selCategory.value;
    var minRating = parseFloat(f.numRating.value) || 0;
    var onlyStock = f.chkStock.checked;

    var result = productList.filter(function (p) {
        if (keyword != "" && p.title.toLowerCase().indexOf(keyword) < 0) { return false; }
        if (p.price < minPrice || p.price > maxPrice) { return false; }
        if (category != "" && p.category != category) { return false; }
        if (color != "" && !p.colors.some(function (c) { return c.name == color; })) { return false; }
        if (onlyStock && p.stock <= 0) { return false; }
        // điểm đánh giá trung bình tính từ reviews.xml (Câu 5)
        var avg = (typeof getAverageRating == "function") ? getAverageRating(p.id) : p.rate;
        if (avg < minRating) { return false; }
        return true;
    });
    renderGrid(result);
}

function initSearchForm() {
    var f = document.getElementById("frmSearch");
    // Kiểm tra chéo: giá từ <= giá đến (bổ sung cho các thuộc tính validation của HTML5)
    function checkRange() {
        var min = parseFloat(f.numMin.value), max = parseFloat(f.numMax.value);
        if (!isNaN(min) && !isNaN(max) && min > max) {
            f.numMax.setCustomValidity("Giá đến phải lớn hơn hoặc bằng giá từ");
        } else {
            f.numMax.setCustomValidity("");
        }
    }
    f.numMin.addEventListener("input", checkRange);
    f.numMax.addEventListener("input", checkRange);

    // Sự kiện submit chỉ chạy khi form đã qua validation của trình duyệt
    f.addEventListener("submit", function (e) {
        e.preventDefault();
        applyFilter();
    });
    f.addEventListener("reset", function () {
        setTimeout(function () { f.numMax.setCustomValidity(""); applyFilter(); }, 0);
    });
}

/* ====================== KHỞI TẠO TRANG ====================== */

function initShop() {
    showSkeleton(8);                // Câu 3: hiện skeleton trong lúc chờ tải dữ liệu
    initGridEvents();               // Câu 4
    initSearchForm();               // Câu 2

    document.getElementById("modalClose").addEventListener("click", closeModal);
    document.getElementById("modal").addEventListener("click", function (e) {
        if (e.target.id == "modal") { closeModal(); }
    });

    loadMany(["datasets/products.xml", "datasets/customers.json", "datasets/reviews.xml"], function (res) {
        if (res === null) {
            document.getElementById("productGrid").innerHTML =
                "<p class='empty'>Không tải được dữ liệu. Hãy chạy website bằng Live Server hoặc GitHub Pages (không mở trực tiếp file://).</p>";
            return;
        }
        productList = readProducts(res[0]);
        customerList = JSON.parse(res[1]);
        reviewXMLText = res[2];
        readReviews(reviewXMLText);   // Câu 5: DOMParser + tính điểm trung bình
        fillFilterOptions();
        cart.load();                  // Câu 6: khôi phục giỏ hàng từ localStorage
        renderMiniCart();
        // Giữ skeleton thêm một chút để người dùng thấy hiệu ứng
        setTimeout(function () { renderGrid(productList); }, 900);
    });
}

window.addEventListener("load", initShop);
