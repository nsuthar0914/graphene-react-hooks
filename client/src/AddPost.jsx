import React, { useState } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { withStyles } from "@material-ui/core/styles";
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import SaveIcon from '@material-ui/icons/Save';
import { useMutation } from "react-apollo-hooks";
import { GET_POSTS } from "./Posts.jsx";

const CREATE_POST_MUTATION = gql`
  mutation createPost($title: String!, $body: String!, $authorUuid: Int!) {
    createPost(title: $title, body: $body, authorUuid: $authorUuid) {
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

const AddPost = ({ authorUuid, classes }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const submitPost = useMutation(CREATE_POST_MUTATION, {
    update: (proxy, { data: { createPost } }) => {
      const data = proxy.readQuery({
        query: GET_POSTS,
      });
      const newData = {
        ...data,
        viewer: {
          ...data.viewer,
          allPosts: {
            ...data.viewer.allPosts,
            edges: [
              ...data.viewer.allPosts.edges,
              {
                node: createPost.post,
                __typename: "PostObjectEdge",
              },
            ],
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
      authorUuid: authorUuid,
    },
  });
  return (
    <div className={classes.wrapper}>
      <h1>Add Post</h1>
      <div className={classes.controls}>
        <IconButton className={classes.button} aria-label="Save" onClick={submitPost}>
          <SaveIcon />
        </IconButton>
      </div>
      <TextField
        id="standard-title"
        label="Title"
        className={classes.textField}
        value={title}
        onChange={e => setTitle(e.target.value)}
        margin="normal"
      />
      <TextField
        id="standard-body"
        label="Body"
        multiline
        rowsMax="4"
        value={body}
        onChange={e => setBody(e.target.value)}
        className={classes.textField}
        margin="normal"
      />
    </div>
  );
};

AddPost.propTypes = {
  createPost: PropTypes.func,
  classes: PropTypes.object,
};

export default withStyles(styles)(AddPost);