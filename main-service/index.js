const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const users = []; // In-memory user storage
const candidates = []; // In-memory candidate storage
const secretKey = 'your_secret_key'; // Use a more secure key in production

app.post('/api/register', (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
    const id = users.length + 1;
    users.push({ id, first_name, last_name, email, password_hash: hashedPassword });
    res.status(201).send({ message: 'User registered successfully' });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return res.status(401).send({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '1h' });
    res.send({ token });
});

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send({ message: 'No token provided' });
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) return res.status(500).send({ message: 'Failed to authenticate token' });
        req.userId = decoded.id;
        next();
    });
};

app.post('/api/protected', verifyToken, (req, res) => {
    res.send({ message: 'This is a protected route' });
});

app.post('/api/candidate', verifyToken, (req, res) => {
    const { first_name, last_name, email } = req.body;
    const userId = req.userId;
    const id = candidates.length + 1;
    candidates.push({ id, first_name, last_name, email, user_id: userId });
    res.status(201).send({ message: 'Candidate added successfully' });
});

app.get('/api/candidate', verifyToken, (req, res) => {
    const userId = req.userId;
    const userCandidates = candidates.filter(c => c.user_id === userId);
    res.send(userCandidates);
});

app.get('/api/public/profile', verifyToken, async (req, res) => {
    try {
        const response = await axios.post('http://localhost:3001/api/public/profile', {}, {
            headers: { 'x-api-key': 'public_api_key' }
        });
        res.send(response.data);
    } catch (error) {
        res.status(500).send({ message: 'Error communicating with public API' });
    }
});

app.get('/api/public/candidate', verifyToken, async (req, res) => {
    try {
        const response = await axios.get('http://localhost:3001/api/public/candidate', {
            headers: { 'x-api-key': 'public_api_key' }
        });
        res.send(response.data);
    } catch (error) {
        res.status(500).send({ message: 'Error communicating with public API' });
    }
});

app.listen(3000, () => {
    console.log('Main service listening on port 3000');
});
