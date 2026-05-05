import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  ApolloClient,
  InMemoryCache,
} from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { createHttpLink } from '@apollo/client/link/http';
import { setContext } from '@apollo/client/link/context';
import SearchBooks from './pages/SearchBooks';
import SavedBooks from './pages/SavedBooks';
import Navbar from './components/Navbar';
import Auth from './utils/auth';

const httpLink = createHttpLink({
  uri: '/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = Auth.getToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Book: {
        keyFields: ['bookId'],
      },
    },
  }),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' element={<SearchBooks />} />
          <Route path='/saved' element={<SavedBooks />} />
          <Route
            path='*'
            element={
              <main className='not-found'>
                <h1>Page not found</h1>
              </main>
            }
          />
        </Routes>
      </Router>
    </ApolloProvider>
  );
}

export default App;
