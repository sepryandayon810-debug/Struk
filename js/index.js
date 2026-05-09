/**
 * INDEX / LAUNCHER SERVICE - KasiRin
 * Fungsi: Entry point aplikasi. Cek first-run, tampilkan info toko,
 *         navigasi ke menu Kasir atau Setting.
 */

const LauncherApp = {
  // ─── Init saat aplikasi dibuka ───
  init() {
    this.cekFirstRun();      // Cek apakah user baru pertama kali buka
    this.tampilkanInfo();    // Load info toko & status printer
    this.bindEvents();       // Pasang tombol menu
    console.log('[Launcher] App entry point ready');
  },

  // ─── Cek First Run ───
  // Logika: kalau setting masih default (namaToko = 'KasiRin POS' dan kosong),
  // anggap user belum setup → kasih notice + arahkan ke Setting
  cekFirstRun() {
    const setting = App.getSetting();

    const belumSetup = (
      setting.namaToko === 'KasiRin POS' ||
      !setting.namaToko ||
      !setting.printerMAC
    );

    if (belumSetup) {
      const notice = document.getElementById('first-run');
      if (notice) notice.style.display = 'block';
      console.log('[Launcher] First run detected - user needs setup');
    }
  },

  // ─── Tampilkan Info Toko & Status Printer ───
  // Baca dari storage (App.getSetting) lalu render ke launcher
  tampilkanInfo() {
    const s = App.getSetting();

    // Nama toko
    const elNama = document.getElementById('info-nama-toko');
    if (elNama) {
      elNama.textContent = s.namaToko || 'Belum diatur';
    }

    // Status printer (warna dot + teks)
    const dot = document.getElementById('status-printer-dot');
    const txt = document.getElementById('status-printer-text');

    if (dot && txt) {
      if (s.printerMAC && s.printerMAC.length > 0) {
        dot.className = 'status-dot status-on';
        txt.textContent = 'Printer: ' + s.printerMAC;
      } else {
        dot.className = 'status-dot status-off';
        txt.textContent = 'Printer belum terhubung';
      }
    }
  },

  // ─── Event Listener Tombol Navigasi ───
  bindEvents() {
    // Tombol Menu Kasir → pindah ke page-kasir.html
    document.getElementById('btn-go-kasir').addEventListener('click', () => {
      console.log('[Launcher] Navigating to Kasir');
      App.goto('page-kasir.html');
    });

    // Tombol Setting → pindah ke page-setting.html
    document.getElementById('btn-go-setting').addEventListener('click', () => {
      console.log('[Launcher] Navigating to Setting');
      App.goto('page-setting.html');
    });
  }
};

// ─── Jalankan saat DOM ready ───
document.addEventListener('DOMContentLoaded', () => LauncherApp.init());
