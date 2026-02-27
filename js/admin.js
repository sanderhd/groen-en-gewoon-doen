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