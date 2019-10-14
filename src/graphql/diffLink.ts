import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { BOOKS, BOOKS_UPDATE, BooksData, BooksUpdateData } from './books';
import { booksGetLastModified, booksSetLastModified } from './lastModified';

export default new ApolloLink((operation, forward) => {
  const context = operation.getContext();
  const { cache } = context as ApolloClient<object>;
  const booksLastModified = booksGetLastModified();
  // TODO: MAKE MORE PURE
  const mutatedOperation = operation;
  const { operationName } = operation;
  switch (operationName) {
    case 'books':
      mutatedOperation.operationName = 'booksUpdate';
      mutatedOperation.query = BOOKS_UPDATE;
      mutatedOperation.variables = {
        lastModified: booksLastModified,
      };
      break;
    default:
  }
  return forward(mutatedOperation).map(result => {
    const { data } = result;
    if (data === undefined || data === null) {
      return result;
    }
    let mutatedData = data;
    switch (operationName) {
      case 'books': {
        const booksUpdateData = data as BooksUpdateData;
        if (booksLastModified === 0) {
          mutatedData = {
            books: booksUpdateData.booksUpdate.filter(({ isDeleted }) => !isDeleted),
          };
        } else {
          const booksCacheData = cache.readQuery<BooksData>({ query: BOOKS });
          if (booksCacheData === null) {
            throw new Error(); // UNEXPECTED
          }
          // TODO: REFACTOR TO BE MORE PURE
          const mutatedBooks = [...booksCacheData.books];
          booksUpdateData.booksUpdate.forEach(bookUpdate => {
            const bookMutatedIndex = mutatedBooks.findIndex(book => book.id === bookUpdate.id);
            if (bookMutatedIndex === -1 && !bookUpdate.isDeleted) {
              // CASE CREATE
              const createBook = { ...bookUpdate };
              delete createBook.isDeleted;
              mutatedBooks.push(createBook);
            } else if (bookMutatedIndex !== -1 && bookUpdate.isDeleted) {
              // CASE DELETE
              mutatedBooks.splice(bookMutatedIndex, 1);
            } else if (bookMutatedIndex !== -1 && !bookUpdate.isDeleted) {
              // CASE UPDATE
              mutatedBooks.splice(bookMutatedIndex, 1);
              const createBook = { ...bookUpdate };
              delete createBook.isDeleted;
              mutatedBooks.push(createBook);
            }
          });
          mutatedData = {
            books: mutatedBooks,
          };
        }
        booksSetLastModified(1);
        break;
      }
      default:
    }
    return {
      data: mutatedData,
    };
  });
});
