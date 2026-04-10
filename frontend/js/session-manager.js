class SessionManager {
    constructor(uiManager) {
        this.ui = uiManager;
        this.timerInterval = null;
        this.secondsElapsed = 0;
        this.isSessionActive = false;
        
        this.timeEl = document.getElementById('session-time');
        
        // Focus tracking logic over time
        this.recentScores = []; // Keep last few seconds to smooth out blips
        
        // Settings/Flags
        this.BREAK_INTERVAL = 45 * 60; // 45 minutes
        this.lastBreakTime = 0;
    }

    startSession() {
        this.isSessionActive = true;
        this.secondsElapsed = 0;
        this.lastBreakTime = 0;
        this.updateTimeDisplay();
        
        this.timerInterval = setInterval(() => {
            this.secondsElapsed++;
            this.updateTimeDisplay();
            this.checkBreakConditions();
            this.updateChartData();
        }, 1000);
    }

    stopSession() {
        this.isSessionActive = false;
        clearInterval(this.timerInterval);
    }

    updateTimeDisplay() {
        const h = Math.floor(this.secondsElapsed / 3600).toString().padStart(2, '0');
        const m = Math.floor((this.secondsElapsed % 3600) / 60).toString().padStart(2, '0');
        const s = (this.secondsElapsed % 60).toString().padStart(2, '0');
        this.timeEl.textContent = `${h}:${m}:${s}`;
    }

    checkBreakConditions() {
        // Suggest break every 45 minutes
        if (this.secondsElapsed - this.lastBreakTime > this.BREAK_INTERVAL) {
            this.ui.notifications.info("Break Time!", "You've been studying for a while. Take a 5-minute break.");
            this.lastBreakTime = this.secondsElapsed;
        }
    }

    // Called every frame with raw score
    reportFocusScore(score) {
        if (!this.isSessionActive) return;
        
        this.recentScores.push(score);
        if (this.recentScores.length > 30) { // ~ 1 second window at 30fps
            this.recentScores.shift();
        }

        // Calculate smoothed score
        const average = this.recentScores.reduce((a, b) => a + b, 0) / this.recentScores.length;
        
        this.ui.updateFocusScore(average);
        
        // Triggers warning if focus is low continuously
        if (average < 30) {
            this.ui.notifications.warning("Distraction Detected", "Please look back at the screen.", 10000); // 10s cooldown
        }
        
        this.currentAverageScore = average;
    }

    updateChartData() {
        // Update chart every second
        const now = new Date();
        const timeLabel = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
        this.ui.addChartDataPoint(timeLabel, this.currentAverageScore || 0);
    }
}

window.SessionManager = SessionManager;
