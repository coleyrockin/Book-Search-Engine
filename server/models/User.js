const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

const bookSchema = require('./Book');

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 40,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: [/.+@.+\..+/, 'Must use a valid email address'],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 128,
    },
    savedBooks: {
      type: [bookSchema],
      default: [],
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

userSchema.pre('save', async function hashPassword(next) {
  if (this.isNew || this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  next();
});

userSchema.methods.isCorrectPassword = async function isCorrectPassword(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.virtual('bookCount').get(function getBookCount() {
  return this.savedBooks.length;
});

const User = model('User', userSchema);

module.exports = User;
