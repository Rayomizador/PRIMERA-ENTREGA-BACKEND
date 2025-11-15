const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(loginForm);
    const body = Object.fromEntries(fd.entries());
    const res = await fetch('/api/sessions/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    const msg = document.getElementById('login-msg');
    if (!res.ok) {
      msg.textContent = data.error || 'Error al iniciar sesión';
      msg.className = 'text-danger';
    } else {
      msg.textContent = 'Sesión iniciada';
      msg.className = 'text-success';
      // Opcional: redirigir a productos
      setTimeout(() => window.location.href = '/products', 700);
    }
  });
}

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(registerForm);
    const body = Object.fromEntries(fd.entries());
    const res = await fetch('/api/sessions/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    const msg = document.getElementById('register-msg');
    if (!res.ok) {
      msg.textContent = data.error || 'Error al registrarse';
      msg.className = 'text-danger';
    } else {
      msg.textContent = 'Cuenta creada, ahora inicia sesión';
      msg.className = 'text-success';
      setTimeout(() => window.location.href = '/login', 1000);
    }
  });
}
