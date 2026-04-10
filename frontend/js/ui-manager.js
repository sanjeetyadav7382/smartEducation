class UIManager {
    constructor() {
        // State
        this.isRunning = false;

        // Elements
        this.startBtn = document.getElementById('cameraToggle');
        this.focusScoreEl = document.getElementById('focusScoreMetric');
        this.focusProgressEl = document.getElementById('focus-progress');
        this.postureStatusEl = document.getElementById('focusStatus');
        this.postureIconBg = document.getElementById('posture-icon-bg');
        this.postureIcon = document.getElementById('posture-icon');
        
        this.cameraOverlay = document.getElementById('camera-overlay');
        
        // Chart
        this.ctx = document.getElementById('focusChart').getContext('2d');
        this.focusChart = new Chart(this.ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Focus Score',
                    data: [],
                    borderColor: '#58a6ff',
                    backgroundColor: 'rgba(88, 166, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#8b949e', maxTicksLimit: 10 }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#8b949e' }
                    }
                },
                animation: {
                    duration: 0
                }
            }
        });
        
        this.notifications = new window.NotificationSystem();
    }

    setLoading(isLoading) {
        const loader = document.getElementById('model-loader');
        if(isLoading) {
            loader.classList.remove('hidden');
        } else {
            loader.classList.add('hidden');
        }
    }

    setSessionState(isRunning) {
        this.isRunning = isRunning;
        if(isRunning) {
            this.startBtn.style.background = 'rgba(248, 113, 113, 0.4)';
            this.startBtn.innerHTML = '<i class="fa-solid fa-video-slash"></i> Stop Detector';
            this.cameraOverlay.style.display = 'none';
            this.notifications.info('Session Started', 'Focus tracking is now active.');
            
            // Add a log entry
            const logs = document.getElementById('aiLogs');
            if(logs) logs.innerHTML = `<li style="padding: 0.5rem; font-size: 0.8rem; background: rgba(52, 211, 153, 0.2); border-left: 2px solid #34d399; margin-bottom: 0.5rem;"><i class="fa-solid fa-camera"></i> Tracking active.</li>` + logs.innerHTML;
        } else {
            this.startBtn.style.background = 'var(--primary)';
            this.startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start Detector';
            this.cameraOverlay.style.display = 'flex';
            this.updateFocusScore(0);
            this.updatePostureStatus('Waiting', 'neutral');
            
            const logs = document.getElementById('aiLogs');
            if(logs) logs.innerHTML = `<li style="padding: 0.5rem; font-size: 0.8rem; background: rgba(248, 113, 113, 0.2); border-left: 2px solid #f87171; margin-bottom: 0.5rem;"><i class="fa-solid fa-ban"></i> Tracking suspended.</li>` + logs.innerHTML;
        }
    }

    updateFocusScore(score) {
        const rounded = Math.round(score);
        this.focusScoreEl.textContent = rounded;
        // Update conic gradient (0 to 360deg based on percentage)
        const degrees = (rounded / 100) * 360;
        this.focusProgressEl.style.setProperty('--progress', `${degrees}deg`);
        
        // Color changes based on score
        if (score > 70) {
            this.focusProgressEl.style.background = `conic-gradient(var(--success-color) var(--progress), rgba(255,255,255,0.1) 0deg)`;
        } else if (score > 40) {
            this.focusProgressEl.style.background = `conic-gradient(var(--warning-color) var(--progress), rgba(255,255,255,0.1) 0deg)`;
        } else {
            this.focusProgressEl.style.background = `conic-gradient(var(--danger-color) var(--progress), rgba(255,255,255,0.1) 0deg)`;
        }
    }

    updatePostureStatus(status, stateClass) {
        this.postureStatusEl.textContent = status;
        this.postureStatusEl.className = `status-text ${stateClass}`;
        
        let icon = 'user';
        let bg = 'rgba(255, 255, 255, 0.05)';
        let color = 'var(--text-muted)';
        
        if (stateClass === 'good') {
            icon = 'user-check';
            bg = 'rgba(35, 134, 54, 0.1)';
            color = 'var(--success-color)';
        } else if (stateClass === 'warning') {
            icon = 'user-minus';
            bg = 'rgba(210, 153, 34, 0.1)';
            color = 'var(--warning-color)';
        } else if (stateClass === 'danger') {
            icon = 'user-xmark';
            bg = 'rgba(218, 54, 51, 0.1)';
            color = 'var(--danger-color)';
        }

        this.postureIconBg.style.background = bg;
        this.postureIconBg.style.color = color;
        this.postureIcon.className = `fa-solid fa-${icon}`;
    }

    addChartDataPoint(label, score) {
        if (!this.isRunning) return;
        const labels = this.focusChart.data.labels;
        const data = this.focusChart.data.datasets[0].data;

        labels.push(label);
        data.push(score);

        // Keep last 60 points
        if (labels.length > 60) {
            labels.shift();
            data.shift();
        }

        this.focusChart.update();
    }
}

window.UIManager = UIManager;
