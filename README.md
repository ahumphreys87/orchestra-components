# Web Component Playground

A playground for building apps with Web Components, using the following tech stack:

* Custom Elements v1
* Handlebars templates
* Redux state storage
* Incremental DOM rendering to Shadow DOM

## Components
Components make use of CustomElements (V1) and must be specifically defined and assigned to a tag. There are currently 3 types of component available: `Page`, `Component` and `Router`. `Page` and `Component` allow for a `template` to be specified so that data can be rendered to the user. Whereas a `Router` is used to navigate between pages on the site.

Here is a small example of rendering a template:

```
// user-display.js
import template from './template.hbs';

class UserDisplay extends Component {
  get template() {
    return template;
  }

  get data() {
    return {
      name: 'Joe Bloggs'
    };
  }
}

window.customElements.define('user-display', UserDisplay);

// template.hbs

<div>{{name}}</div>
```

The above example would render "Joe Bloggs" to the user when the `user-display` element was added to the DOM as both `Page` and `Component` call `render` via the `connectedCallback`. By default a `Page` and `Component` will render to the `shadowRoot` of the CustomElement, to change this you can override the `render` method.

### Page
A `Page` component should be used to connect a web component to a redux store.

You can override the `mapState` method to tell the `Page` what data to use from the store. When any data in the mapped state changes the `storeUpdated` method will be called. Use this to trigger a re-render of the page.

You can override the `mapDispatch` method to attach actions to the `Page`. It should return an object where the key is the name of the action you wish to attach:

```
import { fetchDataIfNeeded } from './actions';

export class HomePage extends Page {
  constructor() {
    super();
    this.actions.fetchDataIfNeeded();
  }

  mapDispatch(dispatch) {
    return {
      fetchDataIfNeeded
    };
  }
}
```

When an action is called it is passed the `dispatch` and `getState` methods from the store, here is an example action creator that could be attached to a `Page`:

```
// ./actions.js
function fetchData() {
  return {
    type: 'REQUEST_DATA'
  }
}

export function fetchDataIfNeeded() {
  return (dispatch, getState) => {
    if (shouldFetchData(getState())) {
      return dispatch(fetchData())
    }
  }
}
```
