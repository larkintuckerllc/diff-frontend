let booksLastModified = 0;
export const booksGetLastModified = (): number => booksLastModified;
export const booksSetLastModified = (lastModified: number): void => {
  booksLastModified = lastModified;
};
