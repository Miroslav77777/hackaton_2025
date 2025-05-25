import { makeAutoObservable } from 'mobx';

class AddrStore {
  addresses = [];
  selectedAddress = null;
  batch = null;

  constructor() {
    makeAutoObservable(this);
  }

  setAddresses(data) {
    this.addresses = data;
  }

  get getAddresses() {
    return this.addresses;
  }

  setSelectedAddress(addr) {
    this.selectedAddress = addr;
  }

  get getSelectedAddress() {
    return this.selectedAddress;
  }

  setBatch(batch) {
    this.batch = batch;
  }

  get getBatch() {
    return this.batch;
  }
}

const addrStore = new AddrStore();
export default addrStore;
