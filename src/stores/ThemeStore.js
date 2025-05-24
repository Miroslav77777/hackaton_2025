import { makeAutoObservable } from 'mobx';

class ThemeStore {
  mode = 'dark';

  constructor() {
    makeAutoObservable(this);
  }

  toggleTheme() {
    this.mode = this.mode === 'dark' ? 'light' : 'dark';
  }
}

const themeStore = new ThemeStore();
export default themeStore;
