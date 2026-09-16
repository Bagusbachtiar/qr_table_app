const token = localStorage.getItem('adminToken');

if (!token) {
    window.location.href = 'login.html';
}

document.getElementById('qr-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const tableNumber = Number(document.getElementById('table-number').value);

  if (!Number.isInteger(tableNumber) || tableNumber <= 0) {
    alert('Table number must be a positive whole number.');
    return;
  }

  const menuUrl = new URL('/', window.location.origin);
  menuUrl.searchParams.set('table', tableNumber);

  console.log(menuUrl.href);
});