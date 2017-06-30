import { patch } from 'incremental-dom';
import { bindActionCreators } from 'redux';
import { observeStore } from '../redux/helpers';
import { provider } from '../redux';

const delegateEventSplitter = /^(\S+)\s*(.*)$/;
const defaultMapState = () => ({});
const defaultMapDispatch = dispatch => ({ dispatch });

export class Component extends HTMLElement {
  constructor() {
    super();

    if (document.head.createShadowRoot || document.head.attachShadow) {
        this.attachShadow({mode: 'open'});
    } else {
        this.shadowRoot = this;
    }

    this.connectToStore();
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    if (typeof this.undelegateEvents === 'function') {
      this.undelegateEvents();
    }
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
      const els = [...this.shadowRoot.querySelectorAll(selector)];
      this.bindEvents(els, eventName, method);
    }
  }

  undelegateEvents() {
    if (this._domEvents) {
      for (const domEvent of this._domEvents) {
        const els = [...this.shadowRoot.querySelectorAll(domEvent.selector)];
        this.unbindEvents(els, domEvent.eventName, this);
      }
    }

    this._domEvents = [];
  }

  render() {
    patch(this.shadowRoot, this.template, this.data);

    this.delegateEvents();
    this.onRender();
  }

  onRender() {}

  shouldComponentUpdate() {
    let isDirty = false;
    const dataset = JSON.parse(JSON.stringify(this.dataset));

    if (this.currentData) {
      for (const prop in dataset) {
        if (Array.isArray(dataset[prop])) {
          const isEqual = dataset[prop].every((element, index) => element === this.currentData[prop][index]);

          if (!isEqual) {
            isDirty = true;
            break;
          }
        } else {
          if (dataset[prop] !== this.currentData[prop]) {
            isDirty = true;
            break;
          }
        }
      }
    } else {
      isDirty = true;
    }

    this.currentData = dataset;

    return isDirty;
  }
}
