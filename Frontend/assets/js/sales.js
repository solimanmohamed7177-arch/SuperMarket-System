// ===== BARCODE SEARCH =====
function searchByBarcode() {
    const query = document.getElementById('barcodeInput').value.trim().toLowerCase();
    if (!query) return;

    // Search by barcode first, then by name
    const found = products.find(p =>
        p.barcode === query ||
        p.sku.toLowerCase() === query ||
        p.prod_name.toLowerCase().includes(query)
    );

    if (found) {
        addToCart(found.id);
        document.getElementById('barcodeInput').value = '';
        showToast(`${found.prod_name} added to cart`, 'success');
    } else {
        showToast('Product not found', 'warning');
        document.getElementById('barcodeInput').select();
    }
}

// ===== ADD TO CART =====
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.qty += 1;
        existing.line_total = calcLineTotal(existing);
    } else {
        const newItem = {
            id: product.id,
            prod_name: product.prod_name,
            unit_price: product.unit_price,
            unit_type: product.unit_type,
            tax_rate: product.tax_rate,
            qty: 1,
            discount_pct: 0,
            line_total: product.unit_price
        };
        newItem.line_total = calcLineTotal(newItem);
        cart.push(newItem);
    }

    renderCart();
    recalculate();
}

// ===== CALC LINE TOTAL =====
function calcLineTotal(item) {
    const base = item.unit_price * item.qty;
    const afterDiscount = base - (base * item.discount_pct / 100);
    const tax = afterDiscount * (item.tax_rate / 100);
    return afterDiscount + tax;
}

// ===== RENDER CART =====
function renderCart() {
    const container = document.getElementById('cartItems');

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>Cart is empty</p>
                <span>Click products to add them</span>
            </div>`;
        return;
    }

    container.innerHTML = cart.map((item, index) => `
        <div class="cart-item" id="cartItem_${index}">
            <div class="cart-item-info">
                <div class="cart-item-name" title="${item.prod_name}">${item.prod_name}</div>
                <div class="cart-item-price">
                    ${formatCurrency(item.unit_price)} / ${item.unit_type}
                    ${item.discount_pct > 0 ? `<span style="color:var(--danger);margin-left:5px;">-${item.discount_pct}%</span>` : ''}
                </div>
                <!-- Per-item discount -->
                <div style="display:flex;align-items:center;gap:5px;margin-top:4px;">
                    <span style="font-size:11px;color:var(--secondary);">Disc%:</span>
                    <input type="number" value="${item.discount_pct}" min="0" max="100"
                        style="width:45px;padding:2px 5px;font-size:11px;border:1px solid var(--border);border-radius:4px;"
                        onchange="updateItemDiscount(${index}, this.value)">
                </div>
            </div>

            <div class="cart-item-qty">
                <button class="qty-btn" onclick="changeQty(${index}, -1)">
                    <i class="fas fa-minus"></i>
                </button>
                <input type="number" class="qty-input" value="${item.qty}" min="0.001"
                    onchange="updateQty(${index}, this.value)">
                <button class="qty-btn" onclick="changeQty(${index}, 1)">
                    <i class="fas fa-plus"></i>
                </button>
            </div>

            <div class="cart-item-total">${formatCurrency(item.line_total)}</div>

            <button class="cart-item-remove" onclick="removeFromCart(${index})" title="Remove">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// ===== CART ACTIONS =====
function changeQty(index, delta) {
    cart[index].qty = Math.max(0.001, cart[index].qty + delta);
    if (cart[index].qty <= 0) {
        removeFromCart(index);
        return;
    }
    cart[index].line_total = calcLineTotal(cart[index]);
    renderCart();
    recalculate();
}

function updateQty(index, value) {
    const qty = parseFloat(value);
    if (isNaN(qty) || qty <= 0) {
        removeFromCart(index);
        return;
    }
    cart[index].qty = qty;
    cart[index].line_total = calcLineTotal(cart[index]);
    renderCart();
    recalculate();
}

function updateItemDiscount(index, value) {
    cart[index].discount_pct = Math.min(100, Math.max(0, parseFloat(value) || 0));
    cart[index].line_total = calcLineTotal(cart[index]);
    renderCart();
    recalculate();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
    recalculate();
}

function clearCart() {
    if (cart.length === 0) return;
    if (!confirm('Clear all items from cart?')) return;
    cart = [];
    renderCart();
    recalculate();
}

// ===== RECALCULATE TOTALS =====
function recalculate() {
    const subtotal = cart.reduce((sum, item) => {
        const base = item.unit_price * item.qty;
        return sum + base;
    }, 0);

    const discountPct = parseFloat(document.getElementById('discountInput').value) || 0;
    const discountAmount = subtotal * discountPct / 100;

    const taxTotal = cart.reduce((sum, item) => {
        const base = item.unit_price * item.qty;
        const afterItemDisc = base - (base * item.discount_pct / 100);
        const afterOrderDisc = afterItemDisc - (afterItemDisc * discountPct / 100);
        return sum + (afterOrderDisc * item.tax_rate / 100);
    }, 0);

    const grandTotal = subtotal - discountAmount + taxTotal;

    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('discountAmount').textContent = `-${formatCurrency(discountAmount)}`;
    document.getElementById('taxTotal').textContent = formatCurrency(taxTotal);
    document.getElementById('grandTotal').textContent = formatCurrency(grandTotal);
    document.getElementById('checkoutTotal').textContent = formatCurrency(grandTotal);

    calcChange();
}

// ===== PAYMENT METHOD =====
function selectPayMethod(el) {
    document.querySelectorAll('.pay-method').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    selectedPayMethod = el.dataset.method;

    // Show/hide cash tendered section
    const cashSection = document.getElementById('cashTenderedSection');
    cashSection.style.display = selectedPayMethod === 'cash' ? 'flex' : 'none';
}

// ===== CASH CHANGE =====
function calcChange() {
    const grandTotalText = document.getElementById('grandTotal').textContent;
    const grandTotal = parseFloat(grandTotalText.replace(/[^0-9.]/g, '')) || 0;
    const tendered = parseFloat(document.getElementById('cashTendered').value) || 0;
    const change = tendered - grandTotal;

    const changeEl = document.getElementById('changeAmount');
    changeEl.textContent = formatCurrency(Math.max(0, change));
    changeEl.style.color = change >= 0 ? 'var(--success)' : 'var(--danger)';
}

function setQuickCash(amount) {
    const grandTotalText = document.getElementById('grandTotal').textContent;
    const grandTotal = parseFloat(grandTotalText.replace(/[^0-9.]/g, '')) || 0;

    // Round up to nearest denomination
    const tendered = amount >= grandTotal ? amount : Math.ceil(grandTotal / amount) * amount;
    document.getElementById('cashTendered').value = tendered;
    calcChange();
}

// ===== PROCESS CHECKOUT =====
async function processCheckout() {
    if (cart.length === 0) {
        showToast('Cart is empty. Add products first.', 'warning');
        return;
    }

    // Validate cash payment
    if (selectedPayMethod === 'cash') {
        const grandTotalText = document.getElementById('grandTotal').textContent;
        const grandTotal = parseFloat(grandTotalText.replace(/[^0-9.]/g, '')) || 0;
        const tendered = parseFloat(document.getElementById('cashTendered').value) || 0;
        if (tendered < grandTotal) {
            showToast('Cash tendered is less than grand total', 'warning');
            return;
        }
    }

    const btn = document.querySelector('.btn-checkout');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    btn.disabled = true;

    try {
        // Build payload
        const subtotal = cart.reduce((s, i) => s + i.unit_price * i.qty, 0);
        const discountPct = parseFloat(document.getElementById('discountInput').value) || 0;
        const discountTotal = subtotal * discountPct / 100;
        const taxTotal = cart.reduce((s, i) => {
            const base = i.unit_price * i.qty;
            const afterDisc = base - (base * i.discount_pct / 100) - ((base - base * i.discount_pct / 100) * discountPct / 100);
            return s + afterDisc * i.tax_rate / 100;
        }, 0);
        const grandTotal = subtotal - discountTotal + taxTotal;

        const payload = {
            customer_id: document.getElementById('customerSelect').value || null,
            branch_id: 1,
            employee_id: 1,
            subtotal: subtotal.toFixed(2),
            discount_total: discountTotal.toFixed(2),
            tax_total: taxTotal.toFixed(2),
            grand_total: grandTotal.toFixed(2),
            status: 'completed',
            payment_method: selectedPayMethod,
            items: cart.map(item => ({
                product_id: item.id,
                qty: item.qty,
                unit_price: item.unit_price,
                discount_pct: item.discount_pct,
                tax_rate: item.tax_rate,
                line_total: item.line_total.toFixed(2)
            }))
        };

        // const result = await API.post('/sales', payload);
        // Simulate API response
        await new Promise(r => setTimeout(r, 600));
        lastSaleId = Math.floor(Math.random() * 9000) + 1000;

        showReceipt(payload, grandTotal);
        showToast('Sale completed successfully!', 'success');

    } catch (err) {
        showToast('Failed to process sale', 'error');
    } finally {
        btn.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Complete Sale</span>
            <strong id="checkoutTotal">$0.00</strong>`;
        btn.disabled = false;
    }
}

// ===== SHOW RECEIPT =====
function showReceipt(payload, grandTotal) {
    const now = new Date();
    const customer = document.getElementById('customerSelect');
    const customerName = customer.options[customer.selectedIndex].text;
    const tendered = parseFloat(document.getElementById('cashTendered').value) || grandTotal;
    const change = tendered - grandTotal;

    const receiptHTML = `
        <div class="receipt">
            <div style="text-align:center;margin-bottom:12px;">
                <strong style="font-size:16px;">🏪 SUPERMARKET MS</strong><br>
                <span style="font-size:11px;color:var(--secondary);">Main Branch | Tel: +1 234 567 890</span><br>
                <span style="font-size:11px;color:var(--secondary);">${now.toLocaleString()}</span>
            </div>
            <hr class="receipt-divider">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px;">
                <span>Receipt #: <strong>${lastSaleId}</strong></span>
                <span>Customer: <strong>${customerName}</strong></span>
            </div>
            <hr class="receipt-divider">
            <table style="width:100%;font-size:12px;border-collapse:collapse;">
                <thead>
                    <tr style="border-bottom:1px dashed var(--border);">
                        <th style="text-align:left;padding:3px 0;">Item</th>
                        <th style="text-align:center;">Qty</th>
                        <th style="text-align:right;">Price</th>
                        <th style="text-align:right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${cart.map(item => `
                        <tr>
                            <td style="padding:4px 0;">${item.prod_name}</td>
                            <td style="text-align:center;">${item.qty}</td>
                            <td style="text-align:right;">${formatCurrency(item.unit_price)}</td>
                            <td style="text-align:right;">${formatCurrency(item.line_total)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <hr class="receipt-divider">
            <div style="font-size:12px;">
                <div style="display:flex;justify-content:space-between;padding:2px 0;">
                    <span>Subtotal:</span><span>${formatCurrency(parseFloat(payload.subtotal))}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:2px 0;color:var(--danger);">
                    <span>Discount:</span><span>-${formatCurrency(parseFloat(payload.discount_total))}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:2px 0;">
                    <span>Tax:</span><span>${formatCurrency(parseFloat(payload.tax_total))}</span>
                </div>
            </div>
            <hr class="receipt-divider">
            <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:700;padding:4px 0;">
                <span>TOTAL:</span><span>${formatCurrency(grandTotal)}</span>
            </div>
            <div style="font-size:12px;margin-top:6px;">
                <div style="display:flex;justify-content:space-between;">
                    <span>Payment (${selectedPayMethod.replace('_', ' ').toUpperCase()}):</span>
                    <span>${formatCurrency(tendered)}</span>
                </div>
                ${selectedPayMethod === 'cash' ? `
                <div style="display:flex;justify-content:space-between;color:var(--success);font-weight:600;">
                    <span>Change:</span><span>${formatCurrency(Math.max(0, change))}</span>
                </div>` : ''}
            </div>
            <hr class="receipt-divider">
            <div style="text-align:center;font-size:11px;color:var(--secondary);margin-top:8px;">
                <p>Thank you for shopping with us!</p>
                <p>Please come again 😊</p>
            </div>
        </div>`;

    document.getElementById('receiptContent').innerHTML = receiptHTML;
    openModal('receiptModal');
}

// ===== PRINT RECEIPT =====
function printReceipt() {
    const content = document.getElementById('receiptContent').innerHTML;
    const win = window.open('', '_blank', 'width=400,height=600');
    win.document.write(`
        <html>
        <head>
            <title>Receipt #${lastSaleId}</title>
            <style>
                body { font-family: 'Courier New', monospace; font-size: 13px; padding: 20px; }
                table { width: 100%; border-collapse: collapse; }
                hr { border: none; border-top: 1px dashed #ccc; margin: 8px 0; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>${content}</body>
        </html>`);
    win.document.close();
    win.print();
}

// ===== NEW SALE =====
function newSale() {
    cart = [];
    renderCart();
    recalculate();
    document.getElementById('customerSelect').value = '';
    document.getElementById('discountInput').value = 0;
    document.getElementById('cashTendered').value = '';
    document.getElementById('barcodeInput').focus();
    closeModal('receiptModal');
    showToast('Ready for new sale', 'info');
}

function openNewCustomerModal() {
    showToast('New customer form - connect to customers page', 'info');
}

// ===== HELPERS =====
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function setupSidebarToggle() {
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
}