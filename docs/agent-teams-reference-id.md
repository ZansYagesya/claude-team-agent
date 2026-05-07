# Tim Agen - Panduan Referensi Utama

> **Terakhir diperbarui:** 2026-05-07
> **Sumber:** https://code.claude.com/docs/en/agent-teams
> **Persyaratan:** Claude Code v2.1.32 atau lebih baru

## Mulai Cepat

```bash
# 1. Aktifkan tim agen (sudah dikonfigurasi di .claude/settings.local.json)
#    Settings sudah berisi: CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1

# 2. Jalankan Claude Code
claude

# 3. Buat tim pertama Anda
"Buat tim agen dengan 3 rekan tim untuk mereview PR #142:
 satu fokus pada keamanan, satu pada performa, satu pada cakupan tes."
```

---

## Apa Itu Tim Agen?

Tim agen mengoordinasikan **beberapa instance Claude Code** yang bekerja bersama:
- Satu **pemimpin tim** (sesi utama) mengoordinasikan pekerjaan, menugaskan tugas, dan menyintesis hasil
- **Rekan tim** bekerja secara independen, masing-masing dengan jendela konteksnya sendiri
- Rekan tim **berkomunikasi langsung** satu sama lain (tidak hanya melalui pemimpin)
- **Daftar tugas bersama** mengoordinasikan pekerjaan di seluruh tim
- Sistem **kotak surat** memungkinkan pertukaran pesan antar agen

### Perbedaan Kunci dengan Subagen

| | Subagen | Tim Agen |
|---|---|---|
| **Konteks** | Konteks sendiri; hasil kembali ke pemanggil | Konteks sendiri; sepenuhnya independen |
| **Komunikasi** | Hanya melaporkan kembali ke agen utama | Rekan tim bertukar pesan langsung satu sama lain |
| **Koordinasi** | Agen utama mengelola semua pekerjaan | Daftar tugas bersama dengan koordinasi mandiri |
| **Terbaik untuk** | Tugas terfokus di mana hanya hasil yang penting | Pekerjaan kompleks yang membutuhkan diskusi/kolaborasi |
| **Biaya token** | Lebih rendah: hasil diringkas | Lebih tinggi: setiap rekan tim adalah instance Claude tersendiri |

**Panduan umum:** Gunakan subagen untuk pekerja yang cepat dan terfokus. Gunakan tim agen ketika rekan tim perlu berbagi temuan, saling menantang, dan berkoordinasi secara independen.

---

## Pengaturan & Konfigurasi

### Mengaktifkan Tim Agen

Sudah dikonfigurasi di [.claude/settings.local.json](.claude/settings.local.json):

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

Atau atur di lingkungan shell Anda:
```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

### Mode Tampilan

Konfigurasi di `~/.claude/settings.json`:

```json
{
  "teammateMode": "auto"  // "auto" (default), "in-process", atau "tmux"
}
```

| Mode | Deskripsi | Persyaratan |
|---|---|---|
| **`auto`** (default) | Gunakan split pane jika dalam sesi tmux, jika tidak in-process | Tidak ada |
| **`in-process`** | Semua rekan tim berjalan di dalam terminal utama. Gunakan `Shift+Down` untuk berpindah | Terminal apa pun |
| **`tmux`** | Setiap rekan tim mendapatkan pane sendiri | tmux atau iTerm2 |

**Override untuk satu sesi:**
```bash
claude --teammate-mode in-process
```

### Pengaturan Split-Pane

- **tmux:** Instal melalui pengelola paket sistem. `tmux -CC` di iTerm2 direkomendasikan untuk macOS.
- **iTerm2:** Instal [`it2` CLI](https://github.com/mkusaka/it2), aktifkan Python API di **iTerm2 → Settings → General → Magic → Enable Python API**.

---

## Konsep Dasar

### Komponen Arsitektur

| Komponen | Peran |
|---|---|
| **Pemimpin Tim** | Sesi Claude Code utama; membuat tim, melahirkan rekan tim, mengoordinasikan pekerjaan |
| **Rekan Tim** | Instance Claude Code terpisah yang mengerjakan tugas yang ditugaskan |
| **Daftar Tugas** | Daftar item kerja bersama yang diklaim dan diselesaikan oleh rekan tim |
| **Kotak Surat** | Sistem pesan untuk komunikasi antar agen |

### Lokasi Penyimpanan

- **Konfigurasi tim:** `~/.claude/teams/{nama-tim}/config.json`
- **Daftar tugas:** `~/.claude/tasks/{nama-tim}/`

> **Peringatan:** Konfigurasi tim menyimpan status runtime (ID sesi, ID pane tmux). Jangan edit secara manual — perubahan akan ditimpa pada pembaruan status berikutnya.

### Status Tugas & Ketergantungan

Tugas memiliki tiga status: `pending` → `sedang dikerjakan` → `selesai`

- Tugas dapat **bergantung pada tugas lain**
- Tugas yang menunggu dengan ketergantungan yang belum terselesaikan **tidak dapat diklaim** hingga ketergantungan diselesaikan
- Klaim tugas menggunakan **kunci file** untuk mencegah kondisi balapan (race condition)

---

## Cara Mengontrol Tim Anda

### Memulai Tim

Beritahu Claude dalam bahasa alami:

```
Buat tim agen untuk mengeksplorasi masalah ini dari sudut pandang berbeda:
satu rekan tim untuk UX, satu untuk arsitektur teknis, satu sebagai pengacau (devil's advocate).
```

Claude akan:
1. Membuat daftar tugas bersama
2. Melahirkan rekan tim untuk setiap peran
3. Meminta mereka mengeksplorasi masalah
4. Menyintesis temuan
5. Membersihkan setelah selesai

### Menentukan Rekan Tim dan Model

```
Buat tim dengan 4 rekan tim untuk me-refactor modul-modul ini secara paralel.
Gunakan Sonnet untuk setiap rekan tim.
```

**Cara menentukan model:**
- Secara default, semua teammates menggunakan model default (biasanya Sonnet)
- Untuk menentukan model spesifik: `"Gunakan Sonnet untuk setiap rekan tim"` atau `"Gunakan Haiku untuk peneliti, Sonnet untuk pengembang"`
- Model yang tersedia: `Haiku` (cepat, murah), `Sonnet` (seimbang), `Opus` (paling cerdas)
- Anda juga dapat menggunakan `--model` flag saat memulai Claude Code: `claude --model sonnet`

**Catatan:** Penentuan model per teammate saat spawn masih terbatas. Cara yang paling andal adalah menyebutkannya dalam prompt spawn:
```
Lahirkan rekan tim dengan model Haiku untuk tugas penelitian sederhana.
Lahirkan rekan tim dengan model Opus untuk arsitektur kompleks.
```

### Memerlukan Persetujuan Rencana

Untuk tugas yang kompleks/berisiko tinggi, minta rekan tim untuk merencanakan sebelum mengimplementasi:

```
Lahirkan rekan tim arsitek untuk me-refactor modul autentikasi.
Perlukan persetujuan rencana sebelum mereka membuat perubahan apa pun.
```

- Rekan tim bekerja dalam mode rencana hanya-baca
- Mengirim permintaan persetujuan rencana ke pemimpin
- Pemimpin meninjau dan menyetujui/menolak dengan umpan balik
- Jika ditolak, rekan tim merevisi dan mengajukan kembali
- Setelah disetujui, rekan tim keluar dari mode rencana dan mengimplementasi

**Untuk mempengaruhi penilaian pemimpin:** Berikan kriteria dalam prompt Anda:
- "Hanya setujui rencana yang menyertakan cakupan tes"
- "Tolak rencana yang memodifikasi skema database"

### Berbicara Langsung ke Rekan Tim

Setiap rekan tim adalah **sesi Claude Code lengkap yang independen**.

**Mode in-process:**
- `Shift+Down` untuk berpindah antar rekan tim
- Ketik untuk mengirim pesan langsung
- `Enter` untuk melihat sesi rekan tim
- `Escape` untuk menginterupsi giliran saat ini
- `Ctrl+T` untuk beralih daftar tugas

**Mode split-pane:**
- Klik ke pane rekan tim untuk berinteraksi langsung
- Setiap rekan tim memiliki tampilan lengkap terminalnya sendiri

### Menugaskan dan Mengklaim Tugas

- **Pemimpin menugaskan:** Beritahu pemimpin tugas mana yang diberikan ke rekan tim mana
- **Klaim mandiri:** Setelah menyelesaikan tugas, rekan tim mengambil tugas belum ditugaskan berikutnya yang tidak diblokir

### Mematikan Rekan Tim

```
Minta rekan tim peneliti untuk mematikan diri
```

Rekan tim dapat menyetujui (keluar dengan baik) atau menolak dengan penjelasan.

### Membersihkan Tim

```
Bersihkan tim
```

> **Selalu gunakan pemimpin untuk membersihkan.** Rekan tim tidak boleh menjalankan pembersihan — konteks tim mereka mungkin tidak terselesaikan dengan benar.

Pemimpin memeriksa rekan tim yang aktif dan gagal jika ada yang masih berjalan. Matikan mereka terlebih dahulu.

---

## Menggunakan Definisi Subagen untuk Rekan Tim

Anda dapat mereferensikan **jenis subagen** saat melahirkan rekan tim:

```
Lahirkan rekan tim menggunakan jenis agen security-reviewer untuk mengaudit modul auth.
```

Rekan tim akan:
- Menghormati izin `tools` dan `model` dari definisi tersebut
- Menambahkan isi definisi ke prompt sistem mereka sebagai **instruksi tambahan** (bukan pengganti)
- Selalu memiliki akses ke alat koordinasi tim (`SendMessage`, manajemen tugas) meskipun `tools` membatasi alat lain

> **Catatan:** Field frontmatter `skills` dan `mcpServers` **tidak** diterapkan saat berjalan sebagai rekan tim. Rekan tim memuat skills dan MCP server dari pengaturan proyek dan pengguna Anda.

### Cakupan Subagen

Definisikan subagen di:
- **Cakupan proyek:** `.claude/agents/{nama-agen}.md` (dalam proyek Anda)
- **Cakupan pengguna:** `~/.claude/agents/{nama-agen}.md` (tersedia di semua proyek)
- **Cakupan plugin:** Didefinisikan oleh plugin
- **Didefinisikan CLI:** Diteruskan saat runtime

---

## Gerbang Kualitas dengan Hook

Gunakan hook untuk menerapkan aturan ketika rekan tim menyelesaikan pekerjaan:

| Hook | Kapan dijalankan | Perilaku exit code 2 |
|---|---|---|
| `TeammateIdle` | Rekan tim akan menganggur | Kirim umpan balik dan biarkan rekan tim tetap bekerja |
| `TaskCreated` | Tugas sedang dibuat | Cegah pembuatan dan kirim umpan balik |
| `TaskCompleted` | Tugas akan ditandai selesai | Cegah penyelesaian dan kirim umpan balik |

### Contoh Penggunaan Hooks

**Contoh 1: TeammateIdle - Beri instruksi tambahan**
```json
{
  "hooks": {
    "TeammateIdle": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "echo 'Please review the latest findings and update the summary document'"
      }]
    }]
  }
}
```
Ketika rekan tim akan menganggur, hook ini akan memberikan instruksi tambahan sehingga rekan tim tetap bekerja.

**Contoh 2: TaskCompleted - Validasi sebelum selesai**
```json
{
  "hooks": {
    "TaskCompleted": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "bash -c 'if grep -q TODO \"$CLAUDE_TASK_OUTPUT\"; then exit 2; else exit 0; fi'"
      }]
    }]
  }
}
```
Jika output tugas masih berisi "TODO", tugas tidak akan ditandai selesai (exit code 2 mencegah penyelesaian dan kirim umpan balik).

**Contoh 3: TaskCreated - Validasi pembuatan tugas**
```json
{
  "hooks": {
    "TaskCreated": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "bash -c 'if [ ${#CLAUDE_TASK_DESC} -lt 10 ]; then exit 2; else exit 0; fi'"
      }]
    }]
  }
}
```
Mencegah pembuatan tugas dengan deskripsi terlalu pendek (kurang dari 10 karakter).

---

## Praktik Terbaik

### 1. Berikan Konteks yang Cukup ke Rekan Tim

Rekan tim memuat konteks proyek secara otomatis (CLAUDE.md, MCP server, skills), tetapi mereka **tidak mewarisi riwayat percakapan pemimpin**.

**Prompt pelahiran yang baik:**
```
Lahirkan rekan tim pengulas keamanan dengan prompt:
"Tinjau modul autentikasi di src/auth/ untuk kerentanan keamanan.
Fokus pada penanganan token, manajemen sesi, dan validasi input.
Aplikasi menggunakan token JWT yang disimpan dalam cookie httpOnly.
Laporkan masalah apa pun dengan peringkat keparahan."
```

### 2. Pilih Ukuran Tim yang Tepat

- **Mulai dengan 3-5 rekan tim** untuk sebagian besar alur kerja
- **5-6 tugas per rekan tim** menjaga semua orang produktif
- Biaya token skala **linear** dengan jumlah rekan tim
- Semakin banyak rekan tim = semakin besar overhead koordinasi
- Pengembalian yang semakin berkurang melampaui titik tertentu

### 3. Ukuran Tugas yang Tepat

| Ukuran Tugas | Masalah | Solusi |
|---|---|---|
| Terlalu kecil | Overhead koordinasi melebihi manfaat | Gabungkan pekerjaan terkait |
| Terlalu besar | Pekerjaan lama tanpa pemeriksaan, risiko limbah lebih tinggi | Split menjadi pengiriman yang lebih kecil |
| Tepat | Unit mandiri dengan pengiriman yang jelas | Fungsi, file tes, atau tinjauan |

### 4. Hindari Konflik File

**Dua rekan tim mengedit file yang sama = penimpaan.**

Pisahkan pekerjaan sehingga setiap rekan tim memiliki **kumpulan file yang berbeda**.

**Tips Tambahan:**
- **Dokumentasikan kepemilikan file:** Saat membuat task list, sebutkan file mana yang dikelola oleh rekan tim tertentu
- **Gunakan Mailbox:** Sebelum edit file bersama, kirim pesan ke rekan tim lain: "Saya akan edit file X, mohon jangan edit saat ini"
- **Task dependencies:** Jika file harus diedit secara berurutan, buatlah task dependencies: Task B (edit file) bergantung pada Task A (edit file selesai)
- **File locking:** Claude Code menggunakan file locking untuk task claims, tapi tidak untuk file edits. Koordinasi manual via Mailbox diperlukan
- **Split work by layer:** Frontend di `src/components/`, backend di `src/api/`, tests di `tests/` - minimalkan tumpang tindih

### 5. Pantau dan Kemudikan

- Periksa kemajuan rekan tim
- Alihkan pendekatan yang tidak berhasil
- Sintesis temuan saat mereka masuk
- Jangan biarkan tim berjalan tanpa pengawasan terlalu lama

### 6. Tunggu Rekan Tim Menyelesaikan Pekerjaan

Jika pemimpin mulai mengimplementasi sendiri alih-alih menunggu:
```
Tunggu rekan tim Anda menyelesaikan tugas mereka sebelum melanjutkan
```

### 7. Mulai dengan Riset dan Tinjauan

Jika baru menggunakan tim agen, mulai dengan:
- Meninjau PR
- Meneliti pustaka
- Menyelidiki bug

Ini memiliki batasan yang jelas dan tidak memerlukan penulisan kode, menunjukkan nilai eksplorasi paralel tanpa tantangan koordinasi.

---

## Contoh Kasus Penggunaan

### 1. Tinjauan Kode Paralel

```
Buat tim agen untuk meninjau PR #142. Lahirkan tiga pengulas:
- Satu fokus pada implikasi keamanan
- Satu memeriksa dampak performa
- Satu memvalidasi cakupan tes
Minta mereka masing-masing meninjau dan melaporkan temuan.
```

**Mengapa ini berhasil:** Setiap pengulas menerapkan filter berbeda pada PR yang sama. Tidak ada tumpang tindih, cakupan menyeluruh dari setiap domain.

### 2. Investigasi Hipotesis Bersaing

```
Pengguna melaporkan aplikasi keluar setelah satu pesan alih-alih tetap terhubung.
Lahirkan 5 rekan tim agen untuk menyelidiki hipotesis berbeda. Minta mereka
berbicara satu sama lain untuk mencoba membantah teori masing-masing, seperti
debat ilmiah. Perbarui dokumen temuan dengan konsensus apa pun yang muncul.
```

**Mengapa ini berhasil:** Investigasi sekuensial menderita bias penjangkaran (anchoring bias). Beberapa investigator independen yang secara aktif membantah satu sama lain menghasilkan akar penyebab yang lebih dapat diandalkan.

### 3. Pengembangan Fitur Baru

```
Buat tim dengan 4 rekan tim untuk membangun alat CLI untuk melacak komentar
TODO:
- Rekan Tim 1: Desain UX dan antarmuka CLI
- Rekan Tim 2: Arsitektur teknis dan model data
- Rekan Tim 3: Implementasi fitur inti
- Rekan Tim 4: Pengujian dan kasus batas (devil's advocate)
```

### 4. Koordinasi Lintas Lapisan

```
Lahirkan rekan tim untuk menangani perubahan full-stack:
- Rekan tim frontend: Perbarui komponen UI di src/components/
- Rekan tim backend: Perbarui endpoint API di src/api/
- Rekan tim tes: Perbarui tes di tests/
```

---

## Izin

- Rekan tim memulai dengan **pengaturan izin pemimpin**
- Jika pemimpin menjalankan dengan `--dangerously-skip-permissions`, semua rekan tim juga
- Anda dapat mengubah mode rekan tim individu setelah dilahirkan
- **Tidak dapat mengatur mode per-rekan-tim saat pelahiran**

Untuk mengurangi prompt izin, izinkan operasi umum di [pengaturan izin](https://code.claude.com/docs/en/permissions) sebelum melahirkan rekan tim.

---

## Pemecahan Masalah

### Rekan Tim Tidak Muncul

1. Dalam mode in-process, tekan `Shift+Down` untuk berpindah antar rekan tim aktif
2. Periksa apakah tugas cukup kompleks untuk menjamin tim (Claude yang memutuskan)
3. Untuk split pane, pastikan tmux terinstal: `which tmux`
4. Untuk iTerm2, verifikasi `it2` CLI dan Python API diaktifkan

### Terlalu Banyak Prompt Izin

Izinkan operasi umum di pengaturan izin sebelum melahirkan rekan tim.

### Rekan Tim Berhenti karena Kesalahan

1. Periksa output mereka (`Shift+Down` di in-process, atau klik pane di mode split)
2. Berikan instruksi tambahan secara langsung
3. Lahirkan rekan tim pengganti untuk melanjutkan pekerjaan

### Pemimpin Mati Sebelum Pekerjaan Selesai

Minta untuk terus melanjutkan, atau tunggu rekan tim menyelesaikan sebelum melanjutkan.

### Sesi tmux yang Telinggal (Orphaned)

```bash
tmux ls
tmux kill-session -t <nama-sesi>
```

### Status Tugas Terjebak

Rekan tim terkadang gagal menandai tugas sebagai selesai. Periksa apakah pekerjaan sebenarnya sudah selesai dan:
- Perbarui status tugas secara manual
- Minta pemimpin untuk mendorong rekan tim

---

## Keterbatasan

> **Tim agen masih eksperimental.** Keterbatasan saat ini:

| Keterbatasan | Detail |
|---|---|
| **Tidak ada resume sesi** | `/resume` dan `/rewind` tidak memulihkan rekan tim in-process |
| **Status tugas bisa tertinggal** | Rekan tim mungkin gagal menandai tugas selesai, memblokir dependensi |
| **Matikan bisa lambat** | Rekan tim menyelesaikan permintaan saat ini sebelum mematikan |
| **Satu tim per sesi** | Bersihkan tim saat ini sebelum memulai tim baru |
| **Tidak ada tim bersarang** | Rekan tim tidak dapat melahirkan tim mereka sendiri |
| **Pemimpin tetap** | Tidak dapat mempromosikan rekan tim menjadi pemimpin atau mentransfer kepemimpinan |
| **Izin diatur saat pelahiran** | Tidak dapat mengatur mode per-rekan-tim saat pelahiran |
| **Persyaratan split pane** | Tidak didukung di terminal terintegrasi VS Code, Windows Terminal, atau Ghostty |

---

## Referensi Cepat

### Pintasan Keyboard (In-Process)

| Pintasan | Aksi |
|---|---|
| `Shift+Down` | Berpindah antar rekan tim |
| `Enter` | Lihat sesi rekan tim |
| `Escape` | Interupsi giliran saat ini rekan tim |
| `Ctrl+T` | Beralih daftar tugas |

### Perintah Umum

```text
// Memulai tim
"Buat tim agen dengan 3 rekan tim untuk [deskripsi tugas]"

// Menentukan model
"Buat tim dengan 4 rekan tim. Gunakan Sonnet untuk setiap rekan tim."

// Persetujuan rencana
"Lahirkan rekan tim arsitek. Perlukan persetujuan rencana sebelum perubahan."

// Pesan langsung
(Gunakan Shift+Down untuk berpindah, lalu ketik langsung ke rekan tim mana pun)

// Matikan
"Minta rekan tim peneliti untuk mematikan diri"

// Bersihkan
"Bersihkan tim"
```

### Pohon Keputusan: Subagen vs Tim Agen

```
Perlukan pekerjaan paralel?
├── Tidak → Gunakan sesi tunggal
└── Ya
    ├── Pekerja perlu berkomunikasi satu sama lain?
    │   ├── Ya → Gunakan Tim Agen
    │   └── Tidak
    │       ├── Tugas cepat, terfokus (hanya hasil yang penting)?
    │       │   └── Ya → Gunakan Subagen
    │       └── Kompleks, butuh diskusi/kolaborasi?
    │           └── Ya → Gunakan Tim Agen
    └── Edit file yang sama atau tugas sekuensial?
        └── Ya → Gunakan sesi tunggal atau subagen
```

---

## Sumber Daya Terkait

- **Dokumentasi Tim Agen:** https://code.claude.com/docs/en/agent-teams
- **Dokumentasi Subagen:** https://code.claude.com/docs/en/sub-agents
- **Dokumentasi Hook:** https://code.claude.com/docs/en/hooks
- **Dokumentasi Pengaturan:** https://code.claude.com/docs/en/settings
- **Dokumentasi Izin:** https://code.claude.com/docs/en/permissions
- **Dokumentasi Worktrees:** https://code.claude.com/docs/en/worktrees
- **Dokumentasi Biaya:** https://code.claude.com/docs/en/costs#agent-team-token-costs
