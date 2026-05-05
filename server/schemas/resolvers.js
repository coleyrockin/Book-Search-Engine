const { GraphQLError } = require('graphql');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const publicUserFields = '-__v -password';

const requireUser = (context, message = 'You must be logged in.') => {
  if (!context.user?._id) {
    throw new GraphQLError(message, {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  return context.user;
};

const throwBadInput = (message) => {
  throw new GraphQLError(message, {
    extensions: { code: 'BAD_USER_INPUT' },
  });
};

const cleanString = (value, fallback = '', maxLength = 5000) => {
  const cleaned = String(value || '').trim();
  return (cleaned || fallback).slice(0, maxLength);
};

const normalizeHttpsUrl = (value) => {
  const rawValue = cleanString(value, '', 2048);
  if (!rawValue) {
    return '';
  }

  try {
    const url = new URL(rawValue.replace(/^http:\/\//i, 'https://'));
    return url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
};

const normalizeBook = (bookData) => {
  const authors = Array.isArray(bookData.authors)
    ? bookData.authors.slice(0, 10).map((author) => cleanString(author, '', 120)).filter(Boolean)
    : [];

  return {
    bookId: cleanString(bookData.bookId, '', 120),
    authors: authors.length ? authors : ['No author listed'],
    title: cleanString(bookData.title, 'Untitled book', 300),
    description: cleanString(bookData.description, 'No description available.', 5000),
    image: normalizeHttpsUrl(bookData.image),
    link: normalizeHttpsUrl(bookData.link),
  };
};

const getSafeUser = (id) => User.findById(id).select(publicUserFields);

const validateNewUser = ({ username, email, password }) => {
  if (username.trim().length < 2 || username.trim().length > 40) {
    throwBadInput('Username must be between 2 and 40 characters.');
  }

  if (email.trim().length > 254 || !/.+@.+\..+/.test(email.trim())) {
    throwBadInput('A valid email address is required.');
  }

  if (password.length < 8 || password.length > 128) {
    throwBadInput('Password must be between 8 and 128 characters.');
  }
};

const resolvers = {
  Query: {
    me: async (_parent, _args, context) => {
      const user = requireUser(context);
      return getSafeUser(user._id);
    },
  },

  Mutation: {
    login: async (_parent, { email, password }) => {
      const user = await User.findOne({ email: email.trim().toLowerCase() });

      if (!user || !(await user.isCorrectPassword(password))) {
        throw new GraphQLError('Incorrect login credentials.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const token = signToken(user);
      return { token, user };
    },

    addUser: async (_parent, args) => {
      validateNewUser(args);

      const user = await User.create({
        username: args.username.trim(),
        email: args.email.trim().toLowerCase(),
        password: args.password,
      });
      const token = signToken(user);

      return { token, user };
    },

    saveBook: async (_parent, { bookData }, context) => {
      const user = requireUser(context, 'You must be logged in to save books.');
      const bookToSave = normalizeBook(bookData);

      if (!bookToSave.bookId) {
        throwBadInput('A valid Google Books id is required.');
      }

      const updatedUser = await User.findOneAndUpdate(
        {
          _id: user._id,
          'savedBooks.bookId': { $ne: bookToSave.bookId },
        },
        { $push: { savedBooks: bookToSave } },
        { new: true, runValidators: true }
      ).select(publicUserFields);

      return updatedUser || getSafeUser(user._id);
    },

    removeBook: async (_parent, { bookId }, context) => {
      const user = requireUser(context, 'You must be logged in to delete books.');
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      ).select(publicUserFields);

      return updatedUser || getSafeUser(user._id);
    },
  },
};

module.exports = resolvers;
