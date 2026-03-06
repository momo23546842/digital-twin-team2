// Simple in-memory user storage (for demo purposes)
// In production, use a real database like PostgreSQL

interface StoredUser {
  id: string;
  email: string;
  name: string;
  password: string; // In production, this should be hashed
}

// Use a simple JSON file-like storage via localStorage in backend
const USERS_KEY = 'digital_twin_users';

// Initialize default users
if (typeof global !== 'undefined' && !global.users) {
  global.users = [
    {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123', // Demo password
    },
  ];
}

declare global {
  var users: StoredUser[];
}

export function getUserByEmail(email: string): StoredUser | undefined {
  if (!global.users) {
    global.users = [];
  }
  return global.users.find((u) => u.email === email);
}

export function createUser(
  email: string,
  password: string,
  name: string
): StoredUser {
  if (!global.users) {
    global.users = [];
  }

  const existingUser = getUserByEmail(email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  const newUser: StoredUser = {
    id: `user-${Date.now()}`,
    email,
    password,
    name,
  };

  global.users.push(newUser);
  return newUser;
}

export function validatePassword(
  stored: string,
  provided: string
): boolean {
  // In production, use bcrypt or similar
  return stored === provided;
}

export function generateToken(userId: string): string {
  // In production, use JWT
  return `token-${userId}-${Date.now()}`;
}
