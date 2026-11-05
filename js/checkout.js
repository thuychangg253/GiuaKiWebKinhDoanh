/**
 * checkout.js - Câu 7: Module thanh toán (form giao hàng + Regex + lưu localStorage)
 */

// Quy tắc kiểm tra bằng Regex
var rules = {
    fullname: { regex: /^[\p{L}\s]{2,50}$/u, msg: "Họ tên 2–50 ký tự, chỉ gồm chữ cái và khoảng trắng" },
    phone:    { regex: /^(0|\+84)(3|5|7|8|9)\d{8}$/, msg: "SĐT Việt Nam không hợp lệ (VD: 0912345678 hoặc +84912345678)" },
    email:    { regex: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, msg: "Email không hợp lệ (VD: ten@gmail.com)" },
    address:  { regex: /^.{10,120}$/, msg: "Địa chỉ giao hàng phải từ 10 đến 120 ký tự" }
};

/** Kiểm tra 1 ô nhập, hiển thị lỗi ngay lập tức */
function validateField(input) {
    var rule = rules[input.name];
    var errBox = document.getElementById("err-" + input.name);
    var ok = rule.regex.test(input.value.trim());
    input.classList.toggle("invalid", !ok);
    input.classList.toggle("valid", ok);
    errBox.textContent = ok ? "" : rule.msg;
    return ok;
}

function validateAll() {
    var f = document.getElementById("frmCheckout");
    var allOk = true;
    ["fullname", "phone", "email", "address"].forEach(function (name) {
        if (!validateField(f[name])) { allOk = false; }
    });
    return allOk;
}

function openCheckout() {
    if (cart.items.length == 0) { showToast("Giỏ hàng đang trống"); return; }
    document.getElementById("miniCart").classList.remove("open");
    document.getElementById("checkoutTotal").textContent =
        cart.totalQty() + " sản phẩm — " + formatMoney(cart.totalMoney());
    document.getElementById("checkoutForm").style.display = "block";
    document.getElementById("checkoutDone").style.display = "none";
    document.getElementById("checkout").classList.add("open");
}

function closeCheckout() {
    document.getElementById("checkout").classList.remove("open");
}

/** Hợp lệ -> tạo đơn hàng giả lập và lưu vào localStorage */
function payOrder() {
    var f = document.getElementById("frmCheckout");
    var email = f.email.value.trim().toLowerCase();

    // nếu email trùng khách hàng đã có trong customers.json thì gắn mã khách hàng, ngược lại là khách vãng lai
    var customerId = "KH000";
    for (var i = 0; i < customerList.length; i++) {
        if (customerList[i].email.toLowerCase() == email) { customerId = customerList[i].id; }
    }

    var details = cart.items.map(function (it) {
        return { product_id: it.id, quantity: it.qty, color: it.color, size: it.size, price: it.price };
    });

    var order = {
        cart_id: "WEB" + String(Date.now()).slice(-6),
        date: today(),
        employee_id: "NV002",         // nhân viên phụ trách đơn online
        customer_id: customerId,
        customer_name: f.fullname.value.trim(),
        phone: f.phone.value.trim(),
        email: email,
        address: f.address.value.trim(),
        payment: f.payment.value,
        status: "Chờ xử lý",
        items: details
    };

    var orders = lsGet("orders", []);
    orders.push(order);
    lsSet("orders", orders);

    cart.clear();
    document.getElementById("checkoutForm").style.display = "none";
    document.getElementById("checkoutDone").style.display = "block";
    document.getElementById("orderCode").textContent = order.cart_id;
    f.reset();
    ["fullname", "phone", "email", "address"].forEach(function (n) {
        f[n].classList.remove("valid", "invalid");
        document.getElementById("err-" + n).textContent = "";
    });
}

function initCheckout() {
    var f = document.getElementById("frmCheckout");
    // kiểm tra ngay khi gõ (keyup) và khi rời ô (blur)
    ["fullname", "phone", "email", "address"].forEach(function (name) {
        f[name].addEventListener("keyup", function () { validateField(this); });
        f[name].addEventListener("blur", function () { validateField(this); });
    });
    f.addEventListener("submit", function (e) {
        e.preventDefault();
        if (validateAll()) { payOrder(); }
    });
    document.getElementById("btnCheckout").addEventListener("click", openCheckout);
    document.getElementById("checkoutClose").addEventListener("click", closeCheckout);
    document.getElementById("checkoutDoneClose").addEventListener("click", closeCheckout);
}

window.addEventListener("load", initCheckout);
