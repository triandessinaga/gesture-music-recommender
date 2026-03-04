# 📚 Tutorial Lengkap - Gesture-Based Music Recommender

Tutorial ini akan memandu Anda memahami setiap komponen sistem secara mendalam.

## 📑 Daftar Isi

1. [Pengenalan Sistem](#1-pengenalan-sistem)
2. [Setup dan Instalasi](#2-setup-dan-instalasi)
3. [Memahami MediaPipe Hands](#3-memahami-mediapipe-hands)
4. [Neural Network untuk Gesture](#4-neural-network-untuk-gesture)
5. [Neural Collaborative Filtering](#5-neural-collaborative-filtering)
6. [Integrasi Sistem](#6-integrasi-sistem)
7. [Eksperimen dan Modifikasi](#7-eksperimen-dan-modifikasi)
8. [Deployment](#8-deployment)

---

## 1. Pengenalan Sistem

### 1.1 Apa itu Gesture-Based Recommendation?

Sistem ini menggunakan gesture tangan sebagai input untuk menentukan mood/preferensi user, kemudian memberikan rekomendasi musik yang sesuai.

**Alur Kerja:**
```
Gesture Tangan → Deteksi → Klasifikasi → Mood → Rekomendasi Musik
```

### 1.2 Mengapa Gesture, Bukan Ekspresi Wajah?

✅ **Keuntungan Gesture:**
- Lebih mudah dikontrol oleh user
- Lebih akurat (rule-based + ML)
- Tidak terpengaruh pencahayaan wajah
- Privacy-friendly (tidak perlu scan wajah)
- Fun dan interaktif

### 1.3 Komponen Utama

1. **Frontend**: HTML + CSS + JavaScript
2. **Computer Vision**: MediaPipe Hands
3. **Deep Learning**: TensorFlow.js
4. **Recommendation**: Neural Collaborative Filtering

---

## 2. Setup dan Instalasi

### 2.1 Persiapan Environment

**Yang Anda Butuhkan:**
```bash
✓ Browser modern (Chrome/Firefox/Edge)
✓ Webcam
✓ Python 3.x atau Node.js
✓ Text editor (VS Code recommended)
✓ Git (untuk version control)
```

### 2.2 Clone dan Setup

```bash
# Clone repository
git clone <your-repo-url>
cd gesture-music-recommender

# Jalankan local server
python -m http.server 8000

# Atau dengan Node.js
npx http-server -p 8000
```

### 2.3 Struktur Project

```
gesture-music-recommender/
│
├── index.html              # UI utama
├── style.css              # Styling
│
├── gestureDetector.js     # Gesture recognition
├── ncfRecommender.js      # Recommendation engine
├── app.js                 # Main application
│
├── README.md              # Dokumentasi utama
└── TUTORIAL.md            # File ini
```

---

## 3. Memahami MediaPipe Hands

### 3.1 Apa itu MediaPipe?

MediaPipe adalah framework dari Google untuk building perception pipelines. MediaPipe Hands menggunakan CNN untuk mendeteksi dan track tangan secara real-time.

### 3.2 Hand Landmarks

MediaPipe mendeteksi **21 landmarks** per tangan:

```
Landmarks Index:
0  - Wrist (pergelangan tangan)
1-4   - Thumb (jempol)
5-8   - Index finger (telunjuk)
9-12  - Middle finger (tengah)
13-16 - Ring finger (manis)
17-20 - Pinky (kelingking)
```

**Visualisasi:**
```
        8  12  16  20
        |   |   |   |
        7  11  15  19
        |   |   |   |
        6  10  14  18
        |   |   |   |
    4   5   9  13  17
    |   └───┴───┴───┘
    3
    |
    2
    |
    1
    |
    0 (wrist)
```

### 3.3 Koordinat Landmarks

Setiap landmark memiliki 3 koordinat:
- **x**: Horizontal position (0-1, left to right)
- **y**: Vertical position (0-1, top to bottom)
- **z**: Depth (relative to wrist)

### 3.4 Implementasi di Code

```javascript
// Inisialisasi MediaPipe Hands
this.hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

// Konfigurasi
this.hands.setOptions({
    maxNumHands: 1,              // Deteksi 1 tangan
    modelComplexity: 1,          // 0=lite, 1=full
    minDetectionConfidence: 0.7, // Threshold deteksi
    minTrackingConfidence: 0.7   // Threshold tracking
});

// Callback untuk hasil
this.hands.onResults((results) => {
    if (results.multiHandLandmarks) {
        const landmarks = results.multiHandLandmarks[0];
        // Process landmarks...
    }
});
```

---

## 4. Neural Network untuk Gesture

### 4.1 Arsitektur Model

```javascript
Model: Sequential
_________________________________________________________________
Layer (type)                 Output Shape              Param #
=================================================================
dense_1 (Dense)              [null, 128]               8192
batch_normalization_1        [null, 128]               512
dropout_1 (Dropout)          [null, 128]               0
_________________________________________________________________
dense_2 (Dense)              [null, 64]                8256
batch_normalization_2        [null, 64]                256
dropout_2 (Dropout)          [null, 64]                0
_________________________________________________________________
dense_3 (Dense)              [null, 32]                2080
_________________________________________________________________
output (Dense)               [null, 3]                 99
=================================================================
Total params: 19,395
Trainable params: 19,011
Non-trainable params: 384
```

### 4.2 Penjelasan Layer

**1. Input Layer (63 features)**
```javascript
// 21 landmarks × 3 koordinat = 63 features
const features = [];
for (let i = 0; i < landmarks.length; i++) {
    features.push(landmarks[i].x);
    features.push(landmarks[i].y);
    features.push(landmarks[i].z);
}
```

**2. Dense Layer 1 (128 neurons)**
- Activation: ReLU
- Purpose: Feature extraction
- Formula: `output = max(0, input × weights + bias)`

**3. Batch Normalization**
- Normalize activations
- Stabilize training
- Reduce internal covariate shift

**4. Dropout (0.3)**
- Randomly drop 30% neurons
- Prevent overfitting
- Force network to learn robust features

**5. Output Layer (3 neurons)**
- Activation: Softmax
- Output: Probability distribution
- Formula: `softmax(x_i) = exp(x_i) / Σ exp(x_j)`

### 4.3 Training Process

```javascript
// Generate training data
const trainingData = this.generateTrainingData();

// Convert to tensors
const xs = tf.tensor2d(trainingData.features);
const ys = tf.tensor2d(trainingData.labels);

// Train model
await this.model.fit(xs, ys, {
    epochs: 100,              // Jumlah iterasi
    batchSize: 16,            // Sample per batch
    validationSplit: 0.2,     // 20% untuk validasi
    shuffle: true,            // Shuffle data
    callbacks: {
        onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch}: loss=${logs.loss}`);
        }
    }
});
```

### 4.4 Gesture Detection Rules

**Peace Sign (✌️) - Girang:**
```javascript
const isPeaceSign = (
    indexExtended &&      // Telunjuk terangkat
    middleExtended &&     // Tengah terangkat
    !ringExtended &&      // Manis dilipat
    !pinkyExtended        // Kelingking dilipat
);
```

**Thumbs Up (👍) - Serius:**
```javascript
const isThumbsUp = (
    thumbExtended &&      // Jempol terangkat
    !indexExtended &&     // Lainnya dilipat
    !middleExtended &&
    !ringExtended &&
    !pinkyExtended
);
```

**Thumbs Down (👎) - Sedih:**
```javascript
const isThumbsDown = (
    !thumbExtended &&           // Jempol tidak terangkat
    thumbTip.y > palmBase.y &&  // Jempol di bawah telapak
    !indexExtended &&           // Lainnya dilipat
    !middleExtended
);
```

---

## 5. Neural Collaborative Filtering

### 5.1 Konsep NCF

**Paper: He et al. (2017) - Neural Collaborative Filtering**

NCF menggantikan matrix factorization tradisional dengan neural network untuk learning user-item interactions.

**Traditional Matrix Factorization:**
```
Rating ≈ User_embedding · Item_embedding
```

**Neural Collaborative Filtering:**
```
Rating ≈ MLP(User_embedding ⊕ Item_embedding)
```

### 5.2 Arsitektur NCF

```javascript
// User Input (6D)          Item Input (6D)
//      ↓                          ↓
//      └──────────┬───────────────┘
//                 ↓
//          Concatenation (12D)
//                 ↓
//      Dense(128, ReLU) + Dropout(0.3)
//                 ↓
//      Dense(64, ReLU) + Dropout(0.2)
//                 ↓
//      Dense(32, ReLU)
//                 ↓
//      Dense(1, Sigmoid)
//                 ↓
//      Preference Score (0-1)
```

### 5.3 Feature Engineering

**User Features (Emotion-based):**
```javascript
emotionFeatures = {
    'Girang': [1.0, 0.0, 0.0, 0.9, 0.8, 0.9],
    //         [happy, sad, neutral, energy, valence, danceability]
    
    'Sedih': [0.0, 1.0, 0.0, 0.2, 0.1, 0.2],
    
    'Serius': [0.0, 0.0, 1.0, 0.5, 0.5, 0.3]
};
```

**Item Features (Song-based):**
```javascript
songFeatures = {
    'Happy - Pharrell': [1.0, 0.0, 0.0, 0.95, 0.9, 0.95],
    'Someone Like You': [0.0, 0.98, 0.0, 0.25, 0.15, 0.20],
    'Time - Hans Zimmer': [0.0, 0.0, 0.98, 0.60, 0.50, 0.30]
};
```

### 5.4 Training NCF

**Positive & Negative Sampling:**
```javascript
// Positive sample: Emotion matches song
User: Girang [1.0, 0.0, 0.0, 0.9, 0.8, 0.9]
Item: Happy  [1.0, 0.0, 0.0, 0.95, 0.9, 0.95]
Label: 1 (match)

// Negative sample: Emotion doesn't match
User: Girang [1.0, 0.0, 0.0, 0.9, 0.8, 0.9]
Item: Sad    [0.0, 0.98, 0.0, 0.25, 0.15, 0.20]
Label: 0 (no match)
```

### 5.5 Prediction & Ranking

```javascript
// Untuk setiap lagu, hitung preference score
for (const song of allSongs) {
    const userFeature = emotionFeatures[userEmotion];
    const itemFeature = song.features;
    
    const score = model.predict([userFeature, itemFeature]);
    scores.push({ song, score });
}

// Sort by score (descending)
scores.sort((a, b) => b.score - a.score);

// Return top-10
return scores.slice(0, 10);
```

---

## 6. Integrasi Sistem

### 6.1 Alur Data Lengkap

```
1. User tunjukkan gesture
   ↓
2. MediaPipe deteksi hand landmarks (21 × 3D)
   ↓
3. Extract features (63 dimensions)
   ↓
4. Neural Network klasifikasi gesture
   ↓
5. Heuristic rules validation
   ↓
6. Voting mechanism (3 detik sampling)
   ↓
7. Final gesture determination
   ↓
8. Map gesture → emotion features (6D)
   ↓
9. NCF compute preference scores
   ↓
10. Rank songs by score
   ↓
11. Display top-10 recommendations
```

### 6.2 Real-time Processing

```javascript
// Processing loop
async processFrame() {
    if (!this.isRunning) return;
    
    // Send frame ke MediaPipe
    await this.gestureDetector.hands.send({ 
        image: this.videoElement 
    });
    
    // Request next frame (60 FPS)
    requestAnimationFrame(() => this.processFrame());
}
```

### 6.3 Smoothing & Stability

**Problem:** Gesture detection bisa flicker (berubah-ubah cepat)

**Solution:** Voting mechanism
```javascript
// Kumpulkan 15 samples dalam 3 detik
this.gestureHistory = [];
this.historySize = 15;

// Ambil gesture yang paling sering muncul
getMostFrequentEmotion() {
    const frequency = {};
    for (const gesture of this.gestureHistory) {
        frequency[gesture] = (frequency[gesture] || 0) + 1;
    }
    return mostFrequentGesture;
}
```

---

## 7. Eksperimen dan Modifikasi

### 7.1 Eksperimen 1: Ubah Arsitektur Neural Network

**Original:**
```javascript
128 → 64 → 32 → 3
```

**Coba:**
```javascript
// Lebih dalam
256 → 128 → 64 → 32 → 3

// Lebih lebar
256 → 256 → 128 → 3

// Lebih shallow
64 → 32 → 3
```

**Cara Modifikasi:**
```javascript
// Di gestureDetector.js, method buildModel()
tf.layers.dense({
    units: 256,  // Ubah ini
    activation: 'relu'
})
```

### 7.2 Eksperimen 2: Tambah Gesture Baru

**Contoh: OK Sign (👌)**

1. **Tambah label:**
```javascript
this.gestureLabels = ['Girang', 'Sedih', 'Serius', 'OK'];
```

2. **Tambah detection rule:**
```javascript
// Jempol dan telunjuk membentuk lingkaran
const isOKSign = (
    Math.abs(thumbTip.x - indexTip.x) < 0.05 &&
    Math.abs(thumbTip.y - indexTip.y) < 0.05 &&
    middleExtended &&
    ringExtended &&
    pinkyExtended
);
```

3. **Tambah training data:**
```javascript
generateOKSignFeatures() {
    // Generate synthetic features
}
```

### 7.3 Eksperimen 3: Improve NCF

**Tambah User History:**
```javascript
class NCFRecommender {
    constructor() {
        this.userHistory = new Map();
    }
    
    recordInteraction(userId, songId, action) {
        // Track: play, skip, like, etc.
        this.userHistory.set(userId, {
            played: [...],
            liked: [...],
            skipped: [...]
        });
    }
    
    getPersonalizedRecommendations(userId, emotion) {
        const history = this.userHistory.get(userId);
        // Adjust recommendations based on history
    }
}
```

### 7.4 Eksperimen 4: A/B Testing

```javascript
// Variant A: Pure NCF
// Variant B: Hybrid (NCF + Content-based)

class ABTest {
    assignVariant(userId) {
        return Math.random() < 0.5 ? 'A' : 'B';
    }
    
    trackMetrics(userId, variant, metrics) {
        // CTR, engagement time, satisfaction
    }
}
```

---

## 8. Deployment

### 8.1 Deploy ke GitHub Pages

```bash
# 1. Push ke GitHub
git add .
git commit -m "Initial commit"
git push origin main

# 2. Enable GitHub Pages
# Settings → Pages → Source: main branch

# 3. Access at:
# https://username.github.io/repo-name/
```

### 8.2 Deploy ke Vercel

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Follow prompts
# Project akan live di: https://project-name.vercel.app
```

### 8.3 Deploy ke Netlify

```bash
# 1. Drag & drop folder ke netlify.com
# Atau

# 2. Connect GitHub repo
# Netlify akan auto-deploy setiap push
```

### 8.4 Considerations untuk Production

**Performance:**
- Minify JavaScript
- Compress images
- Use CDN untuk libraries
- Lazy load components

**Security:**
- HTTPS only
- Content Security Policy
- Rate limiting
- Input validation

**Monitoring:**
- Google Analytics
- Error tracking (Sentry)
- Performance monitoring
- User feedback

---

## 9. Pertanyaan Diskusi

### 9.1 Conceptual Questions

1. Mengapa NCF lebih baik dari Matrix Factorization tradisional?
2. Apa kelebihan dan kekurangan gesture-based input?
3. Bagaimana mengatasi cold start problem?
4. Apa trade-off antara model complexity dan inference speed?

### 9.2 Technical Questions

1. Bagaimana cara menambah gesture baru?
2. Apa fungsi Batch Normalization?
3. Mengapa menggunakan Dropout?
4. Bagaimana cara improve accuracy?

### 9.3 Practical Questions

1. Bagaimana deploy ke production?
2. Bagaimana handle multiple users?
3. Bagaimana scale sistem ini?
4. Apa privacy concerns?

---

## 10. Resources Tambahan

### 10.1 Papers

- **NCF**: https://arxiv.org/abs/1708.05031
- **MediaPipe**: https://arxiv.org/abs/1906.08172
- **Deep Learning Book**: https://www.deeplearningbook.org/

### 10.2 Documentation

- **TensorFlow.js**: https://www.tensorflow.org/js
- **MediaPipe Hands**: https://google.github.io/mediapipe/solutions/hands
- **Web APIs**: https://developer.mozilla.org/en-US/docs/Web/API

### 10.3 Tutorials

- **TensorFlow.js Tutorials**: https://www.tensorflow.org/js/tutorials
- **MediaPipe Examples**: https://mediapipe.dev/
- **Recommendation Systems**: https://developers.google.com/machine-learning/recommendation

---

## 📝 Checklist Pembelajaran

- [ ] Menjalankan aplikasi successfully
- [ ] Memahami alur data end-to-end
- [ ] Membaca dan memahami semua file code
- [ ] Melakukan minimal 1 eksperimen
- [ ] Membuat dokumentasi eksperimen
- [ ] Deploy aplikasi ke cloud
- [ ] Presentasi hasil ke kelas

---

**Selamat belajar! 🚀**

*"The best way to learn is by doing!"*
