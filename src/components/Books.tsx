import { useQuery } from '@apollo/react-hooks';
import React, { FC } from 'react';
import { BooksData, BOOKS } from '../graphql/books';

const Books: FC = () => {
  const { loading, error, data } = useQuery<BooksData>(BOOKS);

  if (loading) return <p>Loading...</p>;
  if (error || data === undefined) return <p>Error :(</p>;
  return (
    <div>
      {data.books.map(({ author, id, title }) => (
        <div key={id} style={{ marginTop: 30 }}>
          <div>
            <b>author:</b>
            &nbsp;
            {author}
          </div>
          <div>
            <b>id:</b>
            &nbsp;
            {id}
          </div>
          <div>
            <b>title:</b>
            &nbsp;
            {title}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Books;
