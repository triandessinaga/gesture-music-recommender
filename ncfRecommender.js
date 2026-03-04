/**
 * NEURAL COLLABORATIVE FILTERING (NCF) RECOMMENDER
 * =================================================
 * Implementasi Neural Collaborative Filtering untuk sistem rekomendasi musik
 * Berdasarkan paper: He, X., et al. (2017). "Neural Collaborative Filtering"
 * 
 * Arsitektur:
 * 1. User Embedding Layer
 * 2. Item (Song) Embedding Layer
 * 3. Multi-Layer Perceptron (MLP) untuk learning interaction
 * 4. Output: Predicted rating/preference score
 */

class NCFRecommender {
    constructor() {
        this.model = null;
        this.isModelReady = false;
        
        // Embedding dimensions
        this.userEmbeddingDim = 32;
        this.itemEmbeddingDim = 32;
        
        // User profiles (emotion history)
        this.userProfiles = new Map();
        this.currentUserId = 'user_1';
        
        // Music database dengan features
        this.musicDatabase = this.initializeMusicDatabase();
        this.songIds = Object.keys(this.musicDatabase);
        
        // Emotion to feature mapping
        this.emotionFeatures = {
            'Girang': [1.0, 0.0, 0.0, 0.9, 0.8, 0.9], // [happy, sad, neutral, energy, valence, danceability]
            'Sedih': [0.0, 1.0, 0.0, 0.2, 0.1, 0.2],
            'Serius': [0.0, 0.0, 1.0, 0.5, 0.5, 0.3]
        };
    }

    /**
     * Initialize music database dengan features untuk NCF
     */
    initializeMusicDatabase() {
        return {
            // GIRANG SONGS
            'happy_1': {
                title: 'Happy - Pharrell Williams',
                artist: 'Pharrell Williams',
                youtubeId: 'ZbZSe6N_BXs',
                emotion: 'Girang',
                features: [1.0, 0.0, 0.0, 0.95, 0.9, 0.95], // [happy, sad, neutral, energy, valence, danceability]
                tags: ['upbeat', 'energetic', 'positive']
            },
            'happy_2': {
                title: 'Can\'t Stop The Feeling - Justin Timberlake',
                artist: 'Justin Timberlake',
                youtubeId: 'ru0K8uYEZWw',
                emotion: 'Girang',
                features: [0.98, 0.0, 0.0, 0.93, 0.88, 0.92],
                tags: ['dance', 'fun', 'cheerful']
            },
            'happy_3': {
                title: 'Walking On Sunshine - Katrina and The Waves',
                artist: 'Katrina and The Waves',
                youtubeId: 'iPUmE-tne5U',
                emotion: 'Girang',
                features: [0.96, 0.0, 0.0, 0.90, 0.85, 0.88],
                tags: ['classic', 'joyful', 'uplifting']
            },
            'happy_4': {
                title: 'Good Vibrations - The Beach Boys',
                artist: 'The Beach Boys',
                youtubeId: 'Eab_beh07HU',
                emotion: 'Girang',
                features: [0.94, 0.0, 0.0, 0.87, 0.82, 0.85],
                tags: ['retro', 'positive', 'feel-good']
            },
            'happy_5': {
                title: 'Don\'t Stop Me Now - Queen',
                artist: 'Queen',
                youtubeId: 'HgzGwKwLmgM',
                emotion: 'Girang',
                features: [0.95, 0.0, 0.0, 0.91, 0.86, 0.80],
                tags: ['rock', 'energetic', 'powerful']
            },
            'happy_6': {
                title: 'Uptown Funk - Mark Ronson ft. Bruno Mars',
                artist: 'Mark Ronson ft. Bruno Mars',
                youtubeId: 'OPf0YbXqDm0',
                emotion: 'Girang',
                features: [0.97, 0.0, 0.0, 0.94, 0.89, 0.96],
                tags: ['funk', 'dance', 'groovy']
            },
            'happy_7': {
                title: 'I Gotta Feeling - Black Eyed Peas',
                artist: 'Black Eyed Peas',
                youtubeId: 'uSD4vsh1zDA',
                emotion: 'Girang',
                features: [0.93, 0.0, 0.0, 0.88, 0.84, 0.91],
                tags: ['party', 'electronic', 'celebration']
            },
            'happy_8': {
                title: 'Shake It Off - Taylor Swift',
                artist: 'Taylor Swift',
                youtubeId: 'nfWlot6h_JM',
                emotion: 'Girang',
                features: [0.92, 0.0, 0.0, 0.86, 0.83, 0.89],
                tags: ['pop', 'catchy', 'fun']
            },
            'happy_9': {
                title: 'September - Earth, Wind & Fire',
                artist: 'Earth, Wind & Fire',
                youtubeId: 'Gs069dndIYk',
                emotion: 'Girang',
                features: [0.96, 0.0, 0.0, 0.90, 0.87, 0.93],
                tags: ['disco', 'classic', 'joyful']
            },
            'happy_10': {
                title: 'Best Day Of My Life - American Authors',
                artist: 'American Authors',
                youtubeId: 'Y66j_BUCBMY',
                emotion: 'Girang',
                features: [0.91, 0.0, 0.0, 0.85, 0.81, 0.84],
                tags: ['indie', 'optimistic', 'uplifting']
            },
            
            // SEDIH SONGS
            'sad_1': {
                title: 'Someone Like You - Adele',
                artist: 'Adele',
                youtubeId: 'hLQl3WQQoQ0',
                emotion: 'Sedih',
                features: [0.0, 0.98, 0.0, 0.25, 0.15, 0.20],
                tags: ['ballad', 'emotional', 'heartbreak']
            },
            'sad_2': {
                title: 'Fix You - Coldplay',
                artist: 'Coldplay',
                youtubeId: 'k4V3Mo61fJM',
                emotion: 'Sedih',
                features: [0.0, 0.95, 0.0, 0.30, 0.20, 0.25],
                tags: ['melancholic', 'healing', 'comfort']
            },
            'sad_3': {
                title: 'The Scientist - Coldplay',
                artist: 'Coldplay',
                youtubeId: 'RB-RcX5DS5A',
                emotion: 'Sedih',
                features: [0.0, 0.94, 0.0, 0.28, 0.18, 0.22],
                tags: ['sad', 'reflective', 'piano']
            },
            'sad_4': {
                title: 'Hurt - Johnny Cash',
                artist: 'Johnny Cash',
                youtubeId: '8AHCfZTRGiI',
                emotion: 'Sedih',
                features: [0.0, 0.97, 0.0, 0.22, 0.12, 0.18],
                tags: ['deep', 'painful', 'raw']
            },
            'sad_5': {
                title: 'Mad World - Gary Jules',
                artist: 'Gary Jules',
                youtubeId: '4N3N1MlvVc4',
                emotion: 'Sedih',
                features: [0.0, 0.93, 0.0, 0.26, 0.16, 0.20],
                tags: ['melancholic', 'atmospheric', 'contemplative']
            },
            'sad_6': {
                title: 'Skinny Love - Bon Iver',
                artist: 'Bon Iver',
                youtubeId: 'ssdgFoHLwnk',
                emotion: 'Sedih',
                features: [0.0, 0.91, 0.0, 0.29, 0.19, 0.23],
                tags: ['indie', 'emotional', 'acoustic']
            },
            'sad_7': {
                title: 'Tears In Heaven - Eric Clapton',
                artist: 'Eric Clapton',
                youtubeId: 'JxPj3GAYYZ0',
                emotion: 'Sedih',
                features: [0.0, 0.95, 0.0, 0.27, 0.17, 0.21],
                tags: ['grief', 'gentle', 'touching']
            },
            'sad_8': {
                title: 'Nothing Compares 2 U - Sinead O\'Connor',
                artist: 'Sinead O\'Connor',
                youtubeId: '0-EF60neguk',
                emotion: 'Sedih',
                features: [0.0, 0.94, 0.0, 0.31, 0.21, 0.24],
                tags: ['heartbreak', 'powerful', 'emotional']
            },
            'sad_9': {
                title: 'Everybody Hurts - R.E.M.',
                artist: 'R.E.M.',
                youtubeId: '5rOiW_xY-kc',
                emotion: 'Sedih',
                features: [0.0, 0.92, 0.0, 0.28, 0.18, 0.22],
                tags: ['comforting', 'supportive', 'slow']
            },
            'sad_10': {
                title: 'Hallelujah - Jeff Buckley',
                artist: 'Jeff Buckley',
                youtubeId: 'y8AWFf7EAc4',
                emotion: 'Sedih',
                features: [0.0, 0.93, 0.0, 0.30, 0.20, 0.23],
                tags: ['spiritual', 'melancholic', 'beautiful']
            },
            
            // SERIUS SONGS
            'serious_1': {
                title: 'Time - Hans Zimmer (Inception OST)',
                artist: 'Hans Zimmer',
                youtubeId: 'RxabLA7UQ9k',
                emotion: 'Serius',
                features: [0.0, 0.0, 0.98, 0.60, 0.50, 0.30],
                tags: ['epic', 'cinematic', 'focused']
            },
            'serious_2': {
                title: 'Interstellar Main Theme - Hans Zimmer',
                artist: 'Hans Zimmer',
                youtubeId: 'UDVtMYqUAyw',
                emotion: 'Serius',
                features: [0.0, 0.0, 0.97, 0.58, 0.48, 0.28],
                tags: ['atmospheric', 'deep', 'contemplative']
            },
            'serious_3': {
                title: 'Experience - Ludovico Einaudi',
                artist: 'Ludovico Einaudi',
                youtubeId: 'hN_q-_nGv4U',
                emotion: 'Serius',
                features: [0.0, 0.0, 0.95, 0.55, 0.45, 0.32],
                tags: ['piano', 'emotional', 'building']
            },
            'serious_4': {
                title: 'Nuvole Bianche - Ludovico Einaudi',
                artist: 'Ludovico Einaudi',
                youtubeId: 'kcihcYEOeic',
                emotion: 'Serius',
                features: [0.0, 0.0, 0.94, 0.52, 0.42, 0.30],
                tags: ['classical', 'peaceful', 'concentration']
            },
            'serious_5': {
                title: 'Clair de Lune - Claude Debussy',
                artist: 'Claude Debussy',
                youtubeId: 'CvFH_6DNRCY',
                emotion: 'Serius',
                features: [0.0, 0.0, 0.96, 0.48, 0.40, 0.25],
                tags: ['classical', 'elegant', 'timeless']
            },
            'serious_6': {
                title: 'Moonlight Sonata - Beethoven',
                artist: 'Ludwig van Beethoven',
                youtubeId: '4Tr0otuiQuU',
                emotion: 'Serius',
                features: [0.0, 0.0, 0.95, 0.50, 0.43, 0.27],
                tags: ['classical', 'dramatic', 'intense']
            },
            'serious_7': {
                title: 'Requiem for a Dream - Clint Mansell',
                artist: 'Clint Mansell',
                youtubeId: 'yVIRcnlRKF8',
                emotion: 'Serius',
                features: [0.0, 0.0, 0.93, 0.65, 0.55, 0.35],
                tags: ['intense', 'dramatic', 'powerful']
            },
            'serious_8': {
                title: 'The Dark Knight Rises - Hans Zimmer',
                artist: 'Hans Zimmer',
                youtubeId: 'g_6yBZKj-eo',
                emotion: 'Serius',
                features: [0.0, 0.0, 0.92, 0.68, 0.58, 0.38],
                tags: ['epic', 'heroic', 'motivational']
            },
            'serious_9': {
                title: 'Arrival of the Birds - The Cinematic Orchestra',
                artist: 'The Cinematic Orchestra',
                youtubeId: 'MqoANESQ4cQ',
                emotion: 'Serius',
                features: [0.0, 0.0, 0.94, 0.54, 0.46, 0.31],
                tags: ['orchestral', 'uplifting', 'majestic']
            },
            'serious_10': {
                title: 'Comptine d\'un autre été - Yann Tiersen',
                artist: 'Yann Tiersen',
                youtubeId: 'H2-1u8xvk54',
                emotion: 'Serius',
                features: [0.0, 0.0, 0.91, 0.51, 0.44, 0.29],
                tags: ['piano', 'french', 'nostalgic']
            }
        };
    }

    /**
     * Build NCF Model
     * Arsitektur: User Embedding + Item Embedding + MLP
     */
    async buildNCFModel() {
        console.log('🔨 Building Neural Collaborative Filtering Model...');
        
        // Input layers
        const userInput = tf.input({ shape: [6], name: 'user_features' }); // emotion features
        const itemInput = tf.input({ shape: [6], name: 'item_features' }); // song features
        
        // Concatenate user and item features
        const concat = tf.layers.concatenate().apply([userInput, itemInput]);
        
        // MLP layers untuk learning interaction
        let mlp = tf.layers.dense({
            units: 128,
            activation: 'relu',
            kernelInitializer: 'heNormal'
        }).apply(concat);
        
        mlp = tf.layers.dropout({ rate: 0.3 }).apply(mlp);
        
        mlp = tf.layers.dense({
            units: 64,
            activation: 'relu',
            kernelInitializer: 'heNormal'
        }).apply(mlp);
        
        mlp = tf.layers.dropout({ rate: 0.2 }).apply(mlp);
        
        mlp = tf.layers.dense({
            units: 32,
            activation: 'relu',
            kernelInitializer: 'heNormal'
        }).apply(mlp);
        
        // Output: predicted preference score
        const output = tf.layers.dense({
            units: 1,
            activation: 'sigmoid',
            name: 'preference_score'
        }).apply(mlp);
        
        // Create model
        this.model = tf.model({
            inputs: [userInput, itemInput],
            outputs: output
        });
        
        this.model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'binaryCrossentropy',
            metrics: ['accuracy']
        });
        
        console.log('✅ NCF Model built successfully');
        this.model.summary();
    }

    /**
     * Train NCF Model dengan implicit feedback
     */
    async trainNCFModel() {
        console.log('🎓 Training NCF Model...');
        
        const trainingData = this.generateNCFTrainingData();
        
        const userFeatures = tf.tensor2d(trainingData.userFeatures);
        const itemFeatures = tf.tensor2d(trainingData.itemFeatures);
        const labels = tf.tensor2d(trainingData.labels);
        
        await this.model.fit([userFeatures, itemFeatures], labels, {
            epochs: 50,
            batchSize: 32,
            validationSplit: 0.2,
            shuffle: true,
            verbose: 0,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    if (epoch % 10 === 0) {
                        console.log(`Epoch ${epoch}: loss=${logs.loss.toFixed(4)}, acc=${logs.acc.toFixed(4)}`);
                    }
                }
            }
        });
        
        userFeatures.dispose();
        itemFeatures.dispose();
        labels.dispose();
        
        this.isModelReady = true;
        console.log('✅ NCF Model trained successfully!');
    }

    /**
     * Generate training data untuk NCF
     * Positive samples: emotion matches song emotion
     * Negative samples: emotion doesn't match
     */
    generateNCFTrainingData() {
        const userFeatures = [];
        const itemFeatures = [];
        const labels = [];
        
        const emotions = ['Girang', 'Sedih', 'Serius'];
        
        // Generate positive and negative samples
        for (let i = 0; i < 500; i++) {
            const emotion = emotions[Math.floor(Math.random() * emotions.length)];
            const userFeature = this.emotionFeatures[emotion];
            
            // Positive sample (matching emotion)
            const matchingSongs = this.songIds.filter(id => 
                this.musicDatabase[id].emotion === emotion
            );
            const positiveSong = matchingSongs[Math.floor(Math.random() * matchingSongs.length)];
            
            userFeatures.push(userFeature);
            itemFeatures.push(this.musicDatabase[positiveSong].features);
            labels.push([1]); // positive
            
            // Negative sample (non-matching emotion)
            const nonMatchingSongs = this.songIds.filter(id => 
                this.musicDatabase[id].emotion !== emotion
            );
            const negativeSong = nonMatchingSongs[Math.floor(Math.random() * nonMatchingSongs.length)];
            
            userFeatures.push(userFeature);
            itemFeatures.push(this.musicDatabase[negativeSong].features);
            labels.push([0]); // negative
        }
        
        return { userFeatures, itemFeatures, labels };
    }

    /**
     * Get recommendations menggunakan NCF
     */
    async getRecommendations(emotion, topN = 10) {
        if (!this.isModelReady) {
            console.warn('⚠️ NCF Model belum siap');
            return [];
        }
        
        console.log(`🎵 Generating NCF recommendations for: ${emotion}`);
        
        const userFeature = this.emotionFeatures[emotion];
        const scores = [];
        
        // Predict score untuk setiap lagu
        for (const songId of this.songIds) {
            const song = this.musicDatabase[songId];
            
            const userTensor = tf.tensor2d([userFeature]);
            const itemTensor = tf.tensor2d([song.features]);
            
            const prediction = this.model.predict([userTensor, itemTensor]);
            const score = (await prediction.data())[0];
            
            userTensor.dispose();
            itemTensor.dispose();
            prediction.dispose();
            
            scores.push({
                songId,
                song,
                score
            });
        }
        
        // Sort by score dan ambil top-N
        scores.sort((a, b) => b.score - a.score);
        const topRecommendations = scores.slice(0, topN);
        
        console.log('✅ Top recommendations:', topRecommendations.map(r => ({
            title: r.song.title,
            score: r.score.toFixed(4)
        })));
        
        return topRecommendations.map(r => r.song);
    }

    /**
     * Render recommendations ke UI
     */
    renderRecommendations(emotion, containerId = 'recommendations') {
        this.getRecommendations(emotion, 10).then(recommendations => {
            const container = document.getElementById(containerId);
            
            if (recommendations.length === 0) {
                container.innerHTML = '<p class="placeholder">Tidak ada rekomendasi tersedia</p>';
                return;
            }
            
            let html = '';
            recommendations.forEach((song, index) => {
                html += `
                    <div class="song-card" data-youtube-id="${song.youtubeId}">
                        <div class="song-number">${index + 1}</div>
                        <div class="song-info">
                            <div class="song-title">${song.title}</div>
                            <div class="song-artist">${song.artist}</div>
                        </div>
                        <a href="https://www.youtube.com/watch?v=${song.youtubeId}" 
                           target="_blank" 
                           class="play-btn">
                            ▶ Play
                        </a>
                    </div>
                `;
            });
            
            container.innerHTML = html;
        });
    }

    /**
     * Initialize NCF Recommender
     */
    async initialize() {
        console.log('🚀 Initializing Neural Collaborative Filtering...');
        await this.buildNCFModel();
        await this.trainNCFModel();
        console.log('✅ NCF Recommender ready!');
    }
}

window.NCFRecommender = NCFRecommender;
