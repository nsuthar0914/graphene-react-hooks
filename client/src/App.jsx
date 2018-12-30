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
import Button from '@material-ui/core/Button';

import Posts from "./Posts.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import PrivateRoute from "./PrivateRoute.jsx";
import { isAuthenticated, unAuthenticate } from "./utils";
import { AuthContext } from "./auth-context";


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
    grow: {
      flexGrow: 1,
    },
  });
};

const App = ({ classes, location, history }) => {
  return (
    <AuthContext.Provider value={{ user: isAuthenticated() }}>
      <div className={classes.root}>
        <AppBar position="absolute" className={classes.appBar}>
          <Toolbar>
            <Typography variant="title" color="inherit" noWrap className={classes.grow}>
              Blogging App
            </Typography>
            {isAuthenticated()
              ? (<Button
                color="inherit"
                onClick={() => {
                  unAuthenticate();
                  history.push("/login");
                }}
              >
                Logout
              </Button>)
              : <Button color="inherit" onClick={() => history.push("/login")}>Login</Button>}
          </Toolbar>
        </AppBar>
        {location.pathname === "/" && <Redirect to="/posts" />}
        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <PrivateRoute path="/posts" component={Posts} />
        </main>
      </div>
    </AuthContext.Provider>
  );
};

App.propTypes = {
  classes: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default hot(module)(withStyles(styles)(App));
