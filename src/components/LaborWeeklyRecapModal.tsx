"use client";

import React, { useState, useMemo } from "react";
import { X, Printer, Hammer, Users, Calendar, PlusCircle, CheckCircle, ArrowRight, ShieldCheck, Inbox } from "lucide-react";
import { ExpenseItem } from "@/types/expense";
import { formatRupiah, formatDateIndo, formatDateDMonthY } from "@/lib/utils";

interface LaborWeeklyRecapModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: ExpenseItem[];
  onAddNewWeek?: (suggestedWeek: number) => void;
  onPrintKJ?: (item: ExpenseItem) => void;
}

export interface LaborRow {
  id?: string;
  originalItem?: ExpenseItem;
  weekNo: number;
  startDate: string;
  endDate: string;
  workerCount: number;
  ratePerWorker: number;
  totalWage: number;
  cumulativePayment: number;
  paymentDate: string;
}

export const formatDMonthY = formatDateDMonthY;

export const LaborWeeklyRecapModal: React.FC<LaborWeeklyRecapModalProps> = ({
  isOpen,
  onClose,
  expenses,
  onAddNewWeek,
  onPrintKJ,
}) => {
  const [contractValue, setContractValue] = useState<number>(110000000); // Rp 110.000.000,- (Default Kontrak Tukang)

  // 100% patokan ke data input riil yang ada di database / expenses KHUSUS Kategori "Jasa Tukang Borongan"
  const { rows, totalWagePaid, nextSuggestedWeek } = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

    // HANYA ambil transaksi yang berasal dari Kategori Pos Biaya "Jasa Tukang Borongan"
    const laborItems = expenses.filter((e) => e.category === "Jasa Tukang Borongan");

    if (laborItems.length === 0) {
      return {
        rows: [],
        totalWagePaid: 0,
        nextSuggestedWeek: 1,
      };
    }

    // Parse data dari setiap item pengeluaran riil
    const parsed: { item: ExpenseItem; weekNo: number; startDate: string; endDate: string; workers: number; rate: number }[] = [];

    laborItems.forEach((item, idx) => {
      let week = item.laborDetails?.weekNo;
      let start = item.laborDetails?.startDate || "";
      let end = item.laborDetails?.endDate || "";
      let workers = item.laborDetails?.workerCount || item.qty || 1;
      let rate = item.laborDetails?.ratePerWorker || item.unitPrice || item.totalPrice;

      // Coba ekstrak nomor pekan dari notes atau itemName jika belum ada di laborDetails
      if (!week) {
        const textToSearch = `${item.notes || ""} ${item.itemName || ""}`;
        const matchWeek = textToSearch.match(/pekan\s*(?:ke-|#|\s)(\d+)/i);
        if (matchWeek) week = parseInt(matchWeek[1], 10);
      }

      // Coba ekstrak rentang tanggal dari notes jika belum ada
      if (!start && item.notes) {
        // Coba format 2/Nov/2026 sd. 7/Nov/2026
        const matchMonthName = item.notes.match(/(\d{1,2})\/([a-zA-Z]{3})\/(\d{4})\s*(?:sd\.?|s\.d\.?|-|sampai)\s*(\d{1,2})\/([a-zA-Z]{3})\/(\d{4})/i);
        if (matchMonthName) {
          const m1 = months.findIndex((m) => m.toLowerCase() === matchMonthName[2].toLowerCase()) + 1;
          const m2 = months.findIndex((m) => m.toLowerCase() === matchMonthName[5].toLowerCase()) + 1;
          start = `${matchMonthName[3]}-${String(m1).padStart(2, "0")}-${String(matchMonthName[1]).padStart(2, "0")}`;
          end = `${matchMonthName[6]}-${String(m2).padStart(2, "0")}-${String(matchMonthName[4]).padStart(2, "0")}`;
        } else {
          // Format 02/11/2026 sd. 07/11/2026
          const matchFullDate = item.notes.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s*(?:sd\.?|s\.d\.?|-|sampai)\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/i);
          if (matchFullDate) {
            start = `${matchFullDate[3]}-${String(matchFullDate[2]).padStart(2, "0")}-${String(matchFullDate[1]).padStart(2, "0")}`;
            end = `${matchFullDate[6]}-${String(matchFullDate[5]).padStart(2, "0")}-${String(matchFullDate[4]).padStart(2, "0")}`;
          } else {
            // Format 2/11 sd. 7/11
            const matchRange = item.notes.match(/(\d{1,2})\/(\d{1,2})\s*(?:sd\.?|s\.d\.?|-|sampai)\s*(\d{1,2})\/(\d{1,2})/i);
            if (matchRange) {
              start = `2026-${String(matchRange[2]).padStart(2, "0")}-${String(matchRange[1]).padStart(2, "0")}`;
              end = `2026-${String(matchRange[4]).padStart(2, "0")}-${String(matchRange[3]).padStart(2, "0")}`;
            }
          }
        }
      }

      // Jika start masih kosong dan item.date valid, infer periode kerja 6 hari (Senin s/d Sabtu)
      if (!start && item.date) {
        try {
          const endDateObj = new Date(item.date);
          if (!isNaN(endDateObj.getTime())) {
            const startDateObj = new Date(endDateObj.getTime() - 5 * 24 * 60 * 60 * 1000);
            start = startDateObj.toISOString().split("T")[0];
            end = endDateObj.toISOString().split("T")[0];
          }
        } catch {
          start = item.date;
          end = item.date;
        }
      }

      parsed.push({
        item,
        weekNo: week || idx + 1,
        startDate: start || item.date,
        endDate: end || item.date,
        workers,
        rate,
      });
    });

    // Urutkan dari Pekan awal ke Pekan akhir (#1, #2, dst.)
    parsed.sort((a, b) => a.weekNo - b.weekNo || new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    // Hitung akumulasi pembayaran berjalan (running sum)
    let runningSum = 0;
    const finalRows: LaborRow[] = parsed.map((p) => {
      const wage = Number(p.item.totalPrice) || p.workers * p.rate;
      runningSum += wage;
      return {
        id: p.item.id,
        originalItem: p.item,
        weekNo: p.weekNo,
        startDate: p.startDate,
        endDate: p.endDate,
        workerCount: p.workers,
        ratePerWorker: p.rate,
        totalWage: wage,
        cumulativePayment: runningSum, // Running sum murni dari data input
        paymentDate: p.item.date,
      };
    });

    const maxWeek = finalRows.reduce((max, r) => Math.max(max, r.weekNo), 0);

    return {
      rows: finalRows,
      totalWagePaid: runningSum,
      nextSuggestedWeek: maxWeek + 1,
    };
  }, [expenses]);

  if (!isOpen) return null;

  // Nilai perhitungan kontrak
  const maxAllowable80 = Math.round(contractValue * 0.8); // 80% dari kontrak (Rp 88.000.000)
  const retention20 = contractValue - maxAllowable80;     // 20% retensi (Rp 22.000.000)
  const remainingContract = Math.max(0, contractValue - totalWagePaid);
  const remainingAllowable = Math.max(0, maxAllowable80 - totalWagePaid);
  const percentOfContract = contractValue > 0 ? ((totalWagePaid / contractValue) * 100).toFixed(1) : "0";
  const percentOfAllowable = maxAllowable80 > 0 ? Math.min(100, Math.round((totalWagePaid / maxAllowable80) * 100)) : 0;

  // Cetak dokumen Rekapitulasi Pembayaran Mingguan ke PDF/Printer
  const handlePrintRecap = () => {
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

    const rowsHtml =
      rows.length > 0
        ? rows
            .map(
              (r) => `
          <tr>
            <td style="text-align: center; font-weight: bold;">Pekan #${r.weekNo}</td>
            <td style="text-align: center;">${formatDMonthY(r.startDate)}</td>
            <td style="text-align: center;">${formatDMonthY(r.endDate)}</td>
            <td style="text-align: center;">${r.workerCount}</td>
            <td style="text-align: right; font-family: monospace;">${formatRupiah(r.ratePerWorker).replace("Rp ", "")}</td>
            <td style="text-align: right; font-family: monospace; font-weight: bold;">${formatRupiah(r.totalWage).replace("Rp ", "")}</td>
            <td style="text-align: right; font-family: monospace; font-weight: 900; background: #f8fafc;">${formatRupiah(r.cumulativePayment).replace("Rp ", "")}</td>
            <td style="text-align: center; font-weight: bold;">${formatDMonthY(r.paymentDate)}</td>
          </tr>
        `
            )
            .join("")
        : `
          <tr>
            <td colspan="8" style="text-align: center; padding: 25px; color: #64748b;">
              Belum ada transaksi pembayaran upah tukang yang tercatat.
            </td>
          </tr>
        `;

    const recapHtml = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Rekapitulasi-Pembayaran-Mingguan-Jasa-Bangun</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 10mm;
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
            padding: 6px;
          }
          .title-box {
            text-align: center;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 2px solid #0f172a;
          }
          .title-box h1 {
            font-size: 15px;
            font-weight: 900;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          .title-box h2 {
            font-size: 13px;
            font-weight: 800;
            margin-top: 2px;
            text-transform: uppercase;
            color: #1e293b;
          }
          .title-box p {
            font-size: 10px;
            color: #64748b;
            margin-top: 3px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10.5px;
            margin-bottom: 18px;
          }
          th {
            background: #f1f5f9;
            color: #0f172a;
            font-weight: bold;
            border: 1px solid #94a3b8;
            padding: 7px 5px;
            text-align: center;
            vertical-align: middle;
            font-size: 10px;
            text-transform: uppercase;
          }
          td {
            border: 1px solid #cbd5e1;
            padding: 6px 7px;
            vertical-align: middle;
          }
          .sub-th {
            font-size: 8.5px;
            color: #475569;
            font-weight: normal;
          }
          .summary-card {
            margin-top: 10px;
            border: 1px solid #94a3b8;
            border-radius: 6px;
            padding: 10px 14px;
            background: #f8fafc;
            font-size: 11px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 3px 0;
            border-bottom: 1px dashed #e2e8f0;
          }
          .summary-row:last-child {
            border-bottom: none;
          }
          .summary-label {
            font-weight: 600;
            color: #334155;
          }
          .summary-val {
            font-weight: bold;
            font-family: monospace;
          }
          .notes-box {
            margin-top: 12px;
            font-size: 10px;
            color: #334155;
            line-height: 1.5;
            background: #fff;
            padding: 8px 12px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
          }
          .notes-title {
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 4px;
            color: #0f172a;
          }
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 25px;
            text-align: center;
            font-size: 10.5px;
          }
          .sign-col {
            width: 170px;
          }
          .sign-name {
            font-weight: bold;
            border-top: 1px solid #0f172a;
            padding-top: 4px;
            margin-top: 50px;
          }
        </style>
      </head>
      <body>
        <div class="title-box">
          <h1>REKAPITULASI PEMBAYARAN MINGGUAN</h1>
          <h2>JASA BANGUN</h2>
          <p>Proyek Pembangunan Rumah Tinggal Nahel Al Fath • Jl. Petani Gg. Ibrahim, Kota Pontianak</p>
        </div>

        <table>
          <thead>
            <tr>
              <th rowspan="2" style="width: 10%;">Periode</th>
              <th rowspan="2" style="width: 13%;">Tanggal Mulai</th>
              <th rowspan="2" style="width: 13%;">Tanggal Akhir</th>
              <th style="width: 10%;">Jumlah Pekerja<br><span class="sub-th">(orang)</span></th>
              <th style="width: 13%;">Upah per Pekerja<br><span class="sub-th">(Rp)</span></th>
              <th style="width: 14%;">Total Upah Pekan Ini<br><span class="sub-th">(Rp)</span></th>
              <th style="width: 14%;">Akumulasi Pembayaran<br><span class="sub-th">(Rp)</span></th>
              <th rowspan="2" style="width: 13%;">Tanggal Bayar</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="summary-card">
          <div style="font-weight: 900; margin-bottom: 6px; text-transform: uppercase; font-size: 11px;">
            Keterangan & Posisi Nilai Kontrak Borongan:
          </div>
          <div class="summary-row">
            <span class="summary-label">Total Nilai Kontrak Borongan:</span>
            <span class="summary-val">${formatRupiah(contractValue)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Akumulasi Pembayaran (s.d saat ini):</span>
            <span class="summary-val" style="color: #047857;">${formatRupiah(totalWagePaid)} (${percentOfContract}%)</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Sisa Nilai Kontrak:</span>
            <span class="summary-val" style="color: #b45309;">${formatRupiah(remainingContract)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Plafon Maksimal Selama Proyek Berjalan (80% Kontrak):</span>
            <span class="summary-val">${formatRupiah(maxAllowable80)} (Sisa Plafon Berjalan: ${formatRupiah(remainingAllowable)})</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Retensi Pelunasan Akhir (20% Kontrak - Selesai Fisik):</span>
            <span class="summary-val">${formatRupiah(retention20)}</span>
          </div>
        </div>

        <div class="notes-box">
          <div class="notes-title">Catatan & Ketentuan Pembayaran:</div>
          <ul style="padding-left: 15px; margin: 0;">
            <li>Pembayaran upah tenaga kerja dilakukan secara mingguan setiap hari Sabtu berdasarkan opname progres.</li>
            <li>Akumulasi nilai maksimal yang dapat dibayarkan selama proyek berjalan adalah <strong>80% dari nilai kontrak</strong> (${formatRupiah(maxAllowable80)}).</li>
            <li>Sisa <strong>20% (${formatRupiah(retention20)})</strong> ditahan sebagai retensi dan dilunasi setelah serah terima pekerjaan selesai 100%.</li>
          </ul>
        </div>

        <div class="signatures">
          <div class="sign-col">
            <p>Pihak Pertama (Pemilik),</p>
            <div class="sign-name">Nahel Al Fath Ichida</div>
          </div>
          <div class="sign-col">
            <p>Pontianak, ${formatDateIndo(new Date().toISOString().split("T")[0])}<br>Pihak Kedua (Mandor Lapangan),</p>
            <div class="sign-name">Kepala Tukang / Mandor</div>
          </div>
        </div>
      </body>
      </html>
    `;

    frameDoc.open();
    frameDoc.write(recapHtml);
    frameDoc.close();

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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-[#0b101d] text-slate-100 border border-slate-800 rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
        
        {/* Top Header Control */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0d1424] flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 flex-shrink-0">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-white uppercase tracking-tight">
                  Rekapitulasi Pembayaran Mingguan Jasa Bangun
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Pos: Jasa Tukang Borongan ({rows.length} Pekan)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Plafon borongan Rp 110 Juta • Pembayaran mingguan per Sabtu • Plafon proyek maksimal 80%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {onAddNewWeek && (
              <button
                onClick={() => {
                  onAddNewWeek(nextSuggestedWeek);
                  onClose();
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 cursor-pointer transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Catat Pekan #{nextSuggestedWeek}</span>
              </button>
            )}

            <button
              onClick={handlePrintRecap}
              disabled={rows.length === 0}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-100 border border-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
              title="Cetak format cetak A4 / PDF"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Cetak Rekap (PDF)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1 bg-slate-950/40">
          
          {/* Spreadsheet Table View */}
          <div className="rounded-2xl border border-slate-700 overflow-hidden bg-[#0c1222] shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-700 text-slate-300 font-bold uppercase text-[11px]">
                    <th className="p-3 text-center border-r border-slate-700/80">Periode</th>
                    <th className="p-3 text-center border-r border-slate-700/80">Tanggal Mulai</th>
                    <th className="p-3 text-center border-r border-slate-700/80">Tanggal Akhir</th>
                    <th className="p-3 text-center border-r border-slate-700/80">
                      Jumlah Pekerja<br />
                      <span className="text-[10px] text-slate-400 lowercase font-normal">(orang)</span>
                    </th>
                    <th className="p-3 text-right border-r border-slate-700/80">
                      Upah per Pekerja<br />
                      <span className="text-[10px] text-slate-400 lowercase font-normal">(Rp)</span>
                    </th>
                    <th className="p-3 text-right border-r border-slate-700/80">
                      Total Upah Pekan Ini<br />
                      <span className="text-[10px] text-slate-400 lowercase font-normal">(Rp)</span>
                    </th>
                    <th className="p-3 text-right border-r border-slate-700/80 bg-amber-500/10 text-amber-300">
                      Akumulasi Pembayaran<br />
                      <span className="text-[10px] text-amber-400/80 lowercase font-normal">(Rp)</span>
                    </th>
                    <th className="p-3 text-center border-r border-slate-700/80">Tanggal Bayar</th>
                    <th className="p-3 text-center">Kuitansi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {rows.length > 0 ? (
                    rows.map((row, idx) => (
                      <tr
                        key={row.id || idx}
                        className="hover:bg-slate-800/40 transition-colors group text-slate-200"
                      >
                        <td className="p-3 text-center font-bold text-amber-400 border-r border-slate-800 whitespace-nowrap">
                          Pekan #{row.weekNo}
                        </td>
                        <td className="p-3 text-center font-mono text-slate-300 border-r border-slate-800 whitespace-nowrap">
                          {formatDMonthY(row.startDate)}
                        </td>
                        <td className="p-3 text-center font-mono text-slate-300 border-r border-slate-800 whitespace-nowrap">
                          {formatDMonthY(row.endDate)}
                        </td>
                        <td className="p-3 text-center font-bold border-r border-slate-800">
                          {row.workerCount}
                        </td>
                        <td className="p-3 text-right font-mono text-slate-300 border-r border-slate-800 whitespace-nowrap">
                          {formatRupiah(row.ratePerWorker).replace("Rp ", "")}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-white border-r border-slate-800 whitespace-nowrap">
                          {formatRupiah(row.totalWage).replace("Rp ", "")}
                        </td>
                        {/* Akumulasi Pembayaran: Running sum murni dari data input */}
                        <td className="p-3 text-right font-mono font-black text-amber-300 border-r border-slate-800 bg-amber-500/5 whitespace-nowrap text-sm">
                          {formatRupiah(row.cumulativePayment).replace("Rp ", "")}
                        </td>
                        <td className="p-3 text-center font-mono text-slate-300 border-r border-slate-800 whitespace-nowrap">
                          {formatDMonthY(row.paymentDate)}
                        </td>
                        <td className="p-2.5 text-center whitespace-nowrap">
                          {row.originalItem && onPrintKJ ? (
                            <button
                              onClick={() => onPrintKJ(row.originalItem!)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1 mx-auto transition-colors cursor-pointer"
                              title="Cetak Kuitansi KJ Pekan Ini"
                            >
                              <Printer className="w-3 h-3 text-emerald-400" />
                              <span>KJ-{String(row.weekNo).padStart(3, "0")}</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">KJ-{String(row.weekNo).padStart(3, "0")}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="p-10 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 mb-1">
                            <Inbox className="w-6 h-6" />
                          </div>
                          <h4 className="font-bold text-slate-200 text-sm">Belum Ada Transaksi Jasa Tukang Borongan</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Tabel ini khusus merekapitulasi pengeluaran dari Kategori Pos Biaya <strong className="text-amber-300">Jasa Tukang Borongan</strong>. Transaksi dari pos kategori lainnya (termasuk Jasa Tukang Lainnya atau Material) tidak dimasukkan ke dalam rekapitulasi borongan utama ini.
                          </p>
                          {onAddNewWeek && (
                            <button
                              onClick={() => {
                                onAddNewWeek(1);
                                onClose();
                              }}
                              className="mt-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 cursor-pointer transition-all"
                            >
                              <PlusCircle className="w-4 h-4" />
                              <span>+ Catat Pembayaran Pekan #1 Sekarang</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Keterangan & Summary Posisi Kontrak */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Box 1: Angka Keterangan (Col 12 md:7) */}
            <div className="md:col-span-7 bg-[#0d1424] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                Keterangan Nilai Kontrak Jasa Bangun:
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Total Nilai Kontrak Borongan:</span>
                  <span className="font-extrabold text-white text-sm font-mono">{formatRupiah(contractValue)}</span>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Akumulasi Pembayaran (Pekan berjalan):</span>
                  <span className="font-extrabold text-emerald-400 text-sm font-mono">
                    {formatRupiah(totalWagePaid)} <span className="text-[11px] text-slate-400">({percentOfContract}%)</span>
                  </span>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Sisa Nilai Kontrak:</span>
                  <span className="font-extrabold text-amber-400 text-sm font-mono">{formatRupiah(remainingContract)}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400">Retensi Pelunasan Akhir (20% Fisik 100%):</span>
                  <span className="font-bold text-slate-300 font-mono">{formatRupiah(retention20)}</span>
                </div>
              </div>
            </div>

            {/* Box 2: Aturan Plafon 80% (Col 12 md:5) */}
            <div className="md:col-span-5 bg-gradient-to-br from-slate-900 to-[#0a1120] border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Plafon Maksimal Berjalan (80%)
                </span>
                <span className="text-xs font-black text-amber-300 font-mono">
                  {formatRupiah(maxAllowable80)}
                </span>
              </div>

              {/* Progress Bar 80% */}
              <div className="space-y-1">
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentOfAllowable}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{percentOfAllowable}% dari plafon 80%</span>
                  <span>Sisa Plafon: {formatRupiah(remainingAllowable)}</span>
                </div>
              </div>

              {/* Ketentuan Catatan */}
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-slate-300 space-y-1">
                <p className="font-bold text-amber-300 text-[11px]">Ketentuan Pembayaran:</p>
                <p>• Pembayaran dilakukan setiap hari <strong>Sabtu</strong>.</p>
                <p>• Akumulasi maksimal yang dapat dibayarkan selama proyek berjalan adalah <strong>80% dari nilai kontrak</strong>.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bar */}
        <div className="p-3.5 bg-[#0d1424] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${rows.length > 0 ? "bg-emerald-400" : "bg-slate-500"}`}></span>
            <span>Total terdaftar: <strong className="text-white">{rows.length} pekan</strong> ({formatRupiah(totalWagePaid)})</span>
          </div>
          <div className="flex items-center gap-2">
            {rows.length > 0 && (
              <>
                <button
                  onClick={handlePrintRecap}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Lembar Rekapitulasi
                </button>
                <span>•</span>
              </>
            )}
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
