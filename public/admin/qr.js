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

  const canvas = document.getElementById('qr-code');

  QRCode.toCanvas(canvas, menuUrl.href, (error) => {
    if (error){
      alert('Could not generate the QR code.');
      console.error(error);
      return;
    }
    const downloadLink = document.getElementById('download-qr');
    downloadLink.href = canvas.toDataURL('image/png');
    downloadLink.download = `table-${tableNumber}.png`;
    downloadLink.hidden = false;
  });

  
});