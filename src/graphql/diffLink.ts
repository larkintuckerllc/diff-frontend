import { ApolloCache } from 'apollo-cache';
import { ApolloClient } from 'apollo-client';
import { ApolloLink, Operation } from 'apollo-link';
import { BOOKS, BOOKS_UPDATE, BooksData, BooksUpdateData } from './books';
import { booksGetLastModified, booksSetLastModified } from './lastModified';

// eslint-disable-next-line
type Data = { [key: string]: any };

const mutateOperation = (operation: Operation): void => {
  const mutatedOperation = operation;
  const { operationName } = operation;
  switch (operationName) {
    case 'books': {
      const booksLastModified = booksGetLastModified();
      mutatedOperation.operationName = 'booksUpdate';
      mutatedOperation.query = BOOKS_UPDATE;
      mutatedOperation.variables = {
        lastModified: booksLastModified,
      };
      break;
    }
    default:
  }
};

const transformedData = (operationName: string, cache: ApolloCache<object>, data: Data): Data => {
  switch (operationName) {
    case 'books': {
      const { booksUpdate } = data as BooksUpdateData;
      const booksLastModified = booksGetLastModified();
      booksSetLastModified(Date.now());
      // FIRST LOAD
      if (booksLastModified === 0) {
        return {
          books: booksUpdate.filter(({ isDeleted }) => !isDeleted),
        };
      }
      // SUBSEQUENT LOADS
      const booksCacheData = cache.readQuery<BooksData>({ query: BOOKS });
      if (booksCacheData === null) {
        throw new Error(); // UNEXPECTED
      }
      const mutatedBooks = [...booksCacheData.books];
      booksUpdate.forEach(bookUpdate => {
        const bookMutatedIndex = mutatedBooks.findIndex(book => book.id === bookUpdate.id);
        if (bookMutatedIndex === -1 && !bookUpdate.isDeleted) {
          // CREATE
          mutatedBooks.push(bookUpdate);
        } else if (bookMutatedIndex !== -1 && bookUpdate.isDeleted) {
          // DELETE
          mutatedBooks.splice(bookMutatedIndex, 1);
        } else if (bookMutatedIndex !== -1 && !bookUpdate.isDeleted) {
          // UPDATE
          mutatedBooks.splice(bookMutatedIndex, 1);
          mutatedBooks.push(bookUpdate);
        }
      });
      return {
        books: mutatedBooks,
      };
    }
    default:
  }
  return data;
};

export default new ApolloLink((operation, forward) => {
  const { operationName } = operation;
  const context = operation.getContext();
  const { cache } = context as ApolloClient<object>;
  mutateOperation(operation); // NOT PURE
  return forward(operation).map(result => {
    const { data } = result;
    if (data === undefined || data === null) {
      return result;
    }
    return {
      data: transformedData(operationName, cache, data),
    };
  });
});
