import React from "react";
import gql from "graphql-tag";
import { useQuery } from "react-apollo-hooks";
import Post from "./Post.jsx";

const GET_POSTS = gql`
  query {
    viewer {
      allPosts {
        edges {
          node {
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
    }
  }
`;

const Posts = (props) => {
  const { data, error } = useQuery(GET_POSTS);
  if (error) return `Error! ${error.message}`;
  return data.viewer.allPosts.edges.map(edge => <Post key={edge.node.uuid} post={edge.node} />);
};

export default Posts;
