/**
 * common.js - Các hàm dùng chung cho cả trang bán hàng (index.html) và trang quản trị (admin.html)
 */

/**
 * Đọc một file (XML/JSON) bằng XMLHttpRequest
 * @param {string} url đường dẫn file
 * @param {function} callback hàm nhận nội dung text (null nếu lỗi)
 */
function loadFile(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                callback(this.responseText);
            } else {
                callback(null);
            }
        }
    };
}

/**
 * Đọc nhiều file cùng lúc, gọi done(results) khi tất cả đã tải xong
 * @param {Array} urls danh sách đường dẫn
 */
function loadMany(urls, done) {
    var results = [];
    var pending = urls.length;
    var failed = false;
    urls.forEach(function (url, index) {
        loadFile(url, function (text) {
            if (text === null) { failed = true; }
            results[index] = text;
            pending--;
            if (pending == 0) { done(failed ? null : results); }
        });
    });
}

/** Chuyển chuỗi XML thành DOM Document */
function parseXML(text) {
    return new DOMParser().parseFromString(text, "text/xml");
}

/** Lấy nội dung text của thẻ con đầu tiên trong parent */
function getText(parent, tag) {
    var n = parent.getElementsByTagName(tag)[0];
    return n ? n.textContent : "";
}

/** Định dạng tiền: 1234.5 -> $1,234.50 */
function formatMoney(n) {
    return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Chống chèn HTML khi dữ liệu do người dùng nhập */
function escapeHTML(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
}

/** Tạo nhanh một phần tử: el("div", "card", "nội dung") */
function el(tag, className, text) {
    var e = document.createElement(tag);
    if (className) { e.className = className; }
    if (text !== undefined) { e.textContent = text; }
    return e;
}

/** Ngày hiện tại dạng yyyy-mm-dd */
function today() {
    var d = new Date();
    var m = ("0" + (d.getMonth() + 1)).slice(-2);
    var day = ("0" + d.getDate()).slice(-2);
    return d.getFullYear() + "-" + m + "-" + day;
}

/** Đọc / ghi localStorage an toàn (JSON) */
function lsGet(key, defaultValue) {
    try {
        var v = localStorage.getItem(key);
        return v ? JSON.parse(v) : defaultValue;
    } catch (e) { return defaultValue; }
}
function lsSet(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

/** Thông báo nhỏ góc màn hình */
function showToast(msg) {
    var t = document.getElementById("toast");
    if (!t) { return; }
    t.textContent = msg;
    t.className = "toast show";
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(function () { t.className = "toast"; }, 2200);
}
