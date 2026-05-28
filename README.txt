Museum Virtual Alat Permainan Tradisional
=========================================

Cara menjalankan:
1. Ekstrak zip ini.
2. Jalankan file JALANKAN_WINDOWS.bat, atau buka terminal di folder ini lalu jalankan:
   python run_server.py
3. Buka alamat yang tampil di terminal, biasanya http://localhost:8000
4. Gunakan menu Koleksi untuk melihat daftar objek.

Catatan implementasi:
- Tampilan awal setiap kartu koleksi menggunakan asset gambar dari folder assets/images.
- File model 3D .glb di folder assets/models tidak dimuat di kartu awal.
- Model 3D baru dimuat ke komponen <model-viewer> saat user menekan tombol "Lihat Model 3D".
- Saat dialog model ditutup, atribut src pada viewer dihapus agar model tidak terus aktif.
- Halaman membutuhkan internet untuk memuat library <model-viewer> dari CDN.

Struktur file penting:
- index.html       : struktur halaman dan dialog viewer 3D
- styles.css       : tampilan visual website
- data.js          : data koleksi, path gambar, dan path model .glb
- app.js           : filter, render kartu gambar, dan pembuka model 3D
- assets/images/   : gambar preview objek
- assets/models/   : file model 3D .glb
