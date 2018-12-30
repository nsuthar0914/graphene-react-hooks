import React, { useState } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { withStyles } from "@material-ui/core/styles";
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import CancelIcon from '@material-ui/icons/Cancel';
import SaveIcon from '@material-ui/icons/Save';
import TextField from '@material-ui/core/TextField';
import { useMutation } from "react-apollo-hooks";
import { AuthContext } from "./auth-context";
import { GET_POSTS } from "./Posts.jsx";

const UPDATE_POST_MUTATION = gql`
  mutation updatePost($title: String!, $body: String!, $uuid: Int!) {
    updatePost(title: $title, body: $body, uuid: $uuid) {
      post {
        uuid
        author {
          uuid
          username
        }
        body
        title
      }
    }
  }
`;

const DELETE_POST_MUTATION = gql`
  mutation deletePost($uuid: Int!) {
    deletePost(uuid: $uuid) {
      status
    }
  }
`;

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
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: "calc(100% - 100px)",
  },
});

const Post = ({ post, classes }) => {
  const removePost = useMutation(DELETE_POST_MUTATION, {
    update: (proxy, { data: { deletePost } }) => {
      const data = proxy.readQuery({
        query: GET_POSTS,
      });
      const edges = Object.assign([], data.viewer.allPosts.edges);
      const idx = edges.findIndex(e => e.node.uuid === post.uuid);
      edges.splice(idx, 1);
      const newData = {
        ...data,
        viewer: {
          ...data.viewer,
          allPosts: {
            ...data.viewer.allPosts,
            edges: edges,
          },
        },
      };
      proxy.writeQuery({
        query: GET_POSTS,
        data: newData,
      });
    },
    variables: {
      uuid: post.uuid,
    },
  });
  const [ mode, setMode ] = useState("list");
  const [title, setTitle] = useState(post.title);
  const [body, setBody] = useState(post.body);
  const submitPost = useMutation(UPDATE_POST_MUTATION, {
    update: (proxy, { data: { updatePost } }) => {
      const data = proxy.readQuery({
        query: GET_POSTS,
      });
      const edges = Object.assign([], data.viewer.allPosts.edges);
      const idx = edges.findIndex(e => e.node.uuid === post.uuid);
      edges.splice(idx, 1, {
        node: updatePost.post,
        __typename: "PostObjectEdge",
      });
      const newData = {
        ...data,
        viewer: {
          ...data.viewer,
          allPosts: {
            ...data.viewer.allPosts,
            edges: edges,
          },
        },
      };
      proxy.writeQuery({
        query: GET_POSTS,
        data: newData,
      });
    },
    variables: {
      title: title,
      body: body,
      uuid: post.uuid,
    },
  });
  return (
    <div className={classes.wrapper}>
      <AuthContext.Consumer>
        {context => {
          if (post.author && context.user && post.author.uuid === context.user.uuid) {
            if (mode === "edit") {
              return (<div className={classes.controls}>
                <IconButton className={classes.button} aria-label="Cancel" onClick={() => setMode("list")}>
                  <CancelIcon />
                </IconButton>
                <IconButton className={classes.button} aria-label="Save" onClick={() => {
                  submitPost();
                  setMode("list");
                }}>
                  <SaveIcon />
                </IconButton>
              </div>);
            }
            return (<div className={classes.controls}>
              <IconButton className={classes.button} aria-label="Edit" onClick={() => setMode("edit")}>
                <EditIcon />
              </IconButton>
              <IconButton className={classes.button} aria-label="Delete" onClick={removePost}>
                <DeleteIcon />
              </IconButton>
            </div>);
          }
          return null;
        }}
      </AuthContext.Consumer>
      {mode === "list"
        ? <h1>{post.title}</h1>
        : <TextField
          id="standard-title"
          label="Title"
          className={classes.textField}
          value={title}
          onChange={e => setTitle(e.target.value)}
          margin="normal"
        />}
      {post.author ? <small>-- by {post.author.username}</small> : null}
      {mode === "list"
        ? <p>{post.body}</p>
        : <TextField
          id="standard-body"
          label="Body"
          multiline
          rowsMax="4"
          value={body}
          onChange={e => setBody(e.target.value)}
          className={classes.textField}
          margin="normal"
        />}
    </div>
  );
};

Post.propTypes = {
  post: PropTypes.object,
  classes: PropTypes.object,
  deletePost: PropTypes.func,
};

export default withStyles(styles)(Post);
