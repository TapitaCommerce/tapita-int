import { ApolloClient, ApolloProvider, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from '@apollo/client/link/context';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { LS_ADMIN_AT, LS_MERCHANT_AT } from "./constants/string.constant";
import { ADMIN_ACCESS_TOKEN, MERCHANT_ACCESS_TOKEN } from "./constants/header.constant";

export default function App() {
  const httpLink = createHttpLink({
    uri: 'http://localhost:4000/graphql',
  });
  
  
  const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    const adminToken = window?.localStorageTp.getItem(LS_ADMIN_AT);
    const merchantToken = window?.localStorageTp.getItem(LS_MERCHANT_AT);
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        [ADMIN_ACCESS_TOKEN]: adminToken ? adminToken : "",
        [MERCHANT_ACCESS_TOKEN]: merchantToken ? merchantToken : "",
      }
    }
  });

  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="stylesheet" href="https://unpkg.com/@shopify/polaris@11.1.2/build/esm/styles.css" onload='this.media="all"'></link>
        <Meta />
        <Links />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              window.disabledCookies = false;
              function storageMock() {
                  let storage = {};
                  return {
                      setItem: function (key, value) {
                          storage[key] = value || '';
                      },
                      getItem: function (key) {
                          return key in storage ? storage[key] : null;
                      },
                      removeItem: function (key) {
                          delete storage[key];
                      },
                      get length() {
                          return Object.keys(storage).length;
                      },
                      key: function (i) {
                          const keys = Object.keys(storage);
                          return keys[i] || null;
                      }
                  };
              }
              try {
                  window.localStorage.setItem('tptseo_test_lcavl', 'yes');
                  window.localStorage.removeItem('tptseo_test_lcavl');
                  window.localStorageTp = window.localStorage;
                  window.sessionStorageTp = window.sessionStorage;
              } catch(e) {
                  window.disabledCookies = true;
                  window.localStorageTp = storageMock();
                  window.sessionStorageTp = storageMock();
              }
            `,
          }}
        />
      </head>
      <body>
        <ApolloProvider client={client}>
          <Outlet />
          <ScrollRestoration />
          <LiveReload />
          <Scripts />
        </ApolloProvider>
      </body>
    </html>
  );
}
