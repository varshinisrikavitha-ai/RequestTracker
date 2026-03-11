const statusService = require('../services/status.service');
const { sendSuccess } = require('../utils/response.utils');

const updateStatus = async (req, res, next) => {
  try {
    const request = await statusService.updateStatus(req.params.id, req.body, req.user);
    sendSuccess(res, request, 'Status updated successfully');
  } catch (err) { next(err); }
};

const getStatusHistory = async (req, res, next) => {
  try {
    const history = await statusService.getStatusHistory(req.params.id, req.user);
    sendSuccess(res, history, 'Status history fetched');
  } catch (err) { next(err); }
};

module.exports = { updateStatus, getStatusHistory };
