import gql from 'graphql-tag';

export interface Book {
  author: string;
  id: string;
  title: string;
}

export interface BooksData {
  books: Book[];
}

export const BOOKS = gql`
  query books {
    books {
      author
      id
      title
    }
  }
`;

export const BOOKS_UPDATE = gql`
  query booksUpdate($lastModified: Int!) {
    booksUpdate(lastModified: $lastModified) {
      author
      id
      title
      __typename
    }
  }
`;
