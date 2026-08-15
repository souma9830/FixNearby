import { useState, useEffect , useCallback} from 'react';
import { ShieldCheck, Lock, RefreshCw } from 'lucide-react';
import api from '../../services/apiClient';
import useToast from '../../hooks/useToast';

const RolePermissionMatrix = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/roles');
      if (res.data?.success) {
        setRoles(res.data.roles || []);
      }
    } catch (err) {
      showToast('Failed to load RBAC role permission matrix', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleToggleScope = async (roleName, scope, currentAllowed) => {
    try {
      const res = await api.patch(`/roles/${roleName}/scopes`, {
        scope,
        isAllowed: !currentAllowed
      });

      if (res.data?.success) {
        showToast(res.data.message, 'success');
        fetchRoles();
      }
    } catch (err) {
      showToast('Failed to update scope permission', 'error');
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Lock size={14} />
            Zero-Trust Access Control
          </div>
          <h2 className="text-2xl font-black text-white">RBAC Dynamic Role Permission Matrix</h2>
          <p className="text-xs text-slate-400 mt-1">Configure granular API scope permissions per administrative role with instant middleware evaluation</p>
        </div>

        <button onClick={fetchRoles} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Role Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <div key={role.roleName} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <ShieldCheck size={18} className="text-blue-400" />
                {role.roleName} Matrix
              </h3>
              <span className="text-[10px] font-mono text-slate-400 font-bold">{role.scopes?.length || 0} Scopes Active</span>
            </div>

            <div className="space-y-2">
              {role.scopes?.map((s) => (
                <div
                  key={s.scope}
                  onClick={() => handleToggleScope(role.roleName, s.scope, s.isAllowed)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs ${
                    s.isAllowed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div>
                    <span className="font-mono font-bold block">{s.scope}</span>
                    <span className="text-[10px] text-slate-400">{s.description}</span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase border ${
                    s.isAllowed ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}>
                    {s.isAllowed ? 'ALLOWED' : 'DENIED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RolePermissionMatrix;
