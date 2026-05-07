# Agent Teams Patterns & Best Practices

> **Dibuat oleh:** research-team (Peneliti, Strategis, Kritikus)
> **Tanggal:** 2026-05-07
> **Tujuan:** Dokumen sintesis dari hasil riset tim tentang pola penggunaan dan praktik terbaik agent teams

---

## Daftar Isi

1. [Configuration Reference](#1-configuration-reference) - dari Peneliti
2. [Use Case Patterns](#2-use-case-patterns) - dari Strategis
3. [Gaps & Recommendations](#3-gaps--recommendations) - dari Kritikus

---

## 1. Configuration Reference

*Sumber: Laporan Peneliti - Inventaris Terstruktur Lengkap*

### 1.1 Opsi Konfigurasi

#### settings.json (User-level)
- **Lokasi:** `~/.claude/settings.json`
- **Properti:**
  - `env`: Variabel lingkungan
  - `teammateMode`: Mode tampilan (`"auto"`, `"in-process"`, `"tmux"`)

#### settings.local.json (Project-level)
```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```
- **Lokasi:** `.claude/settings.local.json` (dalam direktori proyek)
- **Fungsi:** Mengaktifkan fitur Tim Agen secara lokal

#### Environment Variable
- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS="1"` untuk mengaktifkan
- Dapat diatur via shell: `export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

### 1.2 CLI Flags

| Flag | Format | Deskripsi |
|---|---|---|
| `--teammate-mode` | `claude --teammate-mode <mode>` | Override pengaturan teammateMode (`in-process`, `tmux`, `auto`) |
| `--dangerously-skip-permissions` | `claude --dangerously-skip-permissions` | Melewati semua prompt izin (berlaku untuk semua teammates) |
| `--model` | `claude --model <model>` | Menentukan model (Haiku, Sonnet, Opus) - × |
| `claude --version` | `claude --version` | Cek versi (minimal v2.1.32 untuk agent teams) |

> **Catatan:** Flag `--model` mungkin dapat digunakan untuk menentukan model default, namun cara specify model per teammate masih kurang dokumentasi.

### 1.3 Hooks

| Hook | Kapan Berjalan | Exit Code 2 Behavior | Kegunaan |
|---|---|---|---|
| `TeammateIdle` | Rekan tim akan menganggur | Kirim feedback, biarkan tetap bekerja | Beri instruksi tambahan sebelum idle |
| `TaskCreated` | Tugas sedang dibuat | Cegah pembuatan + feedback | Validasi / gerbang kualitas tugas |
| `TaskCompleted` | Tugas akan ditandai selesai | Cegah penyelesaian + feedback | Paksa perbaikan sebelum selesai |

### 1.4 Mode Tampilan (Display Modes)

#### auto (Default)
- Pilih mode otomatis: tmux jika dalam sesi tmux, jika tidak in-process
- **Requirements:** Tidak ada

#### in-process
- Semua rekan tim berjalan di terminal utama
- **Requirements:** Terminal apa pun
- **Keyboard Shortcuts:**
  - `Shift+Down`: Siklus rekan tim
  - `Enter`: Lihat sesi rekan tim
  - `Escape`: Interupsi giliran saat ini
  - `Ctrl+T`: Toggle task list

#### tmux
- Setiap rekan tim dapat pane tmux sendiri (split pane)
- **Requirements:**
  - tmux (via package manager)
  - Atau iTerm2 dengan `it2` CLI
  - Python API iTerm2 aktif (**iTerm2 → Settings → General → Magic → Enable Python API**)
- **Rekomendasi:** `tmux -CC` di iTerm2 untuk macOS

### 1.5 Perilaku Izin (Permissions)

- **Pewarisan:** Rekan tim memulai dengan izin pemimpin
- **--dangerously-skip-permissions:** Berlaku untuk seluruh tim jika pemimpin menggunakannya
- **Perubahan pasca-spawn:** Dapat mengubah mode rekan tim individu SETELAH dilahirkan
- **Keterbatasan:** Tidak dapat mengatur mode per-teammate SAAT spawn

### 1.6 Lokasi Penyimpanan

| Item | Lokasi | Deskripsi |
|---|---|---|
| Team Config | `~/.claude/teams/{nama-tim}/config.json` | Berisi members array, session IDs, tmux pane IDs |
| Task List | `~/.claude/tasks/{nama-tim}/` | File-file daftar tugas bersama |

> **Peringatan:** Jangan edit team config manual - akan ditimpa saat update status.

### 1.7 Fitur Manajemen Tugas

- **Status:** `pending` → `in progress` → `completed`
- **Dependencies:** Tugas dengan dependensi belum selesai tidak dapat diklaim
- **File Locking:** Mencegah race conditions saat klaim tugas
- **Self-Claim:** Rekan tim mengambil tugas berikutnya yang tidak diblokir
- **Lead Assign:** Pemimpin menugaskan tugas secara eksplisit
- **Best Practice:** 5-6 tugas per rekan tim

### 1.8 Arsitektur

| Komponen | Peran |
|---|---|
| **Team Lead** | Sesi utama; buat tim, spawn teammates, koordinasi, cleanup |
| **Teammates** | Instance Claude terpisah; context window sendiri; independen |
| **Task List** | Shared; koordinasi pekerjaan; status & dependensi |
| **Mailbox** | Sistem pesan antar agen |

**4 Mekanisme Komunikasi:**
1. Automatic message delivery
2. Idle notifications
3. Shared task list
4. Teammate messaging (langsung satu sama lain)

### 1.9 Keterbatasan (Limitations)

| Keterbatasan | Detail |
|---|---|
| No session resumption | `/resume` dan `/rewind` tidak pulihkan rekan tim |
| Task status can lag | Rekan tim mungkin gagal update status |
| Shutdown can be slow | Selesaikan request saat ini sebelum mati |
| One team per session | Cleanup dulu sebelum buat tim baru |
| No nested teams | Teammates tidak bisa spawn tim sendiri |
| Lead is fixed | Tidak ada promosi atau transfer kepemimpinan |
| Permissions set at spawn | Tidak bisa set per-teammate saat spawn |
| Split panes requirements | Tidak didukung di VS Code, Windows Terminal, Ghostty |

### 1.10 Perbedaan dengan Subagen

| Kategori | Subagen | Tim Agen |
|---|---|---|
| **Konteks** | Sendiri; hasil ke pemanggil | Sendiri; sepenuhnya independen |
| **Komunikasi** | Hanya ke agen utama | Langsung satu sama lain |
| **Koordinasi** | Agen utama kelola semua | Task list bersama, koordinasi mandiri |
| **Terbaik untuk** | Tugas terfokus | Kolaborasi kompleks |
| **Biaya token** | Lebih rendah | Lebih tinggi (setiap rekan tim instance terpisah) |

**Decision Tree:**
```
Perlukan pekerjaan paralel?
├── Tidak → Sesi tunggal
└── Ya
    ├── Pekerja perlu berkomunikasi?
    │   ├── Ya → Tim Agen
    │   └── Tidak → Subagen (jika cepat) atau Sesi tunggal
    └── Edit file sama? → Sesi tunggal atau subagen
```

---

## 2. Use Case Patterns

*Sumber: Laporan Strategis - 5 Kasus Penggunaan Kreatif*

### 2.1 Respons Insiden Keamanan Siber (Incident Response)

**Skenario:**
Perusahaan fintech mendeteksi anomali sistem pembayaran pukul 2 pagi. Perlu: isolasi sistem, analisis log, verifikasi database, laporan regulasi, komunikasi stakeholder dalam 1 jam.

**Mengapa Tim Agen:**
Subagen hanya lapor ke pemanggil (bottleneck). Tim agen memungkinkan komunikasi dua arah via Mailbox. TeammateIdle hook (exit 2) memungkinkan pemantauan hingga insiden selesai.

**Struktur Tim (6 teammates):**
- Lead: Incident Commander
- Teammate 1: Forensic Analyst
- Teammate 2: System Isolator
- Teammate 3: Database Integrity Checker
- Teammate 4: Compliance Reporter
- Teammate 5: Stakeholder Communicator

**Alur Kerja:**
Task list dibagi 6-8 tugas. Forensic dan Isolator paralel, berkomunikasi via Mailbox. Database Checker verifikasi kebocoran. Compliance Reporter susun laporan bertahap. Stakeholder Communicator siapkan template. Dependencies: laporan regulasi tunggu forensic dan database check.

> **Kritik:** 6 teammates masih dalam batas wajar untuk insiden kritis, tapi pastikan tidak ada file conflicts.

### 2.2 Produksi Dokumenter Multimedia

**Skenario:**
Produksi dokumenter 60 menit "Sejarah Kuliner Nusantara" - riset arsip, wawancara ahli, penulisan naskah, pengolahan footage, desain soundtrack, subtitel 3 bahasa.

**Mengapa Tim Agen:**
Editor subtitel perlu tahu perubahan naskah real-time. Mailbox memungkinkan komunikasi lintas disiplin. Task dependencies krusial: video edit tidak bisa selesai sebelum footage dan naskah selesai.

**Struktur Tim (7 teammates):**
- Lead: Executive Producer
- Teammate 1: Historical Researcher
- Teammate 2: Script Writer
- Teammate 3: Video Editor
- Teammate 4: Music & Sound Designer
- Teammate 5: Subtitle Translator (ID, EN, ZH)
- Teammate 6: Archivist

> **Kritik:** 7 teammates TERLALU BANYAK. Overhead koordinasi tinggi. Saran: Kurangi ke 4-5 teammates. Archivist bisa diganti subagen.

### 2.3 Audit Keamanan Siber Berkala (Penetration Testing)

**Skenario:**
Audit triwulanan e-commerce: 50+ microservices, 200+ API endpoints, 3 database. Scope: vulnerability scanning, penetration testing, cloud config review, IAM policy analysis, remediation report.

**Mengapa Tim Agen:**
Sesi tunggal butuh hari-hari untuk scan 50+ microservices. Tim agen paralelkan pemindaian. Mode tmux visualisasi real-time. TaskCompleted hook (exit 2) validasi temuan sebelum ditandai selesai.

**Struktur Tim (6 teammates):**
- Lead: Security Audit Lead
- Teammate 1: API Security Tester
- Teammate 2: Infrastructure Scanner
- Teammate 3: Cloud Config Auditor
- Teammate 4: IAM Policy Analyst
- Teammate 5: Report Generator

**Alur Kerja:**
50 microservices dibagi 5 kelompok. API Tester scan endpoint. Cloud Auditor cek S3, security groups. IAM Analyst analisis akses. Temuan kritis via Mailbox ke Lead. Report Generator update laporan incremental. Task list pastikan report selesai setelah semua scan selesai.

### 2.4 Penulisan Buku Teks Akademik Kolaboratif

**Skenario:**
Buku "Kecerdasan Buatan untuk Bisnis" - 12 bab, ~30 halaman/bab, referensi silang, latihan soal, studi kasus, glosarium. Perlu peer review.

**Mengapa Tim Agen:**
Koordinasi kompleks: Bab 5 referensi Bab 2&3, latihan konsisten, glosarium kumpulkan istilah. Mailbox koordinasikan referensi silang. Dependencies: review mulai setelah draft bab selesai.

**Struktur Tim (8 teammates):**
- Lead: Editor-in-Chief
- 4 Chapter Authors (3 bab each)
- Teammate 5: Exercise Designer
- Teammate 6: Peer Reviewer
- Teammate 7: Citation & Reference Manager

> **Kritik:** 8 teammates TERLALU BANYAK. Potensi file conflicts pada LaTeX/Word files. Saran: Kurangi ke 4-5. Exercise Designer dan Citation Manager bisa diganti subagen.

### 2.5 Migrasi Sistem Legacy ke Microservices

**Skenario:**
Aplikasi monolitik 15 tahun (Java 6 + COBOL) ke microservices (K8s, Docker, REST APIs). Scope: analisis kode, pemetaan dependensi, Docker containers, API gateway, migrasi DB, integration testing, rollback strategy.

**Mengapa Tim Agen:**
Migrasi kompleks dengan banyak dependensi. Paralelisasi: analisis, coding, testing bersamaan. Mailbox: Microservices Dev tahu dependensi tersembunyi dari Legacy Analyst. Task dependencies: API Gateway setelah microservices siap.

**Struktur Tim (8 teammates):**
- Lead: Migration Architect
- Teammate 1: Legacy Code Analyst
- Teammate 2: Microservices Developer
- Teammate 3: Container & DevOps Engineer
- Teammate 4: API Gateway Designer
- Teammate 5: Database Migration Specialist
- Teammate 6: Integration Tester
- Teammate 7: Rollback Strategist

> **Kritik:** 8 teammates TERLALU BANYAK. Container & DevOps, API Gateway, Rollback Strategist bisa diganti subagen. Saran: Kurangi ke 4-5 teammates inti.

---

## 3. Gaps & Recommendations

*Sumber: Laporan Kritikus - Analisis Gap dan Rekomendasi*

### 3.1 Gap pada Dokumen Referensi

| Gap | Deskripsi | Severity |
|---|---|---|
| CLI flags tidak lengkap | `--model`, `--resume`, `--rewind` tidak didokumentasi di referensi | Medium |
| Subagent definitions kurang detail | Cara menggunakan subagent definitions sebagai teammates kurang jelas | High |
| Model options tidak jelas | Cara specify Haiku/Sonnet/Opus per teammate tidak didokumentasi | High |
| Keyboard shortcuts hanya in-process | Tidak ada info shortcuts untuk tmux mode | Low |
| Contoh hooks tidak ada | Tidak ada contoh konkret penggunaan TeammateIdle, TaskCreated, TaskCompleted | High |
| Tips hindari file conflicts | Tidak ada panduan menghindari konflik file antar teammates | Medium |
| Token cost detail | Tidak ada perhitungan detail biaya token untuk tim agen | Medium |

### 3.2 Pitfalls pada Use Cases Strategis

| Use Case | Pitfall | Rekomendasi |
|---|---|---|
| 2. Dokumenter (7 teammates) | Overhead koordinasi tinggi, melampaui 5-6 tasks/teammate ideal | Kurangi ke 4-5 teammates |
| 4. Buku Teks (8 teammates) | Potensi file conflicts pada LaTeX/Word, terlalu banyak komunikasi | Kurangi ke 4-5, gunakan subagen untuk task kecil |
| 5. Migration (8 teammates) | Beberapa peran bisa diganti subagen saja (tidak butuh komunikasi) | Kurangi ke 4-5 teammates inti |

**Panduan Jumlah Teammates:**
- **3-5 teammates:** Ideal untuk sebagian besar alur kerja
- **6+ teammates:** Hanya untuk kasus khusus (insiden kritis, audit masif)
- Gunakan subagen untuk tugas yang tidak butuh komunikasi antar pekerja

### 3.3 Yang Hilang dari Dokumen Referensi

Berdasarkan perbandingan dengan dokumentasi resmi, ini yang hilang:

1. **Contoh konkret hooks:**
   ```bash
   # Contoh TeammateIdle hook
   # Exit 2 = kirim feedback dan teruskan bekerja
   ```

2. **Penjelasan subagent definitions sebagai teammates:**
   - Cara refrensi: "Spawn a teammate using the security-reviewer agent type"
   - `tools` allowlist dan `model` dihormati
   - `skills` dan `mcpServers` frontmatter TIDAK diterapkan

3. **Tips menghindari file conflicts:**
   - Pisahkan kepemilikan file: setiap teammate punya set file berbeda
   - Gunakan file locking (sudah built-in untuk task claims)
   - Koordinasi via Mailbox sebelum edit file bersama

4. **Perhitungan token cost:**
   - Biaya token skala LINEAR dengan jumlah teammates
   - Setiap teammate punya context window sendiri
   - Lihat: https://code.claude.com/docs/en/costs#agent-team-token-costs

### 3.4 Rekomendasi Konkret

#### Untuk Dokumen Referensi (docs/agent-teams-reference-id.md):

1. **Tambahkan section "Contoh Penggunaan Hooks"**
   ```markdown
   ## Contoh Penggunaan Hooks
   
   ### TeammateIdle Hook
   Berikan instruksi tambahan saat rekan tim akan menganggur...
   
   ### TaskCreated Hook
   Validasi tugas sebelum dibuat...
   
   ### TaskCompleted Hook
   Paksa perbaikan sebelum tugas ditandai selesai...
   ```

2. **Dokumentasikan cara specify model per teammate**
   ```markdown
   ## Menentukan Model per Teammate
   
   Saat ini, semua teammates menggunakan model default (biasanya Sonnet).
   Untuk menentukan model:
   "Create a team with 3 teammates. Use Haiku for researchers, Sonnet for developers."
   ```

3. **Tambahkan section "Common Pitfalls"**
   - Terlalu banyak teammates (>5) = overhead koordinasi tinggi
   - File conflicts = bagi kepemilikan file dengan jelas
   - Task status lag = cek manual dan update jika perlu
   - Lupa cleanup = selalu bersihkan tim setelah selesai

4. **Tambahkan tips untuk tim besar (>5 teammates)**
   - Gunakan mode tmux untuk visibilitas lebih baik
   - Set task dependencies dengan jelas
   - Assign lead untuk monitor dan steer secara aktif
   - Pertimbangkan split menjadi 2 tim (tapi ingat: one team per session)

#### Untuk Penggunaan Praktis:

1. **Mulai dengan 3-4 teammates** untuk hampir semua kasus
2. **Gunakan subagen** untuk tugas yang tidak butuh komunikasi dua arah
3. **Hindari file conflicts** dengan pembagian file yang jelas
4. **Monitor dan steer** tim secara aktif - jangan biarkan berjalan tanpa pengawasan
5. **Gunakan hooks** untuk enforce quality gates
6. **Cleanup selalu** setelah tim selesai

### 3.5 Pesan untuk Peneliti

> "Tambahkan info tentang `--model` flag dan cara specify model per teammate. Dokumentasikan juga `skills` dan `mcpServers` frontmatter behavior saat subagent definition dipakai sebagai teammate."

### 3.6 Pesan untuk Strategis

> "Use cases 2 (Dokumenter), 4 (Buku Teks), dan 5 (Migration) terlalu banyak teammates (7-8). Coba kurangi ke 3-5 teammates sesuai best practice. Beberapa peran bisa diganti subagen (tidak butuh komunikasi langsung)."

---

## Kesimpulan

Tim agen (agent teams) adalah fitur eksperimental di Claude Code yang memungkinkan koordinasi multiple instance Claude Code yang bekerja paralel dan berkomunikasi langsung satu sama lain. Keunggulannya terletak pada:

- **Mailbox** untuk komunikasi dua arah
- **Task dependencies** untuk alur kerja kompleks
- **Parallel execution** untuk efisiensi waktu
- **Self-claim tasks** untuk otonomi rekan tim

**Best practice utama:**
1. Mulai dengan 3-5 teammates
2. 5-6 tasks per teammate
3. Hindari file conflicts dengan pembagian file jelas
4. Gunakan hooks untuk quality gates
5. Monitor dan steer tim secara aktif

**Kapan menggunakan agent teams vs subagents:**
- Gunakan **subagents** untuk tugas cepat, terfokus, hanya hasil yang penting
- Gunakan **agent teams** untuk pekerjaan kompleks yang butuh diskusi, kolaborasi, dan komunikasi dua arah

---

## Sumber Daya

- **Dokumentasi Resmi:** https://code.claude.com/docs/en/agent-teams
- **Subagents:** https://code.claude.com/docs/en/sub-agents
- **Hooks:** https://code.claude.com/docs/en/hooks
- **Settings:** https://code.claude.com/docs/en/settings
- **Costs:** https://code.claude.com/docs/en/costs#agent-team-token-costs
- **Laporan Peneliti:** Inventaris Terstruktur Lengkap (lihat di atas, Section 1)
- **Laporan Strategis:** `strategist_report.md`
- **Laporan Kritikus:** `critic_report.md`
