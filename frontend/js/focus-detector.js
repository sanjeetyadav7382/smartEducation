import { FilesetResolver, FaceLandmarker } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

export class FocusDetector {
    constructor() {
        this.faceLandmarker = null;
        this.isReady = false;
        this.videoWidth = 640;
        this.videoHeight = 480;
    }

    async initialize() {
        try {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
            );
            
            this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                    delegate: "GPU"
                },
                outputFaceBlendshapes: true,
                outputFacialTransformationMatrixes: true,
                runningMode: "VIDEO",
                numFaces: 1
            });
            this.isReady = true;
            console.log("Focus Detector (FaceLandmarker) Initialized");
        } catch (error) {
            console.error("Failed to load FaceLandmarker:", error);
            throw error;
        }
    }

    /**
     * Analyze frame and return a focus score (0 to 100)
     */
    detect(videoElement, timeMs) {
        if (!this.isReady || !this.faceLandmarker) return { score: 0, lookingAway: true, blendshapes: null };

        // Process video frame
        const results = this.faceLandmarker.detectForVideo(videoElement, timeMs);

        if (results.faceLandmarks.length > 0) {
            // Compute head pose using facial transformation matrices
            const matrices = results.facialTransformationMatrixes;
            let score = 100;
            let lookingAway = false;
            
            if (matrices && matrices.length > 0) {
                // Simplified extraction of Yaw and Pitch from the 4x4 Transformation Matrix
                const m = matrices[0].data;
                const yaw = Math.atan2(m[1], m[5]) * (180 / Math.PI);
                const pitch = Math.atan2(-m[9], Math.sqrt(m[10]*m[10] + m[8]*m[8])) * (180 / Math.PI);
                
                // If head is turned significantly on yaw or pitch, distract user
                const maxYaw = 25; // degrees thresholds
                const maxPitch = 25;
                
                if (Math.abs(yaw) > maxYaw || Math.abs(pitch) > maxPitch) {
                    // Penalty scales with rotation
                    score -= Math.max(Math.abs(yaw), Math.abs(pitch)) * 2;
                    if (score < 0) score = 0;
                    lookingAway = true;
                }
            }
            
            // Check eye closed or blinking (from blendshapes)
            const blendshapes = results.faceBlendshapes[0].categories;
            const eyeBlinkLeft = blendshapes.find(b => b.categoryName === 'eyeBlinkLeft')?.score || 0;
            const eyeBlinkRight = blendshapes.find(b => b.categoryName === 'eyeBlinkRight')?.score || 0;
            
            // If eyes are heavily closed for extended frame, it lowers focus
            if (eyeBlinkLeft > 0.8 && eyeBlinkRight > 0.8) {
                score -= 30; // Drop score substantially if eyes closed
                if (score < 0) score = 0;
            }

            return { score, lookingAway, landmarks: results.faceLandmarks[0] };
        }

        // Face not found
        return { score: 0, lookingAway: true, landmarks: null };
    }
}
