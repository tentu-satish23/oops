import express from 'express';
import { store } from '../services/store.js';

const router = express.Router();

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = store.findUserByEmail(email);
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { passwordHash, ...safeUser } = user;
  res.json({ user: safeUser, token: 'oracle_jwt_' + user.id });
});

// Signup
router.post('/signup', (req, res) => {
  const { fullName, username, email, password } = req.body;
  if (!fullName || !username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (store.findUserByEmail(email)) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const existingUsername = store.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (existingUsername) {
    return res.status(400).json({ error: 'This username is already taken' });
  }

  const newUser = store.createUser({ fullName, username, email, password });
  const { passwordHash, ...safeUser } = newUser;
  res.status(201).json({ user: safeUser, token: 'oracle_jwt_' + safeUser.id });
});

// Demo Login
router.post('/demo', (req, res) => {
  const demoUser = store.findUserById('usr_oracle_demo_01');
  const { passwordHash, ...safeUser } = demoUser;
  res.json({ user: safeUser, token: 'oracle_jwt_' + demoUser.id });
});

// Current User
router.get('/me', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr_oracle_demo_01';
  const user = store.findUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { passwordHash, ...safeUser } = user;
  res.json({ user: safeUser });
});

export default router;
