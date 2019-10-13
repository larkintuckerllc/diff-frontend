import gql from 'graphql-tag';

export interface Book {
  author: string;
  id: string;
  title: string;
}

export interface BooksData {
  books: Book[];
}

// eslint-disable-next-line
export const BOOKS = gql`
  {
    books {
      author
      id
      title
    }
  }
`;
