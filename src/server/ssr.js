import KoaRouter from 'koa-router';
import PropTypes from 'prop-types';
import React from 'react';
import { ApolloProvider, ApolloClient, createNetworkInterface, getDataFromTree } from 'react-apollo';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router';
import {
  Switch,
  Route,
} from 'react-router-dom';

import initStore from '../shared/store';
import Document from './components/Document';

const serverClient = new ApolloClient({
  ssrMode: true,
  networkInterface: createNetworkInterface({
    uri: 'http://localhost:3000/graphql',
  }),
});

export default (routes, Doc = Document) => {
  const App = ({ ctx }) => (
    <StaticRouter location={ctx.req.url} context={ctx}>
      <Switch>
        { Object.keys(routes).map((path) => (
          <Route
            key={path}
            path={path}
            component={routes[path]}
            exact
          />
        ))}
      </Switch>
    </StaticRouter>
  );

  App.propTypes = {
    ctx: PropTypes.object.isRequired,
  };

  const processRoute = async (ctx, next) => {
    const store = initStore({
      location: { pathname: ctx.req.url, search: '', hash: '' },
      session: {
        isAuthenticated: false, // ctx.isAuthenticated(),
        user: null, // ctx.state.user,
      },
    });

    const app = (
      <ApolloProvider client={serverClient} store={store}>
        <App ctx={ctx} state={store.getState()} />
      </ApolloProvider>
    );

    return getDataFromTree(app).then(() => {
      ctx.body = ReactDOMServer.renderToString((
        <Doc title={'Test'} state={store.getState()}>
          { app }
        </Doc>
      ));
      next();
    });
  };

  const router = new KoaRouter();
  Object.keys(routes).forEach((path) => {
    router.get(path, processRoute);
  });

  return router.routes();
};
