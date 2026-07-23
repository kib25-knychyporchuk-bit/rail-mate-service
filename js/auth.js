document.addEventListener('DOMContentLoaded', () => {
  // Ініціалізація бази даних користувачів, якщо її немає
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
  }

  // Інжект HTML модального вікна авторизації в body
  if (!document.getElementById('authModal')) {
    const modalHtml = `
      <dialog id="authModal" class="modal" style="width: 100%; max-width: 480px;">
        <div class="modal-header">
          <h2 id="auth-title">Вхід</h2>
          <button class="close-btn" onclick="document.getElementById('authModal').close()"><i class="ph ph-x"></i></button>
        </div>
        <div class="modal-body">
          <div id="auth-tabs" style="display: flex; gap: 16px; margin-bottom: 24px; border-bottom: 1px solid var(--color-border); padding-bottom: 8px;">
            <button class="auth-tab active" data-tab="login" style="background: none; border: none; font-weight: 600; color: var(--color-primary-blue); cursor: pointer;">Вхід</button>
            <button class="auth-tab" data-tab="register" style="background: none; border: none; font-weight: 500; color: var(--color-text-muted); cursor: pointer;">Реєстрація</button>
          </div>
          
          <form id="auth-form">
            <div id="register-fields" style="display: none; margin-bottom: 16px;">
              <label class="form-label">Ім'я</label>
              <input type="text" id="auth-first-name" class="form-control" style="margin-bottom: 16px; padding-left: 16px;" placeholder="Ваше ім'я">
              <label class="form-label">Прізвище</label>
              <input type="text" id="auth-last-name" class="form-control" style="padding-left: 16px;" placeholder="Ваше прізвище">
            </div>
            
            <div style="margin-bottom: 16px;">
              <label class="form-label">Email</label>
              <input type="email" id="auth-email" class="form-control" style="padding-left: 16px;" placeholder="mail@example.com" required>
            </div>
            
            <div style="margin-bottom: 24px;">
              <label class="form-label">Пароль</label>
              <input type="password" id="auth-password" class="form-control" style="padding-left: 16px;" placeholder="Введіть пароль" required>
            </div>
            
            <p id="auth-error" style="color: #e74c3c; font-size: 0.9rem; margin-bottom: 16px; display: none;"></p>
            
            <button type="submit" id="auth-submit-btn" class="btn btn--primary btn--block">Увійти</button>
          </form>
        </div>
      </dialog>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  const authModal = document.getElementById('authModal');
  const authForm = document.getElementById('auth-form');
  const authTabs = document.querySelectorAll('.auth-tab');
  const registerFields = document.getElementById('register-fields');
  const authTitle = document.getElementById('auth-title');
  const authSubmitBtn = document.getElementById('auth-submit-btn');
  const authError = document.getElementById('auth-error');
  
  const loginBtn = document.getElementById('nav-login-btn');
  
  let currentMode = 'login'; // 'login' or 'register'

  // Перемикання вкладок Вхід / Реєстрація
  authTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      authTabs.forEach(t => {
        t.classList.remove('active');
        t.style.fontWeight = '500';
        t.style.color = 'var(--color-text-muted)';
      });
      e.target.classList.add('active');
      e.target.style.fontWeight = '600';
      e.target.style.color = 'var(--color-primary-blue)';
      
      currentMode = e.target.getAttribute('data-tab');
      authError.style.display = 'none';
      
      if (currentMode === 'register') {
        registerFields.style.display = 'block';
        authTitle.textContent = 'Реєстрація';
        authSubmitBtn.textContent = 'Зареєструватися';
        document.getElementById('auth-first-name').required = true;
        document.getElementById('auth-last-name').required = true;
      } else {
        registerFields.style.display = 'none';
        authTitle.textContent = 'Вхід';
        authSubmitBtn.textContent = 'Увійти';
        document.getElementById('auth-first-name').required = false;
        document.getElementById('auth-last-name').required = false;
      }
    });
  });

  // Відкриття модалки
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      authModal.showModal();
    });
  }

  // Обробка форми
  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    authError.style.display = 'none';
    
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    
    let users = JSON.parse(localStorage.getItem('users'));

    if (currentMode === 'register') {
      const firstName = document.getElementById('auth-first-name').value.trim();
      const lastName = document.getElementById('auth-last-name').value.trim();
      
      // Перевірка чи існує такий email
      if (users.find(u => u.email === email)) {
        authError.textContent = 'Користувач з таким email вже існує.';
        authError.style.display = 'block';
        return;
      }
      
      users.push({
        email,
        password,
        firstName,
        lastName,
        tickets: []
      });
      localStorage.setItem('users', JSON.stringify(users));
      
      // Автоматичний вхід після реєстрації
      localStorage.setItem('currentUser', email);
      authModal.close();
      window.location.reload();
      
    } else {
      // Вхід
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        authError.textContent = 'Неправильний email або пароль.';
        authError.style.display = 'block';
        return;
      }
      
      localStorage.setItem('currentUser', email);
      authModal.close();
      window.location.reload();
    }
  });

  // Оновлення шапки
  window.updateHeader = function() {
    const currentUserEmail = localStorage.getItem('currentUser');
    const loginButton = document.getElementById('nav-login-btn');
    const headerNav = document.getElementById('header-nav');
    
    if (currentUserEmail) {
      const users = JSON.parse(localStorage.getItem('users'));
      const user = users.find(u => u.email === currentUserEmail);
      
      if (user && loginButton) {
        // Замінюємо кнопку на ім'я з можливістю вийти
        const userMenu = document.createElement('div');
        userMenu.id = 'nav-user-menu';
        userMenu.style.display = 'flex';
        userMenu.style.alignItems = 'center';
        userMenu.style.gap = '8px';
        userMenu.style.cursor = 'pointer';
        userMenu.style.fontWeight = '500';
        userMenu.innerHTML = `
          <i class="ph-fill ph-user-circle" style="font-size: 1.5rem; color: var(--color-primary-blue);"></i>
          ${user.firstName}
          <button id="nav-logout-btn" style="margin-left: 12px; background: none; border: none; color: var(--color-text-muted); cursor: pointer; text-decoration: underline; font-size: 0.9rem;">Вийти</button>
        `;
        
        loginButton.replaceWith(userMenu);
        
        document.getElementById('nav-logout-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          localStorage.removeItem('currentUser');
          window.location.reload();
        });
      }
    }
  };

  updateHeader();
});
