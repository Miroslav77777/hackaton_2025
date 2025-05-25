import { makeAutoObservable } from 'mobx';

class ThemeStore {
  mode = 'light'; // по умолчанию светлая

  constructor() {
    makeAutoObservable(this);

    // Загружаем сохранённую тему из localStorage
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') {
      this.mode = saved;
    }
  }

  toggleTheme() {
    this.mode = this.mode === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', this.mode); // сохраняем в localStorage
  }
}

const themeStore = new ThemeStore();
export default themeStore;
