import Estimate from '../models/Estimate.js';
import Worker from '../models/Worker.js';

// Replicate estimator formula configurations on the backend
const ESTIMATOR_FORMULAS = {
  Painter: {
    calculate({ width, height, walls, coats }, hourlyRate) {
      const w = parseFloat(width) || 12;
      const h = parseFloat(height) || 9;
      const wl = parseFloat(walls) || 4;
      const c = parseFloat(coats) || 2;
      const rate = parseFloat(hourlyRate) || 40;

      const totalArea   = w * h * wl;
      const paintGal    = parseFloat(((totalArea * c) / 350).toFixed(2));
      const primerGal   = parseFloat((totalArea / 400).toFixed(2));
      const laborHours  = parseFloat(((totalArea / 100) * 1.5 * c).toFixed(2));

      const paintCost    = parseFloat((paintGal  * 32).toFixed(2));
      const primerCost   = parseFloat((primerGal * 18).toFixed(2));
      const laborCost    = parseFloat((laborHours * rate).toFixed(2));
      const materialCost = parseFloat((paintCost + primerCost).toFixed(2));
      const totalCost    = parseFloat((materialCost + laborCost).toFixed(2));

      return {
        materials: [
          { name: "Paint",  qty: paintGal,  unit: "gal", unitCost: 32, subtotal: paintCost  },
          { name: "Primer", qty: primerGal, unit: "gal", unitCost: 18, subtotal: primerCost },
        ],
        laborHours,
        laborCost,
        materialCost,
        totalCost,
        summary: `${paintGal} gal Paint | ${laborHours} hrs Labor`,
      };
    }
  },
  Plumber: {
    calculate({ pipeLength, fixtures, leaks, shutoffs }, hourlyRate) {
      const pl = parseFloat(pipeLength) || 20;
      const fx = parseFloat(fixtures) || 2;
      const l = parseFloat(leaks) || 1;
      const s = parseFloat(shutoffs) || 1;
      const rate = parseFloat(hourlyRate) || 40;

      const pipeCost     = parseFloat((pl * 4.5).toFixed(2));
      const fixtureCost  = parseFloat((fx   * 45).toFixed(2));
      const valveCost    = parseFloat((s   * 18).toFixed(2));
      const sealantCost  = l > 0 ? parseFloat((l * 8).toFixed(2)) : 0;

      const laborHours   = parseFloat((2 + l * 0.5 + fx * 1.2 + s * 0.5).toFixed(2));
      const laborCost    = parseFloat((laborHours * rate).toFixed(2));
      const materialCost = parseFloat((pipeCost + fixtureCost + valveCost + sealantCost).toFixed(2));
      const totalCost    = parseFloat((materialCost + laborCost).toFixed(2));

      const materials = [
        { name: "Pipe",     qty: pl, unit: "ft",  unitCost: 4.5, subtotal: pipeCost    },
        { name: "Fixtures", qty: fx,   unit: "pcs", unitCost: 45,  subtotal: fixtureCost },
        { name: "Valves",   qty: s,   unit: "pcs", unitCost: 18,  subtotal: valveCost   },
      ];
      if (l > 0) materials.push({ name: "Sealant", qty: l, unit: "kits", unitCost: 8, subtotal: sealantCost });

      return {
        materials,
        laborHours,
        laborCost,
        materialCost,
        totalCost,
        summary: `${pl} ft Pipe | ${fx} Fixtures | ${laborHours} hrs Labor`
      };
    }
  },
  Electrician: {
    calculate({ points, switches, panels, fixtures }, hourlyRate) {
      const pt = parseFloat(points) || 5;
      const sw = parseFloat(switches) || 3;
      const pn = parseFloat(panels) || 1;
      const fx = parseFloat(fixtures) || 4;
      const rate = parseFloat(hourlyRate) || 40;

      const wireFt      = pt * 15;
      const wireCost    = parseFloat((wireFt    * 1.2).toFixed(2));
      const switchCost  = parseFloat((sw  * 12).toFixed(2));
      const panelCost   = parseFloat((pn    * 120).toFixed(2));
      const fixtureCost = parseFloat((fx  * 25).toFixed(2));

      const laborHours   = parseFloat((pt * 1.5 + pn * 2 + fx * 0.5).toFixed(2));
      const laborCost    = parseFloat((laborHours * rate).toFixed(2));
      const materialCost = parseFloat((wireCost + switchCost + panelCost + fixtureCost).toFixed(2));
      const totalCost    = parseFloat((materialCost + laborCost).toFixed(2));

      return {
        materials: [
          { name: "Wiring",   qty: wireFt,   unit: "ft",  unitCost: 1.2,  subtotal: wireCost    },
          { name: "Switches", qty: sw,  unit: "pcs", unitCost: 12,   subtotal: switchCost  },
          { name: "Panels",   qty: pn,    unit: "pcs", unitCost: 120,  subtotal: panelCost   },
          { name: "Fixtures", qty: fx,  unit: "pcs", unitCost: 25,   subtotal: fixtureCost },
        ],
        laborHours, laborCost, materialCost, totalCost,
        summary: `${wireFt} ft Wire | ${fx} Fixtures | ${laborHours} hrs Labor`,
      };
    }
  },
  Carpenter: {
    calculate({ pieces, sqft, hardware, finish }, hourlyRate) {
      const pc = parseFloat(pieces) || 2;
      const sf = parseFloat(sqft) || 20;
      const hw = parseFloat(hardware) || 2;
      const fn = parseFloat(finish) || 2;
      const rate = parseFloat(hourlyRate) || 40;

      const woodCost     = parseFloat((pc * sf * 3.5).toFixed(2));
      const hardwareCost = parseFloat((hw * 22).toFixed(2));
      const finishCost   = parseFloat((pc * fn * 8).toFixed(2));

      const laborHours   = parseFloat((pc * 2.5 + hw * 0.5).toFixed(2));
      const laborCost    = parseFloat((laborHours * rate).toFixed(2));
      const materialCost = parseFloat((woodCost + hardwareCost + finishCost).toFixed(2));
      const totalCost    = parseFloat((materialCost + laborCost).toFixed(2));

      return {
        materials: [
          { name: "Wood",     qty: pc * sf,  unit: "sqft",  unitCost: 3.5, subtotal: woodCost     },
          { name: "Hardware", qty: hw,        unit: "sets",  unitCost: 22,  subtotal: hardwareCost },
          { name: "Finish",   qty: pc * fn, unit: "coats", unitCost: 8,   subtotal: finishCost   },
        ],
        laborHours, laborCost, materialCost, totalCost,
        summary: `${pc * sf} sqft Wood | ${hw} Hardware Sets | ${laborHours} hrs Labor`,
      };
    }
  },
  Cleaner: {
    calculate({ rooms, bathrooms, deepClean, windows }, hourlyRate) {
      const r = parseFloat(rooms) || 3;
      const b = parseFloat(bathrooms) || 1;
      const dc = parseFloat(deepClean) || 1;
      const w = parseFloat(windows) || 4;
      const rate = parseFloat(hourlyRate) || 40;

      const suppliesCost  = parseFloat(((r + b) * 8).toFixed(2));
      const deepCleanCost = parseFloat((dc * 15).toFixed(2));
      const windowCost    = parseFloat((w * 3).toFixed(2));

      const laborHours    = parseFloat((r * 1.5 + b * 0.75 + dc * 1.0 + w * 0.25).toFixed(2));
      const laborCost     = parseFloat((laborHours * rate).toFixed(2));
      const materialCost  = parseFloat((suppliesCost + deepCleanCost + windowCost).toFixed(2));
      const totalCost     = parseFloat((materialCost + laborCost).toFixed(2));

      return {
        materials: [
          { name: "Supplies",   qty: r + b, unit: "rooms", unitCost: 8,  subtotal: suppliesCost  },
          { name: "Deep Clean", qty: dc,          unit: "rooms", unitCost: 15, subtotal: deepCleanCost },
          { name: "Window Kit", qty: w,            unit: "pcs",   unitCost: 3,  subtotal: windowCost    },
        ],
        laborHours, laborCost, materialCost, totalCost,
        summary: `${r + b} Rooms | ${w} Windows | ${laborHours} hrs Labor`,
      };
    }
  },
  "HVAC Technician": {
    calculate({ units, ducts, refrigerant, filters }, hourlyRate) {
      const u = parseFloat(units) || 1;
      const d = parseFloat(ducts) || 40;
      const ref = parseFloat(refrigerant) || 3;
      const f = parseFloat(filters) || 2;
      const rate = parseFloat(hourlyRate) || 40;

      const unitPartsCost   = parseFloat((u * 85).toFixed(2));
      const ductCost        = parseFloat((d * 3.5).toFixed(2));
      const refrigerantCost = parseFloat((ref * 22).toFixed(2));
      const filterCost      = parseFloat((f * 18).toFixed(2));

      const laborHours   = parseFloat((u * 2.5 + (d / 40) * 1.5).toFixed(2));
      const laborCost    = parseFloat((laborHours * rate).toFixed(2));
      const materialCost = parseFloat((unitPartsCost + ductCost + refrigerantCost + filterCost).toFixed(2));
      const totalCost    = parseFloat((materialCost + laborCost).toFixed(2));

      return {
        materials: [
          { name: "Unit Parts",   qty: u,        unit: "pcs",  unitCost: 85,   subtotal: unitPartsCost   },
          { name: "Ducting",      qty: d,        unit: "ft",   unitCost: 3.5,  subtotal: ductCost        },
          { name: "Refrigerant",  qty: ref,  unit: "lbs",  unitCost: 22,   subtotal: refrigerantCost },
          { name: "Air Filters",  qty: f,      unit: "pcs",  unitCost: 18,   subtotal: filterCost      },
        ],
        laborHours, laborCost, materialCost, totalCost,
        summary: `${u} Unit(s) | ${ref} lbs Refrigerant | ${laborHours} hrs Labor`,
      };
    }
  }
};

const getProfessionKey = (profession) => {
  if (!profession) return null;
  const p = profession.trim();
  if (p === 'AC Technician' || p === 'HVAC' || p === 'AC Repair') return 'HVAC Technician';
  if (p === 'Electrical') return 'Electrician';
  if (p === 'Plumbing') return 'Plumber';
  if (p === 'Carpentry') return 'Carpenter';
  if (p === 'Cleaning') return 'Cleaner';
  if (p === 'Painting') return 'Painter';
  return p;
};

// @desc    Generate estimate preview
// @route   POST /api/estimates/preview
// @access  Private
export const previewEstimate = async (req, res, next) => {
  try {
    const { workerId, inputs } = req.body;

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const key = getProfessionKey(worker.category);
    const formula = ESTIMATOR_FORMULAS[key];
    if (!formula) {
      return res.status(400).json({
        success: false,
        message: `Estimator is not configured for category: ${worker.category}`
      });
    }

    // Default hourly rate if not present
    const hourlyRate = parseFloat(String(worker.experience || "").replace(/[^0-9.]/g, "")) || 40;
    const breakdown = formula.calculate(inputs || {}, hourlyRate);
    const { calculateServicePriceEstimate } = await import('../services/priceEstimateMatrixService.js');
    const matrixEstimate = calculateServicePriceEstimate(hourlyRate, breakdown.laborHours || 1);

    res.status(200).json({
      success: true,
      profession: worker.category,
      inputs,
      breakdown,
      matrixEstimate
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm and save estimate
// @route   POST /api/estimates/confirm
// @access  Private
export const confirmEstimate = async (req, res, next) => {
  try {
    const { workerId, inputs } = req.body;
    const userId = req.user._id;

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const key = getProfessionKey(worker.category);
    const formula = ESTIMATOR_FORMULAS[key];
    if (!formula) {
      return res.status(400).json({
        success: false,
        message: `Estimator is not configured for category: ${worker.category}`
      });
    }

    const hourlyRate = parseFloat(String(worker.experience || "").replace(/[^0-9.]/g, "")) || 40;
    const breakdown = formula.calculate(inputs || {}, hourlyRate);

    const estimate = await Estimate.create({
      userId,
      workerId,
      profession: worker.category,
      inputs,
      materials: breakdown.materials,
      laborHours: breakdown.laborHours,
      laborCost: breakdown.laborCost,
      materialCost: breakdown.materialCost,
      totalCost: breakdown.totalCost,
      summary: breakdown.summary,
      status: 'confirmed'
    });

    res.status(201).json({
      success: true,
      message: 'Estimate confirmed and saved successfully',
      estimate
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get estimate details by ID with strict ownership authorization
// @route   GET /api/estimates/:id
// @access  Private
export const getEstimateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || id.length !== 24) {
      return res.status(400).json({ success: false, message: 'Invalid estimate ID' });
    }

    const estimate = await Estimate.findById(id);
    if (!estimate) {
      return res.status(404).json({ success: false, message: 'Estimate document not found' });
    }

    // Strict IDOR Authorization Check
    const currentUserId = req.user._id.toString();
    const isOwnerUser = estimate.userId.toString() === currentUserId;
    const isAssignedWorker = estimate.workerId.toString() === currentUserId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwnerUser && !isAssignedWorker && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view or download this estimate'
      });
    }

    res.status(200).json({
      success: true,
      estimate
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download estimate PDF with IDOR verification
// @route   GET /api/estimates/:id/download
// @access  Private
export const downloadEstimatePdf = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || id.length !== 24) {
      return res.status(400).json({ success: false, message: 'Invalid estimate ID' });
    }

    const estimate = await Estimate.findById(id);
    if (!estimate) {
      return res.status(404).json({ success: false, message: 'Estimate document not found' });
    }

    // Strict IDOR Authorization Check
    const currentUserId = req.user._id.toString();
    const isOwnerUser = estimate.userId.toString() === currentUserId;
    const isAssignedWorker = estimate.workerId.toString() === currentUserId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwnerUser && !isAssignedWorker && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to download this estimate document'
      });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=Estimate_${id}.json`);
    res.status(200).json({
      success: true,
      estimate
    });
  } catch (error) {
    next(error);
  }
};
