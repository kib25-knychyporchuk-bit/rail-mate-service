class DataService {
  static async getTrains() {
    try {
      const response = await fetch('data/trains.json');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching trains:', error);
      return [];
    }
  }

  static async getRoutes() {
    try {
      const response = await fetch('data/routes.json');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching routes:', error);
      return [];
    }
  }
}

// Утиліти для роботи з sessionStorage
class Store {
  static set(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  static get(key) {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  static remove(key) {
    sessionStorage.removeItem(key);
  }

  static clear() {
    sessionStorage.clear();
  }
}
