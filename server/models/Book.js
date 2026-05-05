const { Schema } = require('mongoose');

const bookSchema = new Schema(
  {
    authors: {
      type: [String],
      default: ['No author listed'],
      validate: {
        validator(authors) {
          return authors.length <= 10 && authors.every((author) => author.length <= 120);
        },
        message: 'A book can include up to 10 authors of 120 characters each.',
      },
    },
    description: {
      type: String,
      default: 'No description available.',
      trim: true,
      maxlength: 5000,
    },
    bookId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    image: {
      type: String,
      default: '',
      trim: true,
      maxlength: 2048,
    },
    link: {
      type: String,
      default: '',
      trim: true,
      maxlength: 2048,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
  },
  {
    _id: false,
  }
);

module.exports = bookSchema;
