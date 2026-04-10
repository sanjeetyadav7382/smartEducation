const mongoose = require('mongoose');
const Quiz = require('./models/Quiz');
const connectDB = require('./config/db');

const seedData = [
    {
        question: "Which of the following is not a Javascript data type?",
        options: ["Undefined", "Number", "Boolean", "Float"],
        answer: 3
    },
    {
        question: "What does CSS stand for?",
        options: ["Cascading Style Sheets", "Computer Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"],
        answer: 0
    },
    {
        question: "In HTML, which tag is used to define an internal style sheet?",
        options: ["<script>", "<css>", "<style>", "<link>"],
        answer: 2
    },
    {
        question: "What is the primary language used to structure a web page?",
        options: ["HTML", "Python", "CSS", "C++"],
        answer: 0
    }
];

const seedDatabase = async () => {
    try {
        await connectDB();
        await Quiz.deleteMany({});
        await Quiz.insertMany(seedData);
        console.log('Quizzes seeded successfully! 🌱');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
