document.addEventListener('DOMContentLoaded', async () => {
  const searchParams = Store.get('searchParams') || { from: 'Київ', to: 'Львів', date: '2026-07-24', passengers: 1 };
  
  // Оновлення тексту в шапці
  document.getElementById('search-params-text').innerHTML = `${searchParams.from} <i class="ph ph-arrow-right"></i> ${searchParams.to}`;
  document.getElementById('search-params-date-text').textContent = `${searchParams.date}, ${searchParams.passengers} пасажир(ів)`;

  let allTrains = [];
  
  try {
    allTrains = await DataService.getTrains();
  } catch(e) {
    console.error("Failed to fetch trains:", e);
  }

  // Функція для рендеру потягів
  const renderTrains = () => {
    const container = document.getElementById('results-list-container');
    const countElement = document.getElementById('results-count');
    
    // Читаємо значення фільтрів
    const filterIntercity = document.getElementById('filter-intercity').checked;
    const filterNight = document.getElementById('filter-night').checked;

    // Фільтрація по напрямку (частковий збіг або якщо не введено, то всі)
    let filteredTrains = allTrains.filter(train => {
      const matchFrom = train.route.from.toLowerCase().includes(searchParams.from.toLowerCase()) || searchParams.from === '';
      const matchTo = train.route.to.toLowerCase().includes(searchParams.to.toLowerCase()) || searchParams.to === '';
      return matchFrom && matchTo;
    });

    // Якщо нічого не знайдено за напрямком, для демонстрації покажемо всі (mock)
    if (filteredTrains.length === 0) {
      filteredTrains = [...allTrains];
    }

    // Фільтрація по типу потяга
    filteredTrains = filteredTrains.filter(train => {
      if (train.typeClass === 'intercity' && filterIntercity) return true;
      if (train.typeClass === 'night' && filterNight) return true;
      return false;
    });

    countElement.textContent = `Знайдено ${filteredTrains.length} потяг(ів)`;

    // Генеруємо HTML для карток
    const cardsHtml = filteredTrains.map(train => {
      const badgeClass = train.typeClass === 'intercity' ? 'badge--intercity' : '';
      const badgeStyle = train.typeClass === 'night' ? 'style="background-color: #f1f5f9; color: #64748b;"' : '';
      
      const classesHtml = train.classes.map(cls => {
        const isSoldOut = cls.availableSeats === 0;
        const btnClass = isSoldOut ? 'btn--outline' : (cls.name === 'Купе' || cls.name === 'Сидячий 2 кл.' ? 'btn--primary' : 'btn--outline');
        return `
          <div class="train-class" ${isSoldOut ? 'style="opacity: 0.6; pointer-events: none;"' : ''}>
            <div class="train-class__name">${cls.name}</div>
            <div class="train-class__seats" ${isSoldOut ? 'style="color: #e74c3c;"' : ''}>
              ${isSoldOut ? 'Немає місць' : 'Вільних: ' + cls.availableSeats}
            </div>
            <div class="train-class__price">${isSoldOut ? '-' : cls.price + ' грн'}</div>
            <button class="btn ${btnClass} btn--block select-btn" 
                    data-train-id="${train.id}" 
                    data-class-id="${cls.id}"
                    ${isSoldOut ? 'disabled' : ''}>
              ${isSoldOut ? 'Розпродано' : (btnClass === 'btn--primary' ? 'Купити' : 'Вибрати')}
            </button>
          </div>
        `;
      }).join('');

      return `
        <div class="card train-card">
          <div class="train-card__header">
            <div>
              <span class="badge ${badgeClass}" ${badgeStyle}>${train.type}</span>
              <span style="font-weight: 600; margin-left: 12px; font-size: 1.1rem;">${train.number}</span>
            </div>
            <div style="color: var(--color-text-muted); font-size: 0.9rem;">
              У дорозі: ${train.schedule.duration}
            </div>
          </div>
          <div class="train-card__route-info">
            <div class="time-block">
              <div class="time-block__time">${train.schedule.departureTime}</div>
              <div class="time-block__city">${train.route.from}</div>
              <div class="time-block__date">${searchParams.date}</div>
            </div>
            <div class="duration-block">
              <span>Прямий</span>
            </div>
            <div class="time-block">
              <div class="time-block__time">${train.schedule.arrivalTime}</div>
              <div class="time-block__city">${train.route.to}</div>
              <div class="time-block__date">${searchParams.date}</div>
            </div>
          </div>
          <div class="train-card__classes" style="margin-top: 24px;">
            ${classesHtml}
          </div>
        </div>
      `;
    }).join('');

    // Оновлюємо DOM
    // Видаляємо попередні картки
    const existingCards = container.querySelectorAll('.train-card');
    existingCards.forEach(card => card.remove());
    
    // Вставляємо нові
    container.insertAdjacentHTML('beforeend', cardsHtml);

    // Додаємо обробники для кнопок "Вибрати/Купити"
    document.querySelectorAll('.select-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const trainId = e.target.getAttribute('data-train-id');
        const classId = e.target.getAttribute('data-class-id');
        
        // Знаходимо повні дані обраного потягу
        const selectedTrain = allTrains.find(t => t.id === trainId);
        const selectedClass = selectedTrain.classes.find(c => c.id === classId);

        // Зберігаємо в sessionStorage
        Store.set('bookingState', {
          searchParams,
          train: selectedTrain,
          selectedClass: selectedClass
        });

        window.location.href = 'seat-selection.html';
      });
    });
  };

  // Початковий рендер
  renderTrains();

  // Обробка змін фільтрів
  document.getElementById('filter-intercity').addEventListener('change', renderTrains);
  document.getElementById('filter-night').addEventListener('change', renderTrains);
});
