import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';

const loggerMiddleware = createLogger();
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
let currentStore;

export const provider = {
  set store(store) {
    this._store = store;
  },

  get store() {
    return this._store;
  }
}

export function configureStore(reducer, preloadedState) {
  return createStore(
    reducer,
    preloadedState,
    composeEnhancers(
      applyMiddleware(
        thunkMiddleware,
        loggerMiddleware
      )
    )
  );
};
