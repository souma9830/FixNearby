import { useState } from 'react';
import { Camera, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';
import api from '../../services/apiClient';
import useToast from '../../hooks/useToast';

const AiDamageScanner = ({ onAssessmentComplete }) => {
  const { showToast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [assessment, setAssessment] = useState(null);
useState(null);

  const handleScanImage = async () => {
    setScanning(true);
    try {
      const res = await api.post('/ai-diagnostics/scan', {
        imageUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7'
      });

      if (res.data?.success) {
        setAssessment(res.data.assessment);
        showToast('AI Computer Vision damage analysis completed!', 'success');
        if (onAssessmentComplete) onAssessmentComplete(res.data.assessment);
      }
    } catch (err) {
      showToast('AI damage scanning failed', 'error');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={14} />
            AI Computer Vision Damage Diagnostics
          </div>
          <h2 className="text-2xl font-black text-white">Automated Damage Scanner & Cost Estimator</h2>
          <p className="text-xs text-slate-400 mt-1">Upload damage photos to compute severity scores, replacement hardware parts, and estimated repair costs</p>
        </div>

        <button
          onClick={handleScanImage}
          disabled={scanning}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-md whitespace-nowrap self-start sm:self-auto"
        >
          {scanning ? <RefreshCw className="animate-spin" size={14} /> : <Camera size={14} />}
          Scan Damage Photo
        </button>
      </div>

      {/* Assessment Output Display */}
      {assessment && (
        <div className="space-y-6 pt-4 border-t border-slate-800">
          {/* KPI Display */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Detected Category</span>
              <h3 className="text-xl font-black text-blue-400 mt-1">{assessment.detectedCategory}</h3>
            </div>
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Severity Index</span>
              <h3 className="text-xl font-black text-amber-400 mt-1">{assessment.severityScore} / 10</h3>
            </div>
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Estimated Total Cost</span>
              <h3 className="text-xl font-black text-emerald-400 mt-1">${assessment.estimatedTotalCost}</h3>
            </div>
          </div>

          {/* Detected Issues List */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detected Structural / Mechanical Issues</h4>
            <div className="space-y-2">
              {assessment.detectedIssues?.map((issue, idx) => (
                <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <AlertTriangle size={14} className="text-amber-400" />
                      {issue.name}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">{issue.confidencePct}% Confidence</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{issue.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bill of Materials Parts */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recommended Hardware & Replacement Parts</h4>
            <div className="space-y-2">
              {assessment.billOfMaterials?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-300 font-medium">{item.item}</span>
                  <span className="font-bold text-emerald-400">${item.estimatedPrice}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiDamageScanner;
