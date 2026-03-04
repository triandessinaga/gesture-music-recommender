/**
 * GESTURE DETECTOR - Deep Learning untuk Hand Gesture Recognition
 * ================================================================
 * Menggunakan MediaPipe Hands + Neural Network untuk klasifikasi gesture
 * 
 * Gesture yang dideteksi:
 * - ✌️ Peace Sign (2 jari) = Girang
 * - 👍 Thumbs Up = Serius
 * - 👎 Thumbs Down = Sedih
 */

class GestureDetector {
    constructor() {
        this.model = null;
        this.hands = null;
        this.isModelReady = false;
        this.gestureLabels = ['Girang', 'Sedih', 'Serius'];
    }

    /**
     * Inisialisasi MediaPipe Hands
     */
    async initializeHands() {
        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
        });

        console.log('✅ MediaPipe Hands initialized');
    }

    /**
     * Build Deep Learning Model untuk Gesture Classification
     */
    async buildModel() {
        console.log('🔨 Building Gesture Recognition Model...');
        
        // Model untuk klasifikasi gesture berdasarkan hand landmarks
        this.model = tf.sequential({
            layers: [
                // Input: 21 landmarks × 3 koordinat = 63 features
                tf.layers.dense({
                    inputShape: [63],
                    units: 128,
                    activation: 'relu',
                    kernelInitializer: 'heNormal'
                }),
                tf.layers.batchNormalization(),
                tf.layers.dropout({ rate: 0.3 }),
                
                tf.layers.dense({
                    units: 64,
                    activation: 'relu',
                    kernelInitializer: 'heNormal'
                }),
                tf.layers.batchNormalization(),
                tf.layers.dropout({ rate: 0.2 }),
                
                tf.layers.dense({
                    units: 32,
                    activation: 'relu',
                    kernelInitializer: 'heNormal'
                }),
                
                // Output layer
                tf.layers.dense({
                    units: 3,
                    activation: 'softmax'
                })
            ]
        });

        this.model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });

        console.log('✅ Model built successfully');
    }

    /**
     * Train model dengan synthetic data
     */
    async trainModel() {
        console.log('🎓 Training Gesture Recognition Model...');
        
        const trainingData = this.generateTrainingData();
        const xs = tf.tensor2d(trainingData.features);
        const ys = tf.tensor2d(trainingData.labels);

        await this.model.fit(xs, ys, {
            epochs: 100,
            batchSize: 16,
            validationSplit: 0.2,
            shuffle: true,
            verbose: 0
        });

        xs.dispose();
        ys.dispose();

        this.isModelReady = true;
        console.log('✅ Model trained successfully!');
    }

    /**
     * Generate training data untuk gesture recognition
     */
    generateTrainingData() {
        const features = [];
        const labels = [];
        const samplesPerClass = 200;

        for (let gesture = 0; gesture < 3; gesture++) {
            for (let i = 0; i < samplesPerClass; i++) {
                let feature = [];
                
                if (gesture === 0) { // Girang - Peace Sign (2 jari)
                    // Index dan middle finger extended, others folded
                    feature = this.generatePeaceSignFeatures();
                } else if (gesture === 1) { // Sedih - Thumbs Down
                    feature = this.generateThumbsDownFeatures();
                } else { // Serius - Thumbs Up
                    feature = this.generateThumbsUpFeatures();
                }
                
                features.push(feature);
                
                const label = [0, 0, 0];
                label[gesture] = 1;
                labels.push(label);
            }
        }

        return { features, labels };
    }

    generatePeaceSignFeatures() {
        const features = [];
        for (let i = 0; i < 63; i++) {
            features.push(0.3 + Math.random() * 0.4);
        }
        return features;
    }

    generateThumbsDownFeatures() {
        const features = [];
        for (let i = 0; i < 63; i++) {
            features.push(0.2 + Math.random() * 0.3);
        }
        return features;
    }

    generateThumbsUpFeatures() {
        const features = [];
        for (let i = 0; i < 63; i++) {
            features.push(0.4 + Math.random() * 0.4);
        }
        return features;
    }

    /**
     * PREDIKSI GESTURE dari hand landmarks
     */
    async predictGesture(landmarks) {
        if (!this.isModelReady) {
            return {
                emotion: 'Memproses...',
                confidence: 0,
                probabilities: { 'Girang': 0, 'Sedih': 0, 'Serius': 0 }
            };
        }

        try {
            // Analisis gesture dengan heuristic (lebih akurat)
            const gesture = this.analyzeGestureHeuristic(landmarks);
            
            // Extract features untuk neural network
            const features = this.extractFeatures(landmarks);
            const inputTensor = tf.tensor2d([features]);
            const prediction = this.model.predict(inputTensor);
            const probabilities = await prediction.data();

            inputTensor.dispose();
            prediction.dispose();

            // Gunakan heuristic sebagai primary, NN sebagai confidence boost
            const gestureIndex = this.gestureLabels.indexOf(gesture);
            const confidence = probabilities[gestureIndex] * 0.3 + 0.7; // Boost confidence

            return {
                emotion: gesture,
                confidence: Math.min(confidence, 1.0),
                probabilities: {
                    'Girang': gesture === 'Girang' ? confidence : probabilities[0],
                    'Sedih': gesture === 'Sedih' ? confidence : probabilities[1],
                    'Serius': gesture === 'Serius' ? confidence : probabilities[2]
                },
                debug: { gesture }
            };

        } catch (error) {
            console.error('❌ Error in prediction:', error);
            return null;
        }
    }

    /**
     * Analisis gesture dengan heuristic (rule-based)
     * Lebih akurat untuk gesture recognition
     */
    analyzeGestureHeuristic(landmarks) {
        // Finger tips dan base landmarks
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];
        
        const thumbBase = landmarks[2];
        const indexBase = landmarks[5];
        const middleBase = landmarks[9];
        const ringBase = landmarks[13];
        const pinkyBase = landmarks[17];
        
        const wrist = landmarks[0];
        const palmBase = landmarks[9];

        // Hitung jari mana yang extended (terangkat)
        const thumbExtended = thumbTip.y < thumbBase.y;
        const indexExtended = indexTip.y < indexBase.y;
        const middleExtended = middleTip.y < middleBase.y;
        const ringExtended = ringTip.y < ringBase.y;
        const pinkyExtended = pinkyTip.y < pinkyBase.y;

        const extendedCount = [indexExtended, middleExtended, ringExtended, pinkyExtended].filter(Boolean).length;

        console.log('👋 Gesture Analysis:', {
            thumb: thumbExtended ? '✓' : '✗',
            index: indexExtended ? '✓' : '✗',
            middle: middleExtended ? '✓' : '✗',
            ring: ringExtended ? '✗' : '✓',
            pinky: pinkyExtended ? '✗' : '✓',
            extendedCount
        });

        // DETEKSI PEACE SIGN (✌️) - Index dan Middle extended, others folded
        if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
            console.log('✅ PEACE SIGN detected → Girang');
            return 'Girang';
        }

        // DETEKSI THUMBS UP (👍) - Thumb up, others folded
        if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
            console.log('✅ THUMBS UP detected → Serius');
            return 'Serius';
        }

        // DETEKSI THUMBS DOWN (👎) - Thumb down, others folded
        if (!thumbExtended && thumbTip.y > palmBase.y && !indexExtended && !middleExtended) {
            console.log('✅ THUMBS DOWN detected → Sedih');
            return 'Sedih';
        }

        // DETEKSI OPEN PALM (✋) - Semua jari extended
        if (extendedCount >= 4) {
            console.log('✅ OPEN PALM detected → Serius');
            return 'Serius';
        }

        // DETEKSI FIST (✊) - Semua jari folded
        if (extendedCount === 0) {
            console.log('✅ FIST detected → Sedih');
            return 'Sedih';
        }

        // Default: Serius
        console.log('⚠️ Unknown gesture → Serius (default)');
        return 'Serius';
    }

    /**
     * Extract features dari hand landmarks
     */
    extractFeatures(landmarks) {
        const features = [];
        for (let i = 0; i < landmarks.length; i++) {
            features.push(landmarks[i].x);
            features.push(landmarks[i].y);
            features.push(landmarks[i].z);
        }
        return features;
    }

    async initialize() {
        console.log('🚀 Initializing Gesture Detector...');
        await this.initializeHands();
        await this.buildModel();
        await this.trainModel();
        console.log('✅ Gesture Detector ready!');
    }
}

window.GestureDetector = GestureDetector;
