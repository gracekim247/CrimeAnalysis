const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json()); // Parse JSON body
app.use(express.static('public')); // Serve your HTML/CSS/JS from /public

// POST route to handle risk analysis
app.post('/processRisk', (req, res) => {
    const { age, sex, race, location, time } = req.body;

    console.log("Received input:", req.body);

    // For now, send back a fake result
    const fakeRiskLevel = "Medium"; // Replace with real ML logic later

    res.json({ riskLevel: fakeRiskLevel });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});