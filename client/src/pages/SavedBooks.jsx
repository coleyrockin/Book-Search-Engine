import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Row,
  Spinner,
} from 'react-bootstrap';
import { useMutation, useQuery } from '@apollo/client/react';

import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';
import { safeHttpsUrl } from '../utils/url';

const SavedBooks = () => {
  const [deleteError, setDeleteError] = useState('');
  const [deletingBookId, setDeletingBookId] = useState('');
  const loggedIn = Auth.loggedIn();

  const { loading, data, error } = useQuery(GET_ME, {
    skip: !loggedIn,
    fetchPolicy: 'cache-and-network',
  });

  const [removeBook] = useMutation(REMOVE_BOOK, {
    update(cache, { data: mutationData }) {
      if (mutationData?.removeBook) {
        cache.writeQuery({
          query: GET_ME,
          data: { me: mutationData.removeBook },
        });
      }
    },
  });

  const userData = data?.me || { savedBooks: [] };

  const handleDeleteBook = async (bookId) => {
    if (!loggedIn || !bookId) {
      return;
    }

    try {
      setDeletingBookId(bookId);
      setDeleteError('');
      await removeBook({ variables: { bookId } });
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
      setDeleteError('That book could not be removed. Please refresh and try again.');
    } finally {
      setDeletingBookId('');
    }
  };

  if (!loggedIn) {
    return <Navigate to='/' replace />;
  }

  if (loading && !data) {
    return (
      <main className='loading-state'>
        <Spinner animation='border' role='status' />
        <span>Loading saved books</span>
      </main>
    );
  }

  return (
    <>
      <section className='hero compact'>
        <Container>
          <h1>Saved Books</h1>
        </Container>
      </section>
      <Container className='page-section'>
        {(deleteError || error) && (
          <Alert dismissible variant='danger' onClose={() => setDeleteError('')}>
            {deleteError || 'Your saved books could not be loaded. Please sign in again.'}
          </Alert>
        )}

        <div className='section-heading'>
          <h2>
            {userData.savedBooks.length
              ? `Viewing ${userData.savedBooks.length} saved ${
                  userData.savedBooks.length === 1 ? 'book' : 'books'
                }`
              : 'You have no saved books'}
          </h2>
        </div>

        <Row xs={1} md={2} xl={3} className='g-4'>
          {userData.savedBooks.map((book) => {
            const imageUrl = safeHttpsUrl(book.image);
            const linkUrl = safeHttpsUrl(book.link);

            return (
              <Col key={book.bookId}>
                <Card className='book-card h-100'>
                  {imageUrl && (
                    <a href={linkUrl || undefined} target='_blank' rel='noreferrer'>
                      <Card.Img src={imageUrl} alt={`The cover for ${book.title}`} />
                    </a>
                  )}
                  <Card.Body className='d-flex flex-column'>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors.join(', ')}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <div className='mt-auto d-grid gap-2'>
                      {linkUrl && (
                        <Button href={linkUrl} target='_blank' rel='noreferrer' variant='outline-secondary'>
                          View on Google Books
                        </Button>
                      )}
                      <Button
                        variant='danger'
                        disabled={deletingBookId === book.bookId}
                        onClick={() => handleDeleteBook(book.bookId)}
                      >
                        {deletingBookId === book.bookId ? 'Removing' : 'Delete Book'}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
