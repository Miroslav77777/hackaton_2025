import { makeAutoObservable, runInAction } from 'mobx';

class MapStore {
  selectedFeature = null;
  mapInstance = null;

  center = [45.03547, 38.97531];
  zoom = 13;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true }); // ✅ autoBind делает все методы actions
  }

  setMapInstance(map) {
    this.mapInstance = map;
    map.on('moveend', () => {
      const center = map.getCenter();
      runInAction(() => {
        this.center = [center.lat, center.lng];
        this.zoom = map.getZoom();
      });
    });
  }

  setSelectedFeature(feature) {
    this.selectedFeature = feature;
  }

  get getSelectedFeature() {
    return this.selectedFeature;
  }

  clearSelectedFeature() {
    this.selectedFeature = null;
  }
}

const mapStore = new MapStore();
export default mapStore;
