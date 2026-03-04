/**
 * MUSIC RECOMMENDATION SYSTEM
 * ===========================
 * Sistem rekomendasi berbasis Content-Based Filtering
 * 
 * Konsep Deep Learning & Recommendation Systems:
 * 1. Content-Based Filtering: Merekomendasikan item berdasarkan karakteristik konten
 * 2. Feature Extraction: Emosi sebagai fitur utama untuk matching
 * 3. Similarity Matching: Mencocokkan emosi user dengan karakteristik lagu
 * 
 * Dalam implementasi production, bisa dikembangkan dengan:
 * - Neural Collaborative Filtering (NCF)
 * - Autoencoders untuk learning user preferences
 * - Hybrid approach (content + collaborative)
 */

class MusicRecommender {
    constructor() {
        // Database lagu dengan metadata
        // Setiap lagu memiliki emotion tags untuk content-based filtering
        this.musicDatabase = {
            'Girang': [
                {
                    title: 'Happy - Pharrell Williams',
                    artist: 'Pharrell Williams',
                    youtubeId: 'ZbZSe6N_BXs',
                    tags: ['upbeat', 'energetic', 'positive'],
                    emotionScore: 0.95
                },
                {
                    title: 'Can\'t Stop The Feeling - Justin Timberlake',
                    artist: 'Justin Timberlake',
                    youtubeId: 'ru0K8uYEZWw',
                    tags: ['dance', 'fun', 'cheerful'],
                    emotionScore: 0.93
                },
                {
                    title: 'Walking On Sunshine - Katrina and The Waves',
                    artist: 'Katrina and The Waves',
                    youtubeId: 'iPUmE-tne5U',
                    tags: ['classic', 'joyful', 'uplifting'],
                    emotionScore: 0.92
                },
                {
                    title: 'Good Vibrations - The Beach Boys',
                    artist: 'The Beach Boys',
                    youtubeId: 'Eab_beh07HU',
                    tags: ['retro', 'positive', 'feel-good'],
                    emotionScore: 0.90
                },
                {
                    title: 'Don\'t Stop Me Now - Queen',
                    artist: 'Queen',
                    youtubeId: 'HgzGwKwLmgM',
                    tags: ['rock', 'energetic', 'powerful'],
                    emotionScore: 0.91
                },
                {
                    title: 'Uptown Funk - Mark Ronson ft. Bruno Mars',
                    artist: 'Mark Ronson ft. Bruno Mars',
                    youtubeId: 'OPf0YbXqDm0',
                    tags: ['funk', 'dance', 'groovy'],
                    emotionScore: 0.94
                },
                {
                    title: 'I Gotta Feeling - Black Eyed Peas',
                    artist: 'Black Eyed Peas',
                    youtubeId: 'uSD4vsh1zDA',
                    tags: ['party', 'electronic', 'celebration'],
                    emotionScore: 0.89
                },
                {
                    title: 'Shake It Off - Taylor Swift',
                    artist: 'Taylor Swift',
                    youtubeId: 'nfWlot6h_JM',
                    tags: ['pop', 'catchy', 'fun'],
                    emotionScore: 0.88
                },
                {
                    title: 'September - Earth, Wind & Fire',
                    artist: 'Earth, Wind & Fire',
                    youtubeId: 'Gs069dndIYk',
                    tags: ['disco', 'classic', 'joyful'],
                    emotionScore: 0.92
                },
                {
                    title: 'Best Day Of My Life - American Authors',
                    artist: 'American Authors',
                    youtubeId: 'Y66j_BUCBMY',
                    tags: ['indie', 'optimistic', 'uplifting'],
                    emotionScore: 0.87
                }
            ],
            'Sedih': [
                {
                    title: 'Someone Like You - Adele',
                    artist: 'Adele',
                    youtubeId: 'hLQl3WQQoQ0',
                    tags: ['ballad', 'emotional', 'heartbreak'],
                    emotionScore: 0.96
                },
                {
                    title: 'Fix You - Coldplay',
                    artist: 'Coldplay',
                    youtubeId: 'k4V3Mo61fJM',
                    tags: ['melancholic', 'healing', 'comfort'],
                    emotionScore: 0.94
                },
                {
                    title: 'The Scientist - Coldplay',
                    artist: 'Coldplay',
                    youtubeId: 'RB-RcX5DS5A',
                    tags: ['sad', 'reflective', 'piano'],
                    emotionScore: 0.93
                },
                {
                    title: 'Hurt - Johnny Cash',
                    artist: 'Johnny Cash',
                    youtubeId: '8AHCfZTRGiI',
                    tags: ['deep', 'painful', 'raw'],
                    emotionScore: 0.95
                },
                {
                    title: 'Mad World - Gary Jules',
                    artist: 'Gary Jules',
                    youtubeId: '4N3N1MlvVc4',
                    tags: ['melancholic', 'atmospheric', 'contemplative'],
                    emotionScore: 0.92
                },
                {
                    title: 'Skinny Love - Bon Iver',
                    artist: 'Bon Iver',
                    youtubeId: 'ssdgFoHLwnk',
                    tags: ['indie', 'emotional', 'acoustic'],
                    emotionScore: 0.90
                },
                {
                    title: 'Tears In Heaven - Eric Clapton',
                    artist: 'Eric Clapton',
                    youtubeId: 'JxPj3GAYYZ0',
                    tags: ['grief', 'gentle', 'touching'],
                    emotionScore: 0.94
                },
                {
                    title: 'Nothing Compares 2 U - Sinead O\'Connor',
                    artist: 'Sinead O\'Connor',
                    youtubeId: '0-EF60neguk',
                    tags: ['heartbreak', 'powerful', 'emotional'],
                    emotionScore: 0.93
                },
                {
                    title: 'Everybody Hurts - R.E.M.',
                    artist: 'R.E.M.',
                    youtubeId: '5rOiW_xY-kc',
                    tags: ['comforting', 'supportive', 'slow'],
                    emotionScore: 0.91
                },
                {
                    title: 'Hallelujah - Jeff Buckley',
                    artist: 'Jeff Buckley',
                    youtubeId: 'y8AWFf7EAc4',
                    tags: ['spiritual', 'melancholic', 'beautiful'],
                    emotionScore: 0.92
                }
            ],
            'Serius': [
                {
                    title: 'Time - Hans Zimmer (Inception OST)',
                    artist: 'Hans Zimmer',
                    youtubeId: 'RxabLA7UQ9k',
                    tags: ['epic', 'cinematic', 'focused'],
                    emotionScore: 0.97
                },
                {
                    title: 'Interstellar Main Theme - Hans Zimmer',
                    artist: 'Hans Zimmer',
                    youtubeId: 'UDVtMYqUAyw',
                    tags: ['atmospheric', 'deep', 'contemplative'],
                    emotionScore: 0.96
                },
                {
                    title: 'Experience - Ludovico Einaudi',
                    artist: 'Ludovico Einaudi',
                    youtubeId: 'hN_q-_nGv4U',
                    tags: ['piano', 'emotional', 'building'],
                    emotionScore: 0.94
                },
                {
                    title: 'Nuvole Bianche - Ludovico Einaudi',
                    artist: 'Ludovico Einaudi',
                    youtubeId: 'kcihcYEOeic',
                    tags: ['classical', 'peaceful', 'concentration'],
                    emotionScore: 0.93
                },
                {
                    title: 'Clair de Lune - Claude Debussy',
                    artist: 'Claude Debussy',
                    youtubeId: 'CvFH_6DNRCY',
                    tags: ['classical', 'elegant', 'timeless'],
                    emotionScore: 0.95
                },
                {
                    title: 'Moonlight Sonata - Beethoven',
                    artist: 'Ludwig van Beethoven',
                    youtubeId: '4Tr0otuiQuU',
                    tags: ['classical', 'dramatic', 'intense'],
                    emotionScore: 0.94
                },
                {
                    title: 'Requiem for a Dream - Clint Mansell',
                    artist: 'Clint Mansell',
                    youtubeId: 'yVIRcnlRKF8',
                    tags: ['intense', 'dramatic', 'powerful'],
                    emotionScore: 0.92
                },
                {
                    title: 'The Dark Knight Rises - Hans Zimmer',
                    artist: 'Hans Zimmer',
                    youtubeId: 'g_6yBZKj-eo',
                    tags: ['epic', 'heroic', 'motivational'],
                    emotionScore: 0.91
                },
                {
                    title: 'Arrival of the Birds - The Cinematic Orchestra',
                    artist: 'The Cinematic Orchestra',
                    youtubeId: 'MqoANESQ4cQ',
                    tags: ['orchestral', 'uplifting', 'majestic'],
                    emotionScore: 0.93
                },
                {
                    title: 'Comptine d\'un autre été - Yann Tiersen',
                    artist: 'Yann Tiersen',
                    youtubeId: 'H2-1u8xvk54',
                    tags: ['piano', 'french', 'nostalgic'],
                    emotionScore: 0.90
                }
            ]
        };
    }

    /**
     * Algoritma Rekomendasi - Content-Based Filtering
     * 
     * Proses:
     * 1. Identifikasi emosi user (dari emotion detection)
     * 2. Filter lagu berdasarkan emotion category
     * 3. Ranking berdasarkan emotion score (similarity score)
     * 4. Return top-N recommendations
     * 
     * Dalam Neural Collaborative Filtering (NCF):
     * - User embedding dan item embedding dipelajari oleh neural network
     * - Dot product atau MLP untuk menghitung similarity
     * - Model belajar dari interaksi user-item (implicit/explicit feedback)
     */
    getRecommendations(emotion, topN = 10) {
        console.log(`🎵 Generating recommendations for emotion: ${emotion}`);
        
        // Content-based filtering: ambil lagu sesuai kategori emosi
        const emotionSongs = this.musicDatabase[emotion] || [];
        
        // Ranking berdasarkan emotion score (descending)
        const rankedSongs = emotionSongs
            .sort((a, b) => b.emotionScore - a.emotionScore)
            .slice(0, topN);
        
        console.log(`✅ Found ${rankedSongs.length} recommendations`);
        
        return rankedSongs;
    }

    /**
     * Hitung similarity score antara user preference dan item
     * Dalam implementasi advanced, bisa menggunakan:
     * - Cosine similarity
     * - Euclidean distance
     * - Neural network embedding similarity
     */
    calculateSimilarity(userFeatures, itemFeatures) {
        // Simplified cosine similarity
        let dotProduct = 0;
        let userMagnitude = 0;
        let itemMagnitude = 0;
        
        for (let i = 0; i < userFeatures.length; i++) {
            dotProduct += userFeatures[i] * itemFeatures[i];
            userMagnitude += userFeatures[i] * userFeatures[i];
            itemMagnitude += itemFeatures[i] * itemFeatures[i];
        }
        
        userMagnitude = Math.sqrt(userMagnitude);
        itemMagnitude = Math.sqrt(itemMagnitude);
        
        if (userMagnitude === 0 || itemMagnitude === 0) {
            return 0;
        }
        
        return dotProduct / (userMagnitude * itemMagnitude);
    }

    /**
     * Render rekomendasi ke UI
     */
    renderRecommendations(emotion, containerId = 'recommendations') {
        const container = document.getElementById(containerId);
        const recommendations = this.getRecommendations(emotion, 10);
        
        if (recommendations.length === 0) {
            container.innerHTML = '<p class="placeholder">Tidak ada rekomendasi tersedia</p>';
            return;
        }
        
        // Build HTML untuk setiap rekomendasi
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
        
        // Log untuk educational purposes
        console.log('📊 Recommendation System Metrics:');
        console.log(`- Emotion Category: ${emotion}`);
        console.log(`- Total Recommendations: ${recommendations.length}`);
        console.log(`- Average Emotion Score: ${(recommendations.reduce((sum, s) => sum + s.emotionScore, 0) / recommendations.length).toFixed(2)}`);
    }

    /**
     * Simulasi feedback loop untuk Collaborative Filtering
     * Dalam sistem production:
     * - Track user interactions (play, skip, like, etc.)
     * - Update user profile/embedding
     * - Retrain model secara periodik
     */
    recordUserInteraction(userId, songId, interactionType) {
        console.log(`📝 Recording interaction: User ${userId} ${interactionType} Song ${songId}`);
        // Dalam implementasi nyata, simpan ke database
        // Dan gunakan untuk training collaborative filtering model
    }
}

// Export untuk digunakan di file lain
window.MusicRecommender = MusicRecommender;
