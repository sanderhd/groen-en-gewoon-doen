function loadAfspraken() {
    fetch('http://localhost:3000/api/orders')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const tbody = document.querySelector('#Tab4 tbody');
            if (!tbody) return;

            tbody.innerHTML = data.orders.map(order => {
                let offerteDetails = '';
                if (order.offerte && order.offerte !== false) {
                    offerteDetails = `${order.offerte.m2gras || 0}m² Gras, ${order.offerte.m2tegels || 0}m² Tegels, ${order.offerte.heg || 0}m Heg`;
                } else if (order.package && order.package !== false) {
                    offerteDetails = order.package.type || 'Pakket';
                }

                const total = order.total ? `€${order.total.toFixed(2)}` : '€0.00';
                const statusClass = order.status === 'Geplaatst' ? 'status-approved' : 
                                   order.status === 'Geweigerd' ? 'status-rejected' : 
                                   'status-pending';

                return `
                    <tr data-order-id="${order.id}">
                        <td>${order.datum || 'Geen datum'}</td>
                        <td>${order.client || 'Onbekend'}</td>
                        <td>${order.adress || 'Geen adres'}</td>
                        <td>${offerteDetails || 'Geen details'}</td>
                        <td>${total}</td>
                        <td><span class="status-badge ${statusClass}">${order.status || 'In behandeling'}</span></td>
                        <td>
                            ${order.status !== 'Geplaatst' && order.status !== 'Geweigerd' ? `
                                <button class="btn small accept-btn" data-order-id="${order.id}">Accepteren</button>
                                <button class="btn small reject-btn" data-order-id="${order.id}">Weigeren</button>
                            ` : ''}
                        </td>
                    </tr>
                `;
            }).join('');

            tbody.querySelectorAll('.accept-btn').forEach(btn => {
                btn.addEventListener('click', () => updateOrderStatus(btn.dataset.orderId, 'Geplaatst'));
            });

            tbody.querySelectorAll('.reject-btn').forEach(btn => {
                btn.addEventListener('click', () => updateOrderStatus(btn.dataset.orderId, 'Geweigerd'));
            });
        })
        .catch(error => {
            console.error('Error loading orders:', error);
        });
}

function updateOrderStatus(orderId, status) {
    fetch(`http://localhost:3000/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: status })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Order status updated:', data);
        loadAfspraken(); 
    })
    .catch(error => {
        console.error('Error updating order status:', error);
    });
}

loadAfspraken();

async function updateOrder(orderId, payload) {
    try {
        const res = await fetch(`http://localhost:3000/api/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Update failed');
        return await res.json();
    } catch (e) {
        console.error('updateOrder error', e);
        throw e;
    }
}

async function loadOrders() {
    try {
        const res = await fetch('http://localhost:3000/api/orders');
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        const tbody = document.querySelector('#Tab1 tbody') || document.querySelector('#admin-orders-table tbody');
        if (!tbody) return;

        tbody.innerHTML = data.orders.map(order => {
            const datum = order.datum || '';
            const status = order.status || 'In behandeling';
            return `
                <tr data-order-id="${order.id}">
                    <td style="padding:8px;"><input class="admin-select" type="checkbox" data-id="${order.id}"></td>
                    <td style="padding:8px;">${order.id}</td>
                    <td style="padding:8px;">${order.client || order.email || 'Onbekend'}</td>
                    <td style="padding:8px;"><input class="admin-date" type="date" value="${datum}" /></td>
                    <td style="padding:8px;">
                        <select class="admin-status">
                            <option ${status==='In behandeling' ? 'selected' : ''}>In behandeling</option>
                            <option ${status==='Geplaatst' ? 'selected' : ''}>Geplaatst</option>
                            <option ${status==='Akkoord' ? 'selected' : ''}>Akkoord</option>
                            <option ${status==='Niet akkoord' ? 'selected' : ''}>Niet akkoord</option>
                            <option ${status==='Geweigerd' ? 'selected' : ''}>Geweigerd</option>
                        </select>
                    </td>
                    <td style="padding:8px;">€${Number(order.total||0).toFixed(2)}</td>
                    <td style="padding:8px;"><button class="btn small admin-update">Update</button></td>
                </tr>
            `;
        }).join('') || '<tr><td colspan="7" style="padding:8px;">Geen bestellingen.</td></tr>';

        attachAdminHandlers();
    } catch (e) {
        console.error('Failed loading admin orders', e);
    }
}

function attachAdminHandlers() {
    document.querySelectorAll('.admin-update').forEach(btn => {
        btn.removeEventListener('click', onAdminUpdateClick);
        btn.addEventListener('click', onAdminUpdateClick);
    });

    document.getElementById('select-all')?.addEventListener('click', () => {
        document.querySelectorAll('.admin-select').forEach(cb => cb.checked = true);
    });
    document.getElementById('deselect-all')?.addEventListener('click', () => {
        document.querySelectorAll('.admin-select').forEach(cb => cb.checked = false);
    });

    document.getElementById('apply-bulk')?.addEventListener('click', async () => {
        const status = document.getElementById('bulk-status')?.value;
        const date = document.getElementById('bulk-date')?.value;
        const selected = Array.from(document.querySelectorAll('.admin-select:checked')).map(i => i.dataset.id);
        if (!selected.length) { alert('Selecteer minimaal 1 order.'); return; }

        for (const id of selected) {
            const payload = {};
            if (status) payload.status = status;
            if (date) payload.datum = date;
            try {
                await updateOrder(id, payload);
            } catch (e) {
                console.error('Bulk update failed for', id, e);
            }
        }
        alert('Bulk update voltooid.');
        loadOrders();
        loadAfspraken();
    });
}

function onAdminUpdateClick(e) {
    const tr = e.target.closest('tr');
    const id = tr.dataset.orderId;
    const dateInput = tr.querySelector('.admin-date');
    const statusSelect = tr.querySelector('.admin-status');
    const payload = { datum: dateInput.value, status: statusSelect.value };
    updateOrder(id, payload)
        .then(() => {
            alert('Order bijgewerkt.');
            loadOrders();
            loadAfspraken();
        })
        .catch(() => alert('Fout bij bijwerken order.'));
}

document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
});