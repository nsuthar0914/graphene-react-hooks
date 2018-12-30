import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { AuthContext } from "./auth-context";


const styles = theme => ({
  wrapper: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: "10px",
    padding: "10px",
    marginBottom: "10px",
  },
  controls: {
    float: "right",
  },
  button: {
    margin: theme.spacing.unit,
  },
});

const Post = ({ post, classes }) => {
  return (
    <div className={classes.wrapper}>
      <AuthContext.Consumer>
        {context => {
          if (post.author && context.user && post.author.uuid === context.user.uuid) {
            return (<div className={classes.controls}>
              <IconButton className={classes.button} aria-label="Edit">
                <EditIcon />
              </IconButton>
              <IconButton className={classes.button} aria-label="Delete">
                <DeleteIcon />
              </IconButton>
            </div>);
          }
          return null;
        }}
      </AuthContext.Consumer>
      <h1>{post.title}</h1>
      {post.author ? <small>-- by {post.author.username}</small> : null}
      <p>{post.body}</p>
    </div>
  );
};

Post.propTypes = {
  post: PropTypes.object,
  classes: PropTypes.object,
};

export default withStyles(styles)(Post);
