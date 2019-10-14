import { ApolloLink } from 'apollo-link';
import { BOOKS_UPDATE } from './books';
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
    let mutatedResult = result;
    switch (operationName) {
      case 'books':
        if (booksLastModified === 0) {
          mutatedResult = {
            data: {
              books: data.booksUpdate,
            },
          };
        } else {
          // TODO: CACHE
          mutatedResult = {
            data: {
              books: [],
            },
          };
        }
        booksSetLastModified(1);
        break;
      default:
    }
    return mutatedResult;
  });
});
