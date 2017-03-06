// import { patch } from 'incremental-dom';
import { bindActionCreators } from 'redux';
import { observeStore } from '../redux/helpers';
import { provider } from '../redux';

const delegateEventSplitter = /^(\S+)\s*(.*)$/;
const defaultMapState = () => ({});
const defaultMapDispatch = dispatch => ({ dispatch });

export class Component extends HTMLElement {
  constructor() {
    super();
    this.connectToStore();
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    this.undelegateEvents();
  }

  get data() {
    return {};
  }

  get template() {
    return {};
  }

  get events() {
    return {};
  }

  handleEvent(event) {
    const validEvents = this._domEvents.filter(domEvent => {
      if (domEvent.eventName === event.type && event.currentTarget === domEvent.element) {
        return true;
      }

      return false;
    });

    for (const domEvent of validEvents) {
      domEvent.method.call(this, event);
    }
  }

  bindEvents (elements, eventName, method) {
    for (const element of elements) {
      element.addEventListener(eventName, this);
      this._domEvents.push({
        eventName, element, method
      });
    }
  }

  unbindEvents (elements, eventName) {
    for (const element of elements) {
      element.removeEventListener(eventName, this);
    }
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

  delegateEvents() {
    this._domEvents = [];
    this.undelegateEvents();

    for (const event in this.events) {
      const match = event.match(delegateEventSplitter);
      const eventName = match[1];
      const selector = match[2];
      const method = this[this.events[event]];
      const els = [...this.querySelectorAll(selector)];
      this.bindEvents(els, eventName, method);
    }
  }

  undelegateEvents() {
    if (this._domEvents) {
      for (const domEvent of this._domEvents) {
        const els = [...this.querySelectorAll(domEvent.selector)];
        this.unbindEvents(els, domEvent.eventName, this);
      }
    }

    this._domEvents = [];
  }

  render() {
    this.innerHTML = this.template;
    // patch(this, this.template, this.data);
    this.delegateEvents();
  }
}
