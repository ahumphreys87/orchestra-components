import { patch } from 'incremental-dom';
import { bindActionCreators } from 'redux';
import { observeStore } from '../redux/helpers';
import { provider } from '../redux';

const defaultMapState = () => ({});
const defaultMapDispatch = dispatch => ({ dispatch });

export class Page extends HTMLElement {
  constructor() {
    super();
    this.connectToStore();
    this.createShadowRoot();
  }

  connectedCallback() {
    this.render();
  }

  connectToStore() {
    if (!provider.store) {
      return;
    }

    const mapState = this.mapState || defaultMapState;
    const mapDispatch = this.mapDispatch || defaultMapDispatch;
    const actions = bindActionCreators(mapDispatch(), provider.store.dispatch);
    const currentState = mapState(provider.store.getState());

    this.state = currentState;
    this.actions = actions;

    observeStore(provider.store, currentState, mapState, (newState, oldState) => {
      this.state = newState;
      if (typeof this.storeUpdated === 'function') this.storeUpdated(oldState);
    });
  }

  get data() {
    return {};
  }

  get template() {
    return {};
  }

  render() {
    patch(this.shadowRoot, this.template, this.data);
  }
}
