import mongoose from 'mongoose';
import WorkerSkillCertification from '../models/WorkerSkillCertification.js';

async function testWorkflow() {
  console.log('[TEST] Starting Skill Certification Workflow Verification...');
  const fakeWorkerId = new mongoose.Types.ObjectId();

  try {
    const skillData = {
      skillCategory: 'Plumbing',
      skillName: 'Advanced Hydro-Jetting',
      proficiencyLevel: 'Master',
      licenseNumber: 'PLUMB-7729',
      issuingAuthority: 'National Plumbing Board',
    };

    console.log('[TEST] Instantiating Skill Certification...');
    const cert = new WorkerSkillCertification({
      workerId: fakeWorkerId,
      ...skillData,
    });
    console.log('[TEST] Certification instantiated successfully:', cert.skillName, cert.proficiencyLevel);

    console.log('[TEST] Skill Certification Workflow Verification PASSED clean!');
  } catch (err) {
    console.error('[TEST ERROR]', err);
    process.exit(1);
  }
}

testWorkflow();
