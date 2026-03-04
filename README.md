# 🎵 Gesture-Based Music Recommender System

Sistem rekomendasi musik berbasis deteksi gesture tangan menggunakan Deep Learning dan Neural Collaborative Filtering (NCF).

## 📚 Latar Belakang Akademik

Project ini dibuat untuk mata kuliah **Deep Learning for Recommendation Systems** dengan fokus pada:
- Sub-CPMK 2.2: Aplikasi deep learning dalam sistem rekomendasi
- Neural Collaborative Filtering (He et al., 2017)
- Computer Vision untuk Hand Gesture Recognition
- Hybrid Recommendation Systems

## 🎯 Tujuan Pembelajaran

Mahasiswa akan memahami:
1. Implementasi Neural Collaborative Filtering (NCF)
2. Computer Vision dengan MediaPipe Hands
3. Deep Learning untuk klasifikasi gesture
4. Content-based dan Collaborative Filtering
5. Deployment aplikasi web real-time

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE                        │
│              (HTML + CSS + JavaScript)                   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              GESTURE DETECTION MODULE                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  MediaPipe Hands (Pre-trained CNN)               │  │
│  │  - 21 hand landmarks extraction                  │  │
│  │  - Real-time hand tracking                       │  │
│  └──────────────────────────────────────────────────┘  │
│                          │                               │
│                          ▼                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Gesture Classification Neural Network           │  │
│  │  - Input: 63 features (21 landmarks × 3D)        │  │
│  │  - Hidden: 128 → 64 → 32 neurons                 │  │
│  │  - Output: 3 classes (Girang/Sedih/Serius)       │  │
│  │  - Activation: ReLU + Softmax                    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│         NEURAL COLLABORATIVE FILTERING (NCF)             │
│  ┌──────────────────────────────────────────────────┐  │
│  │  User Embedding (Emotion Features)               │  │
│  │  - 6D feature vector per emotion                 │  │
│  └──────────────────────────────────────────────────┘  │
│                          │                               │
│                          ▼                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Item Embedding (Song Features)                  │  │
│  │  - 6D feature vector per song                    │  │
│  └──────────────────────────────────────────────────┘  │
│                          │                               │
│                          ▼                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Multi-Layer Perceptron (MLP)                    │  │
│  │  - Concatenate embeddings                        │  │
│  │  - Hidden: 128 → 64 → 32 neurons                 │  │
│  │  - Output: Preference score (0-1)                │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              RECOMMENDATION OUTPUT                       │
│         Top-10 Songs with YouTube Links                  │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Cara Menjalankan

### Persyaratan
- Browser modern (Chrome, Firefox, Edge)
- Webcam
- Koneksi internet (untuk load library)
- Python 3.x atau Node.js (untuk local server)

### Langkah-langkah

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd gesture-music-recommender
   ```

2. **Jalankan local server**
   
   Menggunakan Python:
   ```bash
   python -m http.server 8000
   ```
   
   Atau menggunakan Node.js:
   ```bash
   npx http-server
   ```

3. **Buka browser**
   ```
   http://localhost:8000
   ```

4. **Tunggu model loading** (10-15 detik)
   - Anda akan melihat "✅ Models ready!"

5. **Klik "Mulai Deteksi"**
   - Izinkan akses kamera
   - Tunjukkan gesture tangan
   - Tahan gesture selama 3 detik

6. **Lihat hasil dan rekomendasi!**

## 👋 Gesture yang Digunakan

| Gesture | Emoji | Kategori | Deskripsi |
|---------|-------|----------|-----------|
| Peace Sign | ✌️ | Girang | Angkat jari telunjuk & tengah |
| Thumbs Up | 👍 | Serius | Angkat jempol ke atas |
| Thumbs Down | 👎 | Sedih | Jempol ke bawah |
| Open Palm | ✋ | Serius | Semua jari terbuka (alternatif) |
| Fist | ✊ | Sedih | Semua jari dilipat (alternatif) |

## 📁 Struktur File

```
gesture-music-recommender/
├── index.html              # Halaman utama aplikasi
├── style.css              # Styling dan layout
├── gestureDetector.js     # Model deep learning untuk gesture
├── ncfRecommender.js      # Neural Collaborative Filtering
├── app.js                 # Aplikasi utama & integrasi
├── README.md             # Dokumentasi (file ini)
└── TUTORIAL.md           # Tutorial untuk mahasiswa
```

## 🧠 Konsep Deep Learning yang Diterapkan

### 1. Hand Gesture Recognition

**MediaPipe Hands:**
- Pre-trained CNN untuk deteksi tangan
- Ekstraksi 21 3D landmarks per tangan
- Real-time tracking dengan performa tinggi

**Neural Network Classifier:**
```javascript
Input Layer (63 features)
    ↓
Dense Layer 1 (128 neurons, ReLU)
    ↓
Batch Normalization
    ↓
Dropout (0.3)
    ↓
Dense Layer 2 (64 neurons, ReLU)
    ↓
Batch Normalization
    ↓
Dropout (0.2)
    ↓
Dense Layer 3 (32 neurons, ReLU)
    ↓
Output Layer (3 neurons, Softmax)
```

**Komponen Penting:**
- **ReLU Activation**: Mengatasi vanishing gradient
- **Batch Normalization**: Stabilisasi training
- **Dropout**: Mencegah overfitting
- **Softmax**: Multi-class probability distribution

### 2. Neural Collaborative Filtering (NCF)

**Berdasarkan Paper: He et al. (2017)**

**Arsitektur:**
```javascript
User Input (6D emotion features)    Item Input (6D song features)
            ↓                                    ↓
            └────────────┬───────────────────────┘
                         ↓
                  Concatenation (12D)
                         ↓
              Dense Layer (128 neurons, ReLU)
                         ↓
                   Dropout (0.3)
                         ↓
              Dense Layer (64 neurons, ReLU)
                         ↓
                   Dropout (0.2)
                         ↓
              Dense Layer (32 neurons, ReLU)
                         ↓
            Output Layer (1 neuron, Sigmoid)
                         ↓
              Preference Score (0-1)
```

**Feature Engineering:**
- **User Features**: [happy, sad, neutral, energy, valence, danceability]
- **Item Features**: [happy, sad, neutral, energy, valence, danceability]

**Training:**
- Positive samples: Emotion matches song emotion
- Negative samples: Emotion doesn't match
- Loss: Binary Crossentropy
- Optimizer: Adam (lr=0.001)

### 3. Hybrid Approach

**Rule-Based + Deep Learning:**
- Heuristic rules untuk gesture detection (70%)
- Neural network untuk confidence boost (30%)
- Voting mechanism untuk stabilitas

## 📊 Evaluasi Model

### Metrics untuk Gesture Classification:
- **Accuracy**: Overall correctness
- **Precision**: True positives / (True positives + False positives)
- **Recall**: True positives / (True positives + False negatives)
- **F1-Score**: Harmonic mean of precision and recall

### Metrics untuk Recommendation:
- **Precision@K**: Relevant items in top-K
- **Recall@K**: Coverage of relevant items
- **NDCG**: Normalized Discounted Cumulative Gain
- **User Satisfaction**: Implicit feedback

## 🎓 Tugas untuk Mahasiswa

### Level 1: Pemahaman Dasar
1. Jalankan aplikasi dan test semua gesture
2. Buka Console (F12) dan amati log output
3. Identifikasi 3 komponen utama sistem
4. Jelaskan alur data dari input ke output

### Level 2: Analisis Kode
1. Baca dan pahami `gestureDetector.js`
2. Identifikasi arsitektur neural network
3. Jelaskan fungsi setiap layer
4. Analisis hyperparameters yang digunakan

### Level 3: Eksperimen
1. Ubah arsitektur neural network (tambah/kurangi layer)
2. Coba optimizer berbeda (SGD, RMSprop)
3. Modifikasi gesture detection rules
4. Tambah gesture baru (contoh: OK sign)

### Level 4: Pengembangan
1. Implementasi dataset real untuk training
2. Tambah fitur user profiling
3. Implementasi A/B testing
4. Deploy ke cloud (Vercel, Netlify, dll)

## 📖 Referensi

1. **He, X., et al. (2017)**. "Neural Collaborative Filtering". WWW 2017.
   - Paper utama untuk NCF
   - https://arxiv.org/abs/1708.05031

2. **Lugaresi, C., et al. (2019)**. "MediaPipe: A Framework for Building Perception Pipelines". arXiv.
   - Framework untuk hand tracking
   - https://arxiv.org/abs/1906.08172

3. **Goodfellow, I., et al. (2016)**. "Deep Learning". MIT Press.
   - Textbook fundamental deep learning

4. **TensorFlow.js Documentation**
   - https://www.tensorflow.org/js

5. **MediaPipe Hands Documentation**
   - https://google.github.io/mediapipe/solutions/hands

## 🔧 Troubleshooting

### Kamera tidak berfungsi
- Pastikan browser memiliki izin akses kamera
- Cek apakah kamera digunakan aplikasi lain
- Gunakan HTTPS atau localhost

### Model tidak load
- Pastikan koneksi internet stabil
- Tunggu hingga "✅ Models ready!" muncul
- Refresh browser (Ctrl + Shift + R)

### Gesture tidak terdeteksi
- Pastikan tangan terlihat jelas di kamera
- Pencahayaan harus cukup
- Tangan tidak terlalu dekat/jauh dari kamera
- Tahan gesture konsisten selama 3 detik

### Rekomendasi tidak muncul
- Buka Console (F12) untuk lihat error
- Pastikan gesture terdeteksi dengan benar
- Cek koneksi internet untuk YouTube links

## 💡 Tips untuk Demo di Kelas

1. **Persiapan:**
   - Test sebelum presentasi
   - Pastikan pencahayaan ruangan baik
   - Siapkan backup video recording

2. **Presentasi:**
   - Jelaskan konsep NCF terlebih dahulu
   - Demo gesture satu per satu
   - Tunjukkan Console untuk transparansi
   - Diskusikan hasil rekomendasi

3. **Diskusi:**
   - Cold start problem
   - Scalability issues
   - Privacy concerns
   - Real-world applications

## 🤝 Kontribusi

Mahasiswa dipersilakan untuk:
- Fork repository ini
- Buat branch untuk fitur baru
- Submit pull request dengan deskripsi jelas
- Diskusikan di Issues untuk pertanyaan

## 📝 License

Educational purposes only.

## 👨‍🏫 Kontak

Untuk pertanyaan lebih lanjut, hubungi dosen pengampu mata kuliah.

---

**Dibuat untuk pembelajaran Deep Learning for Recommendation Systems**

*"Learning by doing is the best way to understand deep learning!"*
