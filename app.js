/**
 * APLIKASI UTAMA - Gesture-Based Music Recommender
 * ================================================
 */

class App {
    constructor() {
        this.gestureDetector = null;
        this.musicRecommender = null;
        this.camera = null;
        this.isRunning = false;
        this.videoElement = null;
        this.canvasElement = null;
        this.canvasCtx = null;
        
        // Untuk stabilitas deteksi dengan timer
        this.gestureHistory = [];
        this.historySize = 15;
        this.detectionTimer = null;
        this.detectionDuration = 3000;
        this.isDetecting = false;
        this.lastGesture = null;
        
        this.detectionMode = 'idle';
    }

    /**
     * Inisialisasi aplikasi
     */
    async initialize() {
        console.log('🚀 Memulai aplikasi...');
        
        // Setup UI elements
        this.videoElement = document.getElementById('webcam');
        this.canvasElement = document.getElementById('canvas');
        this.canvasCtx = this.canvasElement.getContext('2d');
        
        // Inisialisasi komponen
        this.gestureDetector = new GestureDetector();
        this.musicRecommender = new NCFRecommender();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Update status
        document.getElementById('modelStatus').textContent = '⏳ Loading models...';
        
        // Inisialisasi gesture detector
        await this.gestureDetector.initialize();
        
        // Inisialisasi NCF recommender
        await this.musicRecommender.initialize();
        
        // Update status
        document.getElementById('modelStatus').textContent = '✅ Models ready!';
        document.getElementById('modelStatus').classList.add('ready');
        
        console.log('✅ Aplikasi siap digunakan!');
        console.log('💡 Klik "Mulai Deteksi" untuk memulai');
    }

    /**
     * Setup event listeners untuk UI controls
     */
    setupEventListeners() {
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        
        startBtn.addEventListener('click', () => {
            console.log('🖱️ Start button clicked');
            this.startDetection();
        });
        
        stopBtn.addEventListener('click', () => {
            console.log('🖱️ Stop button clicked');
            this.stop();
        });
        
        console.log('✅ Event listeners setup');
    }

    /**
     * Mulai proses deteksi gesture dengan timer
     */
    async startDetection() {
        console.log('🎬 startDetection called, mode:', this.detectionMode);
        
        if (this.detectionMode === 'detecting') {
            console.log('⚠️ Deteksi sedang berlangsung...');
            return;
        }
        
        // Reset state
        this.gestureHistory = [];
        this.detectionMode = 'detecting';
        this.isDetecting = true;
        
        // Update UI
        document.getElementById('startBtn').disabled = true;
        document.getElementById('startBtn').textContent = 'Mendeteksi...';
        document.getElementById('emotionResult').textContent = 'Mendeteksi...';
        document.getElementById('confidence').textContent = 'Tunjukkan gesture Anda...';
        
        console.log('🎬 Mulai deteksi gesture selama 3 detik...');
        
        // Mulai camera jika belum
        if (!this.isRunning) {
            await this.start();
        }
        
        // Set timer
        let countdown = 3;
        const countdownInterval = setInterval(() => {
            document.getElementById('confidence').textContent = `Mendeteksi... ${countdown} detik`;
            countdown--;
            
            if (countdown < 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);
        
        // Setelah 3 detik, finalisasi hasil
        this.detectionTimer = setTimeout(() => {
            this.finalizeDetection();
            clearInterval(countdownInterval);
        }, this.detectionDuration);
    }

    /**
     * Mulai camera
     */
    async start() {
        if (this.isRunning) return;
        
        console.log('▶️ Memulai camera...');
        
        try {
            // Request akses kamera
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            
            this.videoElement.srcObject = stream;
            
            // Tunggu video ready
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    resolve();
                };
            });
            
            // Set canvas size sesuai video
            this.canvasElement.width = this.videoElement.videoWidth;
            this.canvasElement.height = this.videoElement.videoHeight;
            
            // Setup MediaPipe Hands callback
            this.gestureDetector.hands.onResults((results) => {
                this.onHandsResults(results);
            });
            
            // Mulai processing loop
            this.isRunning = true;
            this.processFrame();
            
            // Update UI
            document.getElementById('stopBtn').disabled = false;
            
            console.log('✅ Camera started');
            
        } catch (error) {
            console.error('❌ Error mengakses kamera:', error);
            alert('Tidak dapat mengakses kamera. Pastikan Anda memberikan izin akses kamera.');
        }
    }

    /**
     * Stop camera
     */
    stop() {
        if (!this.isRunning) return;
        
        console.log('⏹️ Menghentikan camera...');
        
        this.isRunning = false;
        
        // Stop video stream
        if (this.videoElement.srcObject) {
            const tracks = this.videoElement.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            this.videoElement.srcObject = null;
        }
        
        // Clear canvas
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        
        // Update UI
        document.getElementById('stopBtn').disabled = true;
        
        console.log('✅ Camera stopped');
    }

    /**
     * Processing loop untuk setiap frame video
     */
    async processFrame() {
        if (!this.isRunning) return;
        
        // Send frame ke MediaPipe Hands
        await this.gestureDetector.hands.send({ image: this.videoElement });
        
        // Request next frame
        requestAnimationFrame(() => this.processFrame());
    }

    /**
     * Callback ketika MediaPipe Hands mendeteksi tangan
     */
    async onHandsResults(results) {
        // Clear canvas
        this.canvasCtx.save();
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        
        // Draw video frame
        this.canvasCtx.drawImage(
            results.image, 
            0, 0, 
            this.canvasElement.width, 
            this.canvasElement.height
        );
        
        // Jika tangan terdeteksi DAN sedang dalam mode deteksi
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            
            // Visualisasi hand landmarks
            this.drawHandLandmarks(landmarks);
            
            // Hanya prediksi jika sedang dalam mode detecting
            if (this.isDetecting) {
                try {
                    const prediction = await this.gestureDetector.predictGesture(landmarks);
                    
                    if (prediction && prediction.emotion && prediction.emotion !== 'Memproses...') {
                        // Tambahkan ke history
                        this.gestureHistory.push(prediction.emotion);
                        
                        console.log('📊 Sample collected:', {
                            gesture: prediction.emotion,
                            confidence: (prediction.confidence * 100).toFixed(1) + '%',
                            totalSamples: this.gestureHistory.length
                        });
                        
                        // Show real-time preview
                        const currentMajority = this.getMostFrequentEmotion();
                        document.getElementById('emotionResult').textContent = currentMajority + ' (preview)';
                    }
                } catch (error) {
                    console.error('❌ Error in prediction:', error);
                }
            }
        } else {
            // Tidak ada tangan terdeteksi
            if (this.isDetecting) {
                console.warn('⚠️ No hand detected');
            }
        }
        
        this.canvasCtx.restore();
    }

    /**
     * Visualisasi hand landmarks di canvas
     */
    drawHandLandmarks(landmarks) {
        // Draw connections
        const connections = [
            [0,1],[1,2],[2,3],[3,4], // Thumb
            [0,5],[5,6],[6,7],[7,8], // Index
            [0,9],[9,10],[10,11],[11,12], // Middle
            [0,13],[13,14],[14,15],[15,16], // Ring
            [0,17],[17,18],[18,19],[19,20], // Pinky
            [5,9],[9,13],[13,17] // Palm
        ];
        
        this.canvasCtx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
        this.canvasCtx.lineWidth = 2;
        
        for (const [start, end] of connections) {
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];
            
            this.canvasCtx.beginPath();
            this.canvasCtx.moveTo(
                startPoint.x * this.canvasElement.width,
                startPoint.y * this.canvasElement.height
            );
            this.canvasCtx.lineTo(
                endPoint.x * this.canvasElement.width,
                endPoint.y * this.canvasElement.height
            );
            this.canvasCtx.stroke();
        }
        
        // Draw landmark points
        for (let i = 0; i < landmarks.length; i++) {
            const landmark = landmarks[i];
            
            // Finger tips are larger
            const isTip = [4, 8, 12, 16, 20].includes(i);
            const radius = isTip ? 6 : 4;
            const color = isTip ? 'rgba(255, 0, 0, 0.9)' : 'rgba(0, 255, 0, 0.9)';
            
            this.canvasCtx.fillStyle = color;
            this.canvasCtx.beginPath();
            this.canvasCtx.arc(
                landmark.x * this.canvasElement.width,
                landmark.y * this.canvasElement.height,
                radius,
                0,
                2 * Math.PI
            );
            this.canvasCtx.fill();
        }
    }

    /**
     * Finalisasi hasil deteksi
     */
    finalizeDetection() {
        this.isDetecting = false;
        this.detectionMode = 'completed';
        
        console.log('✅ Deteksi selesai! Total samples:', this.gestureHistory.length);
        
        if (this.gestureHistory.length === 0) {
            console.warn('⚠️ Tidak ada gesture terkumpul');
            document.getElementById('emotionResult').textContent = 'Tidak terdeteksi';
            document.getElementById('confidence').textContent = 'Silakan coba lagi';
            this.resetDetectionButton();
            return;
        }
        
        // Hitung gesture yang paling sering muncul
        const finalGesture = this.getMostFrequentEmotion();
        const confidence = this.calculateConfidence(finalGesture);
        
        console.log('🎭 Hasil Final:', {
            gesture: finalGesture,
            confidence: confidence,
            samples: this.gestureHistory.length
        });
        
        // Update UI
        this.updateEmotionDisplay(finalGesture, confidence);
        
        // Generate rekomendasi
        console.log('🎵 Generating recommendations...');
        this.musicRecommender.renderRecommendations(finalGesture);
        
        // Update button
        this.resetDetectionButton();
    }

    /**
     * Reset button untuk deteksi ulang
     */
    resetDetectionButton() {
        document.getElementById('startBtn').disabled = false;
        document.getElementById('startBtn').textContent = 'Deteksi Ulang';
        this.detectionMode = 'idle';
    }

    /**
     * Hitung confidence berdasarkan konsistensi hasil
     */
    calculateConfidence(gesture) {
        const count = this.gestureHistory.filter(g => g === gesture).length;
        const confidence = count / this.gestureHistory.length;
        return confidence;
    }

    /**
     * Smoothing: ambil gesture yang paling sering muncul dari history
     */
    getMostFrequentEmotion() {
        const frequency = {};
        let maxCount = 0;
        let mostFrequent = this.gestureHistory[0];
        
        for (const gesture of this.gestureHistory) {
            frequency[gesture] = (frequency[gesture] || 0) + 1;
            
            if (frequency[gesture] > maxCount) {
                maxCount = frequency[gesture];
                mostFrequent = gesture;
            }
        }
        
        return mostFrequent;
    }

    /**
     * Update tampilan gesture di UI
     */
    updateEmotionDisplay(gesture, confidence) {
        const emotionResult = document.getElementById('emotionResult');
        const confidenceDisplay = document.getElementById('confidence');
        
        emotionResult.textContent = gesture;
        confidenceDisplay.textContent = `Confidence: ${(confidence * 100).toFixed(1)}%`;
        
        // Ubah warna badge berdasarkan gesture
        emotionResult.style.background = this.getEmotionColor(gesture);
    }

    /**
     * Dapatkan warna untuk setiap gesture
     */
    getEmotionColor(gesture) {
        const colors = {
            'Girang': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'Sedih': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'Serius': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'Tidak terdeteksi': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        };
        
        return colors[gesture] || colors['Tidak terdeteksi'];
    }
}

/**
 * Inisialisasi aplikasi ketika halaman selesai dimuat
 */
window.addEventListener('DOMContentLoaded', async () => {
    console.log('📱 DOM loaded, initializing app...');
    
    const app = new App();
    await app.initialize();
    
    // Simpan instance untuk debugging
    window.app = app;
});
