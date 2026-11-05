"use client";

import React, { useState } from "react";
import { Calculator, X, Layers, Sparkles, ArrowRight } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface MaterialCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCalculation: (data: {
    category: string;
    itemName: string;
    qty: number;
    unit: string;
    unitPrice: number;
  }) => void;
}

export const MaterialCalculatorModal: React.FC<MaterialCalculatorModalProps> = ({
  isOpen,
  onClose,
  onApplyCalculation,
}) => {
  const [calcType, setCalcType] = useState<"cor" | "dinding" | "besi">("cor");

  // State Cor Beton
  const [corVolume, setCorVolume] = useState<number>(1); // m3
  // Standar per 1 m3 beton K-225: ~8 sak semen (50kg), 0.55 m3 pasir (~0.7 pick up)
  const semenCorSak = Math.ceil(corVolume * 8);
  const pasirCorPickup = Math.max(1, Math.round(corVolume * 0.7 * 10) / 10);
  const semenCorCost = semenCorSak * 82000;
  const pasirCorCost = Math.round(pasirCorPickup * 230000);

  // State Pasangan Dinding Hebel/Bata
  const [luasDinding, setLuasDinding] = useState<number>(20); // m2
  // Standar per 10 m2 dinding hebel 10cm: 1 m3 hebel (~83 bj), 1 sak semen mortar (40kg)
  const volHebelM3 = Math.round((luasDinding / 10) * 10) / 10;
  const semenMortarSak = Math.ceil(luasDinding / 10);

  // State Besi Sloof/Balok
  const [panjangBentang, setPanjangBentang] = useState<number>(12); // meter
  const [jumlahTulanganUtama, setJumlahTulanganUtama] = useState<number>(6); // btg
  // 1 batang besi standar = 12 meter
  const batangBesiUtama = Math.ceil((panjangBentang * jumlahTulanganUtama) / 11.5);
  // Begel jarak 15 cm: (panjang / 0.15) begel. Tiap begel 15x20 butuh keliling ~0.7m. Besi 8 = 12m/0.7 = ~17 begel/btg
  const totalBegelPcs = Math.ceil(panjangBentang / 0.15);
  const batangBesiBegel = Math.ceil(totalBegelPcs / 17);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3.5 sm:p-4">
      <div className="glass-panel rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-white/10 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">Kalkulator Estimasi Bahan</h3>
              <p className="text-[11px] text-slate-400">Hitung semen, pasir, bata & besi secara instan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-semibold p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Mode */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setCalcType("cor")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              calcType === "cor"
                ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Cor Beton
          </button>
          <button
            onClick={() => setCalcType("dinding")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              calcType === "dinding"
                ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Dinding
          </button>
          <button
            onClick={() => setCalcType("besi")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              calcType === "besi"
                ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Besi Bentang
          </button>
        </div>

        {/* Tab 1: Cor Beton */}
        {calcType === "cor" && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Volume Cor Beton (m³):
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={corVolume}
                onChange={(e) => setCorVolume(parseFloat(e.target.value) || 0)}
                className="w-full text-sm glass-input rounded-xl px-3.5 py-2 font-bold text-white focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                *Rumus: Tebal (m) × Lebar (m) × Panjang (m). Contoh: dak 40m² tebal 12cm = 4.8 m³.
              </p>
            </div>

            <div className="glass-panel-subtle p-3.5 rounded-2xl border border-white/5 space-y-2.5">
              <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Hasil Estimasi Bahan Cor:
              </p>
              
              <div className="flex items-center justify-between text-xs bg-slate-900/60 p-2 rounded-xl">
                <div>
                  <span className="font-semibold text-white">Semen 50kg: </span>
                  <span className="text-emerald-400 font-bold">{semenCorSak} sak</span>
                  <span className="text-slate-400 text-[11px] block">{formatRupiah(semenCorCost)} (@Rp 82rb)</span>
                </div>
                <button
                  onClick={() => {
                    onApplyCalculation({
                      category: "Material Struktur Bawah & Pondasi",
                      itemName: `Semen Portland 50kg (Cor ${corVolume}m³)`,
                      qty: semenCorSak,
                      unit: "sak",
                      unitPrice: 82000,
                    });
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  Pakai <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs bg-slate-900/60 p-2 rounded-xl">
                <div>
                  <span className="font-semibold text-white">Pasir Cor: </span>
                  <span className="text-emerald-400 font-bold">{pasirCorPickup} pick up</span>
                  <span className="text-slate-400 text-[11px] block">{formatRupiah(pasirCorCost)} (@Rp 230rb)</span>
                </div>
                <button
                  onClick={() => {
                    onApplyCalculation({
                      category: "Material Struktur Bawah & Pondasi",
                      itemName: `Pasir Cor (Cor ${corVolume}m³)`,
                      qty: pasirCorPickup,
                      unit: "pick up",
                      unitPrice: 230000,
                    });
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  Pakai <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Dinding */}
        {calcType === "dinding" && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Luas Dinding (m²):
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={luasDinding}
                onChange={(e) => setLuasDinding(parseFloat(e.target.value) || 0)}
                className="w-full text-sm glass-input rounded-xl px-3.5 py-2 font-bold text-white focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                *Rumus: Panjang Dinding (m) × Tinggi Dinding (m).
              </p>
            </div>

            <div className="glass-panel-subtle p-3.5 rounded-2xl border border-white/5 space-y-2.5">
              <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Hasil Estimasi Bata Ringan & Mortar:
              </p>
              
              <div className="flex items-center justify-between text-xs bg-slate-900/60 p-2 rounded-xl">
                <div>
                  <span className="font-semibold text-white">Bata Ringan / Hebel (10cm): </span>
                  <span className="text-emerald-400 font-bold">{volHebelM3} m³</span>
                  <span className="text-slate-400 text-[11px] block">± {Math.round(volHebelM3 * 83)} keping</span>
                </div>
                <button
                  onClick={() => {
                    onApplyCalculation({
                      category: "Material Pasangan Dinding & Partisi",
                      itemName: `Bata Ringan Hebel (Dinding ${luasDinding}m²)`,
                      qty: volHebelM3,
                      unit: "m³",
                      unitPrice: 650000,
                    });
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  Pakai <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs bg-slate-900/60 p-2 rounded-xl">
                <div>
                  <span className="font-semibold text-white">Semen Mortar Perekat: </span>
                  <span className="text-emerald-400 font-bold">{semenMortarSak} sak (40kg)</span>
                </div>
                <button
                  onClick={() => {
                    onApplyCalculation({
                      category: "Material Pasangan Dinding & Partisi",
                      itemName: `Semen Mortar Perekat Hebel (Dinding ${luasDinding}m²)`,
                      qty: semenMortarSak,
                      unit: "sak",
                      unitPrice: 75000,
                    });
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  Pakai <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Besi Bentang */}
        {calcType === "besi" && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Panjang Bentang (m):
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={panjangBentang}
                  onChange={(e) => setPanjangBentang(parseFloat(e.target.value) || 0)}
                  className="w-full text-sm glass-input rounded-xl px-3 py-2 font-bold text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Jumlah Tulangan:
                </label>
                <select
                  value={jumlahTulanganUtama}
                  onChange={(e) => setJumlahTulanganUtama(parseInt(e.target.value) || 4)}
                  className="w-full text-sm glass-input rounded-xl px-3 py-2 font-bold text-white bg-slate-900 focus:outline-none"
                >
                  <option value={4} className="bg-slate-900">4 Batang</option>
                  <option value={6} className="bg-slate-900">6 Batang</option>
                  <option value={8} className="bg-slate-900">8 Batang</option>
                </select>
              </div>
            </div>

            <div className="glass-panel-subtle p-3.5 rounded-2xl border border-white/5 space-y-2.5">
              <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Hasil Estimasi Besi:
              </p>
              
              <div className="flex items-center justify-between text-xs bg-slate-900/60 p-2 rounded-xl">
                <div>
                  <span className="font-semibold text-white">Besi 13 Ulir SMTY: </span>
                  <span className="text-emerald-400 font-bold">{batangBesiUtama} batang (12m)</span>
                  <span className="text-slate-400 text-[11px] block">{formatRupiah(batangBesiUtama * 99000)} (@Rp 99rb)</span>
                </div>
                <button
                  onClick={() => {
                    onApplyCalculation({
                      category: "Material Struktur Bawah & Pondasi",
                      itemName: `Besi 13 Ulir SMTY (Bentang ${panjangBentang}m, ${jumlahTulanganUtama} tulangan)`,
                      qty: batangBesiUtama,
                      unit: "batang",
                      unitPrice: 99000,
                    });
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  Pakai <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs bg-slate-900/60 p-2 rounded-xl">
                <div>
                  <span className="font-semibold text-white">Besi 8 Polos (Begel jarak 15cm): </span>
                  <span className="text-emerald-400 font-bold">{batangBesiBegel} batang (12m)</span>
                  <span className="text-slate-400 text-[11px] block">{formatRupiah(batangBesiBegel * 45000)} (@Rp 45rb)</span>
                </div>
                <button
                  onClick={() => {
                    onApplyCalculation({
                      category: "Material Struktur Bawah & Pondasi",
                      itemName: `Besi 8 Polos Begel (Bentang ${panjangBentang}m)`,
                      qty: batangBesiBegel,
                      unit: "batang",
                      unitPrice: 45000,
                    });
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  Pakai <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
