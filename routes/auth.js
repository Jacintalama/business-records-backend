'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { User } = require('../models'); // Adjust the path as necessary

// Use your JWT secret from environment or a fallback value
const JWT_SECRET = process.env.JWT_SECRET || '0216cd9396619f3abfcec489fe0697d9ce6ec029543998da9b47cb3ebd5e5444bf9d601dea2be92c858c8bc7d21f4fdd82074df0e3a0d81b9bb468286e7dbfe8';

// ─── REGISTRATION ENDPOINT ──────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    extensionName,
    username,
    password,
    confirmPassword,
    email,
  } = req.body;

  // Basic validation: Check for required fields
  if (!username || !password || !confirmPassword || !email) {
    return res.status(400).json({
      message:
        'Missing required fields: username, password, confirmPassword, and email are required',
    });
  }

  // Ensure passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    // Check if a user with the same username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user record in the database
    const newUser = await User.create({
      firstName,
      middleName,
      lastName,
      extensionName,
      username,
      password: hashedPassword,
      email,
    });

    return res.status(201).json({ message: 'Registration successful', user: newUser });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Registration failed' });
  }
});

// ─── LOGIN ENDPOINT ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Missing required fields: username and password are required' });
  }

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Extend the token expiration time to 30 days instead of 1 hour
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '30d',
    });

    // Set the token cookie with a corresponding maxAge of 30 days
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',  // Use secure flag in production
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,  // 30 days expressed in milliseconds
    });

    return res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Login failed' });
  }
});
  

// ─── "ME" ENDPOINT ──────────────────────────────────────────────────────────────────────
// Returns the authenticated user's details if the token is valid.
router.get('/me', async (req, res) => {
  console.log('Cookies received:', req.cookies);
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    return res.status(200).json({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      extensionName: user.extensionName,
      email: user.email,
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
});

// ─── UPDATE PROFILE ENDPOINT ─────────────────────────────────────────────────────────────
// This endpoint allows an authenticated user to update profile details.
// Users can update their name details and email. If the password is to be updated,
// the current password must be provided along with a new password and confirmation.
router.put('/profile', async (req, res) => {
  // Ensure the request is authenticated by checking the token
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    // Destructure fields from the request body
    const {
      firstName,
      middleName,
      lastName,
      extensionName,
      email,
      password,         // New password (if updating)
      currentPassword,  // Current password required for updating password
      confirmPassword,  // Confirmation of the new password
    } = req.body;

    // Handle password update if password fields are provided
    if (password || confirmPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to update password' });
      }

      // Verify that the current password matches the stored password
      const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'New passwords do not match' });
      }

      // Hash the new password and update the user's password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Update profile details if provided
    if (firstName !== undefined) user.firstName = firstName;
    if (middleName !== undefined) user.middleName = middleName;
    if (lastName !== undefined) user.lastName = lastName;
    if (extensionName !== undefined) user.extensionName = extensionName;

    // If updating the email, ensure it’s not already taken by another user
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(409).json({ message: 'Email already exists' });
      }
      user.email = email;
    }

    // Save changes to the database
    await user.save();

    return res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ message: 'Profile update failed' });
  }
});

// ─── LOGOUT ENDPOINT ────────────────────────────────────────────────────────────────────
// Clears the token cookie.
router.post('/logout', (req, res) => {
  res.clearCookie('token', { path: '/' });
  return res.status(200).json({ message: 'Logout successful' });
});

module.exports = router;
