// Shared mock user database - In production, use a real database
// This is stored in memory during development
const usersDB = new Map<string, { id: string; email: string; password: string; name: string }>();

// Pre-populate with test users for development
usersDB.set('test@example.com', {
  id: 'user_test',
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
});

usersDB.set('demo@example.com', {
  id: 'user_demo',
  email: 'demo@example.com',
  password: 'demo12345',
  name: 'Demo User',
});

export const authDatabase = {
  getUserByEmail: (email: string) => {
    console.log('Looking up user:', email);
    console.log('Users in database:', Array.from(usersDB.keys()));
    return usersDB.get(email);
  },

  createUser: (email: string, password: string, name: string) => {
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      password, // In production, hash the password!
      name,
    };
    usersDB.set(email, newUser);
    console.log('User created:', email);
    console.log('All users now:', Array.from(usersDB.keys()));
    return newUser;
  },

  userExists: (email: string) => {
    return usersDB.has(email);
  },

  getAllUsers: () => {
    return Array.from(usersDB.values());
  },
};
