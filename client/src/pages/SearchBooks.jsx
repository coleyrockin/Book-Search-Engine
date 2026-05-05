import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from 'react-bootstrap';
import { useMutation, useQuery } from '@apollo/client/react';

import Auth from '../utils/auth';
import { searchGoogleBooks } from '../utils/API';
import { saveBookIds, getSavedBookIds } from '../utils/localStorage';
import { SAVE_BOOK } from '../utils/mutations';
import { GET_ME } from '../utils/queries';
import { safeHttpsUrl } from '../utils/url';

const normalizeBookResults = (items = []) =>
  items.map(({ id, volumeInfo = {} }) => {
    const thumbnail = volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || '';

    return {
      bookId: id,
      authors: volumeInfo.authors?.length ? volumeInfo.authors : ['No author listed'],
      title: volumeInfo.title || 'Untitled book',
      description: volumeInfo.description || 'No description available.',
      image: safeHttpsUrl(thumbnail),
      link: safeHttpsUrl(volumeInfo.infoLink || volumeInfo.previewLink),
    };
  });

const SearchBooks = () => {
  const [searchedBooks, setSearchedBooks] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());
  const [searchError, setSearchError] = useState('');
  const [lastSearch, setLastSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const loggedIn = Auth.loggedIn();

  const savedBookIdSet = useMemo(() => new Set(savedBookIds), [savedBookIds]);
  const { data: meData } = useQuery(GET_ME, {
    skip: !loggedIn,
    fetchPolicy: 'cache-and-network',
  });

  const [saveBook, { loading: isSaving }] = useMutation(SAVE_BOOK, {
    update(cache, { data }) {
      if (data?.saveBook) {
        cache.writeQuery({
          query: GET_ME,
          data: { me: data.saveBook },
        });
      }
    },
  });

  useEffect(() => {
    saveBookIds(savedBookIds);
  }, [savedBookIds]);

  useEffect(() => {
    if (meData?.me?.savedBooks) {
      setSavedBookIds(meData.me.savedBooks.map((book) => book.bookId));
    }
  }, [meData]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const trimmedSearch = searchInput.trim();
    if (!trimmedSearch) {
      return;
    }

    try {
      setIsSearching(true);
      setSearchError('');
      setLastSearch(trimmedSearch);

      const response = await searchGoogleBooks(trimmedSearch);

      if (!response.ok) {
        throw new Error('Google Books did not return a successful response.');
      }

      const { items = [] } = await response.json();
      setSearchedBooks(normalizeBookResults(items).filter((book) => book.bookId));
      setSearchInput('');
    } catch (err) {
      console.error(err);
      setSearchError('The search service is unavailable right now. Please try again shortly.');
      setSearchedBooks([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveBook = async (bookId) => {
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);

    if (!bookToSave || !loggedIn || savedBookIdSet.has(bookId)) {
      return;
    }

    try {
      const { data } = await saveBook({ variables: { bookData: bookToSave } });
      const savedBooks = data?.saveBook?.savedBooks || [];
      setSavedBookIds(savedBooks.map((book) => book.bookId));
    } catch (err) {
      console.error(err);
      setSearchError('That book could not be saved. Please refresh and try again.');
    }
  };

  return (
    <>
      <section className='hero'>
        <Container>
          <Row className='align-items-end gy-3'>
            <Col lg={5}>
              <h1>Find Your Next Book</h1>
            </Col>
            <Col lg={7}>
              <Form onSubmit={handleFormSubmit}>
                <Row className='g-2'>
                  <Col md={8}>
                    <Form.Control
                      aria-label='Search for a book'
                      name='searchInput'
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      type='search'
                      size='lg'
                      placeholder='Search by title, author, or keyword'
                    />
                  </Col>
                  <Col md={4} className='d-grid'>
                    <Button
                      type='submit'
                      variant='success'
                      size='lg'
                      disabled={isSearching || !searchInput.trim()}
                    >
                      {isSearching ? (
                        <>
                          <Spinner animation='border' size='sm' className='me-2' />
                          Searching
                        </>
                      ) : (
                        'Search'
                      )}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
        </Container>
      </section>

      <Container className='page-section'>
        {searchError && (
          <Alert dismissible variant='danger' onClose={() => setSearchError('')}>
            {searchError}
          </Alert>
        )}

        <div className='section-heading'>
          <h2>
            {searchedBooks.length
              ? `Viewing ${searchedBooks.length} result${searchedBooks.length === 1 ? '' : 's'}`
              : lastSearch
                ? `No books found for "${lastSearch}"`
                : 'Search for a book to begin'}
          </h2>
        </div>

        <Row xs={1} md={2} xl={3} className='g-4'>
          {searchedBooks.map((book) => {
            const isSaved = savedBookIdSet.has(book.bookId);
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
                      {loggedIn && (
                        <Button
                          disabled={isSaved || isSaving}
                          variant={isSaved ? 'secondary' : 'info'}
                          onClick={() => handleSaveBook(book.bookId)}
                        >
                          {isSaved ? 'Saved' : 'Save Book'}
                        </Button>
                      )}
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

export default SearchBooks;
