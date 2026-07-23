document.addEventListener('DOMContentLoaded', () => {
  const bookingState = Store.get('bookingState');
  
  if (!bookingState || !bookingState.train || !bookingState.selectedClass) {
    alert("Помилка: дані про обраний потяг відсутні.");
    window.location.href = 'search-results.html';
    return;
  }

  const { train, selectedClass } = bookingState;
  
  // Оновлення заголовків
  document.getElementById('train-info-header').textContent = `Потяг ${train.number} (${train.type}) • Вагон 03 (${selectedClass.name})`;
  document.getElementById('summary-details').textContent = `Вагон 03 • ${selectedClass.name}`;

  const wagonLayout = document.getElementById('wagon-layout');
  const summarySeat = document.getElementById('summary-seat');
  const summaryPrice = document.getElementById('summary-price');
  const checkoutBtn = document.getElementById('checkout-btn');

  let selectedSeat = null;

  // Генерація вагону (простий 2x2 макет для демонстрації)
  const totalSeats = 20;
  let layoutHtml = '';
  
  for (let i = 1; i <= totalSeats; i += 4) {
    // Деякі місця рандомно зайняті, але щоб хоч щось було вільно, зробимо парні вільними, непарні деякі зайнятими.
    // Проте, краще зробити просто перші кілька зайнятими.
    const getStatus = (num) => (num === 1 || num === 4 || num === 7 || num === 10 || num === 15) ? 'occupied' : 'available';

    layoutHtml += `
      <div class="seat-row ${i === 9 ? 'aisle' : ''}">
        <div class="seat ${getStatus(i)}" data-seat="${i}">${i}</div>
        <div class="seat ${getStatus(i+1)}" data-seat="${i+1}">${i+1}</div>
        <div style="width: 48px;"></div>
        <div class="seat ${getStatus(i+2)}" data-seat="${i+2}">${i+2}</div>
        <div class="seat ${getStatus(i+3)}" data-seat="${i+3}">${i+3}</div>
      </div>
    `;
  }
  
  wagonLayout.innerHTML = layoutHtml;

  // Обробка кліку на місця
  wagonLayout.addEventListener('click', (e) => {
    if (e.target.classList.contains('seat') && e.target.classList.contains('available')) {
      // Знімаємо виділення з попереднього
      const prevSelected = wagonLayout.querySelector('.seat.selected');
      if (prevSelected) {
        prevSelected.classList.remove('selected');
        prevSelected.classList.add('available');
      }

      // Виділяємо поточне
      e.target.classList.remove('available');
      e.target.classList.add('selected');
      
      selectedSeat = e.target.getAttribute('data-seat');
      
      // Оновлюємо підсумок
      summarySeat.textContent = `Місце ${selectedSeat}`;
      summaryPrice.textContent = `${selectedClass.price} грн`;
      checkoutBtn.disabled = false;
    } else if (e.target.classList.contains('seat') && e.target.classList.contains('selected')) {
      // Скасування вибору
      e.target.classList.remove('selected');
      e.target.classList.add('available');
      selectedSeat = null;
      
      summarySeat.textContent = `Місце не вибрано`;
      summaryPrice.textContent = `0 грн`;
      checkoutBtn.disabled = true;
    }
  });

  // Клік по кнопці оформлення
  checkoutBtn.addEventListener('click', () => {
    if (selectedSeat) {
      bookingState.seat = selectedSeat;
      bookingState.wagon = '03';
      Store.set('bookingState', bookingState);
      window.location.href = 'checkout.html';
    }
  });
});
