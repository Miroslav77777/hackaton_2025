import { makeAutoObservable } from 'mobx';

class MapStore {
  selectedFeature = null;
  mapInstance = null;


  constructor() {
    makeAutoObservable(this);
  }

  setMapInstance(map) {
    this.mapInstance = map;
  }

  // Сеттер: обновление выбранного feature
  setSelectedFeature(feature) {
    this.selectedFeature = feature;
  }

  // Геттер: получение текущего feature
  get getSelectedFeature() {
    return this.selectedFeature;
  }

  // Можно также добавить очистку
  clearSelectedFeature() {
    this.selectedFeature = null;
  }
}

const mapStore = new MapStore();
export default mapStore;
