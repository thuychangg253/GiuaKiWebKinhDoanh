/**
 * review.js - Câu 5: Xử lý và phân tích dữ liệu XML (reviews.xml)
 * Mỗi sản phẩm có thể được nhiều khách hàng đánh giá, mỗi khách hàng có thể đánh giá nhiều sản phẩm.
 */

// ratingStats["product_id"] = { sum, count, avg, list: [ {customer_id, rating, comment, date} ] }
var ratingStats = {};
var LOCAL_REVIEWS_KEY = "miniShopReviews";

/**
 * Dùng DOMParser đọc file XML, duyệt các node <review>, tính điểm trung bình cho từng product_id
 */
function readReviews(xmlText) {
    ratingStats = {};
    var xmlDoc = new DOMParser().parseFromString(xmlText, "text/xml");
    var reviews = xmlDoc.getElementsByTagName("review");
    for (var i = 0; i < reviews.length; i++) {
        var r = reviews[i];
        var pid = r.getElementsByTagName("product_id")[0].textContent;
        var rating = parseFloat(r.getElementsByTagName("rating")[0].textContent);
        if (!ratingStats[pid]) {
            ratingStats[pid] = { sum: 0, count: 0, avg: 0, list: [] };
        }
        var st = ratingStats[pid];
        st.sum += rating;
        st.count++;
        st.list.push({
            customer_id: r.getElementsByTagName("customer_id")[0].textContent,
            customer_name: "",
            rating: rating,
            comment: r.getElementsByTagName("comment")[0].textContent,
            date: r.getElementsByTagName("date")[0].textContent
        });
    }
    var localReviews = lsGet(LOCAL_REVIEWS_KEY, []);
    localReviews.forEach(function (review) {
        if (!ratingStats[review.product_id]) {
            ratingStats[review.product_id] = { sum: 0, count: 0, avg: 0, list: [] };
        }
        var stats = ratingStats[review.product_id];
        stats.sum += review.rating;
        stats.count++;
        stats.list.push(review);
    });
    for (var key in ratingStats) {
        ratingStats[key].avg = ratingStats[key].sum / ratingStats[key].count;
    }
}

/** Điểm trung bình của 1 sản phẩm (0 nếu chưa có đánh giá) */
function getAverageRating(pid) {
    return ratingStats[pid] ? ratingStats[pid].avg : 0;
}

/** Danh sách đánh giá của sản phẩm, mới nhất trước */
function getProductReviews(pid) {
    var stats = ratingStats[pid];
    return stats ? stats.list.slice().sort(function (a, b) {
        return b.date.localeCompare(a.date);
    }) : [];
}

/** Lưu đánh giá mới trong trình duyệt vì trang tĩnh không thể ghi ngược vào XML */
function addProductReview(pid, customerName, rating, comment) {
    var localReviews = lsGet(LOCAL_REVIEWS_KEY, []);
    localReviews.push({
        review_id: "LOCAL-" + Date.now(),
        product_id: String(pid),
        customer_id: "",
        customer_name: customerName,
        rating: Number(rating),
        comment: comment,
        date: today()
    });
    lsSet(LOCAL_REVIEWS_KEY, localReviews);
    readReviews(reviewXMLText);
}

/**
 * Tạo mới thẻ <span> chèn số sao trung bình lên ảnh của từng sản phẩm trong DOM
 */
function showAverageRatings() {
    var cards = document.querySelectorAll("#productGrid article.product");
    for (var i = 0; i < cards.length; i++) {
        var pid = cards[i].getAttribute("data-id");
        var thumb = cards[i].querySelector(".thumb");
        var old = thumb.querySelector(".rating-badge");
        if (old) { thumb.removeChild(old); }

        var span = document.createElement("span");
        span.className = "rating-badge";
        span.setAttribute("data-action", "rating-detail");   // để Event Delegation (Câu 4) bắt được
        span.setAttribute("data-id", pid);
        if (ratingStats[pid]) {
            span.textContent = "★ " + ratingStats[pid].avg.toFixed(1) + " (" + ratingStats[pid].count + ")";
            span.title = "Bấm để xem chi tiết đánh giá";
        } else {
            span.textContent = "☆ Chưa có";
            span.classList.add("none");
        }
        thumb.appendChild(span);
    }
}

/** Bấm vào Rating Detail: hiện danh sách khách hàng đã đánh giá sản phẩm */
function showRatingDetail(pid) {
    var p = findProduct(pid);
    var wrap = el("div", "rating-detail");
    var st = ratingStats[pid];
    if (!st) {
        wrap.appendChild(el("p", "", "Sản phẩm này chưa có đánh giá."));
    } else {
        wrap.appendChild(el("p", "rd-summary", "Trung bình " + st.avg.toFixed(1) + " / 5 từ " + st.count + " khách hàng"));
        var table = el("table", "rd-table");
        var head = document.createElement("tr");
        ["Khách hàng", "Số sao", "Nhận xét", "Ngày"].forEach(function (h) { head.appendChild(el("th", "", h)); });
        table.appendChild(head);
        st.list.forEach(function (rv) {
            var cus = findCustomer(rv.customer_id);
            var tr = document.createElement("tr");
            tr.appendChild(el("td", "", rv.customer_name || (cus ? cus.fullname : rv.customer_id)));
            tr.appendChild(el("td", "stars", "★".repeat(rv.rating) + "☆".repeat(5 - rv.rating)));
            tr.appendChild(el("td", "", rv.comment));
            tr.appendChild(el("td", "", rv.date));
            table.appendChild(tr);
        });
        wrap.appendChild(table);
    }
    openModal("Đánh giá: " + p.title, wrap);
}
