import  { useState } from 'react';
import { Award, CheckCircle } from 'lucide-react';
import { submitSkillCertification } from '../../services/skillCertificationService';

const SkillCertifications = () => {
  const [skillCategory, setSkillCategory] = useState('Plumbing');
  const [skillName, setSkillName] = useState('');
  const [proficiency, setProficiency] = useState('Journeyman');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [authority, setAuthority] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitSkillCertification({
        skillCategory,
        skillName,
        proficiencyLevel: proficiency,
        licenseNumber,
        issuingAuthority: authority
      });
      setMsg(`Skill certification '${skillName}' submitted for verification audit!`);
      setSkillName('');
      setLicenseNumber('');
      setAuthority('');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Skill submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white p-6 rounded-3xl shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Award className="w-7 h-7 text-purple-200" /> Skill Matrix & Trade Certifications
          </h1>
          <p className="text-xs text-purple-100 mt-1">Showcase verified licenses to stand out on customer searches.</p>
        </div>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 font-bold rounded-2xl flex items-center gap-2 border border-emerald-200 text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600" /> {msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Add Certified Trade Skill</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1">Category</label>
            <select value={skillCategory} onChange={(e) => setSkillCategory(e.target.value)} className="w-full p-2.5 rounded-xl border text-xs dark:bg-slate-900">
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="HVAC">HVAC</option>
              <option value="Carpentry">Carpentry</option>
              <option value="Appliance Repair">Appliance Repair</option>
              <option value="General Maintenance">General Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Proficiency Tier</label>
            <select value={proficiency} onChange={(e) => setProficiency(e.target.value)} className="w-full p-2.5 rounded-xl border text-xs dark:bg-slate-900">
              <option value="Apprentice">Apprentice</option>
              <option value="Journeyman">Journeyman</option>
              <option value="Master">Master</option>
              <option value="Certified Specialist">Certified Specialist</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold mb-1">Skill Title (e.g. Backflow Prevention Specialist)</label>
          <input type="text" required value={skillName} onChange={(e) => setSkillName(e.target.value)} className="w-full p-2.5 rounded-xl border text-xs dark:bg-slate-900" placeholder="Master Pipe Fitter" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1">License / Registration Number</label>
            <input type="text" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className="w-full p-2.5 rounded-xl border text-xs dark:bg-slate-900" placeholder="LIC-998811" />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Issuing Authority / State Board</label>
            <input type="text" value={authority} onChange={(e) => setAuthority(e.target.value)} className="w-full p-2.5 rounded-xl border text-xs dark:bg-slate-900" placeholder="State Board of Plumbing" />
          </div>
        </div>

        <button type="submit" disabled={submitting} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition">
          {submitting ? 'Submitting Skill...' : 'Submit Certification for Audit'}
        </button>
      </form>
    </div>
  );
};

export default SkillCertifications;
