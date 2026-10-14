// ===== STATE =====
let allCards = [];
let filteredCards = [];
let currentPage = 1;
const pageSize = 10;

// ===== TIER CONFIG =====
const tierConfig = {
    Basic:    { min: 0,     max: 999,   color: '#6b7280', icon: 'fa-circle',  rate: 1   },
    Silver:   { min: 1000,  max: 4999,  color: '#64748b', icon: 'fa-medal',   rate: 1.5 },
    Gold:     { min: 5000,  max: 19999, color: '#d97706', icon: 'fa-star',    rate: 2   },
    Platinum: { min: 20000, max: Infinity, color: '#2563eb', icon: 'fa-crown', rate: 3  },
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadCards();
    setupSidebarToggle();
});

function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.name) {
        document.getElementById('userName').textContent    = user.name;
        document.getElementById('userRole').textContent   = user.role || 'Staff';
        document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
    }
}

// ===== LOAD CARDS =====
async function loadCards() {
    // const data = await API.get('/loyalty/cards');
    allCards = [
        {
            id: 1, card_num: 'LC-0001', customer_id: 1,
            customer_name: 'John Doe',
            points_balance: 1250, total_earned: 1500, total_redeemed: 250,
            tier: 'Silver', issued_date: '2023-01-15', status: 'active'
        },
        {
            id: 2, card_num: 'LC-0002', customer_id: 2,
            customer_name: 'Jane Smith',
            points_balance: 8500, total_earned: 9200, total_redeemed: 700,
            tier: 'Gold', issued_date: '2023-03-22', status: 'active'
        },
        {
            id: 3, card_num: 'LC-0003', customer_id: 3,
            customer_name: 'Bob Johnson',
            points_balance: 320, total_earned: 320, total_redeemed: 0,
            tier: 'Basic', issued_date: '2023-06-10', status: 'active'
        },
        {
            id: 4, card_num: 'LC-0004', customer_id: 4,
            customer_name: 'Alice Brown',
            points_balance: 22000, total_earned: 25000, total_redeemed: 3000,
            tier: 'Platinum', issued_date: '2022-11-05', status: 'active'
        },
        {
            id: 5, card_num: 'LC-0005', customer_id: 5,
            customer_name: 'Charlie Wilson',
            points_balance: 0, total_earned: 450, total_redeemed: 450,
            tier: 'Basic', issued_date: '2023-08-20', status: 'inactive'
        },
        {
            id: 6, card_num: 'LC-0006', customer_id: 6,
            customer_name: 'Diana Prince',
            points_balance: 3800, total_earned: 4100, total_redeemed: 300,
            tier: 'Silver', issued_date: '2023-05-14', status: 'active'
        },
        {
            id: 7, card_num: 'LC-0007', customer_id: 7,
            customer_name: 'Eve Adams',
            points_balance: 750, total_earned: 750, total_redeemed: 0,
            tier: 'Basic', issued_date: '2024-01-02', status: 'blocked'
        },
    ];

    filteredCards = [...allCards];
    populateDropdowns();
    updateStats();
    renderTable();
}

// ===== POPULATE DROPDOWNS =====
function populateDropdowns() {
    const issueSel  = document.getElementById('issueCustomer');
    const adjustSel = document.getElementById('adjustCard');

    // Customers without cards (for issue)
    const withCards = new Set(allCards.map(c => c.customer_id));
    const allCustomers = [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' },
        { id: 3, name: 'Bob Johnson' },
        { id: 4, name: 'Alice Brown' },
        { id: 5, name: 'Charlie Wilson' },
        { id: 6, name: 'Diana Prince' },
        { id: 7, name: 'Eve Adams' },
        { id: 8, name: 'Frank Castle' },
        { id: 9, name: 'Grace Hopper' },
    ];

    issueSel.innerHTML = '<option value="">Select Customer</option>';
    allCustomers
        .filter(c => !withCards.has(c.id))
        .forEach(c => {
            issueSel.innerHTML += `<option value="${c.id}">${c.name}</option>`;
        });

    // All cards for adjust
    adjustSel.innerHTML = '<option value="">Select Card</option>';
    allCards.forEach(c => {
        adjustSel.innerHTML +=
            `<option value="${c.id}" data-pts="${c.points_balance}">
                ${c.card_num} — ${c.customer_name}
            </option>`;
    });
}

// ===== TIER HELPER =====
function getTier(points) {
    if (points >= 20000) return 'Platinum';
    if (points >= 5000)  return 'Gold';
    if (points >= 1000)  return 'Silver';
    return 'Basic';
}

function getTierBadge(tier) {
    const cfg = tierConfig[tier] || tierConfig.Basic;
    return `<span class="badge" style="background:${cfg.color}20;
        color:${cfg.color};border:1px solid ${cfg.color}40;font-weight:700;">
        <i class="fas ${cfg.icon}"></i> ${tier}
    </span>`;
}

// ===== STATS =====
function updateStats() {
    const active       = allCards.filter(c => c.status === 'active').length;
    const totalPoints  = allCards.reduce((s, c) => s + c.total_earned, 0);
    const totalRedeem  = allCards.reduce((s, c) => s + c.total_redeemed, 0);

    const tierCounts = { Basic: 0, Silver: 0, Gold: 0, Platinum: 0 };
    allCards.forEach(c => { if (tierCounts[c.tier] !== undefined) tierCounts[c.tier]++; });

    document.getElementById('statCards').textContent       = allCards.length;
    document.getElementById('statActive').textContent      = active;
    document.getElementById('statTotalPoints').textContent = totalPoints.toLocaleString();
    document.getElementById('statRedeemed').textContent    = totalRedeem.toLocaleString();
    document.getElementById('tierBasic').textContent       = tierCounts.Basic;
    document.getElementById('tierSilver').textContent      = tierCounts.Silver;
    document.getElementById('tierGold').textContent        = tierCounts.Gold;
    document.getElementById('tierPlatinum').textContent    = tierCounts.Platinum;
}

// ===== FILTER =====
function filterCards() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const tier   = document.getElementById('tierFilter').value;
    const status = document.getElementById('statusFilter').value;

    filteredCards = allCards.filter(c => {
        const matchSearch =
            c.card_num.toLowerCase().includes(search) ||
            c.customer_name.toLowerCase().includes(search);
        const matchTier   = !tier   || c.tier === tier;
        const matchStatus = !status || c.status === status;
        return matchSearch && matchTier && matchStatus;
    });

    currentPage = 1;
    renderTable();
}

// ===== RENDER TABLE =====
function renderTable() {
    const start    = (currentPage - 1) * pageSize;
    const pageData = filteredCards.slice(start, start + pageSize);
    const tbody    = document.getElementById('loyaltyTable');

    if (pageData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9"
                    style="text-align:center;padding:40px;color:var(--secondary)">
                    <i class="fas fa-star fa-2x"></i><br><br>No loyalty cards found
                </td>
            </tr>`;
        document.getElementById('paginationInfo').textContent = '';
        document.getElementById('paginationControls').innerHTML = '';
        return;
    }

    tbody.innerHTML = pageData.map(c => {
        const cfg = tierConfig[c.tier] || tierConfig.Basic;

        // Progress to next tier
        const nextTierPts = c.tier === 'Platinum'
            ? c.points_balance
            : cfg.max + 1;
        const pct = c.tier === 'Platinum'
            ? 100
            : Math.min(100, Math.round(
                ((c.points_balance - cfg.min) / (nextTierPts - cfg.min)) * 100
              ));

        const statusClass = {
            active:   'badge-success',
            inactive: 'badge-secondary',
            blocked:  'badge-danger',
        }[c.status] || 'badge-secondary';

        return `
        <tr>
            <td>
                <code style="background:var(--light);padding:3px 10px;
                    border-radius:4px;font-size:13px;font-weight:700;
                    color:var(--primary);">${c.card_num}</code>
            </td>
            <td>
                <div style="display:flex;align-items:center;gap:8px;">
                    <div style="width:34px;height:34px;border-radius:50%;
                        background:${cfg.color}20;color:${cfg.color};
                        display:flex;align-items:center;justify-content:center;
                        font-weight:700;font-size:13px;flex-shrink:0;">
                        ${c.customer_name.charAt(0)}
                    </div>
                    <strong>${c.customer_name}</strong>
                </div>
            </td>
            <td>${getTierBadge(c.tier)}</td>
            <td>
                <div>
                    <strong style="font-size:15px;color:${cfg.color};">
                        ${c.points_balance.toLocaleString()}
                    </strong>
                    <span style="font-size:11px;color:var(--secondary);margin-left:3px;">pts</span>
                </div>
                <div style="background:var(--border);border-radius:4px;
                    height:5px;margin-top:5px;min-width:80px;">
                    <div style="width:${pct}%;background:${cfg.color};
                        height:100%;border-radius:4px;transition:width 0.3s;">
                    </div>
                </div>
                <div style="font-size:10px;color:var(--secondary);margin-top:2px;">
                    ${c.tier === 'Platinum'
                        ? 'Max tier reached'
                        : `${pct}% to ${Object.keys(tierConfig)[Object.keys(tierConfig).indexOf(c.tier) + 1]}`}
                </div>
            </td>
            <td>
                <span style="color:var(--success);font-weight:600;">
                    +${c.total_earned.toLocaleString()}
                </span>
            </td>
            <td>
                <span style="color:var(--danger);font-weight:600;">
                    -${c.total_redeemed.toLocaleString()}
                </span>
            </td>
            <td style="font-size:12px;color:var(--secondary);">
                ${formatDate(c.issued_date)}
            </td>
            <td>
                <span class="badge ${statusClass}">
                    ${c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                </span>
            </td>
            <td>
                <div style="display:flex;gap:6px;">
                    <button class="btn btn-outline btn-sm"
                        onclick="viewCard(${c.id})" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline btn-sm"
                        onclick="quickAdjust(${c.id})" title="Adjust Points">
                        <i class="fas fa-sliders-h"></i>
                    </button>
                    <button class="btn btn-${c.status === 'blocked' ? 'success' : 'danger'} btn-sm"
                        onclick="toggleCardStatus(${c.id})"
                        title="${c.status === 'blocked' ? 'Unblock' : 'Block'}">
                        <i class="fas fa-${c.status === 'blocked' ? 'unlock' : 'ban'}"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');

    document.getElementById('paginationInfo').textContent =
        `Showing ${start + 1}–${Math.min(start + pageSize, filteredCards.length)} ` +
        `of ${filteredCards.length} cards`;

    renderPagination();
}

// ===== PAGINATION =====
function renderPagination() {
    const totalPages = Math.ceil(filteredCards.length / pageSize);
    const ctrl = document.getElementById('paginationControls');
    ctrl.innerHTML = '';
    if (totalPages <= 1) return;

    const prev = document.createElement('button');
    prev.className = 'page-btn';
    prev.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prev.disabled  = currentPage === 1;
    prev.onclick   = () => { currentPage--; renderTable(); };
    ctrl.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className   = `page-btn ${i === currentPage ? 'active' : ''}`;
        btn.textContent = i;
        btn.onclick     = () => { currentPage = i; renderTable(); };
        ctrl.appendChild(btn);
    }

    const next = document.createElement('button');
    next.className = 'page-btn';
    next.innerHTML = '<i class="fas fa-chevron-right"></i>';
    next.disabled  = currentPage === totalPages;
    next.onclick   = () => { currentPage++; renderTable(); };
    ctrl.appendChild(next);
}

// ===== ISSUE CARD =====
function openIssueCardModal() {
    generateCardNum();
    document.getElementById('issueCustomer').value    = '';
    document.getElementById('issueInitPoints').value  = '0';
    openModal('issueCardModal');
}

function generateCardNum() {
    const num = 'LC-' + String(Math.floor(Math.random() * 9000) + 1000);
    document.getElementById('issueCardNum').value = num;
}

async function issueCard() {
    const customerId = document.getElementById('issueCustomer').value;
    const cardNum    = document.getElementById('issueCardNum').value;
    const initPts    = parseInt(document.getElementById('issueInitPoints').value) || 0;

    if (!customerId) { showToast('Please select a customer', 'warning'); return; }

    const sel          = document.getElementById('issueCustomer');
    const customerName = sel.options[sel.selectedIndex].text;

    // await API.post('/loyalty/cards', { customer_id, card_num, initial_points });

    const newCard = {
        id:              allCards.length + 1,
        card_num:        cardNum,
        customer_id:     parseInt(customerId),
        customer_name:   customerName,
        points_balance:  initPts,
        total_earned:    initPts,
        total_redeemed:  0,
        tier:            getTier(initPts),
        issued_date:     new Date().toISOString().split('T')[0],
        status:          'active',
    };

    allCards.unshift(newCard);
    filteredCards = [...allCards];
    populateDropdowns();
    updateStats();
    renderTable();
    closeModal('issueCardModal');
    showToast(`Loyalty card ${cardNum} issued to ${customerName}`, 'success');
}

// ===== ADJUST POINTS =====
function openAdjustPointsModal() {
    document.getElementById('adjustCard').value   = '';
    document.getElementById('adjustPoints').value = '';
    document.getElementById('adjustReason').value = '';
    document.getElementById('currentPointsDisplay').style.display = 'none';
    openModal('adjustPointsModal');
}

function quickAdjust(cardId) {
    document.getElementById('adjustCard').value = cardId;
    showCurrentPoints();
    openModal('adjustPointsModal');
}

function showCurrentPoints() {
    const sel = document.getElementById('adjustCard');
    const opt = sel.options[sel.selectedIndex];
    const pts = opt?.dataset?.pts;

    const display = document.getElementById('currentPointsDisplay');
    if (pts !== undefined) {
        display.style.display = 'block';
        document.getElementById('currentPointsVal').textContent =
            parseInt(pts).toLocaleString() + ' pts';
    } else {
        display.style.display = 'none';
    }
}

async function adjustPoints() {
    const cardId = document.getElementById('adjustCard').value;
    const type   = document.getElementById('adjustType').value;
    const pts    = parseInt(document.getElementById('adjustPoints').value) || 0;

    if (!cardId) { showToast('Please select a card', 'warning'); return; }
    if (pts <= 0) { showToast('Please enter a valid points amount', 'warning'); return; }

    const idx  = allCards.findIndex(c => c.id == cardId);
    if (idx === -1) return;

    const card = allCards[idx];

    if (type === 'add') {
        card.points_balance += pts;
        card.total_earned   += pts;
    } else if (type === 'deduct') {
        card.points_balance = Math.max(0, card.points_balance - pts);
        card.total_redeemed += Math.min(pts, card.points_balance + pts);
    } else {
        card.points_balance = pts;
    }

    // Auto-update tier
    card.tier = getTier(card.points_balance);

    filteredCards = [...allCards];
    updateStats();
    renderTable();
    closeModal('adjustPointsModal');
    showToast(
        `Points ${type === 'add' ? 'added' : type === 'deduct' ? 'deducted' : 'set'} successfully`,
        'success'
    );
}

// ===== TOGGLE STATUS =====
async function toggleCardStatus(id) {
    const card = allCards.find(c => c.id === id);
    if (!card) return;

    const newStatus = card.status === 'blocked' ? 'active' : 'blocked';
    if (!confirm(`${newStatus === 'blocked' ? 'Block' : 'Unblock'} card ${card.card_num}?`)) return;

    // await API.put(`/loyalty/cards/${id}`, { status: newStatus });
    card.status = newStatus;

    filteredCards = [...allCards];
    updateStats();
    renderTable();
    showToast(
        `Card ${card.card_num} ${newStatus === 'blocked' ? 'blocked' : 'unblocked'}`,
        newStatus === 'blocked' ? 'warning' : 'success'
    );
}

// ===== VIEW CARD =====
function viewCard(id) {
    const c = allCards.find(x => x.id === id);
    if (!c) return;

    const cfg = tierConfig[c.tier] || tierConfig.Basic;
    const nextTierPts = c.tier === 'Platinum' ? c.points_balance : cfg.max + 1;
    const pct = c.tier === 'Platinum'
        ? 100
        : Math.min(100, Math.round(
            ((c.points_balance - cfg.min) / (nextTierPts - cfg.min)) * 100
          ));

    const statusClass = {
        active:   'badge-success',
        inactive: 'badge-secondary',
        blocked:  'badge-danger',
    }[c.status] || 'badge-secondary';

    document.getElementById('viewCardBody').innerHTML = `
        <!-- Card Visual -->
        <div style="background:linear-gradient(135deg,${cfg.color},${cfg.color}99);
            border-radius:16px;padding:24px;color:white;margin-bottom:20px;
            position:relative;overflow:hidden;">
            <div style="position:absolute;right:-20px;bottom:-20px;
                font-size:100px;opacity:0.1;">
                <i class="fas ${cfg.icon}"></i>
            </div>
            <div style="font-size:11px;text-transform:uppercase;
                letter-spacing:3px;opacity:0.8;margin-bottom:8px;">
                SuperMarket Loyalty Card
            </div>
            <div style="font-size:22px;font-weight:800;letter-spacing:4px;
                margin-bottom:16px;">${c.card_num}</div>
            <div style="display:flex;justify-content:space-between;align-items:flex-end;">
                <div>
                    <div style="font-size:11px;opacity:0.75;">Card Holder</div>
                    <div style="font-size:16px;font-weight:700;">${c.customer_name}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:11px;opacity:0.75;">Tier</div>
                    <div style="font-size:16px;font-weight:700;">
                        <i class="fas ${cfg.icon}"></i> ${c.tier}
                    </div>
                </div>
            </div>
        </div>

        <!-- Points Summary -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;
            gap:12px;margin-bottom:16px;">
            <div style="background:var(--light);border-radius:var(--radius);
                padding:14px;text-align:center;">
                <div style="font-size:11px;color:var(--secondary);
                    text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">
                    Balance
                </div>
                <div style="font-size:22px;font-weight:800;color:${cfg.color};">
                    ${c.points_balance.toLocaleString()}
                </div>
                <div style="font-size:11px;color:var(--secondary);">points</div>
            </div>
            <div style="background:var(--light);border-radius:var(--radius);
                padding:14px;text-align:center;">
                <div style="font-size:11px;color:var(--secondary);
                    text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">
                    Total Earned
                </div>
                <div style="font-size:22px;font-weight:800;color:var(--success);">
                    ${c.total_earned.toLocaleString()}
                </div>
                <div style="font-size:11px;color:var(--secondary);">points</div>
            </div>
            <div style="background:var(--light);border-radius:var(--radius);
                padding:14px;text-align:center;">
                <div style="font-size:11px;color:var(--secondary);
                    text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">
                    Redeemed
                </div>
                <div style="font-size:22px;font-weight:800;color:var(--danger);">
                    ${c.total_redeemed.toLocaleString()}
                </div>
                <div style="font-size:11px;color:var(--secondary);">points</div>
            </div>
        </div>

        <!-- Tier Progress -->
        <div style="background:var(--light);border-radius:var(--radius);padding:14px;margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;
                font-size:13px;margin-bottom:8px;">
                <span style="font-weight:600;">
                    <i class="fas ${cfg.icon}" style="color:${cfg.color};"></i>
                    ${c.tier} Tier
                </span>
                <span style="color:var(--secondary);">
                    ${c.tier === 'Platinum'
                        ? 'Maximum tier reached!'
                        : `${pct}% to next tier`}
                </span>
            </div>
            <div style="background:var(--border);border-radius:6px;height:10px;">
                <div style="width:${pct}%;background:${cfg.color};
                    height:100%;border-radius:6px;transition:width 0.5s;">
                </div>
            </div>
            ${c.tier !== 'Platinum' ? `
            <div style="font-size:12px;color:var(--secondary);margin-top:6px;">
                ${(nextTierPts - c.points_balance).toLocaleString()} more points to
                ${Object.keys(tierConfig)[Object.keys(tierConfig).indexOf(c.tier) + 1]} tier
            </div>` : ''}
        </div>

        <!-- Status & Date -->
        <div style="display:flex;justify-content:space-between;
            align-items:center;font-size:13px;">
            <span>
                Status:
                <span class="badge ${statusClass}" style="margin-left:6px;">
                    ${c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                </span>
            </span>
            <span style="color:var(--secondary);">
                Issued: ${formatDate(c.issued_date)}
            </span>
        </div>`;

    openModal('viewCardModal');
}

// ===== EXPORT CSV =====
function exportCSV() {
    const headers = [
        'Card Number', 'Customer', 'Tier',
        'Points Balance', 'Total Earned', 'Total Redeemed',
        'Issued Date', 'Status'
    ];
    const rows = filteredCards.map(c => [
        c.card_num, c.customer_name, c.tier,
        c.points_balance, c.total_earned, c.total_redeemed,
        c.issued_date, c.status
    ]);
    const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'loyalty_cards.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('Loyalty cards exported', 'success');
}

// ===== HELPERS =====
function openModal(id)  { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function setupSidebarToggle() {
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
}