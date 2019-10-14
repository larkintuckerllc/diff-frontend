import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { BOOKS, BOOKS_UPDATE, BooksData, BooksUpdateData } from './books';
import { booksGetLastModified, booksSetLastModified } from './lastModified';

export default new ApolloLink((operation, forward) => {
  const context = operation.getContext();
  const { cache } = context as ApolloClient<object>;
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
            books: (data as BooksUpdateData).booksUpdate.filter(({ isDeleted }) => !isDeleted),
          };
        } else {
          const cacheData = cache.readQuery<BooksData>({ query: BOOKS });
          if (cacheData === null) {
            break;
          }
          // TODO: LOOP THROUGH UPDATE, CREATE, UPDATE, DELETE
          console.log(cacheData);
          console.log(data);
          mutatedData = cacheData;
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
