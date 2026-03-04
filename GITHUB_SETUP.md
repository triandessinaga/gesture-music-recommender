# 📦 Panduan Push ke GitHub

## Langkah 1: Inisialisasi Git Repository

Buka terminal/command prompt di folder project, lalu jalankan:

```bash
# Inisialisasi git repository
git init

# Tambahkan semua file
git add .

# Commit pertama
git commit -m "Initial commit: Gesture-Based Music Recommender System"
```

## Langkah 2: Buat Repository di GitHub

1. Buka https://github.com
2. Login ke akun Anda
3. Klik tombol "+" di kanan atas → "New repository"
4. Isi form:
   - **Repository name**: `gesture-music-recommender`
   - **Description**: `Deep Learning project: Gesture-based music recommendation using MediaPipe Hands and Neural Collaborative Filtering`
   - **Public** atau **Private**: Pilih sesuai kebutuhan
   - **JANGAN** centang "Initialize with README" (karena kita sudah punya)
5. Klik "Create repository"

## Langkah 3: Connect Local ke GitHub

Setelah repository dibuat, GitHub akan menampilkan instruksi. Jalankan:

```bash
# Tambahkan remote repository
git remote add origin https://github.com/USERNAME/gesture-music-recommender.git

# Ganti USERNAME dengan username GitHub Anda

# Push ke GitHub
git branch -M main
git push -u origin main
```

## Langkah 4: Verifikasi

1. Refresh halaman repository di GitHub
2. Anda akan melihat semua file sudah ter-upload
3. README.md akan otomatis ditampilkan di halaman utama

## Langkah 5: Enable GitHub Pages (Optional)

Untuk deploy aplikasi agar bisa diakses online:

1. Di repository GitHub, klik **Settings**
2. Scroll ke bagian **Pages** (di sidebar kiri)
3. Di **Source**, pilih:
   - Branch: `main`
   - Folder: `/ (root)`
4. Klik **Save**
5. Tunggu beberapa menit
6. Aplikasi akan live di: `https://USERNAME.github.io/gesture-music-recommender/`

## Langkah 6: Update di Masa Depan

Setiap kali ada perubahan:

```bash
# Tambahkan file yang berubah
git add .

# Commit dengan pesan yang jelas
git commit -m "Deskripsi perubahan"

# Push ke GitHub
git push origin main
```

## Tips untuk Mahasiswa

### Commit Message yang Baik

❌ **Buruk:**
```bash
git commit -m "update"
git commit -m "fix"
git commit -m "changes"
```

✅ **Baik:**
```bash
git commit -m "Add thumbs up gesture detection"
git commit -m "Fix NCF model training accuracy"
git commit -m "Update README with deployment guide"
```

### Branching untuk Eksperimen

```bash
# Buat branch baru untuk eksperimen
git checkout -b experiment-new-gesture

# Lakukan perubahan...

# Commit perubahan
git add .
git commit -m "Experiment: Add OK sign gesture"

# Push branch
git push origin experiment-new-gesture

# Jika berhasil, merge ke main
git checkout main
git merge experiment-new-gesture
git push origin main
```

### Kolaborasi dengan Tim

```bash
# Clone repository teman
git clone https://github.com/FRIEND_USERNAME/repo-name.git

# Buat branch untuk kontribusi
git checkout -b my-contribution

# Lakukan perubahan dan commit

# Push branch
git push origin my-contribution

# Buat Pull Request di GitHub
```

## Troubleshooting

### Error: "remote origin already exists"

```bash
# Hapus remote yang ada
git remote remove origin

# Tambahkan lagi dengan URL yang benar
git remote add origin https://github.com/USERNAME/repo-name.git
```

### Error: "failed to push some refs"

```bash
# Pull dulu untuk sync
git pull origin main --rebase

# Lalu push lagi
git push origin main
```

### Error: "Permission denied (publickey)"

Gunakan HTTPS instead of SSH:
```bash
git remote set-url origin https://github.com/USERNAME/repo-name.git
```

## Checklist Sebelum Push

- [ ] Semua file penting sudah di-add
- [ ] .gitignore sudah dibuat
- [ ] README.md sudah lengkap
- [ ] Code sudah di-test dan berfungsi
- [ ] Tidak ada file sensitif (password, API keys)
- [ ] Commit message jelas dan deskriptif

## Resources

- **Git Documentation**: https://git-scm.com/doc
- **GitHub Guides**: https://guides.github.com/
- **Git Cheat Sheet**: https://education.github.com/git-cheat-sheet-education.pdf

---

**Selamat! Repository Anda sudah online! 🎉**
