import bodyParser from 'koa-bodyparser';
import chalk from 'chalk';
import cors from 'kcors';
import fs from 'fs';
import requestLogger from 'koa-logger-winston';
import Koa from 'koa';
import postgraphile from 'postgraphile';
import appManifest from './appManifest';

import logger from '../shared/utils/logger';
import ssr from './ssr';
import staticAssets from './static';

export default async function startApp(options = {}) {
  const app = new Koa();

  app.use(requestLogger(logger));

  const pgqlOpts = Object.assign(
    {
      graphiql: false,
    },
    options.postgraphileOptions || {},
  );
  // prevent graphqlRoute from being changed
  pgqlOpts.graphqlRoute = '/graphql';
  app.use(postgraphile(options.db, 'public', pgqlOpts));
  app.use(cors());
  app.use(bodyParser());

  // add middleware from the user's app if it exists
  // we need to load it from a different place in "prod" vs "dev"
  if (options.disableWebpack && (
    fs.existsSync(`${options.appLocation}/build/middleware.js`) ||
    fs.existsSync(`${options.appLocation}/build/middleware/index.js`)
  )) {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    require(`${options.appLocation}/build/middleware`).default({ app, logger, options });
  } else if (
    fs.existsSync(`${options.appLocation}/src/middleware.js`) ||
    fs.existsSync(`${options.appLocation}/src/middleware/index.js`)
  ) {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    require(`${options.appLocation}/src/middleware`).default({ app, logger, options });
  }

  app.use(appManifest(options));
  app.use(ssr(options));
  if (!options.disableWebpack) {
    // eslint-disable-next-line global-require
    require('../config/webpack.dev').default(app, options);
  }
  app.use(staticAssets());

  await app.listen(options.port);
  logger.info(chalk.green(`Server started on: ${options.host}`));

  return app;
}
