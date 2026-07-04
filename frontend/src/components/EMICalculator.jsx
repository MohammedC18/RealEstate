/**
 * EMICalculator — luxury EMI calculator for property details page.
 * All-client-side. Uses standard flat-rate EMI formula.
 */
import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";

function fmtINR(n) {
  if (!isFinite(n)) return "—";
  if (n >= 10000000) return `₹ ${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹ ${(n / 100000).toFixed(2)} L`;
  return `₹ ${Math.round(n).toLocaleString("en-IN")}`;
}

export default function EMICalculator({ defaultPrice = 50000000 }) {
  const [price, setPrice] = useState(defaultPrice);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  const { emi, principal, totalInterest, totalPayable } = useMemo(() => {
    const p = Math.max(0, price - (price * downPct) / 100);
    const r = rate / 12 / 100;
    const n = years * 12;
    const e = r > 0 ? (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : p / n;
    return {
      principal: p,
      emi: e,
      totalPayable: e * n,
      totalInterest: e * n - p,
    };
  }, [price, downPct, rate, years]);

  return (
    <div className="border border-black/10 dark:border-white/10 p-6" data-testid="emi-calculator">
      <div className="flex items-center gap-2 text-[#C8A96A]">
        <Calculator size={16} strokeWidth={1.5} />
        <span className="text-xs tracking-widest uppercase">EMI Calculator</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4 mt-4">
        <SliderRow label="Property price" value={fmtINR(price)}>
          <input type="range" min={5000000} max={500000000} step={500000} value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full accent-[#C8A96A]" data-testid="emi-price" />
        </SliderRow>
        <SliderRow label="Down payment" value={`${downPct}%`}>
          <input type="range" min={10} max={80} step={5} value={downPct}
            onChange={(e) => setDownPct(Number(e.target.value))}
            className="w-full accent-[#C8A96A]" data-testid="emi-downpayment" />
        </SliderRow>
        <SliderRow label="Interest rate" value={`${rate.toFixed(2)}%`}>
          <input type="range" min={6} max={14} step={0.05} value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full accent-[#C8A96A]" data-testid="emi-rate" />
        </SliderRow>
        <SliderRow label="Loan tenure" value={`${years} yrs`}>
          <input type="range" min={5} max={30} step={1} value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full accent-[#C8A96A]" data-testid="emi-years" />
        </SliderRow>
      </div>

      <div className="mt-6 pt-5 border-t border-black/10 dark:border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <ResultCell label="Monthly EMI" value={fmtINR(emi)} accent />
        <ResultCell label="Principal" value={fmtINR(principal)} />
        <ResultCell label="Total interest" value={fmtINR(totalInterest)} />
        <ResultCell label="Total payable" value={fmtINR(totalPayable)} />
      </div>

      <p className="text-[10px] text-black/40 dark:text-white/40 mt-4 tracking-wider">
        Indicative only. Speak to our advisor for tailored financing options.
      </p>
    </div>
  );
}

function SliderRow({ label, value, children }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs tracking-wider text-black/60 dark:text-white/60 uppercase mb-2">
        <span>{label}</span>
        <span className="text-charcoal dark:text-white font-medium normal-case tracking-normal">{value}</span>
      </div>
      {children}
    </div>
  );
}

function ResultCell({ label, value, accent }) {
  return (
    <div>
      <div className="text-[10px] tracking-widest uppercase text-black/50 dark:text-white/50">{label}</div>
      <div className={`font-serif-luxe mt-1 ${accent ? "text-2xl text-[#C8A96A]" : "text-lg text-charcoal dark:text-white/90"}`}>
        {value}
      </div>
    </div>
  );
}
