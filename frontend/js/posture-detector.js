import { FilesetResolver, PoseLandmarker } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

export class PostureDetector {
    constructor() {
        this.poseLandmarker = null;
        this.isReady = false;
        this.baselineShoulderY = null;
        
        // Settings
        this.SLOUCH_THRESHOLD = 0.05; // Relative Y difference threshold
    }

    async initialize() {
        try {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
            );
            
            this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numPoses: 1
            });
            this.isReady = true;
            console.log("Posture Detector (PoseLandmarker) Initialized");
        } catch (error) {
            console.error("Failed to load PoseLandmarker:", error);
            throw error;
        }
    }
    
    // Call this to set the "good posture" baseline
    calibrate(shoulderY) {
        this.baselineShoulderY = shoulderY;
    }

    /**
     * Analyze frame and return posture status
     * Returns: 'Good', 'Slouching', or 'Not Detected'
     */
    detect(videoElement, timeMs) {
        if (!this.isReady || !this.poseLandmarker) return { status: 'Waiting', stateClass: 'neutral', landmarks: null };

        const results = this.poseLandmarker.detectForVideo(videoElement, timeMs);

        if (results.landmarks.length > 0) {
            const pose = results.landmarks[0];
            
            // Extract Shoulder landmarks (index 11 and 12 in MediaPipe Pose)
            const leftShoulder = pose[11];
            const rightShoulder = pose[12];
            
            // Extract Nose (index 0)
            const nose = pose[0];
            
            // Visibility check
            if (leftShoulder.visibility < 0.5 || rightShoulder.visibility < 0.5) {
                return { status: 'Camera angle too high', stateClass: 'warning', landmarks: pose };
            }
            
            const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
            
            // Auto-calibrate if baseline not set
            if (!this.baselineShoulderY) {
                this.calibrate(avgShoulderY);
            }
            
            // Check for slouching (shoulders drop on Y axis, Y grows down)
            const deviation = avgShoulderY - this.baselineShoulderY;
            
            // Also check head forward posture (distance between nose and shoulders)
            const headDrop = avgShoulderY - nose.y; // Smaller means head is dropping down/forward usually
            
            if (deviation > this.SLOUCH_THRESHOLD || headDrop < 0.15) {
                return { status: 'Slouching Detected', stateClass: 'danger', landmarks: pose };
            } else if (deviation > (this.SLOUCH_THRESHOLD * 0.5)) {
                return { status: 'Slightly bent', stateClass: 'warning', landmarks: pose };
            }
            
            return { status: 'Good Posture', stateClass: 'good', landmarks: pose };
        }

        return { status: 'No Pose Detected', stateClass: 'warning', landmarks: null };
    }
}
