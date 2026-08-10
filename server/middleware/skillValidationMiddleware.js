export const validateSkillCertificationPayload = (req, res, next) => {
  const { skillCategory, skillName, proficiencyLevel } = req.body;

  const validCategories = ['Plumbing', 'Electrical', 'HVAC', 'Carpentry', 'Appliance Repair', 'Roofing', 'Painting', 'General Maintenance'];
  const validProficiency = ['Apprentice', 'Journeyman', 'Master', 'Certified Specialist'];

  if (!skillCategory || !validCategories.includes(skillCategory)) {
    return res.status(400).json({
      success: false,
      message: `Invalid skill category. Must be one of: ${validCategories.join(', ')}`,
    });
  }

  if (!skillName || typeof skillName !== 'string' || skillName.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Skill name is required and must be at least 2 characters.',
    });
  }

  if (proficiencyLevel && !validProficiency.includes(proficiencyLevel)) {
    return res.status(400).json({
      success: false,
      message: `Invalid proficiency level. Must be one of: ${validProficiency.join(', ')}`,
    });
  }

  next();
};
