const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const apiKey = 'public_api_key'; // Use a more secure key in production

const verifyApiKey = (req, res, next) => {
    const key = req.headers['x-api-key'];
    if (key !== apiKey) {
        return res.status(403).send({ message: 'Invalid API key' });
    }
    next();
};

app.post('/api/public/profile', verifyApiKey, (req, res) => {
    // Simulating user profile retrieval
    const userProfile = { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com' };
    res.send(userProfile);
});

app.get('/api/public/candidate', verifyApiKey, (req, res) => {
    // Simulating candidate retrieval
    const userCandidates = [
        { id: 1, first_name: 'Alice', last_name: 'Smith', email: 'alice@example.com', user_id: 1 },
        { id: 2, first_name: 'Bob', last_name: 'Brown', email: 'bob@example.com', user_id: 1 }
    ];
    res.send(userCandidates);
});

app.listen(3001, () => {
    console.log('Public API service listening on port 3001');
});
