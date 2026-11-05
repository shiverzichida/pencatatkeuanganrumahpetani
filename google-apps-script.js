/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - PENGHUBUNG GOOGLE SPREADSHEET & VERCEL
 * Proyek: Catatan Pengeluaran Bangun Rumah - Nahel Al Fath Ichida
 * Lokasi: Jalan Petani Gang Ibrahim, Kota Pontianak
 * =========================================================================
 * 
 * CARA MEMASANG DI GOOGLE SPREADSHEET (Hanya butuh 2 Menit):
 * 1. Buka Google Spreadsheet baru di browser (misal beri nama: "Catatan Bangun Rumah - Nahel")
 * 2. Klik menu: Ekstensi (Extensions) > Apps Script
 * 3. Hapus semua kode default di Apps Script, lalu COPY & PASTE seluruh kode di file ini.
 * 4. Klik icon Save (Simpan).
 * 5. Klik tombol: Deploy (Terapkan) > New deployment (Penerapan baru).
 * 6. Klik ikon gerigi (Select type) > pilih: Web app (Aplikasi Web).
 * 7. Isi konfigurasi:
 *    - Description: Web App Pengeluaran Rumah
 *    - Execute as: Me (email Anda)
 *    - Who has access: Anyone (Siapa saja)  <-- PENTING agar Next.js di Vercel bisa kirim data
 * 8. Klik Deploy > Berikan izin (Authorize access) > Advanced > Go to (unsafe) > Allow.
 * 9. Copy "Web app URL" (format: https://script.google.com/macros/s/.../exec)
 * 10. Masukkan URL tersebut ke aplikasi web catatan pengeluaran Anda!
 */

const SHEET_NAME = "Pengeluaran";
const BUDGET_SHEET = "Budget";

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Sheet 1: Pengeluaran
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  // Header kolom jika masih kosong
  if (sheet.getLastRow() === 0) {
    const headers = [
      "ID", 
      "Tanggal", 
      "Kategori", 
      "Item / Uraian Barang", 
      "Qty", 
      "Satuan", 
      "Harga Satuan (Rp)", 
      "Total Biaya (Rp)", 
      "Pihak / Toko / Penerima", 
      "Catatan", 
      "Bukti / Link Nota", 
      "Waktu Input"
    ];
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#1E293B");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  
  // Sheet 2: Budget
  let budgetSheet = ss.getSheetByName(BUDGET_SHEET);
  if (!budgetSheet) {
    budgetSheet = ss.insertSheet(BUDGET_SHEET);
    budgetSheet.appendRow(["Kategori", "Alokasi Budget (Rp)", "Target Pesimis (Rp)"]);
    const bHeader = budgetSheet.getRange(1, 1, 1, 3);
    bHeader.setBackground("#0F766E");
    bHeader.setFontColor("#FFFFFF");
    bHeader.setFontWeight("bold");
    
    // Default initial budget categories sesuai RAB
    const defaultBudgets = [
      ["Jasa Tukang Borongan", 110000000, 110000000],
      ["Material Struktur Bawah & Pondasi", 47500000, 52250000],
      ["Material Struktur Atas & Dak Beton", 62500000, 68750000],
      ["Material Pasangan Dinding & Partisi", 42500000, 46750000],
      ["Material Rangka Atap & Plafond", 32500000, 35750000],
      ["Lantai Granit, Keramik & Cat", 37500000, 41250000],
      ["Kusen Pintu/Jendela, Sanitair & MEP", 27500000, 30250000],
      ["Operasional & Tak Terduga", 15000000, 16500000]
    ];
    defaultBudgets.forEach(row => budgetSheet.appendRow(row));
    budgetSheet.setFrozenRows(1);
  }
}

// Menangani permintaan GET (Membaca data)
function doGet(e) {
  setupSheet();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues();
  
  if (rows.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify({ status: "success", data: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  const headers = rows[0];
  const items = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const item = {
      id: row[0] ? String(row[0]) : "EXP-" + i,
      date: row[1] instanceof Date ? Utilities.formatDate(row[1], Session.getScriptTimeZone(), "yyyy-MM-dd") : String(row[1]),
      category: String(row[2] || ""),
      itemName: String(row[3] || ""),
      qty: Number(row[4]) || 1,
      unit: String(row[5] || "ls"),
      unitPrice: Number(row[6]) || 0,
      totalPrice: Number(row[7]) || 0,
      vendor: String(row[8] || ""),
      notes: String(row[9] || ""),
      receiptUrl: String(row[10] || ""),
      createdAt: String(row[11] || "")
    };
    items.push(item);
  }
  
  // Baca juga Budget
  const budgetSheet = ss.getSheetByName(BUDGET_SHEET);
  const bRows = budgetSheet.getDataRange().getValues();
  const budgets = [];
  for (let j = 1; j < bRows.length; j++) {
    budgets.push({
      category: String(bRows[j][0]),
      budget: Number(bRows[j][1]) || 0,
      pessimistic: Number(bRows[j][2]) || 0
    });
  }
  
  const response = {
    status: "success",
    data: items,
    budgets: budgets
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// Menangani permintaan POST (Menambah data baru atau hapus)
function doPost(e) {
  setupSheet();
  try {
    const contents = JSON.parse(e.postData.contents);
    const action = contents.action || "add";
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (action === "add") {
      const exp = contents.data;
      const id = exp.id || "EXP-" + new Date().getTime();
      const date = exp.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
      const category = exp.category || "Material Pokok";
      const itemName = exp.itemName || "";
      const qty = Number(exp.qty) || 1;
      const unit = exp.unit || "ls";
      const unitPrice = Number(exp.unitPrice) || 0;
      const totalPrice = Number(exp.totalPrice) || (qty * unitPrice);
      const vendor = exp.vendor || "";
      const notes = exp.notes || "";
      const receiptUrl = exp.receiptUrl || "";
      const createdAt = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
      
      sheet.appendRow([
        id,
        date,
        category,
        itemName,
        qty,
        unit,
        unitPrice,
        totalPrice,
        vendor,
        notes,
        receiptUrl,
        createdAt
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        message: "Data berhasil dicatat ke Spreadsheet", 
        id: id 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "edit") {
      const exp = contents.data;
      const idToEdit = exp.id;
      const rows = sheet.getDataRange().getValues();
      let found = false;
      
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(idToEdit)) {
          const rowNum = i + 1;
          const date = exp.date || rows[i][1];
          const category = exp.category || rows[i][2];
          const itemName = exp.itemName || rows[i][3];
          const qty = Number(exp.qty) || Number(rows[i][4]) || 1;
          const unit = exp.unit || rows[i][5] || "ls";
          const unitPrice = Number(exp.unitPrice) || Number(rows[i][6]) || 0;
          const totalPrice = Number(exp.totalPrice) || (qty * unitPrice);
          const vendor = exp.vendor !== undefined ? exp.vendor : rows[i][8];
          const notes = exp.notes !== undefined ? exp.notes : rows[i][9];
          const receiptUrl = exp.receiptUrl !== undefined ? exp.receiptUrl : rows[i][10];
          const updatedAt = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

          sheet.getRange(rowNum, 1, 1, 12).setValues([[
            idToEdit,
            date,
            category,
            itemName,
            qty,
            unit,
            unitPrice,
            totalPrice,
            vendor,
            notes,
            receiptUrl,
            updatedAt
          ]]);
          found = true;
          break;
        }
      }

      return ContentService.createTextOutput(JSON.stringify({ 
        status: found ? "success" : "not_found",
        message: found ? "Data berhasil diubah di Spreadsheet" : "ID tidak ditemukan" 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "delete") {
      const idToDelete = contents.id;
      const rows = sheet.getDataRange().getValues();
      let found = false;
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(idToDelete)) {
          sheet.deleteRow(i + 1);
          found = true;
          break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ 
        status: found ? "success" : "not_found",
        message: found ? "Baris berhasil dihapus" : "ID tidak ditemukan" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Aksi tidak dikenali" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
