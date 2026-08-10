import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Camera,
  FileImage,
} from "lucide-react";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import {
  submitVerification,
  getVerificationStatus,
} from "../../services/verificationService";
import useToast from "../../hooks/useToast";

const ID_TYPES = [
  { value: "", label: "Select ID type..." },
  { value: "passport", label: "Passport" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "national_id", label: "National ID Card" },
];

const FileUpload = ({ label, name, file, preview, onChange, required, icon: Icon }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    <div className="relative">
      <label
        htmlFor={`file-${name}`}
        className={`flex items-center gap-3 p-4 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
          ${file
            ? 'border-emerald-300 bg-emerald-50'
            : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
      >
        {preview ? (
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0">
            <img
              src={preview}
              alt={`${label} preview`}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <Icon size={20} className="text-slate-400" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-700 truncate">
            {file ? file.name : `Upload ${label.toLowerCase()}`}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {file ? 'Click to replace' : 'JPG, PNG, or PDF — max 10MB'}
          </p>
        </div>
        <Upload size={16} className="text-slate-400 shrink-0" />
      </label>
      <input
        id={`file-${name}`}
        type="file"
        accept="image/*,.pdf"
        onChange={onChange}
        className="sr-only"
      />
    </div>
  </div>
);

const StatusBanner = ({ status, verifiedAt, rejectionReason }) => {
  const config = {
    approved: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: <CheckCircle2 size={28} className="text-emerald-500" />,
      title: 'You are a Verified Worker',
      subtitle: `Verified on ${new Date(verifiedAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })}`,
      text: 'text-emerald-800',
    },
    pending: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: <Clock size={28} className="text-amber-500" />,
      title: 'Verification In Progress',
      subtitle: "We're reviewing your documents",
      text: 'text-amber-800',
    },
    rejected: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      icon: <XCircle size={28} className="text-rose-500" />,
      title: 'Verification Rejected',
      subtitle: rejectionReason || 'Your documents did not meet our requirements',
      text: 'text-rose-800',
    },
  };

  const c = config[status];
  if (!c) return null;

  return (
    <div className={`rounded-2xl border ${c.bg} ${c.border} p-6 mb-8`}>
      <div className="flex items-start gap-4">
        {c.icon}
        <div>
          <h3 className={`text-lg font-bold ${c.text}`}>{c.title}</h3>
          <p className={`text-sm mt-1 ${c.text} opacity-80`}>{c.subtitle}</p>
          {status === 'pending' && (
            <p className="text-xs text-amber-600 mt-2">
              Typical review time is 1-3 business days. We'll notify you once the review is complete.
            </p>
          )}
          {status === 'rejected' && (
            <p className="text-xs text-rose-600 mt-2">
              Please review the feedback above and resubmit with corrected documents.
            </p>
          )}
        </div>
      </div>
      {status === 'approved' && (
        <div className="mt-5 flex items-center gap-3 bg-white rounded-xl p-4 border border-emerald-100">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Verified Worker Badge</p>
            <p className="text-xs text-slate-500">
              This badge is displayed on your profile and search results.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const VerificationPage = () => {
  useDocumentTitle("Worker Verification");

  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [verificationData, setVerificationData] = useState(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [idDocument, setIdDocument] = useState(null);
  const [selfieWithId, setSelfieWithId] = useState(null);
  const [addressProof, setAddressProof] = useState(null);
  const [professionalLicense, setProfessionalLicense] = useState(null);
  const [insuranceProof, setInsuranceProof] = useState(null);

  // File previews
  const [idDocPreview, setIdDocPreview] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [addressPreview, setAddressPreview] = useState(null);
  const [licensePreview, setLicensePreview] = useState(null);
  const [insurancePreview, setInsurancePreview] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getVerificationStatus();
      setStatus(data.status);
      setVerificationData(data.verification);
      if (data.verification?.fullName) {
        setFullName(data.verification.fullName);
      }
    } catch (err) {
      console.error('Failed to load verification status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleFileChange = (setter, previewSetter) => (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setter(file);
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        previewSetter(url);
      } else {
        previewSetter(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      showToast('Please enter your full legal name', 'error');
      return;
    }
    if (!idDocument) {
      showToast('Please upload your ID document', 'error');
      return;
    }
    if (!selfieWithId) {
      showToast('Please upload a selfie with your ID', 'error');
      return;
    }
    if (!addressProof) {
      showToast('Please upload proof of address', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('fullName', fullName.trim());
      if (dateOfBirth) formData.append('dateOfBirth', dateOfBirth);
      if (idType) formData.append('idType', idType);
      formData.append('idNumber', idNumber);
      formData.append('idDocument', idDocument);
      formData.append('selfieWithId', selfieWithId);
      formData.append('addressProof', addressProof);
      if (professionalLicense) formData.append('professionalLicense', professionalLicense);
      if (insuranceProof) formData.append('insuranceProof', insuranceProof);

      await submitVerification(formData);
      showToast('Verification documents submitted successfully!', 'success');
      await fetchStatus();
    } catch (err) {
      showToast(err.message || 'Failed to submit verification', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0056D2]" />
          <p className="text-sm font-medium text-slate-400">Loading verification status...</p>
        </div>
      </div>
    );
  }

  const showForm = status === 'not_submitted' || status === 'rejected';

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#0056D2] flex items-center justify-center">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Worker Verification</h1>
            <p className="text-sm text-slate-500">
              Verify your identity to earn the Verified Worker badge
            </p>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {status && status !== 'not_submitted' && (
        <StatusBanner
          status={status}
          verifiedAt={verificationData?.verifiedAt}
          rejectionReason={verificationData?.rejectionReason}
        />
      )}

      {/* Verification Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Rejection banner with resubmit hint */}
          {status === 'rejected' && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-rose-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-rose-800">Resubmit Your Documents</p>
                  <p className="text-xs text-rose-600 mt-1">
                    Please address the issues mentioned above and submit corrected documents below.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Personal Info Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-5">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="As it appears on your ID"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            </div>
          </div>

          {/* Identity Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-5">Identity Verification</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  ID Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white"
                >
                  {ID_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  ID Number
                </label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="Enter your ID number"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            </div>

            <FileUpload
              label="ID Document"
              name="idDocument"
              file={idDocument}
              preview={idDocPreview}
              onChange={handleFileChange(setIdDocument, setIdDocPreview)}
              required
              icon={FileText}
            />
          </div>

          {/* Document Uploads */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-5">Supporting Documents</h2>
            <div className="space-y-5">
              <FileUpload
                label="Selfie Holding Your ID"
                name="selfieWithId"
                file={selfieWithId}
                preview={selfiePreview}
                onChange={handleFileChange(setSelfieWithId, setSelfiePreview)}
                required
                icon={Camera}
              />

              <FileUpload
                label="Proof of Address"
                name="addressProof"
                file={addressProof}
                preview={addressPreview}
                onChange={handleFileChange(setAddressProof, setAddressPreview)}
                required
                icon={FileImage}
              />

              <FileUpload
                label="Professional License (Optional)"
                name="professionalLicense"
                file={professionalLicense}
                preview={licensePreview}
                onChange={handleFileChange(setProfessionalLicense, setLicensePreview)}
                required={false}
                icon={ShieldCheck}
              />

              <FileUpload
                label="Insurance Proof (Optional)"
                name="insuranceProof"
                file={insuranceProof}
                preview={insurancePreview}
                onChange={handleFileChange(setInsuranceProof, setInsurancePreview)}
                required={false}
                icon={FileText}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0056D2] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0047AF] shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Submit for Verification
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Already approved — no form */}
      {status === 'approved' && (
        <div className="text-center py-8">
          <p className="text-slate-500 text-sm">
            Your identity has been verified. No further action is needed.
          </p>
        </div>
      )}

      {/* Pending — no form, just status message */}
      {status === 'pending' && (
        <div className="text-center py-8">
          <Clock size={40} className="mx-auto text-amber-400 mb-3" />
          <p className="text-slate-700 font-medium">Your verification is being reviewed</p>
          <p className="text-sm text-slate-500 mt-1">
            You'll receive a notification once the review is complete. You can check back here anytime.
          </p>
        </div>
      )}
    </div>
  );
};

export default VerificationPage;
