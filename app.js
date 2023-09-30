const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { spawn } = require('child_process');

const app = express();

app.use(bodyParser.json());

app.use('/static', express.static(path.join(__dirname, 'static')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

app.post('/process_video', (req, res) => {
    const { url } = req.body;

    const python = spawn('python3', ['pyScript.py', url]);
    
    python.stdout.on('data', (data) => {
        console.log(`Python Output: ${data}`);
    });

    python.stderr.on('data', (data) => {
        console.log(`Python process closed with error: ${data}`);
        res.json({ success: true });
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
