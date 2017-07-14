import React from 'react';
import {
    ApolloClient,
    ApolloProvider,
    createNetworkInterface,
} from 'react-apollo';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import initStore from '../shared/store';
import Routes from './routes';

const store = initStore(window.APOLLO_STATE);

const webClient = new ApolloClient({
  initialState: { apollo: window.APOLLO_STATE.apollo },
  networkInterface: createNetworkInterface({
    uri: `${process.env.HOST}/graphql`,
  }),
});

const render = (Component) => {
  ReactDOM.render(
    (
      <ApolloProvider client={webClient} store={store}>
        <BrowserRouter>
          <Component />
        </BrowserRouter>
      </ApolloProvider>
    ),
    document.querySelector('#app'),
  );
};

render(Routes);

if (module.hot) {
  // eslint-disable-next-line global-require
  module.hot.accept('./routes', () => render(require('./routes').default));
}
