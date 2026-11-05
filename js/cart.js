/**
 * cart.js - Câu 6: Quản lý State giỏ hàng bằng đối tượng JS
 */

var cart = {
    items: [],   // mỗi phần tử: { id, title, price, image, color, size, qty }

    /** Tổng số lượng của 1 sản phẩm (mọi màu/size) đang có trong giỏ */
    qtyOfProduct: function (id) {
        var total = 0;
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].id == id) { total += this.items[i].qty; }
        }
        return total;
    },

    /** Thêm mới nếu chưa có; tăng số lượng nếu cùng sản phẩm + màu + size đã tồn tại */
    add: function (product, color, size) {
        if (product.stock <= 0) { return { ok: false, msg: "Sản phẩm đã hết hàng" }; }
        if (this.qtyOfProduct(product.id) + 1 > product.stock) {
            return { ok: false, msg: "Vượt quá tồn kho (chỉ còn " + product.stock + ")" };
        }
        for (var i = 0; i < this.items.length; i++) {
            var it = this.items[i];
            if (it.id == product.id && it.color == color && it.size == size) {
                it.qty++;
                this.save();
                renderMiniCart();
                return { ok: true, msg: "Đã tăng số lượng: " + product.title.substring(0, 25) + "..." };
            }
        }
        this.items.push({ id: product.id, title: product.title, price: product.price, image: product.image, color: color, size: size, qty: 1 });
        this.save();
        renderMiniCart();
        return { ok: true, msg: "Đã thêm vào giỏ hàng" };
    },

    changeQty: function (index, delta) {
        var it = this.items[index];
        if (!it) { return; }
        var p = findProduct(it.id);
        if (delta > 0 && this.qtyOfProduct(it.id) + 1 > p.stock) {
            showToast("Vượt quá tồn kho (chỉ còn " + p.stock + ")");
            return;
        }
        it.qty += delta;
        if (it.qty <= 0) { this.items.splice(index, 1); }
        this.save();
        renderMiniCart();
    },

    remove: function (index) {
        this.items.splice(index, 1);
        this.save();
        renderMiniCart();
    },

    clear: function () {
        this.items = [];
        this.save();
        renderMiniCart();
    },

    /** Tự động tính tổng số lượng */
    totalQty: function () {
        var t = 0;
        for (var i = 0; i < this.items.length; i++) { t += this.items[i].qty; }
        return t;
    },

    /** Tự động tính tổng tiền */
    totalMoney: function () {
        var t = 0;
        for (var i = 0; i < this.items.length; i++) { t += this.items[i].qty * this.items[i].price; }
        return t;
    },

    save: function () { lsSet("cart", this.items); },
    load: function () { this.items = lsGet("cart", []); }
};

/** Render bảng Mini-cart (position: absolute + z-index, đè lên nội dung trang) */
function renderMiniCart() {
    document.getElementById("cartCount").textContent = cart.totalQty();
    var box = document.getElementById("miniCartBody");
    box.innerHTML = "";

    if (cart.items.length == 0) {
        box.appendChild(el("p", "empty", "Giỏ hàng đang trống."));
        document.getElementById("btnCheckout").disabled = true;
        return;
    }
    document.getElementById("btnCheckout").disabled = false;

    var table = el("table", "mini-table");
    var head = document.createElement("tr");
    ["Sản phẩm", "Biến thể", "Đơn giá", "SL", "Thành tiền", ""].forEach(function (h) { head.appendChild(el("th", "", h)); });
    table.appendChild(head);

    cart.items.forEach(function (it, index) {
        var tr = document.createElement("tr");
        var tdName = el("td", "mc-name");
        var img = document.createElement("img");
        img.src = it.image; img.alt = "";
        tdName.appendChild(img);
        tdName.appendChild(el("span", "", it.title));
        tr.appendChild(tdName);
        tr.appendChild(el("td", "", it.color + " / " + it.size));
        tr.appendChild(el("td", "", formatMoney(it.price)));

        var tdQty = el("td", "mc-qty");
        var bMinus = el("button", "qty-btn", "−"); bMinus.setAttribute("data-act", "dec"); bMinus.setAttribute("data-index", index);
        var bPlus = el("button", "qty-btn", "+"); bPlus.setAttribute("data-act", "inc"); bPlus.setAttribute("data-index", index);
        tdQty.appendChild(bMinus);
        tdQty.appendChild(el("span", "", it.qty));
        tdQty.appendChild(bPlus);
        tr.appendChild(tdQty);

        tr.appendChild(el("td", "", formatMoney(it.qty * it.price)));
        var tdDel = el("td");
        var bDel = el("button", "qty-btn del", "✕"); bDel.setAttribute("data-act", "remove"); bDel.setAttribute("data-index", index);
        tdDel.appendChild(bDel);
        tr.appendChild(tdDel);
        table.appendChild(tr);
    });
    box.appendChild(table);

    var total = el("p", "mc-total");
    total.innerHTML = "Tổng: <b>" + cart.totalQty() + "</b> sản phẩm — <b>" + formatMoney(cart.totalMoney()) + "</b>";
    box.appendChild(total);
}

/** Sự kiện cho giỏ hàng */
function initCartEvents() {
    document.getElementById("btnCart").addEventListener("click", function () {
        document.getElementById("miniCart").classList.toggle("open");
    });
    document.getElementById("miniCartClose").addEventListener("click", function () {
        document.getElementById("miniCart").classList.remove("open");
    });
    document.getElementById("miniCartBody").addEventListener("click", function (e) {
        var act = e.target.getAttribute("data-act");
        if (!act) { return; }
        var index = parseInt(e.target.getAttribute("data-index"));
        if (act == "inc") { cart.changeQty(index, 1); }
        else if (act == "dec") { cart.changeQty(index, -1); }
        else if (act == "remove") { cart.remove(index); }
    });
    document.getElementById("btnClearCart").addEventListener("click", function () { cart.clear(); });
}

window.addEventListener("load", initCartEvents);
