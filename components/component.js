// import { patch } from 'incremental-dom';
const delegateEventSplitter = /^(\S+)\s*(.*)$/;

export class Component extends HTMLElement {
  constructor() {
    super();
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
    for (const domEvent of this._domEvents) {
      const els = [...this.querySelectorAll(domEvent.selector)];
      this.unbindEvents(els, domEvent.eventName, this);
    }

    this._domEvents = [];
  }

  render() {
    this.innerHTML = this.template;
    // patch(this, this.template, this.data);
    this.delegateEvents();
  }
}
