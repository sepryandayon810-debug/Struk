/**
 * KASIR SERVICE - KasiRin
 * Fungsi: Input manual produk, pilih dari list, keranjang, bayar, print struk
 */

const KasirApp = {
  // State
  keranjang: [],
  produkList: [], // Nanti diisi dari Firebase / local

  // ─── Init page kasir ───
  init() {
    this.loadProdukDummy(); // Ganti ini dengan fetch Firebase kamu
    this.renderProdukList();
    this.renderKeranjang();
    this.bindEvents();
    this.updateTotal();
    console.log('[Kasir] Initialized');
  },

  // ─── Data produk sementara (ganti dengan fetch Firebase) ───
  loadProdukDummy() {
    this.produkList = [
      { id: 1, nama: 'Kopi Hitam', harga: 8000 },
      { id: 2, nama: 'Teh Manis', harga: 5000 },
      { id: 3, nama: 'Nasi Goreng', harga: 15000 },
      { id: 4, nama: 'Mie Goreng', harga: 13000 },
      { id: 5, nama: 'Air Mineral', harga: 4000 },
    ];
  },

  // ─── Render list produk (bagian tengah/scroll) ───
  renderProdukList() {
    const container = document.getElementById('list-produk');
    container.innerHTML = '';
    this.produkList.forEach(p => {
      const el = document.createElement('div');
      el.className = 'produk-card';
      el.innerHTML = `
        <div class="produk-nama">${p.nama}</div>
        <div class="produk-harga">${App.formatRupiah(p.harga)}</div>
      `;
      el.addEventListener('click', () => this.tambahKeKeranjang(p));
      container.appendChild(el);
    });
  },

  // ─── Tambah produk dari LIST (klik card) ───
  tambahKeKeranjang(produk, qty = 1) {
    const existing = this.keranjang.find(i => i.id === produk.id);
    if (existing) {
      existing.qty += qty;
    } else {
      this.keranjang.push({ ...produk, qty: qty });
    }
    this.renderKeranjang();
    App.toast(`+ ${produk.nama}`);
  },

  // ─── Tambah produk MANUAL (input bebas) ───
  tambahManual() {
    const nama = document.getElementById('manual-nama').value.trim();
    const harga = App.parseNumber(document.getElementById('manual-harga').value);
    const qty = parseInt(document.getElementById('manual-qty').value) || 1;

    if (!nama || harga <= 0) {
      App.toast('Nama & harga wajib diisi');
      return;
    }

    // Produk manual pakai ID random negatif biar beda dari list
    const item = {
      id: 'manual-' + Date.now(),
      nama: nama,
      harga: harga,
      qty: qty
    };

    this.keranjang.push(item);
    this.renderKeranjang();

    // Reset form manual
    document.getElementById('manual-nama').value = '';
    document.getElementById('manual-harga').value = '';
    document.getElementById('manual-qty').value = '1';
  },

  // ─── Render ulang keranjang ───
  renderKeranjang() {
    const container = document.getElementById('keranjang-list');
    container.innerHTML = '';

    this.keranjang.forEach((item, index) => {
      const subtotal = item.harga * item.qty;
      const el = document.createElement('div');
      el.className = 'keranjang-item';
      el.innerHTML = `
        <div class="ki-info">
          <div class="ki-nama">${item.nama}</div>
          <div class="ki-harga">${App.formatRupiah(item.harga)} x ${item.qty}</div>
        </div>
        <div class="ki-aksi">
          <button class="btn-qty" data-idx="${index}" data-act="minus">−</button>
          <span class="ki-qty">${item.qty}</span>
          <button class="btn-qty" data-idx="${index}" data-act="plus">+</button>
          <button class="btn-hapus" data-idx="${index}">🗑</button>
        </div>
        <div class="ki-subtotal">${App.formatRupiah(subtotal)}</div>
      `;
      container.appendChild(el);
    });

    this.updateTotal();
    this.bindKeranjangEvents();
  },

  // ─── Event listener untuk tombol + - hapus di keranjang ───
  bindKeranjangEvents() {
    document.querySelectorAll('.btn-qty').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.idx);
        const act = e.target.dataset.act;
        if (act === 'plus') this.keranjang[idx].qty++;
        if (act === 'minus') {
          this.keranjang[idx].qty--;
          if (this.keranjang[idx].qty <= 0) this.keranjang.splice(idx, 1);
        }
        this.renderKeranjang();
      });
    });

    document.querySelectorAll('.btn-hapus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.idx);
        this.keranjang.splice(idx, 1);
        this.renderKeranjang();
      });
    });
  },

  // ─── Hitung & tampilkan total ───
  updateTotal() {
    const total = this.keranjang.reduce((sum, i) => sum + (i.harga * i.qty), 0);
    document.getElementById('total-belanja').textContent = App.formatRupiah(total);
    return total;
  },

  // ─── Proses Bayar ───
  bayar() {
    const total = this.updateTotal();
    if (total <= 0) {
      App.toast('Keranjang masih kosong');
      return;
    }

    const bayarInput = App.parseNumber(document.getElementById('input-bayar').value);
    if (bayarInput < total) {
      App.toast('Uang bayar kurang!');
      return;
    }

    const kembalian = bayarInput - total;
    document.getElementById('kembalian').textContent = App.formatRupiah(kembalian);

    // Simpan transaksi (ganti dengan Firebase kamu)
    const transaksi = {
      items: [...this.keranjang],
      total: total,
      bayar: bayarInput,
      kembalian: kembalian,
      waktu: new Date().toISOString()
    };
    console.log('[Transaksi]', transaksi);

    // Auto print kalau setting aktif
    const setting = App.getSetting();
    if (setting.autoPrint) {
      this.printStruk(transaksi);
    }

    App.toast('✅ Transaksi sukses!');
    this.reset();
  },

  // ─── Print Struk: format ESC/POS-like lalu kirim ke Native ───
  async printStruk(transaksi) {
    const s = App.getSetting();
    let struk = '';
    struk += s.namaToko + '\n';
    if (s.alamat) struk += s.alamat + '\n';
    if (s.telepon) struk += 'Telp: ' + s.telepon + '\n';
    struk += '----------------\n';
    struk += 'Struk Transaksi\n';
    struk += '----------------\n';

    transaksi.items.forEach(i => {
      struk += `${i.nama}\n`;
      struk += `${i.qty} x ${App.formatRupiah(i.harga)} = ${App.formatRupiah(i.harga * i.qty)}\n`;
    });

    struk += '----------------\n';
    struk += `TOTAL: ${App.formatRupiah(transaksi.total)}\n`;
    struk += `BAYAR: ${App.formatRupiah(transaksi.bayar)}\n`;
    struk += `KEMBALI: ${App.formatRupiah(transaksi.kembalian)}\n`;
    struk += '----------------\n';
    struk += s.footer + '\n';
    struk += '\n\n\n'; // Feed kertas

    await App.printToNative(struk);
  },

  // ─── Reset kasir setelah bayar ───
  reset() {
    this.keranjang = [];
    this.renderKeranjang();
    document.getElementById('input-bayar').value = '';
    document.getElementById('kembalian').textContent = 'Rp 0';
  },

  // ─── Event listener global page kasir ───
  bindEvents() {
    document.getElementById('btn-tambah-manual').addEventListener('click', () => this.tambahManual());
    document.getElementById('btn-bayar').addEventListener('click', () => this.bayar());
    document.getElementById('btn-print-ulang').addEventListener('click', () => {

      // ─── TAMBAH INI ───
    document.getElementById('btn-uang-pas').addEventListener('click', () => {
      const total = this.updateTotal();
      if (total <= 0) {
        App.toast('Keranjang masih kosong');
        return;
      }
      document.getElementById('input-bayar').value = total;
      // Auto hitung kembalian = 0
      document.getElementById('kembalian').textContent = 'Rp 0';
      App.toast('✅ Uang pas: ' + App.formatRupiah(total));
    });
      
      // Print ulang struk terakhir (simpan dulu ya kalau mau fitur ini)
      App.toast('Print ulang: simpan transaksi terakhir dulu ke variabel');
    });
    document.getElementById('btn-ke-setting').addEventListener('click', () => App.goto('page-setting.html'));
  }
};

// ─── Jalankan saat page load ───
document.addEventListener('DOMContentLoaded', () => KasirApp.init());
