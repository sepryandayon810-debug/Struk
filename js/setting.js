/**
 * SETTING SERVICE - KasiRin
 * Fungsi: Kelola header struk, pilihan printer, auto-print, test print
 */

const SettingApp = {
  // ─── Init page setting ───
  init() {
    this.loadForm();
    this.bindEvents();
    console.log('[Setting] Initialized');
  },

  // ─── Isi form dari storage ───
  loadForm() {
    const s = App.getSetting();
    document.getElementById('inp-nama-toko').value = s.namaToko || '';
    document.getElementById('inp-alamat').value = s.alamat || '';
    document.getElementById('inp-telepon').value = s.telepon || '';
    document.getElementById('inp-footer').value = s.footer || '';
    document.getElementById('inp-printer-mac').value = s.printerMAC || '';
    document.getElementById('inp-auto-print').checked = !!s.autoPrint;
  },

  // ─── Simpan ke storage ───
  simpan() {
    const data = {
      namaToko: document.getElementById('inp-nama-toko').value.trim(),
      alamat: document.getElementById('inp-alamat').value.trim(),
      telepon: document.getElementById('inp-telepon').value.trim(),
      footer: document.getElementById('inp-footer').value.trim(),
      printerMAC: document.getElementById('inp-printer-mac').value.trim(),
      autoPrint: document.getElementById('inp-auto-print').checked
    };

    App.saveSetting(data);
    App.toast('✅ Pengaturan tersimpan');
  },

  // ─── Event listener tombol ───
  bindEvents() {
    document.getElementById('btn-simpan-setting').addEventListener('click', () => this.simpan());
    document.getElementById('btn-test-print').addEventListener('click', () => this.testPrint());
    document.getElementById('btn-scan-printer').addEventListener('click', () => this.scanPrinter());
    document.getElementById('btn-kembali-kasir').addEventListener('click', () => App.goto('page-kasir.html'));
  },

  // ─── Test Print: kirim struk dummy ke Android ───
  async testPrint() {
    const s = App.getSetting();
    const dummy = [
      s.namaToko,
      s.alamat,
      '----------------',
      'TEST PRINT OK',
      'Printer siap pakai',
      '----------------',
      s.footer
    ].join('\n');

    const res = await App.printToNative(dummy);
    if (!res.success) {
      App.toast('❌ Gagal test print: ' + (res.error || 'unknown'));
    }
  },

  // ─── Scan Printer: trigger Android Studio untuk scan Bluetooth ───
  scanPrinter() {
    if (window.AndroidBridge && window.AndroidBridge.scanPrinter) {
      window.AndroidBridge.scanPrinter();
    } else if (window.Capacitor?.Plugins?.BluetoothPrinter?.scan) {
      window.Capacitor.Plugins.BluetoothPrinter.scan();
    } else {
      App.toast('Scan printer via Android Settings > Bluetooth');
    }
  }
};

// ─── Jalankan saat page load ───
document.addEventListener('DOMContentLoaded', () => SettingApp.init());
