const token = localStorage.getItem('adminToken');

if (!token) {
    window.location.href = 'login.html';
}

async function loadOrders() {
    const response = await fetch('/api/orders', {
        headers: {
            Authorization: `Bearer ${token}`, 
        },
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.error);
        return;
    }

    const orderList = document.getElementById('order-list');
    orderList.textContent = '';
    
    data.forEach((order) => {
        const row = document.createElement('p');
        const table = order.table_number ?? 'Not specified';
        const createdAt = new Date(order.created_at).toLocaleString();
        row.textContent = `Order #${order.id} - Table ${table} - Rp ${order.total} - ${order.status} - ${createdAt}`;
        orderList.appendChild(row);

        const itemList = document.createElement('ul');

        order.items.forEach((item) => {
            const itemRow = document.createElement('li');
            itemRow.textContent = `${item.quantity} x ${item.name ?? 'Delete menu item'} - Rp ${item.price} each`;
            itemList.appendChild(itemRow);
        });
        orderList.appendChild(itemList);
    });
}

if (token) {
    loadOrders();
}