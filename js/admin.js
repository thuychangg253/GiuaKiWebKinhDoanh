/**
 * admin.js - Câu 8: Quản lý đơn hàng trong ADMIN, thống kê đơn hàng và sản phẩm được bán, màn hình đăng nhập
 * Dữ liệu: employees.json (đăng nhập), carts.xml (hóa đơn giả lập), products.xml, customers.json
 *          + đơn hàng mới tạo từ trang bán hàng (localStorage "orders")
 */

var employees = [];
var customers = [];
var products = [];
var orders = [];      // gộp từ carts.xml và localStorage

/* ---------- Tiện ích tra cứu ---------- */
function byId(list, id) {
    for (var i = 0; i < list.length; i++) { if (list[i].id == id) { return list[i]; } }
    return null;
}
function orderTotal(o) {
    var t = 0;
    o.items.forEach(function (it) { t += it.quantity * it.price; });
    return t;
}
function orderQty(o) {
    var t = 0;
    o.items.forEach(function (it) { t += it.quantity; });
    return t;
}
function statusClass(s) {
    if (s == "Hoàn thành") { return "done"; }
    if (s == "Đang giao") { return "ship"; }
    return "wait";
}

/* ---------- Đọc dữ liệu ---------- */
function readProducts(xmlText) {
    var nodes = parseXML(xmlText).getElementsByTagName("product");
    var list = [];
    for (var i = 0; i < nodes.length; i++) {
        list.push({
            id: nodes[i].getAttribute("id"),
            title: getText(nodes[i], "title"),
            category: getText(nodes[i], "category"),
            price: parseFloat(getText(nodes[i], "price")),
            stock: parseInt(getText(nodes[i], "stock"))
        });
    }
    return list;
}

/** Đọc carts.xml: mỗi <cart> là một hóa đơn */
function readCarts(xmlText) {
    var carts = parseXML(xmlText).getElementsByTagName("cart");
    var list = [];
    for (var i = 0; i < carts.length; i++) {
        var c = carts[i];
        var items = [];
        var itemNodes = c.getElementsByTagName("item");
        for (var j = 0; j < itemNodes.length; j++) {
            items.push({
                product_id: getText(itemNodes[j], "product_id"),
                quantity: parseInt(getText(itemNodes[j], "quantity")),
                color: getText(itemNodes[j], "color"),
                size: getText(itemNodes[j], "size"),
                price: parseFloat(getText(itemNodes[j], "price"))
            });
        }
        list.push({
            cart_id: getText(c, "cart_id"),
            date: getText(c, "date"),
            employee_id: getText(c, "employee_id"),
            customer_id: getText(c, "customer_id"),
            status: getText(c, "status"),
            items: items,
            source: "xml"
        });
    }
    return list;
}

/* ---------- Đăng nhập ---------- */
function showLogin() {
    document.getElementById("loginView").style.display = "block";
    document.getElementById("dashView").style.display = "none";
    document.getElementById("btnLogout").style.display = "none";
    document.getElementById("adminInfo").textContent = "";
}

function login(username, password) {
    for (var i = 0; i < employees.length; i++) {
        var e = employees[i];
        if (e.username == username && e.password == password) { return e; }
    }
    return null;
}

function initLogin() {
    document.getElementById("frmLogin").addEventListener("submit", function (ev) {
        ev.preventDefault();
        var u = this.txtUser.value.trim();
        var p = this.txtPass.value;
        var err = document.getElementById("loginError");
        var emp = login(u, p);
        if (emp == null) {
            err.textContent = "Sai tên đăng nhập hoặc mật khẩu.";
        } else if (emp.role != "admin") {
            err.textContent = "Tài khoản này không có quyền truy cập trang quản trị.";
        } else {
            err.textContent = "";
            sessionStorage.setItem("adminUser", emp.id);
            showDashboard(emp);
        }
    });
    document.getElementById("btnLogout").addEventListener("click", function () {
        sessionStorage.removeItem("adminUser");
        showLogin();
    });
}

/* ---------- Dashboard ---------- */
function showDashboard(emp) {
    document.getElementById("loginView").style.display = "none";
    document.getElementById("dashView").style.display = "block";
    document.getElementById("btnLogout").style.display = "inline-block";
    document.getElementById("adminInfo").textContent = "👤 " + emp.fullname + " (" + emp.role + ")";

    // gộp hóa đơn từ carts.xml với đơn tạo từ trang bán hàng (localStorage)
    orders = cartsFromXML.slice();
    lsGet("orders", []).forEach(function (o) {
        o.source = "web";
        orders.push(o);
    });
    renderStats();
    renderOrders();
    renderTopProducts();
    renderCategoryChart();
    renderLowStock();
}

function renderStats() {
    var revenue = 0, qty = 0, custSet = {};
    orders.forEach(function (o) {
        revenue += orderTotal(o);
        qty += orderQty(o);
        custSet[o.customer_id] = true;
    });
    var data = [
        ["Tổng số đơn hàng", orders.length],
        ["Tổng doanh thu", formatMoney(revenue)],
        ["Sản phẩm đã bán", qty],
        ["Khách hàng đã mua", Object.keys(custSet).length]
    ];
    var box = document.getElementById("statCards");
    box.innerHTML = "";
    data.forEach(function (d) {
        var card = el("div", "stat");
        card.appendChild(el("div", "lbl", d[0]));
        card.appendChild(el("div", "num", d[1]));
        box.appendChild(card);
    });
}

function renderOrders() {
    var kw = document.getElementById("txtFind").value.trim().toLowerCase();
    var st = document.getElementById("selStatus").value;
    var tbody = document.getElementById("tbOrdersBody");
    tbody.innerHTML = "";

    // đơn mới nhất lên đầu
    var list = orders.slice().sort(function (a, b) { return a.date < b.date ? 1 : (a.date > b.date ? -1 : 0); });

    list.forEach(function (o) {
        var cus = byId(customers, o.customer_id);
        var cusName = cus ? cus.fullname : (o.customer_name || "Khách vãng lai");
        var emp = byId(employees, o.employee_id);
        if (st != "" && o.status != st) { return; }
        if (kw != "" && o.cart_id.toLowerCase().indexOf(kw) < 0 && cusName.toLowerCase().indexOf(kw) < 0) { return; }

        var tr = el("tr", "order-row");
        var tdId = el("td", "", o.cart_id);
        if (o.source == "web") { tdId.appendChild(el("span", "tag-web", "WEB")); }
        tr.appendChild(tdId);
        tr.appendChild(el("td", "", o.date));
        tr.appendChild(el("td", "", emp ? emp.fullname : o.employee_id));
        tr.appendChild(el("td", "", cusName));
        tr.appendChild(el("td", "", orderQty(o)));
        tr.appendChild(el("td", "", formatMoney(orderTotal(o))));
        var tdSt = el("td");
        tdSt.appendChild(el("span", "status " + statusClass(o.status), o.status));
        tr.appendChild(tdSt);
        tr.appendChild(el("td", "", "▼ Chi tiết"));

        // dòng chi tiết hóa đơn (ẩn, bấm vào dòng để mở)
        var detail = el("tr", "detail-row");
        detail.style.display = "none";
        var td = el("td");
        td.colSpan = 8;
        td.appendChild(buildDetailTable(o));
        detail.appendChild(td);

        tr.addEventListener("click", function () {
            detail.style.display = (detail.style.display == "none") ? "table-row" : "none";
        });
        tbody.appendChild(tr);
        tbody.appendChild(detail);
    });
    if (tbody.children.length == 0) {
        var tr = el("tr"); var td = el("td", "", "Không có đơn hàng phù hợp."); td.colSpan = 8; tr.appendChild(td); tbody.appendChild(tr);
    }
}

function buildDetailTable(o) {
    var wrap = el("div");
    var cus = byId(customers, o.customer_id);
    var info = "Khách hàng: " + (cus ? cus.fullname + " — " + cus.phone + " — " + cus.address : (o.customer_name + " — " + o.phone + " — " + o.address));
    if (o.payment) { info += " | Thanh toán: " + o.payment; }
    wrap.appendChild(el("p", "", info));
    var t = el("table", "detail-table");
    var head = document.createElement("tr");
    ["Sản phẩm", "Màu", "Size", "Đơn giá", "SL", "Thành tiền"].forEach(function (h) { head.appendChild(el("th", "", h)); });
    t.appendChild(head);
    o.items.forEach(function (it) {
        var p = byId(products, it.product_id);
        var tr = document.createElement("tr");
        tr.appendChild(el("td", "", p ? p.title : it.product_id));
        tr.appendChild(el("td", "", it.color));
        tr.appendChild(el("td", "", it.size));
        tr.appendChild(el("td", "", formatMoney(it.price)));
        tr.appendChild(el("td", "", it.quantity));
        tr.appendChild(el("td", "", formatMoney(it.price * it.quantity)));
        t.appendChild(tr);
    });
    wrap.appendChild(t);
    return wrap;
}

/** Thống kê các sản phẩm được bán */
function renderTopProducts() {
    var sold = {};    // product_id -> {qty, revenue}
    orders.forEach(function (o) {
        o.items.forEach(function (it) {
            if (!sold[it.product_id]) { sold[it.product_id] = { qty: 0, revenue: 0 }; }
            sold[it.product_id].qty += it.quantity;
            sold[it.product_id].revenue += it.quantity * it.price;
        });
    });
    var arr = Object.keys(sold).map(function (id) { return { id: id, qty: sold[id].qty, revenue: sold[id].revenue }; });
    arr.sort(function (a, b) { return b.qty - a.qty || b.revenue - a.revenue; });

    var tbody = document.getElementById("tbTopProducts");
    tbody.innerHTML = "";
    arr.slice(0, 8).forEach(function (r, i) {
        var p = byId(products, r.id);
        var tr = document.createElement("tr");
        tr.appendChild(el("td", "", i + 1));
        tr.appendChild(el("td", "", p ? p.title : r.id));
        tr.appendChild(el("td", "", r.qty));
        tr.appendChild(el("td", "", formatMoney(r.revenue)));
        tbody.appendChild(tr);
    });
}

function renderCategoryChart() {
    var rev = {};
    orders.forEach(function (o) {
        o.items.forEach(function (it) {
            var p = byId(products, it.product_id);
            var cat = p ? p.category : "khác";
            rev[cat] = (rev[cat] || 0) + it.quantity * it.price;
        });
    });
    var max = 0;
    for (var k in rev) { if (rev[k] > max) { max = rev[k]; } }
    var box = document.getElementById("categoryChart");
    box.innerHTML = "";
    for (var cat in rev) {
        var row = el("div", "bar-row");
        row.appendChild(el("div", "", cat + " — " + formatMoney(rev[cat])));
        var bg = el("div", "bar-bg");
        var bar = el("div", "bar");
        bar.style.width = (rev[cat] / max * 100) + "%";
        bg.appendChild(bar);
        row.appendChild(bg);
        box.appendChild(row);
    }
}

function renderLowStock() {
    var ul = document.getElementById("lowStock");
    ul.innerHTML = "";
    products.filter(function (p) { return p.stock <= 5; }).forEach(function (p) {
        ul.appendChild(el("li", "", p.title.substring(0, 45) + "… — còn " + p.stock));
    });
}

/* ---------- Khởi tạo ---------- */
var cartsFromXML = [];

function initAdmin() {
    initLogin();
    document.getElementById("txtFind").addEventListener("keyup", renderOrders);
    document.getElementById("selStatus").addEventListener("change", renderOrders);
    document.getElementById("btnResetWeb").addEventListener("click", function () {
        localStorage.removeItem("orders");
        var emp = byId(employees, sessionStorage.getItem("adminUser"));
        if (emp) { showDashboard(emp); }
    });

    loadMany(["datasets/employees.json", "datasets/customers.json", "datasets/products.xml", "datasets/carts.xml"], function (res) {
        if (res === null) {
            document.getElementById("loginError").textContent = "Không tải được dữ liệu. Hãy chạy bằng Live Server / GitHub Pages.";
            return;
        }
        employees = JSON.parse(res[0]);
        customers = JSON.parse(res[1]);
        products = readProducts(res[2]);
        cartsFromXML = readCarts(res[3]);

        // đã đăng nhập từ trước trong phiên làm việc thì vào thẳng dashboard
        var saved = byId(employees, sessionStorage.getItem("adminUser"));
        if (saved && saved.role == "admin") { showDashboard(saved); } else { showLogin(); }
    });
}

window.addEventListener("load", initAdmin);
