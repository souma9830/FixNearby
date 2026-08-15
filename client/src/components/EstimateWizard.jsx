import { useState, useEffect, useMemo, useCallback } from "react";
import {
  X, ChevronLeft, ChevronRight, Package, Clock,
  Calendar, MapPin, CheckCircle2, AlertCircle, Info, Calculator
} from "lucide-react";
import FocusTrap from "./FocusTrap";
import { getWorkerAvailability } from "../services/availabilityService";
import { previewEstimate, confirmEstimate } from "../services/estimateService";
import { createBooking } from "../services/bookingService";
import { getEstimatorConfig } from "../utils/estimatorConfig";

const EstimateWizard = ({ isOpen, onClose, worker, onBookingSuccess }) => {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState({});
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [setPreviewError] = useState("");

  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [address, setAddress] = useState("123 Main St, New York");
  const [notes, setNotes] = useState("");

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [, setBookingSuccess] = useState(false);

  const [animateIn, setAnimateIn] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const config = useMemo(() => {
    if (!worker || !worker.profession) return null;
    return getEstimatorConfig(worker.profession);
  }, [worker]);

  // Set default values for steps
  useEffect(() => {
    if (config) {
      const defaults = {};
      config.fields.forEach(f => {
        defaults[f.key] = f.default;
      });
      setInputs(defaults);
    }
    setStep(1);
    setPreview(null);
    setBookingSuccess(false);
    setBookingError("");
  }, [config]);

  // Fetch available slots on load
  useEffect(() => {
    if (isOpen && worker?.id) {
      const fetchSlots = async () => {
        setSlotsLoading(true);
        try {
          const res = await getWorkerAvailability(worker.id);
          if (res?.success && res.availableSlots) {
            setAvailableSlots(res.availableSlots);
            if (res.availableSlots.length > 0) {
              setSelectedSlot(res.availableSlots[0]);
            }
          }
        } catch (err) {
          console.error("Failed to load worker slots inside Wizard", err);
        } finally {
          setSlotsLoading(false);
        }
      };
      fetchSlots();
    }
  }, [isOpen, worker]);

  /* ── Animate open/close ── */
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      requestAnimationFrame(() => setAnimateIn(true));
      document.body.style.overflow = "hidden";
    } else {
      setAnimateIn(false);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setAnimateIn(false);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 250);
  }, [onClose]);

  /* ── Input value change handler ── */
  const handleInputChange = (key, val) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  /* ── Fetch backend preview ── */
  const fetchPreview = async () => {
    if (!worker?.id) return;
    setPreviewLoading(true);
    setPreviewError("");
    try {
      const res = await previewEstimate(worker.id, inputs);
      if (res.success && res.breakdown) {
        setPreview(res.breakdown);
        setStep(2);
      } else {
        setPreviewError("Failed to calculate estimate. Please try again.");
      }
    } catch (err) {
      console.error("Error fetching preview:", err);
      setPreviewError(err.response?.data?.message || "Failed to contact estimator service.");
    } finally {
      setPreviewLoading(false);
    }
  };

  /* ── Confirm Estimate and Book ── */
  const handleConfirmAndBook = async () => {
    if (!worker?.id) return;
    setBookingLoading(true);
    setBookingError("");
    try {
      // 1. Confirm and save estimate on backend
      const confirmRes = await confirmEstimate(worker.id, inputs);
      if (!confirmRes.success) {
        throw new Error("Could not lock in estimate.");
      }

      const confirmedEstimate = confirmRes.estimate;
      const scheduledTime = selectedSlot ? selectedSlot.start : new Date().toISOString();

      // 2. Create booking carrying the confirmed breakdown in notes
      await createBooking({
        workerId: worker.id,
        service: worker.profession,
        price: confirmedEstimate.totalCost,
        scheduledTime,
        durationHours: confirmedEstimate.laborHours || 2,
        address,
        notes: JSON.stringify({
          summary: confirmedEstimate.summary,
          materials: confirmedEstimate.materials,
          laborHours: confirmedEstimate.laborHours,
          laborCost: confirmedEstimate.laborCost,
          materialCost: confirmedEstimate.materialCost,
          totalCost: confirmedEstimate.totalCost,
          estimateId: confirmedEstimate._id
        })
      });

      setBookingSuccess(true);
      setStep(4);
      if (onBookingSuccess) onBookingSuccess();
    } catch (err) {
      console.error("Error confirming booking:", err);
      setBookingError(err.response?.data?.message || "Failed to complete booking. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (!isOpen && !isClosing) return null;
  if (!config) return null;

  return (
    <FocusTrap active={isOpen}>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-colors duration-250 ${
          animateIn ? "bg-black/50" : "bg-black/0"
        }`}
        onClick={handleClose}
        role="dialog"
        aria-modal="true"
        aria-label="Smart Estimate Wizard"
      >
        {/* Modal card */}
        <div
          className={`bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all duration-300 ease-out flex flex-col max-h-[90vh] ${
            animateIn ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-blue-500 shrink-0" />

          {/* Modal Header */}
          <div className="px-6 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <Calculator size={18} />
              </div>
              <h3 className="font-bold text-slate-800 text-base">
                Smart Estimate Wizard — {worker.name}
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              aria-label="Close wizard"
            >
              <X size={18} />
            </button>
          </div>

          {/* Step Progress Bar */}
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Step {step} of 4: {
                step === 1 ? "Parameters" :
                step === 2 ? "Breakdown" :
                step === 3 ? "Scheduling" : "Success"
              }
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(s => (
                <div
                  key={s}
                  className={`w-5 h-1 rounded-full transition-all duration-300 ${
                    s <= step ? "bg-emerald-500 w-8" : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Modal Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {bookingError && (
              <div className="mb-4 bg-red-50 border border-red-100 text-red-700 p-3.5 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            {/* STEP 1: Parameters */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-4 flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{config.icon}</span>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{config.description}</h4>
                    <p className="text-xs text-slate-500 mt-1">{config.savingsTip}</p>
                  </div>
                </div>

                {config.fields.map(field => {
                  const val = inputs[field.key] !== undefined ? inputs[field.key] : field.default;
                  const pct = ((val - field.min) / (field.max - field.min)) * 100;
                  return (
                    <div key={field.key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                          {field.icon && <span>{field.icon}</span>}
                          {field.label}
                        </label>
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-0.5">
                          {val} {field.unit}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        value={val}
                        onChange={e => handleInputChange(field.key, parseFloat(e.target.value))}
                        className="estimator-slider w-full"
                        style={{
                          background: `linear-gradient(to right, #10b981 0%, #10b981 ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`,
                        }}
                      />
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>{field.min} {field.unit}</span>
                        {field.tip && <span className="flex items-center gap-1"><Info size={10} />{field.tip}</span>}
                        <span>{field.max} {field.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* STEP 2: Preview breakdown */}
            {step === 2 && preview && (
              <div className="space-y-5">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Estimated Total Cost</span>
                  <span className="text-3xl font-extrabold text-emerald-600 block mt-1">${preview.totalCost.toFixed(2)}</span>
                  <span className="text-[11px] text-slate-400 mt-1 block font-mono bg-emerald-100/30 rounded-lg py-1 px-3 inline-block">
                    {preview.summary}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Materials */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Package size={14} /> Materials
                    </span>
                    <div className="space-y-1.5">
                      {preview.materials.map((mat, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-700 bg-slate-50 border border-slate-100 px-3.5 py-2.5 rounded-xl">
                          <span>{mat.name} <span className="text-slate-400">({mat.qty} {mat.unit})</span></span>
                          <span className="font-semibold text-slate-800">${mat.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Labor */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Clock size={14} /> Labor
                    </span>
                    <div className="flex justify-between text-xs text-slate-700 bg-amber-50/50 border border-amber-100/50 px-3.5 py-2.5 rounded-xl">
                      <span>Labor Hours <span className="text-slate-400">({preview.laborHours} hrs)</span></span>
                      <span className="font-semibold text-amber-700">${preview.laborCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Scheduling */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <Calendar size={14} /> Choose Available Slot
                  </span>
                  {slotsLoading ? (
                    <div className="flex items-center gap-2 py-4 justify-center">
                      <span className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-slate-400">Loading open slots...</span>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-xs text-red-500 py-3 bg-red-50 border border-red-100 rounded-xl px-4 flex items-center gap-2">
                      <AlertCircle size={14} />
                      No immediate slots available. The system will propose the earliest schedule.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1">
                      {availableSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`text-xs font-semibold px-3 py-2.5 rounded-xl border text-center transition-all ${
                            selectedSlot?.start === slot.start
                              ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                              : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300"
                          }`}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <MapPin size={14} /> Service Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full text-xs font-medium px-3.5 py-3 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    placeholder="Enter your address..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600">
                    Additional Instructions / Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full text-xs font-medium px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    placeholder="Any specific requests or detail about the problem..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* STEP 4: Success confirmation */}
            {step === 4 && (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 size={36} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-slate-800">Booking Confirmed!</h4>
                  <p className="text-xs text-slate-500 px-6 leading-relaxed">
                    Your appointment with <strong>{worker.name}</strong> has been successfully booked using the locked-in smart estimate.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between shrink-0">
            {step > 1 && step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="text-xs font-bold text-slate-600 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
              >
                <ChevronLeft size={16} /> Back
              </button>
            ) : (
              <div />
            )}

            {step === 1 && (
              <button
                type="button"
                onClick={fetchPreview}
                disabled={previewLoading}
                className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-5 py-2.5 rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                {previewLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    Generate Estimate <ChevronRight size={16} />
                  </>
                )}
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                Schedule & Book <ChevronRight size={16} />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handleConfirmAndBook}
                disabled={bookingLoading}
                className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-5 py-2.5 rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                {bookingLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Locking In & Booking...
                  </>
                ) : (
                  <>
                    Lock In & Confirm Booking <CheckCircle2 size={16} />
                  </>
                )}
              </button>
            )}

            {step === 4 && (
              <button
                type="button"
                onClick={handleClose}
                className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-xl shadow-sm transition"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </FocusTrap>
  );
};

export default EstimateWizard;
