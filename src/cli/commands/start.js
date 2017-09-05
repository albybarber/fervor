const dotenv = require('dotenv');
const path = require('path');
require('isomorphic-fetch');
require('babel-polyfill');
const startApp = require('../../../lib/server/server').default;

module.exports = () => {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const routes = require(`${process.cwd()}/build/urls`).default;

  if (process.env.DISABLE_DOT_ENV !== 'true') {
    dotenv.config({ path: path.join(process.cwd(), '.env') });
  }

  return startApp({
    appName: process.env.APP_NAME,
    appShortName: process.env.APP_SHORT_NAME || process.env.APP_NAME,
    appFavicon: process.env.APP_FAVICON,
    appIcons: JSON.parse(process.env.APP_ICONS || '{}'),
    appBackgroundColor: process.env.APP_BACKGROUND_COLOR,
    appThemeColor: process.env.APP_THEME_COLOR,
    db: process.env.DATABASE_URL,
    host: process.env.HOST || 'http://localhost:3000',
    port: process.env.PORT || 3000,
    appLocation: process.cwd(),
    disableWebpack: true,
    postgraphileOptions: JSON.parse(process.env.POSTGRAPHILE_OPTS || '{}'),
    routes,
  });
};
