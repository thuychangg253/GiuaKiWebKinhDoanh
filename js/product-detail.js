var productList = [];
var customerList = [];
var reviewXMLText = "";
var currentProduct = null;

function readProducts(xmlText) {
    var nodes = parseXML(xmlText).getElementsByTagName("product");
    var list = [];
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var colors = [];
        var colorNodes = node.getElementsByTagName("color");
        for (var c = 0; c < colorNodes.length; c++) {
            colors.push({ name: colorNodes[c].textContent, hex: colorNodes[c].getAttribute("hex") });
        }
        var sizes = [];
        var sizeNodes = node.getElementsByTagName("size");
        for (var s = 0; s < sizeNodes.length; s++) { sizes.push(sizeNodes[s].textContent); }
        list.push({
            id: node.getAttribute("id"),
            title: getText(node, "title"),
            price: parseFloat(getText(node, "price")),
            description: getText(node, "description"),
            category: getText(node, "category"),
            image: getText(node, "image"),
            colors: colors,
            sizes: sizes,
            stock: parseInt(getText(node, "stock"))
        });
    }
    return list;
}

function findProduct(id) {
    return productList.find(function (product) { return product.id == id; }) || null;
}

function findCustomer(id) {
    return customerList.find(function (customer) { return customer.id == id; }) || null;
}

function appendDetailMeta(container, label, values, showColors) {
    container.appendChild(document.createTextNode(label + ": "));
    values.forEach(function (value, index) {
        if (index > 0) { container.appendChild(document.createTextNode(", ")); }
        if (showColors) {
            var swatch = el("span", "detail-swatch");
            swatch.style.backgroundColor = value.hex;
            swatch.title = value.name;
            container.appendChild(swatch);
            container.appendChild(document.createTextNode(value.name));
        } else {
            container.appendChild(document.createTextNode(value));
        }
    });
}

function renderProductDetail(product) {
    document.title = product.title + " - Mini Shop";
    document.getElementById("detailMessage").hidden = true;
    document.getElementById("productDetail").hidden = false;
    document.getElementById("reviewsSection").hidden = false;
    document.getElementById("detailImage").src = product.image;
    document.getElementById("detailImage").alt = product.title;
    document.getElementById("detailCategory").textContent = product.category;
    document.getElementById("detailTitle").textContent = product.title;
    document.getElementById("detailPrice").textContent = formatMoney(product.price);
    document.getElementById("detailDescription").textContent = product.description;
    document.getElementById("detailStock").textContent = product.stock > 0
        ? "Còn " + product.stock + " sản phẩm"
        : "Tạm hết hàng";
    appendDetailMeta(document.getElementById("detailColors"), "Màu sắc", product.colors, true);
    appendDetailMeta(document.getElementById("detailSizes"), "Kích cỡ", product.sizes, false);
    renderProductReviews();
}

function renderProductReviews() {
    var reviews = getProductReviews(currentProduct.id);
    var average = getAverageRating(currentProduct.id);
    document.getElementById("detailRating").textContent = reviews.length
        ? "★ " + average.toFixed(1) + " / 5 · " + reviews.length + " đánh giá"
        : "☆ Chưa có đánh giá";
    document.getElementById("reviewsSummary").textContent = reviews.length
        ? average.toFixed(1) + " / 5 (" + reviews.length + ")"
        : "Chưa có đánh giá";

    var list = document.getElementById("reviewList");
    list.innerHTML = "";
    if (!reviews.length) {
        list.appendChild(el("p", "empty", "Chưa có nhận xét cho sản phẩm này."));
        return;
    }
    reviews.forEach(function (review) {
        var customer = findCustomer(review.customer_id);
        var item = el("article", "review-item");
        var heading = el("div", "review-item-heading");
        heading.appendChild(el("strong", "", review.customer_name || (customer ? customer.fullname : "Khách hàng")));
        heading.appendChild(el("time", "", review.date));
        item.appendChild(heading);
        item.appendChild(el("p", "stars", "★".repeat(review.rating) + "☆".repeat(5 - review.rating)));
        item.appendChild(el("p", "review-comment", review.comment));
        list.appendChild(item);
    });
}

function initProductDetail() {
    var productId = new URLSearchParams(window.location.search).get("id");
    if (!productId) {
        document.getElementById("detailMessage").textContent = "Không tìm thấy mã sản phẩm.";
        return;
    }
    loadMany(["datasets/products.xml", "datasets/customers.json", "datasets/reviews.xml"], function (results) {
        var message = document.getElementById("detailMessage");
        if (!results) {
            message.textContent = "Không tải được dữ liệu. Hãy mở trang bằng Live Server hoặc GitHub Pages.";
            return;
        }
        productList = readProducts(results[0]);
        customerList = JSON.parse(results[1]);
        reviewXMLText = results[2];
        readReviews(reviewXMLText);
        currentProduct = findProduct(productId);
        if (!currentProduct) {
            message.textContent = "Sản phẩm không tồn tại hoặc đã bị xóa.";
            return;
        }
        renderProductDetail(currentProduct);
    });

    document.getElementById("reviewForm").addEventListener("submit", function (event) {
        event.preventDefault();
        if (!currentProduct) { return; }
        var name = document.getElementById("reviewName").value.trim();
        var rating = document.getElementById("reviewRating").value;
        var comment = document.getElementById("reviewComment").value.trim();
        if (!name || !comment) { return; }
        addProductReview(currentProduct.id, name, rating, comment);
        this.reset();
        renderProductReviews();
        showToast("Đã gửi đánh giá của bạn.");
    });
}

window.addEventListener("load", initProductDetail);