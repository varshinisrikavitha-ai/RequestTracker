const requestService = require('../services/request.service');
const { sendSuccess, sendPaginated } = require('../utils/response.utils');

const createRequest = async (req, res, next) => {
  try {
    const request = await requestService.createRequest(req.body, req.user.id, req.file);
    sendSuccess(res, request, 'Request created successfully', 201);
  } catch (err) { next(err); }
};

const getRequests = async (req, res, next) => {
  try {
    const { requests, pagination } = await requestService.getRequests(req.query, req.user);
    sendPaginated(res, requests, pagination, 'Requests fetched');
  } catch (err) { next(err); }
};

const getRequestById = async (req, res, next) => {
  try {
    const request = await requestService.getRequestById(req.params.id, req.user);
    sendSuccess(res, request, 'Request fetched');
  } catch (err) { next(err); }
};

const deleteRequest = async (req, res, next) => {
  try {
    await requestService.deleteRequest(req.params.id, req.user);
    sendSuccess(res, null, 'Request deleted');
  } catch (err) { next(err); }
};

const updateRequest = async (req, res, next) => {
  try {
    const request = await requestService.updateRequest(
      req.params.id,
      req.body,
      req.user,
      req.file
    );
    sendSuccess(res, request, 'Request updated');
  } catch (err) { next(err); }
};

module.exports = { createRequest, getRequests, getRequestById, deleteRequest, updateRequest };
