import { useState, useMemo, useRef, useEffect } from "react";
import { getEstimatorConfig, parseHourlyRate } from "../utils/estimatorConfig";
import {
  Calculator, ChevronRight, Package, Clock, DollarSign,
  Zap, Info, TrendingUp, CheckCircle2, Lightbulb,
} from "lucide-react";

/* ─── Animated number that flashes on value change ─────────────────────── */
const AnimatedCost = ({ value, prefix = "$", className = "" }) => {
  const [key, setKey] = useState(0);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current !== value) {
      setKey((k) => k + 1);
      prevRef.current = value;
    }
  }, [value]);

  return (
    <span key={key} className={`animate-value-change font-bold tabular-nums ${className}`}>
      {prefix}{Number(value).toFixed(2)}
    </span>
  );
};

/* ─── Cost split bar: material vs labor ───────────────────────────────── */
const CostSplitBar = ({ materialCost, laborCost }) => {
  const total = materialCost + laborCost || 1;
  const matPct = Math.round((materialCost / total) * 100);
  const labPct = 100 - matPct;
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-slate-500 mb-1.5">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          Materials {matPct}%
        </span>
        <span className="flex items-center gap-1">
          Labor {labPct}%
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
        </span>
      </div>
      <div className="cost-bar-track flex">
        <div className="cost-bar-fill bg-blue-500" style={{ width: `${matPct}%` }} />
        <div className="cost-bar-fill bg-amber-400" style={{ width: `${labPct}%` }} />
      </div>
    </div>
  );
};

/* ─── Highlight chip row ──────────────────────────────────────────────── */
const HighlightChips = ({ chips }) => (
  <div className="grid grid-cols-4 gap-2">
    {chips.map((chip, i) => (
      <div
        key={i}
        className="animate-slide-up bg-white border border-slate-200 rounded-xl p-2.5 text-center shadow-sm"
        style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
      >
        <p className="text-xs font-bold text-slate-800 truncate">{chip.value}</p>
        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{chip.label}</p>
      </div>
    ))}
  </div>
);

/* ─── Single field row: label + range slider + number input ─────────── */
const EstimatorField = ({ field, value, onChange }) => {
  const pct = ((value - field.min) / (field.max - field.min)) * 100;

  return (
    <div className="mb-5">
      {/* Label row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {field.icon && (
            <span className="text-base leading-none">{field.icon}</span>
          )}
          <label className="text-sm font-semibold text-slate-700">
            {field.label}
          </label>
        </div>
        {/* Value pill */}
        <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1">
          <input
            id={`estimator-${field.key}`}
            type="number"
            min={field.min}
            max={field.max}
            step={field.step}
            value={value}
            onChange={(e) =>
              onChange(field.key, parseFloat(e.target.value) || field.min)
            }
            className="w-14 bg-transparent text-sm font-bold text-blue-700 text-right outline-none"
          />
          <span className="text-xs text-blue-500 whitespace-nowrap">
            {field.unit}
          </span>
        </div>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={field.min}
        max={field.max}
        step={field.step}
        value={value}
        onChange={(e) => onChange(field.key, parseFloat(e.target.value))}
        className="estimator-slider w-full"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`,
        }}
      />

      <div className="flex justify-between items-center mt-1">
        <span className="text-[11px] text-slate-400">
          {field.min} {field.unit}
        </span>
        {/* Inline tip */}
        {field.tip && (
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Info size={10} />
            {field.tip}
          </span>
        )}
        <span className="text-[11px] text-slate-400">
          {field.max} {field.unit}
        </span>
      </div>
    </div>
  );
};

/* ─── How it works guide ─────────────────────────────────────────────── */
const HowItWorks = () => (
  <div className="flex items-center gap-3 text-xs text-blue-100/80 mt-3">
    {[
      { icon: "1", label: "Set parameters" },
      { icon: "2", label: "Review live estimate" },
      { icon: "3", label: "Lock in & book" },
    ].map((step, i) => (
      <div key={i} className="flex items-center gap-1.5">
        <span className="w-5 h-5 rounded-full bg-white/20 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
          {step.icon}
        </span>
        <span>{step.label}</span>
        {i < 2 && <ChevronRight size={12} className="text-blue-300/60" />}
      </div>
    ))}
  </div>
);

// Insert this block before your existing return in SmartEstimator
const ProgressTracker = ({ issue }) => {
    if (!issue.estimatedArrival) return null;
    
    return (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mt-6">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-indigo-800 uppercase">Service Status</span>
                <span className="text-[10px] text-indigo-500 font-medium">
                    ETA: {new Date(issue.estimatedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
            <div className="w-full bg-indigo-200 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full animate-pulse" style={{ width: '65%' }} />
            </div>
        </div>
    );
};

/* ─── Main Component ─────────────────────────────────────────────────── */
const SmartEstimator = ({ profession, priceString, onBookWithEstimate, issue}) => {
  const config      = getEstimatorConfig(profession);
  const hourlyRate  = parseHourlyRate(priceString);

  /* Build initial state from field defaults */
  const initialValues = useMemo(() => {
    if (!config) return {};
    return Object.fromEntries(config.fields.map((f) => [f.key, f.default]));
  }, [config]);

  const [values, setValues] = useState(initialValues);

  const handleChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  /* Live calculation */
  const estimate = useMemo(() => {
    if (!config) return null;
    return config.calculate(values, hourlyRate);
  }, [config, values, hourlyRate]);

  /* Highlight chips */
  const highlights = useMemo(() => {
    if (!config || !estimate || !config.highlights) return [];
    return config.highlights(values, estimate);
  }, [config, values, estimate]);

  /* ── Unsupported profession ── */
  if (!config) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Calculator size={28} className="text-slate-400" />
        </div>
        <h3 className="text-slate-700 font-bold text-base">
          Smart Estimator Coming Soon
        </h3>
        <p className="text-slate-500 text-sm mt-1.5 max-w-xs mx-auto">
          The Smart Estimator for <strong>{profession}</strong> is currently
          being calibrated. Use Quick Book for now.
        </p>
        <span className="inline-block mt-4 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-100">
          🚧 Coming Soon
        </span>
      </div>
    );
  }

  const matPct    = estimate ? Math.round((estimate.materialCost / estimate.totalCost) * 100) : 0;
  const isReady   = estimate && estimate.totalCost > 0;

  return (
    <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-white">

      {/* ── Header ── */}
      <div
        className="p-6 pb-5 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${config.accentColor}ee 0%, ${config.accentColor}99 100%)`,
        }}
      >
        {/* Decorative ring */}
        <div
          className="absolute -right-10 -top-10 w-44 h-44 rounded-full opacity-20"
          style={{ background: "rgba(255,255,255,0.4)" }}
        />
        <div
          className="absolute -right-4 -top-4 w-28 h-28 rounded-full opacity-10"
          style={{ background: "rgba(255,255,255,0.6)" }}
        />

        <div className="relative flex items-start gap-4">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-lg">
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-white font-bold text-lg leading-tight">
                Smart {profession} Estimator
              </h3>
              <span className="text-[11px] bg-white/20 text-white/90 px-2 py-0.5 rounded-full font-medium backdrop-blur-sm">
                Live Pricing
              </span>
            </div>
            <p className="text-white/80 text-sm mt-1">{config.description}</p>
          </div>
        </div>

        <HowItWorks />

        {/* Savings tip */}
        {config.savingsTip && (
          <div className="mt-4 flex items-start gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5">
            <Lightbulb size={13} className="text-yellow-200 mt-0.5 flex-shrink-0" />
            <p className="text-white/90 text-xs leading-relaxed">{config.savingsTip}</p>
          </div>
        )}
      </div>

      {issue && <ProgressTracker issue={issue} />}

      {/* ── Highlight chips (summary bar) ── */}
      {highlights.length > 0 && (
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-1.5 mb-2.5">
            <TrendingUp size={13} className="text-slate-400" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              Live Summary
            </span>
          </div>
          <HighlightChips chips={highlights} />
        </div>
      )}

      {/* ── Body: inputs + live results ── */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* LEFT: Inputs */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Zap size={15} className="text-blue-500" />
            <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">
              Project Parameters
            </h4>
          </div>
          {config.fields.map((field) => (
            <EstimatorField
              key={field.key}
              field={field}
              value={values[field.key]}
              onChange={handleChange}
            />
          ))}
        </div>

        {/* RIGHT: Live Results */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-5">
            <Calculator size={15} className="text-emerald-500" />
            <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">
              Live Estimate
            </h4>
          </div>

          <div className="flex-1">
            {/* Materials */}
            <div className="flex items-center gap-2 mb-3">
              <Package size={13} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Materials
              </span>
            </div>
            <div className="space-y-2 mb-4">
              {estimate.materials.map((mat, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5"
                >
                  <div>
                    <span className="font-medium text-slate-700 text-sm">{mat.name}</span>
                    <span className="ml-2 text-slate-400 text-xs">
                      {mat.qty} {mat.unit} × ${mat.unitCost}
                    </span>
                  </div>
                  <AnimatedCost
                    value={mat.subtotal}
                    className="text-emerald-600 text-sm"
                  />
                </div>
              ))}
            </div>

            {/* Labor */}
            <div className="flex items-center gap-2 mb-3">
              <Clock size={13} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Labor
              </span>
            </div>
            <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 mb-5">
              <div>
                <span className="font-medium text-slate-700 text-sm">Labor</span>
                <span className="ml-2 text-slate-400 text-xs">
                  {estimate.laborHours} hrs × ${hourlyRate}/hr
                </span>
              </div>
              <AnimatedCost
                value={estimate.laborCost}
                className="text-amber-600 text-sm"
              />
            </div>

            {/* Cost split bar */}
            <CostSplitBar
              materialCost={estimate.materialCost}
              laborCost={estimate.laborCost}
            />

            {/* Total */}
            <div className="border-t border-slate-200 pt-4 mt-4 mb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-emerald-600" />
                  <span className="font-bold text-slate-900">Total Estimate</span>
                </div>
                <AnimatedCost
                  value={estimate.totalCost}
                  className="text-2xl text-emerald-600"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Materials ${estimate.materialCost.toFixed(2)} + Labor ${estimate.laborCost.toFixed(2)}
              </p>
            </div>
          </div>

          {/* CTA */}
          <button
            id="lock-in-book-btn"
            disabled={!isReady}
            onClick={() => onBookWithEstimate(estimate)}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 estimator-glow"
          >
            <CheckCircle2 size={18} />
            Lock In & Book
            <ChevronRight size={18} />
          </button>
          <p className="text-center text-[11px] text-slate-400 mt-2">
            Estimate is locked at booking — no surprise charges.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SmartEstimator;
