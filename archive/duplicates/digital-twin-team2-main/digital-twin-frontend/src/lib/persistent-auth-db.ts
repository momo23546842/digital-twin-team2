import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'users-db.json');

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
}

interface UsersDB {
  users: User[];
}

// Initialize database with default users
function initializeDB(): UsersDB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading database:', error);
  }

  // Default database with test users
  const defaultDB: UsersDB = {
    users: [
      {
        id: 'user_test',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      },
      {
        id: 'user_demo',
        email: 'demo@example.com',
        password: 'demo12345',
        name: 'Demo User',
      },
    ],
  };

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2));
  } catch (error) {
    console.error('Error writing default database:', error);
  }

  return defaultDB;
}

// Read current database
function readDB(): UsersDB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading database:', error);
  }
  return initializeDB();
}

// Write to database
function writeDB(db: UsersDB): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error writing database:', error);
  }
}

export const persistentAuthDB = {
  getUserByEmail: (email: string): User | undefined => {
    const db = readDB();
    return db.users.find((u) => u.email === email);
  },

  createUser: (email: string, password: string, name: string): User => {
    const db = readDB();
    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      password,
      name,
    };
    db.users.push(newUser);
    writeDB(db);
    console.log('User created and persisted:', email);
    return newUser;
  },

  userExists: (email: string): boolean => {
    const db = readDB();
    return db.users.some((u) => u.email === email);
  },

  getAllUsers: (): User[] => {
    const db = readDB();
    return db.users;
  },
};
