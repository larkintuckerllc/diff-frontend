import { ApolloLink } from 'apollo-link';
import { BOOKS_UPDATE } from './books';

export default new ApolloLink((operation, forward) => {
  const mutatedOperation = operation;
  const { operationName } = operation;
  switch (operationName) {
    case 'books':
      mutatedOperation.operationName = 'booksUpdate';
      mutatedOperation.query = BOOKS_UPDATE;
      mutatedOperation.variables = {
        lastModified: 0,
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
        mutatedResult = {
          data: {
            books: data.booksUpdate,
          },
        };
        break;
      default:
    }
    return mutatedResult;
  });
});
