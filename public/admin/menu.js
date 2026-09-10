const token = localStorage.getItem('adminToken');

if (!token) {
    window.location.href = 'login.html';
}

async function loadMenu() {
    const response = await fetch('/api/menu/admin', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if(!response.ok) {
        const error = await response.json();
        alert(error.error);
        return;
    }
    const items = await response.json();

    const menuList = document.getElementById('menu-list');
    menuList.textContent = '';

    items.forEach((item) => {
        const row = document.createElement('p');
        const status = item.available ? 'Available' : 'Sold out';
        row.textContent = `${item.name} - Rp ${item.price} - ${status}`;

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.textContent = 'Delete';

        deleteButton.addEventListener('click', async () => {
            const confirmed = confirm(`Delete "${item.name}"?`);

            if (!confirmed){
                return;
            }

            const response = await fetch(`/api/menu/${item.id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if(!response.ok) {
                alert(data.error);
                return;
            }

            await loadMenu();
        });

        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.textContent = 'Edit';

        editButton.addEventListener('click', async () => {
            const newName = prompt('Enter the new item name:', item.name);
            if (newName === null) {
                return;
            }

            const name = newName.trim();

            if (name === ''){
                alert('Item name cannot be empty.');
                return;
            }
                const newPrice = prompt('Enter the new price in Rupiah:', item.price);

                if (newPrice === null) {
                    return;
                }

                const price = Number(newPrice);

                if (!Number.isInteger(price) || price <= 0){
                    alert('Price must be a positive whole number.');
                    return;
                }

            const newDescription = prompt(
                'Enter the description:',
                item.description ?? ''
            );

            if (newDescription === null) {
                return;
            }

            const description = newDescription.trim();
            
            const newCategory = prompt('Enter the category:', item.category ?? '');

            if (newCategory === null){
                return;
            }

            const category = newCategory.trim();

            const response = await fetch(`/api/menu/${item.id}`, {
                method: 'PATCH', 
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name, price, description, category }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error);
                return;
            }
            await loadMenu();
        });

        const availabilityButton = document.createElement('button');
        availabilityButton.type = 'button';
        availabilityButton.textContent = item.available
            ? 'Mark sold out'
            : 'Mark available';

        availabilityButton.addEventListener('click', async () => {
            const available = !item.available;
            const response = await fetch(`/api/menu/${item.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ available }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error);
                return;
            }

            await loadMenu();
        });

        row.appendChild(availabilityButton);
        row.appendChild(editButton);
        row.appendChild(deleteButton);
        menuList.appendChild(row);
    });
}

if(token) {
    loadMenu();
}

document.getElementById('add-menu-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('item-name').value;
    const price = Number(document.getElementById('item-price').value);
    const description = document.getElementById('item-description').value.trim();
    const category = document.getElementById('item-category').value.trim();

    const response = await fetch('/api/menu', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, price, category, description, available:true }),
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.error);
        return;
    }

    document.getElementById('add-menu-form').reset();
    await loadMenu();
});