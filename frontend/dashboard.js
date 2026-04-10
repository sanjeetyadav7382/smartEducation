// Navigation Logic
const views = ['dashboard', 'timer', 'notes', 'quizzes', 'focus'];
const viewData = {
    'dashboard': { title: 'Dashboard', sub: 'Ready to crush your goals today?' },
    'timer': { title: 'Study Timer', sub: 'Focus mode activated.' },
    'notes': { title: 'Notes', sub: 'Jot down important thoughts.' },
    'quizzes': { title: 'Quizzes', sub: 'Test your knowledge.' },
    'focus': { title: 'AI Focus Detector', sub: 'Smart tracking for optimal study habits.' }
};

function switchView(viewName, element) {
    // Update nav active state
    document.querySelectorAll('#mainNav li').forEach(li => li.classList.remove('active'));
    element.classList.add('active');

    // Update Titles
    document.getElementById('pageTitle').textContent = viewData[viewName].title;
    document.getElementById('pageSubtitle').textContent = viewData[viewName].sub;

    // Hide all views, display the right one
    views.forEach(v => {
        const el = document.getElementById(v + '-view');
        if (el) {
            el.style.display = (v === viewName) ? (v === 'dashboard' ? 'block' : 'flex') : 'none';
            if(v === viewName) {
                // Re-trigger animation
                el.style.animation = 'none';
                el.offsetHeight; /* trigger reflow */
                el.style.animation = null; 
            }
        }
    });
}

// Timer Logic
let timeInCenti = 25 * 60 * 100; // Time in centiseconds (1/100 sec)
let initialTime = 25 * 60 * 100;
let timerInterval = null;
let isRunning = false;

const circle = document.getElementById('timerProgress');
// radius is 140, circumference is 2 * PI * 140 ~= 879.6
const circumference = 2 * Math.PI * 140;

function updateTimerDisplay() {
    let totalSeconds = Math.ceil(timeInCenti / 100);
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    document.getElementById('timeDisplay').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
    // Update circle progress
    let progress = timeInCenti / initialTime;
    let offset = circumference - (progress * circumference);
    if(circle) circle.style.strokeDashoffset = offset;
}

function setTimer(minutes) {
    initialTime = minutes * 60 * 100;
    timeInCenti = initialTime;
    updateTimerDisplay();
    if (isRunning) toggleTimer(); // Stop if running
}

function toggleTimer() {
    const btn = document.getElementById('startBtn');
    if (isRunning) {
        clearInterval(timerInterval);
        btn.innerHTML = '<i class="fa-solid fa-play"></i> Start Timer';
        btn.classList.remove('btn-reset');
        btn.classList.add('btn-play');
        isRunning = false;
    } else {
        if (timeInCenti <= 0) timeInCenti = initialTime; // Prevent start if 0
        timerInterval = setInterval(() => {
            timeInCenti -= 1; // Decrease by 1 centisecond
            if(timeInCenti % 100 === 0 || timeInCenti === 0) updateTimerDisplay(); // UI update
            
            if (timeInCenti <= 0) {
                clearInterval(timerInterval);
                isRunning = false;
                btn.innerHTML = '<i class="fa-solid fa-play"></i> Start Timer';
                btn.classList.remove('btn-reset');
                btn.classList.add('btn-play');
                updateTimerDisplay();
                alert("Time's up! Great job studying.");
            }
        }, 10);
        btn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause Timer';
        btn.classList.remove('btn-play');
        btn.classList.add('btn-reset'); // Reuse reset color theme for pausing
        isRunning = true;
    }
}

function resetTimer() {
    if (isRunning) toggleTimer(); // Stop
    timeInCenti = initialTime;
    updateTimerDisplay();
}

// Notes Logic
document.addEventListener("DOMContentLoaded", async () => {
    // Initial display config
    updateTimerDisplay();

    // Previous simple animation for dashboard stats
    const stats = document.querySelectorAll('.stat-card h3');
    stats.forEach(stat => {
        stat.style.opacity = 0;
        stat.style.transform = 'translateY(10px)';
        stat.style.transition = 'all 0.5s ease out';
        setTimeout(() => {
            stat.style.opacity = 1;
            stat.style.transform = 'translateY(0)';
        }, 300);
    });

    // Fetch notes from Backend API
    try {
        const response = await fetch('http://localhost:5000/api/notes');
        if(response.ok) {
            const notes = await response.json();
            if(notes && notes.length > 0) {
                // Populate the exact scratch-pad Note content
                document.getElementById('notesArea').value = notes[0].content;
            }
        }
    } catch(err) {
        console.warn("Backend unavailable, loading from local storage.", err);
        // Fallback to local storage if API is down
        const savedNotes = localStorage.getItem('smartEduNotes');
        if (savedNotes) {
            document.getElementById('notesArea').value = savedNotes;
        }
    }
});
    

async function saveNotes() {
    const text = document.getElementById('notesArea').value;
    const msg = document.getElementById('saveMsg');
    
    // Backup locally
    localStorage.setItem('smartEduNotes', text);
    
    try {
        // Send to backend DB
        const response = await fetch('http://localhost:5000/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: text })
        });
        
        if (response.ok) {
            msg.textContent = "Saved to Database!";
            msg.style.color = "#34d399";
        } else {
            msg.textContent = "API error, saved locally!";
            msg.style.color = "#fbbf24";
        }
    } catch(err) {
        msg.textContent = "Offline, saved locally!";
        msg.style.color = "#fbbf24";
    }
    
    msg.style.opacity = 1;
    setTimeout(() => { msg.style.opacity = 0; }, 2000);
}

function logout() {
    window.location.href = 'index.html';
}

// Quiz Logic
const quizData = [
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
    }
];

let currentQuestionIndex = 0;
let score = 0;

function startQuiz() {
    document.getElementById('quizSetup').style.display = 'block';
    document.getElementById('quizResults').style.display = 'none';
    document.getElementById('quizActive').style.display = 'flex';
    document.getElementById('quizSetup').style.display = 'none';
    currentQuestionIndex = 0;
    score = 0;
    loadQuestion();
}

function loadQuestion() {
    const q = quizData[currentQuestionIndex];
    document.getElementById('quizProgress').textContent = `Question ${currentQuestionIndex + 1} / ${quizData.length}`;
    document.getElementById('quizScore').textContent = `Score: ${score}`;
    document.getElementById('questionText').textContent = q.question;
    
    const container = document.getElementById('optionsContainer');
    container.innerHTML = '';
    
    q.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.textContent = opt;
        btn.onclick = () => selectOption(index, btn);
        container.appendChild(btn);
    });
    
    document.getElementById('nextBtn').style.display = 'none';
}

function selectOption(selectedIndex, selectedBtn) {
    const q = quizData[currentQuestionIndex];
    const options = document.querySelectorAll('.quiz-option');
    
    // Disable all options
    options.forEach(opt => opt.disabled = true);
    
    if(selectedIndex === q.answer) {
        selectedBtn.classList.add('correct');
        score++;
        document.getElementById('quizScore').textContent = `Score: ${score}`;
    } else {
        selectedBtn.classList.add('wrong');
        options[q.answer].classList.add('correct');
    }
    
    document.getElementById('nextBtn').style.display = 'inline-block';
}

function nextQuestion() {
    currentQuestionIndex++;
    if(currentQuestionIndex < quizData.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById('quizActive').style.display = 'none';
    document.getElementById('quizResults').style.display = 'block';
    document.getElementById('finalScore').textContent = `You scored ${score} out of ${quizData.length}!`;
}

function resetQuiz() {
    document.getElementById('quizResults').style.display = 'none';
    document.getElementById('quizSetup').style.display = 'block';
}

// Real AI Focus logic is now handled by frontend/js/app.js & ui-manager.js
