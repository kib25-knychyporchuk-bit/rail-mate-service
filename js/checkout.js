document.addEventListener('DOMContentLoaded', () => {
  const currentUserEmail = localStorage.getItem('currentUser');
  
  if (!currentUserEmail) {
    alert("Для оформлення квитка потрібно увійти в акаунт або зареєструватися.");
    // Можна відкрити модалку або перекинути на головну
    window.location.href = 'index.html';
    return;
  }

  const users = JSON.parse(localStorage.getItem('users'));
  const user = users.find(u => u.email === currentUserEmail);

  const bookingState = Store.get('bookingState');
  
  if (!bookingState || !bookingState.seat) {
    alert("Помилка: дані про замовлення відсутні.");
    window.location.href = 'index.html';
    return;
  }

  const { searchParams, train, selectedClass, seat, wagon } = bookingState;

  // Оновлення заголовку пасажира та автозаповнення полів
  document.getElementById('checkout-passenger-title').innerHTML = `
    <i class="ph ph-user-focus"></i>
    Дані пасажира (Місце ${seat})
  `;
  document.getElementById('passenger-first-name').value = user.firstName;
  document.getElementById('passenger-last-name').value = user.lastName;

  // Оновлення блоку підсумку
  document.getElementById('summary-route').textContent = `${train.route.from} — ${train.route.to}`;
  document.getElementById('summary-date-time').textContent = `${searchParams.date}, ${train.schedule.departureTime}`;
  document.getElementById('summary-train-info').textContent = `Потяг ${train.number} (${train.type})`;

  document.getElementById('summary-ticket-details').textContent = `Квиток (${selectedClass.name}, Місце ${seat})`;
  document.getElementById('summary-ticket-price').textContent = `${selectedClass.price} грн`;

  // Логіка підрахунку ціни
  const basePrice = selectedClass.price;
  let totalPrice = basePrice;

  const drinkCheckbox = document.getElementById('addon-drink');
  const baggageCheckbox = document.getElementById('addon-baggage');
  const summaryDrink = document.getElementById('summary-drink');
  const summaryBaggage = document.getElementById('summary-baggage');
  const summaryTotalPrice = document.getElementById('summary-total-price');
  const payBtn = document.getElementById('pay-btn');

  const updatePrice = () => {
    let currentTotal = basePrice;
    
    if (drinkCheckbox.checked) {
      currentTotal += parseInt(drinkCheckbox.getAttribute('data-price'));
      summaryDrink.style.display = 'flex';
    } else {
      summaryDrink.style.display = 'none';
    }

    if (baggageCheckbox.checked) {
      currentTotal += parseInt(baggageCheckbox.getAttribute('data-price'));
      summaryBaggage.style.display = 'flex';
    } else {
      summaryBaggage.style.display = 'none';
    }

    summaryTotalPrice.textContent = `${currentTotal} грн`;
    payBtn.innerHTML = `
      Оплатити ${currentTotal} грн
      <i class="ph ph-lock-key"></i>
    `;
    
    totalPrice = currentTotal;
  };

  drinkCheckbox.addEventListener('change', updatePrice);
  baggageCheckbox.addEventListener('change', updatePrice);

  // Ініціалізація
  updatePrice();

  // Оплата
  payBtn.addEventListener('click', () => {
    // Збереження квитка в профіль користувача
    const ticket = {
      id: 'T' + Math.floor(Math.random() * 1000000),
      route: `${train.route.from} — ${train.route.to}`,
      date: searchParams.date,
      time: train.schedule.departureTime,
      trainInfo: `Потяг ${train.number} (${train.type})`,
      seatInfo: `Вагон ${wagon}, Місце ${seat} (${selectedClass.name})`,
      price: totalPrice,
      purchaseDate: new Date().toISOString()
    };
    
    user.tickets.push(ticket);
    localStorage.setItem('users', JSON.stringify(users));

    alert(`Оплата ${totalPrice} грн пройшла успішно! Ваші квитки збережено в профілі.`);
    Store.clear(); // Очищаємо дані оформлення після успішної покупки
    window.location.href = 'my-tickets.html';
  });
});
