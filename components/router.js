import { patch } from 'incremental-dom';
import cherrytree from 'cherrytree';

export class Router extends HTMLElement {
  constructor() {
    super();
    this.createShadowRoot();
  }

  connectedCallback() {
    this._router = cherrytree({
      pushState: true,
      log: true
    });

    // add default render middleware
    this._setupMapping();
    this._setupMiddleware();

    // start listening to URL changes
    this._router.listen();
  }

  _setupMapping() {
    this._router.map(this.mapping);
  }

  _setupMiddleware() {
    for (const middleware of this.middleware) {
      this._router.use(middleware.bind(this));
    }
  }

  render() {
    patch(this.shadowRoot, this.template, this.data);
  }

  get mapping() {
    return {};
  }

  get middleware() {
    return {};
  }
}
