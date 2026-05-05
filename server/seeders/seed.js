require('dotenv').config({ quiet: true });

const { connectDb, connection } = require('../config/connection');
const { User } = require('../models');

const seedUsers = [
  {
    username: 'demo_reader',
    email: 'demo.reader@example.com',
    password: 'Password123!',
    savedBooks: [
      {
        bookId: 'zyTCAlFPjgYC',
        authors: ['J.K. Rowling'],
        title: 'Harry Potter and the Sorcerer\'s Stone',
        description: 'A young wizard begins his first year at Hogwarts.',
        image: 'https://books.google.com/books/content?id=zyTCAlFPjgYC&printsec=frontcover&img=1&zoom=1',
        link: 'https://books.google.com/books?id=zyTCAlFPjgYC',
      },
      {
        bookId: 'wrOQLV6xB-wC',
        authors: ['Mary Shelley'],
        title: 'Frankenstein',
        description: 'A scientist creates life and faces the consequences.',
        image: 'https://books.google.com/books/content?id=wrOQLV6xB-wC&printsec=frontcover&img=1&zoom=1',
        link: 'https://books.google.com/books?id=wrOQLV6xB-wC',
      },
    ],
  },
];

const seedDatabase = async () => {
  await connectDb();

  const seedEmails = seedUsers.map((user) => user.email);

  if (process.env.SEED_CLEAR_ALL === 'true') {
    await User.deleteMany({});
  } else {
    await User.deleteMany({ email: { $in: seedEmails } });
  }

  await User.create(seedUsers);
  console.log(`Seeded ${seedUsers.length} user account.`);
};

seedDatabase()
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await connection.close();
  });
