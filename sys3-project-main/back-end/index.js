const express      = require('express');
const session      = require('express-session');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const path         = require('path');
const fs           = require('fs');
const jwt          = require('jsonwebtoken');

require('dotenv').config();

const app        = express();
const PORT       = process.env.PORT || 30100;
const JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret-change-this';

// Allowed origins for CORS — add new ones here as needed
const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:30100',
    'http://88.200.63.148:3000',
    'http://88.200.63.148:30100',
];

const corsOptions = {
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl)
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Session must be set up before the JWT middleware below
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,   // set to true when serving over HTTPS
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
}));

// Decode a Bearer JWT (sent by the React frontend) and populate req.session
// so all route handlers can use req.session.logged_in / req.session.user
// without needing to know whether the client is using sessions or tokens.
app.use((req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.session.logged_in = true;
            req.session.user = {
                id:       decoded.id,
                username: decoded.username,
                email:    decoded.email,
            };
        } catch {
            // Invalid or expired token — routes will return 401 naturally
        }
    }
    next();
});

// Routes
const usersRouter     = require('./routes/users');
const carsRouter      = require('./routes/cars');
const providersRouter = require('./routes/providers');

const reviews = require('./routes/reviews');
app.use('/reviews', reviews);

app.use('/users',      usersRouter);
app.use('/cars',       carsRouter);
app.use('/providers',  providersRouter);

// Serve the React production build
const frontendBuildPath = path.join(__dirname, '..', 'front-end', 'build');
const buildPath = frontendBuildPath;

console.log(`Frontend build path: ${buildPath}`);
if (!fs.existsSync(buildPath)) {
    console.error(`Frontend build not found at ${buildPath}. Build the frontend first.`);
    process.exit(1);
}

app.use(express.static(buildPath));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Catch-all: let React Router handle client-side navigation
app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));