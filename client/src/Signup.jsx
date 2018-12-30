import React, { useState } from "react";
import { useMutation } from "react-apollo-hooks";
import PropTypes from "prop-types";
import {
  Redirect,
} from "react-router-dom";
import gql from "graphql-tag";
import TextField from "@material-ui/core/TextField";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

const styles = theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  button: {
    margin: theme.spacing.unit,
  },
});


const SIGNUP_MUTATION = gql`
  mutation Signup($username: String!, $password: String!) {
    signup( username: $username, password: $password ) {
      user {
        username
        uuid
      }
      authToken
    }
  }
`;

const Signup  = (props) => {
  const { location, classes, history } = props;
  const { from } = location.state || { from: { pathname: "/" } };
  const [ username, setUsername ] = useState("");
  const [ password, setPassword ] = useState("");
  const signup = useMutation(SIGNUP_MUTATION, {
    update: (proxy, { data }) => {
      if (data && data.signup && data.signup.user) {
        localStorage.setItem("user", JSON.stringify(data.signup.user));
        localStorage.setItem("authToken", data.signup.authToken);
        setTimeout(() => {
          history.push(from.pathname);
        }, 0);
      }
    },
    variables: {
      username: username,
      password: password,
    },
  });

  return (
    <div>
      <form
      className={classes.container}
      noValidate
      autoComplete="off"
      onSubmit={e => { e.preventDefault(); signup(); }}
      >
      <TextField
        required
        id="username"
        label="Username"
        className={classes.textField}
        margin="normal"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <TextField
        id="password"
        label="Password"
        className={classes.textField}
        type="password"
        margin="normal"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <Button className={classes.button} type="submit">Signup</Button>
      </form>
    </div>
  );
};

Signup.propTypes = {
  location: PropTypes.object,
  classes: PropTypes.object,
};

export default withStyles(styles)(Signup);
