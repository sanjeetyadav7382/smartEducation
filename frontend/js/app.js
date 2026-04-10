import { FocusDetector } from './focus-detector.js';
import { PostureDetector } from './posture-detector.js';

class App {
    constructor() {
        // Core Logic Managers
        this.ui = new window.UIManager();
        this.session = new window.SessionManager(this.ui);
        
        // AI Detectors
        this.focusDetector = new FocusDetector();
        this.postureDetector = new PostureDetector();

        // DOM elements
        this.video = document.getElementById('webcam');
        this.canvas = document.getElementById('output_canvas');
        this.ctx = this.canvas.getContext('2d');
        this.startBtn = document.getElementById('cameraToggle');

        // State
        this.lastVideoTime = -1;
        this.animationFrameId = null;

        // Binds
        this.toggleSession = this.toggleSession.bind(this);
        this.predictWebcam = this.predictWebcam.bind(this);
        
        // Init bindings
        this.startBtn.addEventListener('click', this.toggleSession);

        // Resize observer
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.init();
    }

    async init() {
        this.ui.setLoading(true);
        try {
            await Promise.all([
                this.focusDetector.initialize(),
                this.postureDetector.initialize()
            ]);
            await this.setupWebcam();
            this.resizeCanvas();
            this.ui.notifications.info("System Ready", "AI models loaded successfully.");
        } catch (err) {
            console.error(err);
            this.ui.notifications.danger("Error", "Failed to initialize camera or models.");
        } finally {
            this.ui.setLoading(false);
        }
    }

    async setupWebcam() {
        return new Promise((resolve, reject) => {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    this.video.srcObject = stream;
                    this.video.addEventListener('loadeddata', resolve);
                })
                .catch(err => reject(err));
        });
    }

    resizeCanvas() {
        this.canvas.width = this.video.clientWidth;
        this.canvas.height = this.video.clientHeight;
    }

    toggleSession() {
        if (this.session.isSessionActive) {
            this.session.stopSession();
            this.ui.setSessionState(false);
            cancelAnimationFrame(this.animationFrameId);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.session.startSession();
            this.ui.setSessionState(true);
            this.predictWebcam();
        }
    }

    predictWebcam() {
        const startTimeMs = performance.now();
        
        if (this.lastVideoTime !== this.video.currentTime) {
            this.lastVideoTime = this.video.currentTime;
            
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // 1. Detect Focus (Face Head Pose + Blinking)
            const focusResult = this.focusDetector.detect(this.video, startTimeMs);
            this.session.reportFocusScore(focusResult.score);

            // 2. Detect Posture (Slouching)
            const postureResult = this.postureDetector.detect(this.video, startTimeMs);
            this.ui.updatePostureStatus(postureResult.status, postureResult.stateClass);
            
            // Posture Feedback
            if (postureResult.stateClass === 'danger') {
                this.ui.notifications.warning("Check your posture", "You are slouching.", 8000);
            }

            // Draw helpful overlays
            this.drawOverlay(focusResult, postureResult);
        }

        if (this.session.isSessionActive) {
            this.animationFrameId = requestAnimationFrame(this.predictWebcam);
        }
    }

    drawOverlay(focusResult, postureResult) {
        // We could draw landmarks using Mediapipe DrawingUtils, but simple dots are cleaner.
        // For aesthetics, we won't clutter the camera view with complex webs, just a minimal bounding box or target indicator.
        
        // Draw a light blue target reticle or overlay if head is detected
        if (focusResult.landmarks) {
            // Find nose tip (index 1 of MediaPipe face mesh)
            const nose = focusResult.landmarks[1];
            if (nose) {
                const x = nose.x * this.canvas.width;
                const y = nose.y * this.canvas.height;
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
                this.ctx.fillStyle = focusResult.lookingAway ? 'red' : '#58a6ff';
                this.ctx.fill();
            }
        }
    }
}

// Boot application
window.addEventListener('DOMContentLoaded', () => {
    new App();
});
