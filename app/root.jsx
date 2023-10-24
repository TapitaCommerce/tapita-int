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

export default function App() {
  const httpLink = createHttpLink({
    uri: 'https://his-india-horizontal-ya.trycloudflare.com/graphql',
  });
  
  
  const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    const token = localStorage.getItem('accessToken');
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
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
        {/* <link rel="stylesheet" href="./routes/_index/style.css" onload='this.media="all"'></link> */}
        <Meta />
        <Links />
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
