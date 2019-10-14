import { ApolloLink } from 'apollo-link';
import { BOOKS_UPDATE, BookUpdate } from './books';
import { booksGetLastModified, booksSetLastModified } from './lastModified';

export default new ApolloLink((operation, forward) => {
  const booksLastModified = booksGetLastModified();
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
      case 'books':
        if (booksLastModified === 0) {
          mutatedData = {
            books: data.booksUpdate.filter(({ isDeleted }: BookUpdate) => !isDeleted),
          };
        } else {
          // TODO: CACHE
          mutatedData = {
            books: [],
          };
        }
        booksSetLastModified(1);
        break;
      default:
    }
    return {
      data: mutatedData,
    };
  });
});
