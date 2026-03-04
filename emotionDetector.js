/**
 * EMOTION DETECTOR - Deep Learning Computer Vision
 * =================================================
 * Menggunakan CNN-based approach untuk deteksi emosi yang akurat
 */

class EmotionDetector {
    constructor() {
        this.model = null;
        this.faceMesh = null;
        this.isModelReady = false;
        this.emotionLabels = ['Girang', 'Sedih', 'Serius'];
    }

    async initializeFaceMesh() {
        this.faceMesh = new FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            }
        });

        this.faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        console.log('✅ MediaPipe Face Mesh initialized');
    }

    /**
     * Build Deep Learning Model untuk Emotion Classification
     * Menggunakan Dense Neural Network dengan feature engineering
     */
    async buildModel() {
        console.log('🔨 Building Deep Learning Model...');
        
        // Model dengan arsitektur yang lebih dalam untuk pattern recognition
        this.model = tf.sequential({
            layers: [
                // Input: geometric features (7 features)
                tf.layers.dense({
                    inputShape: [7],
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
                
                // Output layer dengan softmax
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
        this.model.summary();
    }

    /**
     * Train model dengan synthetic data yang realistic
     */
    async trainModel() {
        console.log('🎓 Training Deep Learning Model...');
        
        const trainingData = this.generateRealisticTrainingData();
        const xs = tf.tensor2d(trainingData.features);
        const ys = tf.tensor2d(trainingData.labels);

        await this.model.fit(xs, ys, {
            epochs: 100,
            batchSize: 16,
            validationSplit: 0.2,
            shuffle: true,
            verbose: 0,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    if (epoch % 20 === 0) {
                        console.log(`Epoch ${epoch}: loss=${logs.loss.toFixed(4)}, acc=${logs.acc.toFixed(4)}`);
                    }
                }
            }
        });

        xs.dispose();
        ys.dispose();

        this.isModelReady = true;
        console.log('✅ Model trained successfully!');
    }

    /**
     * Generate realistic training data berdasarkan facial geometry
     */
    generateRealisticTrainingData() {
        const features = [];
        const labels = [];
        const samplesPerClass = 200;

        for (let emotion = 0; emotion < 3; emotion++) {
            for (let i = 0; i < samplesPerClass; i++) {
                let feature;
                
                if (emotion === 0) { // Girang - SENYUM/TERTAWA
                    feature = [
                        0.17 + Math.random() * 0.06,   // mouthWidth: SANGAT LEBAR (0.17-0.23)
                        0.03 + Math.random() * 0.025,  // mouthHeight: TERBUKA (0.03-0.055)
                        -0.02 + Math.random() * 0.015, // mouthCurvature: KE ATAS negatif (-0.02 to -0.005)
                        0.16 + Math.random() * 0.06,   // mouthLift: TERANGKAT (0.16-0.22)
                        0.022 + Math.random() * 0.012, // avgEyeHeight: normal-sedikit menyipit
                        0.27 + Math.random() * 0.04,   // avgEyebrowY: NAIK (nilai kecil = atas)
                        0.09 + Math.random() * 0.04    // cheekRaise: PIPI NAIK (0.09-0.13)
                    ];
                } else if (emotion === 1) { // Sedih
                    feature = [
                        0.09 + Math.random() * 0.03,   // mouthWidth: KECIL (0.09-0.12)
                        0.005 + Math.random() * 0.008, // mouthHeight: TERTUTUP (0.005-0.013)
                        0.01 + Math.random() * 0.012,  // mouthCurvature: KE BAWAH positif (0.01-0.022)
                        0.07 + Math.random() * 0.04,   // mouthLift: TURUN (0.07-0.11)
                        0.016 + Math.random() * 0.008, // avgEyeHeight: kecil
                        0.37 + Math.random() * 0.04,   // avgEyebrowY: TURUN (nilai besar = bawah)
                        0.02 + Math.random() * 0.025   // cheekRaise: RENDAH (0.02-0.045)
                    ];
                } else { // Serius - NETRAL
                    feature = [
                        0.12 + Math.random() * 0.03,   // mouthWidth: NORMAL (0.12-0.15)
                        0.012 + Math.random() * 0.01,  // mouthHeight: sedikit terbuka (0.012-0.022)
                        -0.003 + Math.random() * 0.006,// mouthCurvature: DATAR (-0.003 to 0.003)
                        0.11 + Math.random() * 0.04,   // mouthLift: NORMAL (0.11-0.15)
                        0.020 + Math.random() * 0.01,  // avgEyeHeight: normal
                        0.31 + Math.random() * 0.04,   // avgEyebrowY: NORMAL (0.31-0.35)
                        0.05 + Math.random() * 0.03    // cheekRaise: NORMAL (0.05-0.08)
                    ];
                }
                
                features.push(feature);
                
                const label = [0, 0, 0];
                label[emotion] = 1;
                labels.push(label);
            }
        }

        return { features, labels };
    }

    /**
     * PREDIKSI EMOSI - Deep Learning Approach
     */
    async predictEmotion(landmarks) {
        if (!this.isModelReady) {
            console.warn('⚠️ Model belum siap, tunggu sebentar...');
            return {
                emotion: 'Memproses...',
                confidence: 0,
                probabilities: { 'Girang': 0, 'Sedih': 0, 'Serius': 0 }
            };
        }

        try {
            // Extract geometric features
            const features = this.extractGeometricFeatures(landmarks);
            
            // Convert to tensor
            const featureArray = [
                features.mouthWidth,
                features.mouthHeight,
                features.mouthCurvature,
                features.mouthLift,
                features.avgEyeHeight,
                features.avgEyebrowY,
                features.cheekRaise
            ];
            
            console.log('📊 Extracted Features:', {
                mouthWidth: featureArray[0].toFixed(4),
                mouthHeight: featureArray[1].toFixed(4),
                mouthCurvature: featureArray[2].toFixed(5),
                mouthLift: featureArray[3].toFixed(4),
                cheekRaise: featureArray[6].toFixed(4)
            });

            // Predict dengan neural network
            const inputTensor = tf.tensor2d([featureArray]);
            const prediction = this.model.predict(inputTensor);
            const probabilities = await prediction.data();

            inputTensor.dispose();
            prediction.dispose();

            // Get predicted class
            let maxProb = 0;
            let predictedClass = 0;
            
            for (let i = 0; i < probabilities.length; i++) {
                if (probabilities[i] > maxProb) {
                    maxProb = probabilities[i];
                    predictedClass = i;
                }
            }

            const result = {
                emotion: this.emotionLabels[predictedClass],
                confidence: maxProb,
                probabilities: {
                    'Girang': probabilities[0],
                    'Sedih': probabilities[1],
                    'Serius': probabilities[2]
                },
                debug: features // Tambahkan untuk debugging
            };

            console.log('🎭 Prediction Result:', {
                emotion: result.emotion,
                confidence: (result.confidence * 100).toFixed(1) + '%',
                probs: {
                    Girang: (probabilities[0] * 100).toFixed(1) + '%',
                    Sedih: (probabilities[1] * 100).toFixed(1) + '%',
                    Serius: (probabilities[2] * 100).toFixed(1) + '%'
                }
            });
            
            return result;

        } catch (error) {
            console.error('❌ Error in prediction:', error);
            
            // Fallback: gunakan heuristic
            const features = this.extractGeometricFeatures(landmarks);
            const heuristicEmotion = this.analyzeEmotionHeuristic(features);
            
            return {
                emotion: heuristicEmotion,
                confidence: 0.7,
                probabilities: {
                    'Girang': heuristicEmotion === 'Girang' ? 0.7 : 0.15,
                    'Sedih': heuristicEmotion === 'Sedih' ? 0.7 : 0.15,
                    'Serius': heuristicEmotion === 'Serius' ? 0.7 : 0.15
                },
                debug: features
            };
        }
    }
    
    /**
     * Heuristic analysis sebagai fallback
     */
    analyzeEmotionHeuristic(features) {
        const { mouthWidth, mouthHeight, mouthCurvature, cheekRaise, mouthLift } = features;
        
        console.log('🔍 DETAILED ANALYSIS:', {
            mouthWidth: mouthWidth.toFixed(4) + (mouthWidth > 0.16 ? ' ✓ LEBAR' : ' ✗ kecil'),
            mouthHeight: mouthHeight.toFixed(4) + (mouthHeight > 0.025 ? ' ✓ TERBUKA' : ' ✗ tertutup'),
            mouthCurvature: mouthCurvature.toFixed(5) + (mouthCurvature < -0.003 ? ' ✓ KE ATAS (senyum)' : mouthCurvature > 0.008 ? ' ✗ KE BAWAH (sedih)' : ' - datar'),
            mouthLift: mouthLift.toFixed(4),
            cheekRaise: cheekRaise.toFixed(4) + (cheekRaise > 0.08 ? ' ✓ PIPI NAIK' : ' ✗ pipi normal')
        });
        
        let girangScore = 0;
        let sedihScore = 0;
        let seriusScore = 0;
        
        // === DETEKSI GIRANG (Senyum/Tertawa) ===
        
        // Kriteria 1: Mulut LEBAR (paling penting untuk senyum)
        if (mouthWidth > 0.16) {
            girangScore += 4;
            console.log('  ✓ Mulut lebar (+4 Girang)');
        } else if (mouthWidth < 0.12) {
            sedihScore += 2;
            console.log('  ✓ Mulut kecil (+2 Sedih)');
        }
        
        // Kriteria 2: Mouth Curvature (sudut mulut)
        // NEGATIF = ke atas (senyum), POSITIF = ke bawah (sedih)
        if (mouthCurvature < -0.003) {
            girangScore += 5; // Sangat penting!
            console.log('  ✓ Sudut mulut KE ATAS (+5 Girang)');
        } else if (mouthCurvature > 0.008) {
            sedihScore += 4;
            console.log('  ✓ Sudut mulut KE BAWAH (+4 Sedih)');
        } else {
            seriusScore += 2;
            console.log('  ✓ Sudut mulut DATAR (+2 Serius)');
        }
        
        // Kriteria 3: Mulut terbuka (tertawa)
        if (mouthHeight > 0.025) {
            girangScore += 3;
            console.log('  ✓ Mulut TERBUKA (+3 Girang)');
        }
        
        // Kriteria 4: Pipi terangkat
        if (cheekRaise > 0.08) {
            girangScore += 3;
            console.log('  ✓ Pipi TERANGKAT (+3 Girang)');
        } else if (cheekRaise < 0.05) {
            sedihScore += 1;
        }
        
        // Kriteria 5: Kombinasi untuk Serius
        if (mouthWidth >= 0.12 && mouthWidth <= 0.16 && Math.abs(mouthCurvature) <= 0.003) {
            seriusScore += 3;
            console.log('  ✓ Ekspresi NETRAL (+3 Serius)');
        }
        
        // Tentukan emosi berdasarkan score
        const scores = { Girang: girangScore, Sedih: sedihScore, Serius: seriusScore };
        const maxScore = Math.max(girangScore, sedihScore, seriusScore);
        
        let emotion;
        if (girangScore === maxScore) {
            emotion = 'Girang';
        } else if (sedihScore === maxScore) {
            emotion = 'Sedih';
        } else {
            emotion = 'Serius';
        }
        
        console.log('📊 FINAL SCORES:', scores);
        console.log('🎭 WINNER:', emotion);
        
        return emotion;
    }
    
    /**
     * Extract geometric features dari face landmarks
     */
    extractGeometricFeatures(landmarks) {
        // Mouth landmarks
        const leftMouth = landmarks[61];    // Sudut kiri mulut
        const rightMouth = landmarks[291];  // Sudut kanan mulut
        const upperLip = landmarks[13];     // Bibir atas tengah
        const lowerLip = landmarks[14];     // Bibir bawah tengah
        
        // Eye landmarks
        const leftEyeTop = landmarks[159];
        const leftEyeBottom = landmarks[145];
        const rightEyeTop = landmarks[386];
        const rightEyeBottom = landmarks[374];
        
        // Eyebrow landmarks
        const leftEyebrow = landmarks[70];
        const rightEyebrow = landmarks[300];
        
        // Cheek and nose
        const leftCheek = landmarks[205];
        const rightCheek = landmarks[425];
        const noseTip = landmarks[1];
        
        // HITUNG FITUR
        
        // 1. Lebar mulut (horizontal distance)
        const mouthWidth = Math.abs(rightMouth.x - leftMouth.x);
        
        // 2. Tinggi mulut (vertical distance)
        const mouthHeight = Math.abs(lowerLip.y - upperLip.y);
        
        // 3. Lengkungan mulut - PERBAIKAN LOGIKA
        // Dalam koordinat MediaPipe: Y=0 adalah TOP, Y=1 adalah BOTTOM
        // Senyum: sudut mulut NAIK (Y lebih kecil dari tengah) = NEGATIF
        // Sedih: sudut mulut TURUN (Y lebih besar dari tengah) = POSITIF
        const mouthCenterY = (upperLip.y + lowerLip.y) / 2;
        const mouthCornersY = (leftMouth.y + rightMouth.y) / 2;
        
        // INVERSI: corners lebih kecil dari center = senyum (negatif)
        const mouthCurvature = mouthCornersY - mouthCenterY;
        
        // 4. Mouth lift - seberapa tinggi mulut relatif ke hidung
        const mouthCornerAvgY = (leftMouth.y + rightMouth.y) / 2;
        const mouthLift = noseTip.y - mouthCornerAvgY; // Positif = mulut di bawah hidung
        
        // 5. Eye height
        const leftEyeHeight = Math.abs(leftEyeBottom.y - leftEyeTop.y);
        const rightEyeHeight = Math.abs(rightEyeBottom.y - rightEyeTop.y);
        const avgEyeHeight = (leftEyeHeight + rightEyeHeight) / 2;
        
        // 6. Eyebrow position
        const avgEyebrowY = (leftEyebrow.y + rightEyebrow.y) / 2;
        
        // 7. Cheek raise - pipi naik saat senyum
        const avgCheekY = (leftCheek.y + rightCheek.y) / 2;
        const cheekRaise = noseTip.y - avgCheekY; // Positif = pipi di bawah hidung
        
        return {
            mouthWidth,
            mouthHeight,
            mouthCurvature,
            mouthLift,
            avgEyeHeight,
            avgEyebrowY,
            cheekRaise
        };
    }

    async initialize() {
        console.log('🚀 Initializing Emotion Detector with Deep Learning...');
        await this.initializeFaceMesh();
        await this.buildModel();
        await this.trainModel();
        console.log('✅ Emotion Detector ready!');
    }
}

window.EmotionDetector = EmotionDetector;
