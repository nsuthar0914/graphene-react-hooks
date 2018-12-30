import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";


const styles = theme => ({
  wrapper: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: "10px",
    padding: "10px",
  },
});

const Post = ({ post, classes }) => (
  <div className={classes.wrapper}>
    <h1>{post.title}</h1>
    {post.author ? <small>-- by {post.author.username}</small> : null}
    <p>{post.body}</p>
  </div>
);

Post.propTypes = {
  post: PropTypes.object,
  classes: PropTypes.object,
};

export default withStyles(styles)(Post);
