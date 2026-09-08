const token = localStorage.getItem('adminToken');

if (!token) {
    window.location.href = 'login.html';
}

async function loadMenu() {
    const response = await fetch('/api/menu');
    const items = await response.json();

    const menuList = document.getElementById('menu-list');
    menuList.textContent = '';

    items.forEach((item) => {
        const row = document.createElement('p');
        row.textContent = `${item.name} - Rp ${item.price}`;

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

            const response = await fetch(`/api/menu/${item.id}`, {
                method: 'PATCH', 
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error);
                return;
            }
            await loadMenu();
        });

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

    const name =document.getElementById('item-name').value;
    const price = Number(document.getElementById('item-price').value);

    const response = await fetch('/api/menu', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, price, available:true }),
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.error);
        return;
    }

    document.getElementById('add-menu-form').reset();
    await loadMenu();
});