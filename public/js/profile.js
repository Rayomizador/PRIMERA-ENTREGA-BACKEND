(async function(){
  const alertBox = document.getElementById('profile-alert');
  function showAlert(type, text) {
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = text;
    alertBox.classList.remove('d-none');
  }
  try {
    const res = await fetch('/api/sessions/current', { credentials: 'include' });
    if (res.status === 401) {
      window.location.href = '/login';
      return;
    }
    const data = await res.json();
    const u = data.user;
    document.getElementById('pf-name').textContent = u.first_name;
    document.getElementById('pf-lastname').textContent = u.last_name;
    document.getElementById('pf-email').textContent = u.email;
    document.getElementById('pf-age').textContent = u.age;
    document.getElementById('pf-role').textContent = u.role;
    document.getElementById('pf-cart').textContent = u.cart || '-';
  } catch (e) {
    showAlert('danger', 'No se pudo cargar el perfil.');
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await fetch('/api/sessions/logout', { method: 'POST', credentials: 'include' });
      window.location.href = '/login';
    });
  }
})();
