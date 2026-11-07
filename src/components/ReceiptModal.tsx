"use client";

import React, { useState } from "react";
import { X, Printer, CheckCircle, FileText, User, CreditCard, Layout } from "lucide-react";
import { ExpenseItem } from "@/types/expense";
import { formatRupiah, formatDateIndo, angkaTerbilang } from "@/lib/utils";

interface ReceiptModalProps {
  item: ExpenseItem | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  // Editable fields with smart defaults
  const [payerName, setPayerName] = useState("Nahel Al Fath Ichida");
  const [paymentMethod, setPaymentMethod] = useState<"Tunai" | "Transfer Bank">("Tunai");
  const [paperSize, setPaperSize] = useState<"A5 landscape" | "A4 portrait">("A5 landscape");
  const [receiptNo, setReceiptNo] = useState(() => {
    const cleanDate = (item.date || "").replace(/-/g, "");
    const cleanId = (item.id || "").replace("EXP-", "").slice(-5);
    return `KW/${cleanDate || "2026"}/${cleanId || "001"}`;
  });

  const terbilangText = angkaTerbilang(item.totalPrice || 0);

  // Print via isolated iframe to ensure instantaneous rendering, no blank page, and exact paper size
  const handlePrint = () => {
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "none";
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document;
    if (!frameDoc) return;

    const receiptHtml = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Kuitansi-${receiptNo}</title>
        <style>
          @page {
            size: ${paperSize};
            margin: 8mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #0f172a;
            background: #ffffff;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            padding: ${paperSize.startsWith("A5") ? "2mm" : "6mm"};
          }
          .kuitansi-box {
            border: 2px solid #334155;
            padding: 16px 20px;
            border-radius: 8px;
            background: #ffffff;
            position: relative;
          }
          .kuitansi-inner {
            border: 1px solid #94a3b8;
            padding: 16px 20px;
            border-radius: 6px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 10px;
            margin-bottom: 14px;
          }
          .title {
            font-size: 16px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #0f172a;
          }
          .subtitle {
            font-size: 11px;
            font-weight: 700;
            color: #334155;
            margin-top: 2px;
          }
          .address {
            font-size: 9.5px;
            color: #64748b;
            margin-top: 1px;
          }
          .receipt-badge {
            display: inline-block;
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 3px 8px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 11px;
            font-weight: bold;
            color: #0f172a;
          }
          .date-text {
            font-size: 10px;
            color: #64748b;
            margin-top: 3px;
            text-align: right;
          }
          .row {
            display: flex;
            margin-bottom: 9px;
            align-items: baseline;
            font-size: 11px;
          }
          .label {
            width: 130px;
            font-weight: bold;
            color: #475569;
            text-transform: uppercase;
            font-size: 9.5px;
            flex-shrink: 0;
          }
          .value {
            flex: 1;
            font-weight: bold;
            color: #0f172a;
            border-bottom: 1px dashed #cbd5e1;
            padding-bottom: 3px;
          }
          .terbilang-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 6px 10px;
            font-style: italic;
            font-weight: bold;
            color: #1e293b;
            font-size: 11.5px;
            line-height: 1.4;
          }
          .footer-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 14px;
            padding-top: 12px;
            border-top: 1px solid #cbd5e1;
          }
          .amount-box {
            display: inline-block;
            background: #0f172a;
            color: #ffffff;
            padding: 8px 14px;
            border-radius: 6px;
            border: 1.5px solid #0f172a;
          }
          .amount-label {
            font-size: 8px;
            text-transform: uppercase;
            font-weight: bold;
            color: #34d399;
            display: block;
            margin-bottom: 2px;
          }
          .amount-value {
            font-size: 16px;
            font-weight: 900;
            font-family: monospace;
            letter-spacing: -0.5px;
          }
          .stamp {
            display: inline-block;
            border: 2px solid ${item.paymentStatus === "Bon / Tempo" ? "#d97706" : "#059669"};
            color: ${item.paymentStatus === "Bon / Tempo" ? "#b45309" : "#047857"};
            background: ${item.paymentStatus === "Bon / Tempo" ? "#fef3c7" : "#ecfdf5"};
            font-weight: 900;
            font-size: 10px;
            padding: 2px 8px;
            border-radius: 4px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 6px;
          }
          .signatures {
            display: flex;
            gap: 25px;
            text-align: center;
          }
          .sign-col {
            width: 130px;
            font-size: 10px;
          }
          .sign-title {
            color: #475569;
            margin-bottom: 45px;
            font-weight: 600;
          }
          .sign-name {
            font-weight: bold;
            border-top: 1px solid #475569;
            padding-top: 3px;
            color: #0f172a;
          }
        </style>
      </head>
      <body>
        <div class="kuitansi-box">
          <div class="kuitansi-inner">
            <div class="header">
              <div>
                <div class="title">KUITANSI PEMBAYARAN</div>
                <div class="subtitle">Proyek Pembangunan Rumah Tinggal Nahel Al Fath</div>
                <div class="address">Jl. Petani Gg. Ibrahim, Kec. Pontianak Kota, Kota Pontianak, Kalimantan Barat</div>
              </div>
              <div>
                <div class="receipt-badge">${receiptNo}</div>
                <div class="date-text">Tanggal: ${formatDateIndo(item.date)}</div>
              </div>
            </div>

            <div class="row">
              <div class="label">Telah Terima Dari</div>
              <div class="value">${payerName}</div>
            </div>

            <div class="row">
              <div class="label">Uang Sejumlah</div>
              <div class="value terbilang-box"># ${terbilangText} #</div>
            </div>

            <div class="row" style="align-items: flex-start;">
              <div class="label" style="padding-top: 3px;">Untuk Pembayaran</div>
              <div class="value" style="line-height: 1.5;">
                <strong>${item.itemName}</strong><br>
                <span style="font-size: 10px; color: #475569;">• Rincian: ${item.qty} ${item.unit} × ${formatRupiah(item.unitPrice)}</span><br>
                <span style="font-size: 10px; color: #475569;">• Pos Anggaran: ${item.category}</span>
                ${item.notes ? `<br><span style="font-size: 10px; color: #64748b; font-style: italic;">• Catatan: ${item.notes}</span>` : ""}
              </div>
            </div>

            <div class="row">
              <div class="label">Penerima / Vendor</div>
              <div class="value">${item.vendor || "Toko / Mandor"} (${paymentMethod})</div>
            </div>

            <div class="footer-section">
              <div>
                <div class="amount-box">
                  <span class="amount-label">Jumlah Total Dibayar:</span>
                  <span class="amount-value">${formatRupiah(item.totalPrice)}</span>
                </div>
                <div>
                  <span class="stamp">${item.paymentStatus === "Bon / Tempo" ? "BON / TEMPO" : "LUNAS"}</span>
                </div>
              </div>

              <div class="signatures">
                <div class="sign-col">
                  <div class="sign-title">Yang Menyerahkan,</div>
                  <div class="sign-name">${payerName}</div>
                </div>
                <div class="sign-col">
                  <div class="sign-title">Pontianak, ${formatDateIndo(item.date)}<br>Penerima,</div>
                  <div class="sign-name">${item.vendor || "Toko / Mandor"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    frameDoc.open();
    frameDoc.write(receiptHtml);
    frameDoc.close();

    // Trigger print after styles render
    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame);
        }
      }, 2000);
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#0b101d] text-slate-100 border border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto">
        
        {/* Top Control Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0d1424] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">Cetak Kuitansi Bukti Pembayaran</h3>
              <p className="text-xs text-slate-400">Siap simpan PDF atau cetak ke printer</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-lg hover:brightness-110 cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Edit Options Bar (Payer, Method, Paper Size) */}
        <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 text-xs grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-emerald-400" /> Nama Pembayar:
            </label>
            <input
              type="text"
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-emerald-400" /> Metode Bayar:
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Tunai">Tunai (Cash)</option>
              <option value="Transfer Bank">Transfer Bank</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <Layout className="w-3 h-3 text-emerald-400" /> Ukuran Kertas:
            </label>
            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="A5 landscape">A5 Landscape (Standar Bon)</option>
              <option value="A4 portrait">A4 Portrait (Halaman Penuh)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-emerald-400" /> No. Kuitansi:
            </label>
            <input
              type="text"
              value={receiptNo}
              onChange={(e) => setReceiptNo(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* Visual Preview of the Kuitansi */}
        <div className="p-4 sm:p-6 overflow-x-auto max-h-[65vh] custom-scrollbar bg-slate-950/40 flex justify-center">
          <div className="w-full max-w-[680px] bg-white text-slate-900 p-5 sm:p-6 rounded-xl shadow-2xl border-2 border-slate-300 relative select-text">
            <div className="border border-slate-400 p-4 sm:p-5 rounded-lg relative">
              
              {/* Header Kop */}
              <div className="border-b-2 border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                    Kuitansi Pembayaran
                  </h2>
                  <p className="text-xs font-semibold text-slate-700">
                    Proyek Pembangunan Rumah Tinggal Nahel Al Fath
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Jl. Petani Gg. Ibrahim, Kec. Pontianak Kota, Kota Pontianak, Kalimantan Barat
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="inline-block bg-slate-100 border border-slate-300 px-3 py-1 rounded text-xs font-mono font-bold text-slate-800">
                    {receiptNo}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Tanggal: {formatDateIndo(item.date)}
                  </p>
                </div>
              </div>

              {/* Body Content */}
              <div className="py-4 space-y-3 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-2 items-baseline">
                  <div className="sm:col-span-3 font-bold text-slate-700 uppercase text-xs">
                    Telah Terima Dari
                  </div>
                  <div className="sm:col-span-9 font-extrabold text-slate-900 border-b border-dashed border-slate-400 pb-1">
                    : {payerName}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-2 items-start">
                  <div className="sm:col-span-3 font-bold text-slate-700 uppercase text-xs pt-1">
                    Uang Sejumlah
                  </div>
                  <div className="sm:col-span-9 bg-slate-100 border border-slate-300 rounded-lg p-2 font-bold italic text-slate-800 text-xs sm:text-sm leading-relaxed">
                    # {terbilangText} #
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-2 items-start">
                  <div className="sm:col-span-3 font-bold text-slate-700 uppercase text-xs pt-1">
                    Untuk Pembayaran
                  </div>
                  <div className="sm:col-span-9 space-y-1 border-b border-dashed border-slate-400 pb-2">
                    <p className="font-extrabold text-slate-900">
                      : {item.itemName}
                    </p>
                    <p className="text-xs text-slate-600 pl-2">
                      • Rincian: {item.qty} {item.unit} × {formatRupiah(item.unitPrice)}
                    </p>
                    <p className="text-xs text-slate-600 pl-2">
                      • Pos Anggaran: {item.category}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-slate-500 pl-2 italic">
                        • Catatan: {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-2 items-baseline">
                  <div className="sm:col-span-3 font-bold text-slate-700 uppercase text-xs">
                    Penerima / Vendor
                  </div>
                  <div className="sm:col-span-9 font-bold text-slate-800 border-b border-dashed border-slate-400 pb-1">
                    : {item.vendor || "Toko / Mandor Lapangan"} ({paymentMethod})
                  </div>
                </div>
              </div>

              {/* Bottom Row: Amount Box, Stamp, & Signatures */}
              <div className="mt-3 pt-3 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-6 space-y-2">
                  <div className="inline-block bg-slate-900 text-white px-3.5 py-2 rounded-lg border-2 border-slate-800 shadow-md">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                      Terbilang Angka (Total):
                    </span>
                    <span className="text-base sm:text-lg font-black font-mono tracking-tight text-white">
                      {formatRupiah(item.totalPrice)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border-2 font-black text-xs uppercase tracking-widest ${
                      item.paymentStatus === "Bon / Tempo"
                        ? "border-amber-600 text-amber-700 bg-amber-50"
                        : "border-emerald-600 text-emerald-700 bg-emerald-50"
                    }`}>
                      <CheckCircle className="w-3 h-3" />
                      {item.paymentStatus === "Bon / Tempo" ? "BON / TEMPO" : "LUNAS"}
                    </div>
                    <span className="text-[10px] text-slate-400 italic">Valid & Sah</span>
                  </div>
                </div>

                <div className="sm:col-span-6 grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="text-[10px] text-slate-600 font-semibold mb-10">
                      Yang Menyerahkan,
                    </p>
                    <p className="font-bold text-xs text-slate-900 border-t border-slate-400 pt-1 truncate">
                      {payerName}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-600 font-semibold mb-10">
                      Pontianak, {formatDateIndo(item.date)}<br />
                      Penerima,
                    </p>
                    <p className="font-bold text-xs text-slate-900 border-t border-slate-400 pt-1 truncate">
                      {item.vendor || "Toko / Mandor"}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-[#0d1424] border-t border-slate-800 text-center text-xs text-slate-400">
          Ukuran kertas aktif: <span className="text-emerald-400 font-semibold uppercase">{paperSize}</span> • Otomatis memuat preview kuitansi tanpa loading.
        </div>
      </div>
    </div>
  );
};
