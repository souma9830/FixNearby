import TaskBreakdown from '../models/TaskBreakdown.js';
import Booking from '../models/Booking.js';
import Worker from '../models/Worker.js';

// @desc    Dispatch team sub-tasks for a booking
// @route   POST /api/team-bookings/dispatch
// @access  Private (Worker)
export const dispatchTeamTasks = async (req, res, next) => {
  try {
    const { bookingId, subTasks, assignedSubWorkers } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const defaultTasks = subTasks || [
      { taskId: 'task-1', title: 'Site Inspection & Setup', weightPct: 20, status: 'completed' },
      { taskId: 'task-2', title: 'Primary Installation / Repair', weightPct: 50, status: 'in_progress' },
      { taskId: 'task-3', title: 'Quality Assurance & Testing', weightPct: 30, status: 'pending' }
    ];

    const totalWeight = defaultTasks.reduce((acc, t) => acc + (t.status === 'completed' ? t.weightPct : 0), 0);

    const taskBreakdown = await TaskBreakdown.create({
      bookingId,
      leadWorkerId: req.user._id,
      assignedSubWorkers: assignedSubWorkers || [],
      subTasks: defaultTasks,
      overallProgressPct: totalWeight
    });

    res.status(201).json({
      success: true,
      message: 'Team dispatch & sub-task breakdown initialized successfully',
      taskBreakdown
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get team task breakdown by booking ID
// @route   GET /api/team-bookings/:bookingId
// @access  Private
export const getTeamTaskBreakdown = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    let taskBreakdown = await TaskBreakdown.findOne({ bookingId })
      .populate('leadWorkerId', 'name category contact')
      .populate('assignedSubWorkers.workerId', 'name category contact');

    if (!taskBreakdown) {
      taskBreakdown = await TaskBreakdown.create({
        bookingId,
        leadWorkerId: req.user._id,
        subTasks: [
          { taskId: 'task-1', title: 'Diagnostic Assessment', weightPct: 30, status: 'completed' },
          { taskId: 'task-2', title: 'Component Replacement', weightPct: 45, status: 'in_progress' },
          { taskId: 'task-3', title: 'Final System Validation', weightPct: 25, status: 'pending' }
        ],
        overallProgressPct: 30
      });
    }

    res.status(200).json({
      success: true,
      taskBreakdown
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sub-task status
// @route   PATCH /api/team-bookings/:bookingId/tasks/:taskId
// @access  Private
export const updateSubTaskStatus = async (req, res, next) => {
  try {
    const { bookingId, taskId } = req.params;
    const { status, proofImage } = req.body;

    const taskBreakdown = await TaskBreakdown.findOne({ bookingId });
    if (!taskBreakdown) {
      return res.status(404).json({ success: false, message: 'Task breakdown not found' });
    }

    const subTask = taskBreakdown.subTasks.find(t => t.taskId === taskId);
    if (subTask) {
      subTask.status = status;
      if (proofImage) subTask.proofImage = proofImage;
      if (status === 'completed') subTask.completedAt = new Date();
    }

    const completedWeight = taskBreakdown.subTasks.reduce((acc, t) => acc + (t.status === 'completed' ? t.weightPct : 0), 0);
    taskBreakdown.overallProgressPct = completedWeight;
    await taskBreakdown.save();

    res.status(200).json({
      success: true,
      message: `Sub-task "${subTask?.title || taskId}" status updated to ${status}`,
      taskBreakdown
    });
  } catch (error) {
    next(error);
  }
};
