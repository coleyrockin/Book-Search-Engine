# Book Search Engine

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-API-E10098?style=flat&logo=graphql&logoColor=white)
![Apollo](https://img.shields.io/badge/Apollo-Client%20%2F%20Server-311C87?style=flat&logo=apollographql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000?style=flat&logo=express&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Server-339933?style=flat&logo=nodedotjs&logoColor=white)

A full-stack Google Books search engine refactored from a RESTful API to a GraphQL API built with Apollo Server and Apollo Client. Users can search for books, create an account, and save their favorite titles.

---

## About

Originally built with a RESTful API, this application was refactored to use GraphQL with Apollo Server on the back end and Apollo Client on the front end. The app allows users to search the Google Books API, view results, sign up or log in, and save books to a personal list.

## Features

- **GraphQL API** — queries and mutations replace traditional REST endpoints
- **Apollo Server** — Express.js middleware handling GraphQL schema, resolvers, and context
- **Apollo Client** — React front end with in-memory cache and reactive queries
- **JWT authentication** — secure sign-up and login with token-based auth
- **Google Books API** — search millions of books by title, author, or keyword
- **Save & manage books** — authenticated users can save and remove books from their list
- **Responsive design** — mobile-friendly UI built with React Bootstrap

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, Apollo Client, React Bootstrap |
| **Backend** | Node.js, Express.js, Apollo Server |
| **API** | GraphQL (queries & mutations) |
| **Database** | MongoDB, Mongoose ODM |
| **Auth** | JSON Web Tokens (JWT), bcrypt |
| **External API** | Google Books API |
| **Dev Tools** | Concurrently, Nodemon |

## Getting Started

```bash
# Clone the repository
git clone https://github.com/coleyrockin/Book-Search-Engine.git

# Navigate to the project
cd Book-Search-Engine

# Install all dependencies (client + server)
npm install

# Start the development server
npm run develop
```

The client runs on `http://localhost:3000` and the server on `http://localhost:3001/graphql`.

## Project Structure

```
Book-Search-Engine/
├── client/              # React front end
│   ├── src/
│   │   ├── components/  # UI components (SearchBooks, SavedBooks, LoginForm)
│   │   ├── pages/       # Page-level views
│   │   └── utils/       # Apollo queries, mutations, and auth helpers
│   └── package.json
├── server/              # Express + Apollo Server back end
│   ├── models/          # Mongoose schemas (User, Book)
│   ├── schemas/         # GraphQL typeDefs and resolvers
│   ├── utils/           # JWT auth middleware
│   └── server.js        # Express server entry point
└── package.json         # Root scripts and dev dependencies
```

---

*Built with React, GraphQL, Apollo, and MongoDB.*
