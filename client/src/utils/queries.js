import { gql } from '@apollo/client';

// Query to fetch a single user
export const QUERY_USER = gql`
  {
    user {
      _id
      firstName
      lastName
      username
    }
  }
`;

// Query to fetch all users
export const QUERY_USERS = gql`
  {
    users {
      _id
      firstName
      lastName
      username
    }
  }
`;
