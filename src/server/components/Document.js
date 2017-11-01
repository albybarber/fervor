import PropTypes from 'prop-types';
import React from 'react';

/* eslint-disable react/no-danger */
export default function Document({
  appFavicon,
  appLocation,
  content,
  manifest,
  state,
  title,
}) {
  let scripts = [
    <script key="bundle.js" src="/build/bundle.js" />,
  ];
  let cssFiles = null;

  if (process.env.NODE_ENV.indexOf('prod') > -1) {
    // requiring the manfiest happens on the server side and only in prod
    // this means a dynamic require is fine
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const manifestJSON = require(`${appLocation}/build/manifest.json`);

    cssFiles = Object.keys(manifestJSON.cssChunks).map((cssFile) => (
      <link key={`/build/${cssFile}`} rel="stylesheet" type="text/css" href={`/build/${cssFile}`} />
    ));
    scripts = Object.keys(manifestJSON.jsChunks).reverse().map((jsFile) => (
      (jsFile.indexOf('bundle') > -1 || jsFile.indexOf('common') > -1) ?
        <script key={`/build/${jsFile}`} async defer src={`/build/${jsFile}`} /> :
        null
    )).filter((value) => value !== null);
    scripts.unshift(
      <script
        dangerouslySetInnerHTML={{
          __html: 'if ("serviceWorker" in navigator) {navigator.serviceWorker.register("/sw.js") }',
        }}
      />,
    );
  }

  const pwaMeta = [];
  if (manifest.icons.length) {
    Object.keys(manifest.icons).forEach((key) => {
      const icon = manifest.icons[key];
      pwaMeta.push(
        <link
          href={icon.src}
          key={`appAppleIcon${icon.size}`}
          rel="apple-touch-icon-precomposed"
          sizes={icon.size}
        />,
      );
      pwaMeta.push(
        <link
          href={icon.src}
          key={`appIcon${icon.size}`}
          rel="icon"
          sizes={icon.size}
        />,
      );
    });
  }
  if (appFavicon) {
    pwaMeta.push(
      <link key="appFavicon" rel="shortcut icon" href={appFavicon} />,
    );
  }
  if (manifest.theme_color) {
    pwaMeta.push(<meta key="appThemeColor" name="theme-color" content={manifest.theme_color} />);
  }

  return (
    <html lang="en">
      <head>
        <title>{title}</title>
        { pwaMeta }
        <link key="appManifest" rel="manifest" href="/appmanifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        { cssFiles }
      </head>
      <body>
        <div id="app" dangerouslySetInnerHTML={{ __html: content }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.APOLLO_STATE=${JSON.stringify(state).replace(/</g, '\\u003c')};`,
          }}
        />
        { scripts }
      </body>
    </html>
  );
}

Document.defaultProps = {
  appFavicon: null,
  manifest: {},
  title: '',
};

Document.propTypes = {
  appLocation: PropTypes.string.isRequired,
  appFavicon: PropTypes.string,
  manifest: PropTypes.object,
  content: PropTypes.string.isRequired,
  state: PropTypes.object.isRequired,
  title: PropTypes.string,
};
