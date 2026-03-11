const dashboardService = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/response.utils');

const getAdminDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getAdminDashboard();
    sendSuccess(res, data, 'Admin dashboard data');
  } catch (err) { next(err); }
};

const getUserDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getUserDashboard(req.user);
    sendSuccess(res, data, 'User dashboard data');
  } catch (err) { next(err); }
};

module.exports = { getAdminDashboard, getUserDashboard };
