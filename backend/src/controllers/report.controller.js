const reportService = require('../services/report.service');
const { sendSuccess } = require('../utils/response.utils');

const requestsSummary = async (req, res, next) => {
  try {
    const data = await reportService.requestsSummary();
    sendSuccess(res, data, 'Requests summary');
  } catch (err) { next(err); }
};

const departmentPerformance = async (req, res, next) => {
  try {
    const data = await reportService.departmentPerformance();
    sendSuccess(res, data, 'Department performance report');
  } catch (err) { next(err); }
};

const monthlyReport = async (req, res, next) => {
  try {
    const data = await reportService.monthlyReport();
    sendSuccess(res, data, 'Monthly report');
  } catch (err) { next(err); }
};

module.exports = { requestsSummary, departmentPerformance, monthlyReport };
