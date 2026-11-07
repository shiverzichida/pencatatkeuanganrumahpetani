"use client";

import React, { useState } from "react";
import { X, Printer, CheckCircle, FileText, User, CreditCard, Layout, Hammer } from "lucide-react";
import { ExpenseItem } from "@/types/expense";
import { formatRupiah, formatDateIndo, angkaTerbilang } from "@/lib/utils";

interface ReceiptModalProps {
  item: ExpenseItem | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  // Deteksi cerdas apakah ini pengeluaran upah tukang (KJ) atau kuitansi umum (KW)
  const isLaborInitial = Boolean(
    item.laborDetails ||
    item.category === "Jasa Tukang Borongan" ||
    item.itemName.toLowerCase().includes("upah") ||
    item.itemName.toLowerCase().includes("pekan") ||
    item.unit === "pekerja"
  );

  const [receiptType, setReceiptType] = useState<"KJ" | "KW">(isLaborInitial ? "KJ" : "KW");

  // Format rentang tanggal ringkas: e.g. "2/11 sd. 7/11"
  const formatShortRange = (start?: string, end?: string) => {
    if (!start || !end) return "";
    const sParts = start.split("-");
    const eParts = end.split("-");
    if (sParts.length === 3 && eParts.length === 3) {
      const sDay = parseInt(sParts[2], 10);
      const sMonth = parseInt(sParts[1], 10);
      const eDay = parseInt(eParts[2], 10);
      const eMonth = parseInt(eParts[1], 10);
      return `${sDay}/${sMonth} sd. ${eDay}/${eMonth}`;
    }
    return `${start} sd. ${end}`;
  };

  // Editable fields with smart defaults
  const [payerName, setPayerName] = useState(() => {
    return isLaborInitial
      ? "Nahel Al Fath Ichida (Pihak Pertama)"
      : "Nahel Al Fath Ichida";
  });

  const [receiverName, setReceiverName] = useState(() => {
    if (isLaborInitial) {
      return item.vendor ? `${item.vendor} (Pihak Kedua)` : "Mandor / Kepala Tukang (Pihak Kedua)";
    }
    return item.vendor || "Toko / Mandor Lapangan";
  });

  const [paymentMethod, setPaymentMethod] = useState<"Tunai" | "Transfer Bank">("Tunai");
  const [paperSize, setPaperSize] = useState<"A5 landscape" | "A4 portrait">("A5 landscape");

  const [receiptNo, setReceiptNo] = useState(() => {
    if (isLaborInitial) {
      const week = item.laborDetails?.weekNo || 1;
      return `KJ-${String(week).padStart(3, "0")}`;
    }
    const cleanDate = (item.date || "").replace(/-/g, "");
    const cleanId = (item.id || "").replace("EXP-", "").slice(-5);
    return `KW/${cleanDate || "2026"}/${cleanId || "001"}`;
  });

  // Data detil tukang
  const weekNo = item.laborDetails?.weekNo || 1;
  const shortRange = formatShortRange(item.laborDetails?.startDate, item.laborDetails?.endDate);
  const workerCount = item.laborDetails?.workerCount || item.qty || 3;
  const ratePerWorker = item.laborDetails?.ratePerWorker || item.unitPrice || 1000000;

  const [periodText, setPeriodText] = useState(() => {
    return `Pekan ke-${weekNo}${shortRange ? ` (${shortRange})` : ""}`;
  });

  const [laborBreakdownText, setLaborBreakdownText] = useState(() => {
    return `${workerCount} pekerja x ${formatRupiah(ratePerWorker)} = ${formatRupiah(item.totalPrice)}`;
  });

  const terbilangText = angkaTerbilang(item.totalPrice || 0);

  // Switch format kuitansi
  const handleReceiptTypeChange = (newType: "KJ" | "KW") => {
    setReceiptType(newType);
    if (newType === "KJ") {
      setReceiptNo(`KJ-${String(weekNo).padStart(3, "0")}`);
      setPayerName("Nahel Al Fath Ichida (Pihak Pertama)");
      setReceiverName(item.vendor ? `${item.vendor} (Pihak Kedua)` : "Mandor / Kepala Tukang (Pihak Kedua)");
    } else {
      const cleanDate = (item.date || "").replace(/-/g, "");
      const cleanId = (item.id || "").replace("EXP-", "").slice(-5);
      setReceiptNo(`KW/${cleanDate || "2026"}/${cleanId || "001"}`);
      setPayerName("Nahel Al Fath Ichida");
      setReceiverName(item.vendor || "Toko / Mandor Lapangan");
    }
  };

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

    const isKJ = receiptType === "KJ";

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
            background: ${isKJ ? "#fef3c7" : "#f1f5f9"};
            border: 1px solid ${isKJ ? "#f59e0b" : "#cbd5e1"};
            padding: 3px 10px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 13px;
            font-weight: 900;
            color: ${isKJ ? "#92400e" : "#0f172a"};
          }
          .date-text {
            font-size: 10px;
            color: #64748b;
            margin-top: 4px;
            text-align: right;
            font-weight: bold;
          }
          .row {
            display: flex;
            margin-bottom: 9px;
            align-items: baseline;
            font-size: 11.5px;
          }
          .label {
            width: 140px;
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
            width: 140px;
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
                <div class="title">${isKJ ? "KUITANSI PEMBAYARAN JASA" : "KUITANSI PEMBAYARAN"}</div>
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
                ${isKJ ? `<strong>Upah tenaga kerja pembangunan rumah</strong>` : `<strong>${item.itemName}</strong>`}
                ${
                  !isKJ
                    ? `<br><span style="font-size: 10px; color: #475569;">• Rincian: ${item.qty} ${item.unit} × ${formatRupiah(item.unitPrice)}</span>
                       <br><span style="font-size: 10px; color: #475569;">• Pos Anggaran: ${item.category}</span>`
                    : ""
                }
                ${item.notes && !isKJ ? `<br><span style="font-size: 10px; color: #64748b; font-style: italic;">• Catatan: ${item.notes}</span>` : ""}
              </div>
            </div>

            ${
              isKJ
                ? `
            <div class="row">
              <div class="label">Periode Pekerjaan</div>
              <div class="value">${periodText}</div>
            </div>

            <div class="row">
              <div class="label">Dengan Rincian</div>
              <div class="value" style="font-family: monospace; font-size: 11.5px; color: #047857;">${laborBreakdownText}</div>
            </div>
            `
                : ""
            }

            <div class="row">
              <div class="label">${isKJ ? "Penerima Jasa" : "Penerima / Vendor"}</div>
              <div class="value">${receiverName} (${paymentMethod})</div>
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
                  <div class="sign-title">${isKJ ? "Pihak Pertama (Pemilik)," : "Yang Menyerahkan,"}</div>
                  <div class="sign-name">${payerName.replace(" (Pihak Pertama)", "")}</div>
                </div>
                <div class="sign-col">
                  <div class="sign-title">Pontianak, ${formatDateIndo(item.date)}<br>${isKJ ? "Pihak Kedua (Penerima)," : "Penerima,"}</div>
                  <div class="sign-name">${receiverName.replace(" (Pihak Kedua)", "")}</div>
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

  const isKJ = receiptType === "KJ";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#0b101d] text-slate-100 border border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto">
        
        {/* Top Control Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0d1424] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              isKJ 
                ? "bg-amber-500/20 text-amber-400 border-amber-500/30" 
                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
            }`}>
              {isKJ ? <Hammer className="w-5 h-5" /> : <Printer className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  {isKJ ? "Cetak Kuitansi Upah Tukang (KJ)" : "Cetak Kuitansi Bukti Pembayaran"}
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black border ${
                  isKJ
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                }`}>
                  {receiptNo}
                </span>
              </div>
              <p className="text-xs text-slate-400">Pratinjau otomatis & siap simpan PDF (A5 Landscape / A4)</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handlePrint}
              className={`px-4 py-2 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-lg hover:brightness-110 cursor-pointer transition-all ${
                isKJ
                  ? "bg-gradient-to-r from-amber-500 to-orange-400 text-slate-950"
                  : "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950"
              }`}
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

        {/* Quick Edit Options Bar (Tipe Kuitansi, Payer, Method, Paper Size, No Kuitansi) */}
        <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 text-xs grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {/* Format Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-emerald-400" /> Format:
            </label>
            <select
              value={receiptType}
              onChange={(e) => handleReceiptTypeChange(e.target.value as "KJ" | "KW")}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="KJ">Kuitansi Jasa (KJ)</option>
              <option value="KW">Kuitansi Umum (KW)</option>
            </select>
          </div>

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
              <CreditCard className="w-3 h-3 text-emerald-400" /> Metode:
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as "Tunai" | "Transfer Bank")}
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
              onChange={(e) => setPaperSize(e.target.value as "A5 landscape" | "A4 portrait")}
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
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* Khusus KJ: Opsi edit baris Periode & Rincian langsung di modal */}
        {isKJ && (
          <div className="px-4 py-2 bg-amber-950/20 border-b border-amber-500/20 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] font-bold text-amber-300 block mb-0.5">Periode Pekerjaan:</span>
              <input
                type="text"
                value={periodText}
                onChange={(e) => setPeriodText(e.target.value)}
                placeholder="Pekan ke-1 (2/11 sd. 7/11)"
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-medium focus:border-amber-400"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-300 block mb-0.5">Dengan Rincian:</span>
              <input
                type="text"
                value={laborBreakdownText}
                onChange={(e) => setLaborBreakdownText(e.target.value)}
                placeholder="3 pekerja x Rp 1.000.000,00 = Rp 3.000.000,00"
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-medium focus:border-amber-400 font-mono text-[11px]"
              />
            </div>
          </div>
        )}

        {/* Visual Preview of the Kuitansi */}
        <div className="p-4 sm:p-6 overflow-x-auto max-h-[65vh] custom-scrollbar bg-slate-950/40 flex justify-center">
          <div className="w-full max-w-[680px] bg-white text-slate-900 p-5 sm:p-6 rounded-xl shadow-2xl border-2 border-slate-300 relative select-text">
            <div className="border border-slate-400 p-4 sm:p-5 rounded-lg relative">
              
              {/* Header Kop */}
              <div className="border-b-2 border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                    {isKJ ? "Kuitansi Pembayaran Jasa" : "Kuitansi Pembayaran"}
                  </h2>
                  <p className="text-xs font-semibold text-slate-700">
                    Proyek Pembangunan Rumah Tinggal Nahel Al Fath
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Jl. Petani Gg. Ibrahim, Kec. Pontianak Kota, Kota Pontianak, Kalimantan Barat
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <div className={`inline-block border px-3 py-1 rounded text-xs font-mono font-black ${
                    isKJ ? "bg-amber-100 text-amber-900 border-amber-300" : "bg-slate-100 text-slate-800 border-slate-300"
                  }`}>
                    {receiptNo}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-bold">
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
                    {isKJ ? (
                      <p className="font-extrabold text-slate-900">
                        : Upah tenaga kerja pembangunan rumah
                      </p>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                </div>

                {/* Khusus KJ: Baris Periode Pekerjaan & Dengan Rincian */}
                {isKJ && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-2 items-baseline">
                      <div className="sm:col-span-3 font-bold text-slate-700 uppercase text-xs">
                        Periode Pekerjaan
                      </div>
                      <div className="sm:col-span-9 font-bold text-slate-900 border-b border-dashed border-slate-400 pb-1">
                        : {periodText}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-2 items-baseline">
                      <div className="sm:col-span-3 font-bold text-slate-700 uppercase text-xs">
                        Dengan Rincian
                      </div>
                      <div className="sm:col-span-9 font-bold text-emerald-800 border-b border-dashed border-slate-400 pb-1 font-mono">
                        : {laborBreakdownText}
                      </div>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-2 items-baseline">
                  <div className="sm:col-span-3 font-bold text-slate-700 uppercase text-xs">
                    {isKJ ? "Penerima Jasa" : "Penerima / Vendor"}
                  </div>
                  <div className="sm:col-span-9 font-bold text-slate-800 border-b border-dashed border-slate-400 pb-1">
                    : {receiverName} ({paymentMethod})
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
                      {isKJ ? "Pihak Pertama (Pemilik)," : "Yang Menyerahkan,"}
                    </p>
                    <p className="font-bold text-xs text-slate-900 border-t border-slate-400 pt-1 truncate">
                      {payerName.replace(" (Pihak Pertama)", "")}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-600 font-semibold mb-10">
                      Pontianak, {formatDateIndo(item.date)}<br />
                      {isKJ ? "Pihak Kedua (Penerima)," : "Penerima,"}
                    </p>
                    <p className="font-bold text-xs text-slate-900 border-t border-slate-400 pt-1 truncate">
                      {receiverName.replace(" (Pihak Kedua)", "")}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-[#0d1424] border-t border-slate-800 text-center text-xs text-slate-400">
          Format aktif: <span className="text-amber-400 font-semibold">{isKJ ? "KJ (Kuitansi Jasa Tukang)" : "KW (Kuitansi Umum)"}</span> • Kertas: <span className="text-emerald-400 font-semibold uppercase">{paperSize}</span> • Pratinjau langsung tanpa loading.
        </div>
      </div>
    </div>
  );
};
