const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const users   = express.Router();
const DB      = require('../db/dbConn.js');

const SALT_ROUNDS = 10;
const JWT_SECRET  = process.env.JWT_SECRET || 'jwt-secret-change-this';

// POST /users/login
users.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                user: null,
                status: { success: false, msg: 'Username and password are required' },
            });
        }

        const rows = await DB.AuthUser(username);

        if (rows.length === 0) {
            return res.status(401).json({
                user: null,
                status: { success: false, msg: 'Username not registered' },
            });
        }

        const dbUser = rows[0];
        const passwordMatch = await bcrypt.compare(password, dbUser.password);

        if (!passwordMatch) {
            return res.status(401).json({
                user: null,
                status: { success: false, msg: 'Username or password incorrect' },
            });
        }

        // Persist the user in the server-side session
        req.session.logged_in = true;
        req.session.user = {
            id:       dbUser.userId,
            username: dbUser.username,
            email:    dbUser.email,
        };

        await new Promise((resolve, reject) =>
            req.session.save(err => (err ? reject(err) : resolve()))
        );

        // Issue a JWT so the React frontend can authenticate cross-origin requests
        const token = jwt.sign(
            { id: dbUser.userId, username: dbUser.username, email: dbUser.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            user:   req.session.user,
            status: { success: true, msg: 'Logged in' },
            token,
        });

    } catch (err) {
        console.error('POST /users/login error:', err);
        return res.status(500).json({ status: { success: false, msg: 'Server error' } });
    }
});

// POST /users/register
users.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({
                status: { success: false, msg: 'All fields are required' },
            });
        }

        const existing = await DB.CheckUserExists(username, email);
        if (existing.length > 0) {
            return res.status(409).json({
                status: { success: false, msg: 'Username or email already registered' },
            });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const result = await DB.AddUser(username, email, hashedPassword);

        if (result.affectedRows) {
            return res.status(201).json({
                status: { success: true, msg: 'New user created' },
            });
        }

        return res.status(500).json({
            status: { success: false, msg: 'User could not be created' },
        });

    } catch (err) {
        console.error('POST /users/register error:', err);
        return res.status(500).json({ status: { success: false, msg: 'Server error' } });
    }
});

// GET /users/logout
users.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ status: { success: false, msg: 'Logout failed' } });
        }
        res.clearCookie('connect.sid');
        return res.status(200).json({ status: { success: true, msg: 'Logged out' } });
    });
});

// GET /users/session — lets the frontend check if the user is still logged in
users.get('/session', (req, res) => {
    if (req.session.logged_in) {
        return res.status(200).json({ logged_in: true, user: req.session.user });
    }
    return res.status(200).json({ logged_in: false, user: null });
});

module.exports = users;