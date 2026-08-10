import WorkerSlaCompliance from '../models/WorkerSlaCompliance.js';

export const getWorkerSlaStatus = async (req, res, next) => {
  try {
    const { workerId } = req.params;
    const currentMonth = new Date().toISOString().substring(0, 7);

    let sla = await WorkerSlaCompliance.findOne({ workerId, periodMonth: currentMonth });

    if (!sla) {
      sla = await WorkerSlaCompliance.create({
        workerId,
        periodMonth: currentMonth,
        onTimeArrivalRate: 98,
        jobCompletionRate: 99,
        averageResponseTimeMinutes: 12,
        slaStatus: 'compliant',
      });
    }

    res.status(200).json({ success: true, data: sla });
  } catch (error) {
    next(error);
  }
};

export const logSlaViolation = async (req, res, next) => {
  try {
    const { workerId } = req.params;
    const { violationType } = req.body;
    const currentMonth = new Date().toISOString().substring(0, 7);

    let sla = await WorkerSlaCompliance.findOne({ workerId, periodMonth: currentMonth });
    if (!sla) {
      sla = new WorkerSlaCompliance({ workerId, periodMonth: currentMonth });
    }

    sla.slaViolationsCount += 1;
    if (sla.slaViolationsCount >= 3) {
      sla.slaStatus = 'breached';
    } else if (sla.slaViolationsCount >= 1) {
      sla.slaStatus = 'warning';
    }

    await sla.save();

    res.status(200).json({ success: true, message: 'SLA violation logged', data: sla });
  } catch (error) {
    next(error);
  }
};
