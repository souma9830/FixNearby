import  { useState, useEffect , useCallback} from 'react';
import { fetchWorkerSkills, submitSkillCertification } from '../../services/skillCertificationService';

export default function SkillMatrixManager({ workerId }) {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    skillCategory: 'Plumbing',
    skillName: '',
    proficiencyLevel: 'Journeyman',
    licenseNumber: '',
    issuingAuthority: '',
    expirationDate: '',
  });

  const categories = ['Plumbing', 'Electrical', 'HVAC', 'Carpentry', 'Appliance Repair', 'Roofing', 'Painting', 'General Maintenance'];
  const proficiencies = ['Apprentice', 'Journeyman', 'Master', 'Certified Specialist'];

  const loadSkills = useCallback(async () => {
    if (!workerId) return;
    setLoading(true);
    try {
      const res = await fetchWorkerSkills(workerId);
      if (res.success) {
        setSkills(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [workerId, setLoading, setError]);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitSkillCertification({ ...formData, workerId });
      setFormData({
        skillCategory: 'Plumbing',
        skillName: '',
        proficiencyLevel: 'Journeyman',
        licenseNumber: '',
        issuingAuthority: '',
        expirationDate: '',
      });
      loadSkills();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Verified Skills & Certifications</h3>

      {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
          <select
            value={formData.skillCategory}
            onChange={(e) => setFormData({ ...formData, skillCategory: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Skill Name</label>
          <input
            type="text"
            required
            value={formData.skillName}
            onChange={(e) => setFormData({ ...formData, skillName: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white"
            placeholder="e.g. Master Pipe Fitting"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Proficiency Level</label>
          <select
            value={formData.proficiencyLevel}
            onChange={(e) => setFormData({ ...formData, proficiencyLevel: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white"
          >
            {proficiencies.map((lvl) => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">License Number</label>
          <input
            type="text"
            value={formData.licenseNumber}
            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white"
            placeholder="e.g. LIC-994812"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Issuing Authority</label>
          <input
            type="text"
            value={formData.issuingAuthority}
            onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white"
            placeholder="e.g. State Trades Board"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiration Date</label>
          <input
            type="date"
            value={formData.expirationDate}
            onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow"
          >
            Add Skill Certification
          </button>
        </div>
      </form>

      <div className="mt-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Skills</h4>
        {loading ? (
          <p className="text-gray-500">Loading skills...</p>
        ) : skills.length === 0 ? (
          <p className="text-gray-500">No skills added yet.</p>
        ) : (
          <div className="space-y-3">
            {skills.map((s) => (
              <div key={s._id} className="p-4 border rounded-lg flex justify-between items-center dark:border-gray-700">
                <div>
                  <h5 className="font-bold text-gray-900 dark:text-white">{s.skillName} ({s.skillCategory})</h5>
                  <p className="text-xs text-gray-500">Level: {s.proficiencyLevel} | Authority: {s.issuingAuthority || 'N/A'}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                  s.verificationStatus === 'Verified' ? 'bg-green-100 text-green-800' :
                  s.verificationStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  {s.verificationStatus}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
