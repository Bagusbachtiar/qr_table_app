document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        document.getElementById('error-message').textContent = data.error;
        return;
    }

    localStorage.setItem('adminToken', data.token);
    window.location.href = 'menu.html';
});
