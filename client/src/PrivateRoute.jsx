import React, { Suspense } from "react";
import PropTypes from "prop-types";
import {
  Route,
  Redirect,
} from "react-router-dom";
import { isAuthenticated } from "./utils.js";

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => {
      return (isAuthenticated() ? (
        <Suspense fallback={<div>Loading...</div>}>
          <Component {...props} />
        </Suspense>
      ) : (
        <Redirect
          to={{
            pathname: "/login",
            state: { from: props.location }
          }}
        />
      ));
    }}
  />
);

PrivateRoute.propTypes = {
  location: PropTypes.object,
  component: PropTypes.func,
};

export default PrivateRoute;
