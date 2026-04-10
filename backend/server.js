const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = 5000;

// Connect to Database
try { 
    connectDB(); 
} catch(e) { 
    console.log("DB connecting pending installation."); 
}

// Middleware
app.use(cors());
app.use(express.json());

// Main Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));

// Test Root Route
app.get('/', (req, res) => {
    res.send('Smart Education Backend Running 🚀 with Mongoose & Express!');
});

// For backward compatibility with your frontend mock snippet
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if(email && password){
        res.json({ message: "Login successful! (Legacy Endpoint)" });
    } else {
        res.status(400).json({ message: "Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
