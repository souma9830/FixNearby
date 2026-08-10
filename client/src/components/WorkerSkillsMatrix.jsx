import React from 'react';
import { Award, CheckBadge, ShieldCheck, AlertCircle } from 'lucide-react';

const WorkerSkillsMatrix = ({ skills = [] }) => {
  return (
    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center space-x-2">
        <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="font-bold text-slate-800 dark:text-slate-100">Verified Trade Certifications</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {skills.map((skill, idx) => (
          <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{skill.skillTitle || skill.skillName}</p>
              <p className="text-xs text-slate-500">{skill.issuingAuthority} • Level: {skill.proficiencyLevel || 'Expert'}</p>
            </div>
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-600">
              {skill.verificationStatus || 'Verified'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkerSkillsMatrix;

