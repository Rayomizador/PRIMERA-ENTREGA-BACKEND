(async function(){
  const alertBox = document.getElementById('admin-alert');
  function showAlert(type, text) {
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = text;
    alertBox.classList.remove('d-none');
  }

  try {
    // Verificar sesión y rol
    const meRes = await fetch('/api/sessions/current', { credentials: 'include' });
    if (meRes.status === 401) {
      showAlert('warning', 'No autenticado. Redirigiendo a login...');
      setTimeout(() => (window.location.href = '/login'), 1200);
      return;
    }
    const me = await meRes.json();
    if (!me.user || me.user.role !== 'admin') {
      showAlert('danger', 'No autorizado. Se requiere rol administrador.');
      return;
    }

    // Obtener usuarios
    const usersRes = await fetch('/api/users', { credentials: 'include' });
    if (!usersRes.ok) {
      showAlert('danger', 'No se pudo obtener la lista de usuarios.');
      return;
    }
    const users = await usersRes.json();
    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = '';
    users.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${u.first_name || ''}</td>
        <td>${u.last_name || ''}</td>
        <td>${u.email || ''}</td>
        <td>${u.age ?? ''}</td>
        <td>${u.role || ''}</td>
        <td>${u.cart || ''}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    showAlert('danger', 'Ocurrió un error inesperado.');
  }
})();
