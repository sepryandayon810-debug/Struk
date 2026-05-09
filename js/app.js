/**
 * APP CORE - KasiRin Android
 * Fungsi: Utility global, format uang, storage wrapper, bridge ke Android native
 */

const App = {
  // ─── Format Rupiah ───
  formatRupiah(angka) {
    if (!angka && angka !== 0) return 'Rp 0';
    return 'Rp ' + parseInt(angka).toLocaleString('id-ID');
  },

  // ─── Parse angka dari input yang ada titik/rupiah ───
  parseNumber(str) {
    if (!str) return 0;
    return parseInt(String(str).replace(/[^0-9]/g, '')) || 0;
  },

  // ─── Storage Wrapper (bisa ganti ke Capacitor Preferences nanti) ───
  storage: {
    get(key, fallback = null) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  },

  // ─── Ambil Setting Global (dipakai kasir & setting) ───
  getSetting() {
    return this.storage.get('kasirin_setting', {
      namaToko: 'KasiRin POS',
      alamat: '',
      telepon: '',
      footer: 'Terima Kasih',
      printerMAC: '',
      autoPrint: false
    });
  },

  // ─── Simpan Setting Global ───
  saveSetting(data) {
    this.storage.set('kasirin_setting', data);
  },

  // ─── Bridge Print ke Android Native ───
  // Dipanggil dari kasir.js & setting.js
  // Android Studio kamu yang handle Bluetooth + ESC/POS
  async printToNative(textEscPos) {
    // Opsi A: Kalau pakai Capacitor Plugin
    if (window.Capacitor && window.Capacitor.Plugins?.BluetoothPrinter) {
      try {
        await window.Capacitor.Plugins.BluetoothPrinter.print({
          mac: App.getSetting().printerMAC,
          data: textEscPos
        });
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    // Opsi B: Kalau pakai custom WebView bridge dari Android Studio
    if (window.AndroidBridge && window.AndroidBridge.printStruk) {
      window.AndroidBridge.printStruk(textEscPos, App.getSetting().printerMAC);
      return { success: true };
    }

    // Fallback: belum ada native bridge
    alert('Printer belum terhubung. Data struk:\n\n' + textEscPos);
    return { success: false, error: 'No native bridge' };
  },

  // ─── Navigasi antar page (karena ini Android single-page feel) ───
  goto(page) {
    window.location.href = page;
  },

  // ─── Toast sederhana ───
  toast(msg) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }
};

// ─── Init Global saat DOM ready ───
document.addEventListener('DOMContentLoaded', () => {
  console.log('[App] KasiRin Core initialized');
});
