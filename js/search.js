document.addEventListener('DOMContentLoaded', async () => {
  // Завантаження популярних напрямків
  const routesContainer = document.querySelector('.popular-routes');
  if (routesContainer) {
    try {
      const routes = await DataService.getRoutes();
      routesContainer.innerHTML = routes.map(route => `
        <div class="card route-card">
          <img src="${route.imageUrl}" alt="${route.to}" class="route-card__img">
          <div class="route-card__body">
            <h3 class="route-card__title">${route.from} - ${route.to}</h3>
            <p class="route-card__price">від ${route.price} грн</p>
          </div>
        </div>
      `).join('');
    } catch (e) {
      console.error("Failed to load routes", e);
    }
  }

  // Обробка форми пошуку
  const searchBtn = document.getElementById('search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const from = document.getElementById('search-from').value.trim();
      const to = document.getElementById('search-to').value.trim();
      const date = document.getElementById('search-date').value;
      const passengers = document.getElementById('search-passengers').value;

      if (!from || !to) {
        alert("Будь ласка, введіть міста відправлення та прибуття.");
        return;
      }
      
      // Якщо дата не вибрана, беремо сьогоднішню для прикладу
      const searchDate = date || new Date().toISOString().split('T')[0];

      Store.set('searchParams', {
        from,
        to,
        date: searchDate,
        passengers
      });

      window.location.href = 'search-results.html';
    });
  }
});
