import React from "react";
import { render } from "react-dom";
import { ApolloProvider } from 'react-apollo-hooks';
import {
  Router,
  Route,
} from "react-router-dom";
import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { ApolloLink, concat } from "apollo-link";
import { InMemoryCache } from "apollo-cache-inmemory";
import createHistory from "history/createBrowserHistory";
import { isAuthenticated, unAuthenticate } from "./utils";
import App from "./App.jsx";


const history = createHistory();

const httpLink = new HttpLink({ uri: "http://localhost:5000/graphql" });

const authErrorLink = onError(({ graphQLErrors }) => {
  const hasUnauthorized = graphQLErrors && graphQLErrors.find(error => {
    const { statusCode } = error;
    return statusCode === 401;
  });
  if (hasUnauthorized) {
    unAuthenticate();
    history.push("/login");
  }
});

const cache = new InMemoryCache();

const authMiddleware = new ApolloLink((operation, forward) => {
  if (isAuthenticated()) {
    // add the authorization to the headers
    operation.setContext({
      headers: {
        Authorization: `JWT ${localStorage.getItem("authToken")}`,
      },
    });
  }
  return forward(operation);
});

const client = new ApolloClient({
  link: authErrorLink.concat(concat(authMiddleware, httpLink)),
  cache: cache,
});

const Main = () => (
  <ApolloProvider client={client}>
    <Router history={history}>
      <div>
        <Route path="/" component={App} />
      </div>
    </Router>
  </ApolloProvider>
);

render(<Main />, document.getElementById("root"));
