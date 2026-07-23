document.addEventListener('DOMContentLoaded', () => {
  const bookingState = Store.get('bookingState');
  
  if (!bookingState || !bookingState.seat) {
    alert("Помилка: дані про замовлення відсутні.");
    window.location.href = 'index.html';
    return;
  }

  const { searchParams, train, selectedClass, seat, wagon } = bookingState;

  // Оновлення заголовку пасажира
  document.getElementById('checkout-passenger-title').innerHTML = `
    <i class="ph ph-user-focus"></i>
    Дані пасажира (Місце ${seat})
  `;

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
    alert(`Оплата ${totalPrice} грн пройшла успішно! Ваші квитки відправлені на пошту.`);
    Store.clear(); // Очищаємо дані після успішної покупки
    window.location.href = 'index.html';
  });
});
