document.addEventListener('DOMContentLoaded', () => {
  const ticketsList = document.getElementById('tickets-list');
  const currentUserEmail = localStorage.getItem('currentUser');
  
  if (!currentUserEmail) {
    ticketsList.innerHTML = `
      <div class="ticket-empty">
        <i class="ph ph-lock-key"></i>
        <h2>Ви не авторизовані</h2>
        <p style="color: var(--color-text-muted); margin-top: 8px;">Будь ласка, увійдіть в акаунт, щоб переглянути свої квитки.</p>
        <button class="btn btn--primary" style="margin-top: 24px;" onclick="document.getElementById('authModal').showModal()">Увійти</button>
      </div>
    `;
    return;
  }

  const users = JSON.parse(localStorage.getItem('users'));
  const user = users.find(u => u.email === currentUserEmail);

  if (!user.tickets || user.tickets.length === 0) {
    ticketsList.innerHTML = `
      <div class="ticket-empty">
        <i class="ph ph-ticket"></i>
        <h2>У вас поки немає квитків</h2>
        <p style="color: var(--color-text-muted); margin-top: 8px;">Знайдіть потрібний маршрут та здійсніть свою першу подорож.</p>
        <a href="index.html" class="btn btn--primary" style="margin-top: 24px; display: inline-block;">Пошук квитків</a>
      </div>
    `;
    return;
  }

  // Рендер квитків (нові зверху)
  const ticketsHtml = user.tickets.reverse().map(ticket => `
    <div class="card ticket-card">
      <div class="ticket-card__header">
        <div class="ticket-card__route">${ticket.route}</div>
        <div class="ticket-card__id">Замовлення №${ticket.id}</div>
      </div>
      <div class="ticket-card__details">
        <div class="ticket-card__detail-item">
          <span class="ticket-card__detail-label">Дата та Час</span>
          <span class="ticket-card__detail-value">${ticket.date}, ${ticket.time}</span>
        </div>
        <div class="ticket-card__detail-item">
          <span class="ticket-card__detail-label">Потяг</span>
          <span class="ticket-card__detail-value">${ticket.trainInfo}</span>
        </div>
        <div class="ticket-card__detail-item">
          <span class="ticket-card__detail-label">Пасажир</span>
          <span class="ticket-card__detail-value">${user.firstName} ${user.lastName}</span>
        </div>
        <div class="ticket-card__detail-item">
          <span class="ticket-card__detail-label">Місце</span>
          <span class="ticket-card__detail-value">${ticket.seatInfo}</span>
        </div>
      </div>
      <div style="border-top: 1px dashed var(--color-border); padding-top: 16px; display: flex; justify-content: space-between; align-items: center;">
        <div style="color: var(--color-text-muted); font-size: 0.9rem;">
          Придбано: ${new Date(ticket.purchaseDate).toLocaleString('uk-UA')}
        </div>
        <div style="font-weight: 700; font-size: 1.25rem; color: var(--color-accent-orange);">
          ${ticket.price} грн
        </div>
      </div>
    </div>
  `).join('');

  ticketsList.innerHTML = ticketsHtml;
});
