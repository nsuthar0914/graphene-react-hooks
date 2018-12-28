import React from "react";
import {hot} from "react-hot-loader";
import PropTypes from "prop-types";
import {
  Route,
  NavLink,
  Redirect,
} from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import Post from "./Post.jsx";
import Posts from "./Posts.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import PrivateRoute from "./PrivateRoute.jsx";
import { isAuthenticated } from "./utils";


const styles = theme => {
  return ({
    root: {
      flexGrow: 1,
      height: "97vh",
      zIndex: 1,
      overflow: "hidden",
      position: "relative",
      display: "flex",
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
    content: {
      overflowY: "auto",
      flexGrow: 1,
      backgroundColor: theme.palette.background.default,
      padding: theme.spacing.unit * 3,
      minWidth: 0, // So the Typography noWrap works
    },
    toolbar: theme.mixins.toolbar,
  });
};

const App = ({ classes, location }) => {
  function activeRoute(routeName) {
    return location.pathname.indexOf(routeName) > -1;
  }
  return (
    <div className={classes.root}>
      <AppBar position="absolute" className={classes.appBar}>
        <Toolbar>
          <Typography variant="title" color="inherit" noWrap>
            Blogging App
          </Typography>
        </Toolbar>
      </AppBar>
      {location.pathname === "/" && <Redirect to="/posts" />}
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <PrivateRoute path="/posts" component={Posts} />
        <PrivateRoute path="/posts/:postid" component={Post} />
      </main>
    </div>
  );
};

App.propTypes = {
  classes: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default hot(module)(withStyles(styles)(App));
