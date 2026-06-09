const service = require('./reservationService');

async function list(req, res, next) {
  try {
    res.json(await service.getReservations(req.query));
  } catch (err) {
    next(err);
  }
}

async function availability(req, res, next) {
  try {
    res.json(await service.getAvailability(req.query));
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    res.status(201).json(await service.createReservation(req.body, req.user.id));
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    res.json(await service.updateReservation(req.params.id, req.body, req.user.id));
  } catch (err) {
    next(err);
  }
}

async function cancel(req, res, next) {
  try {
    res.json(await service.cancelReservation(req.params.id, req.user.id));
  } catch (err) {
    next(err);
  }
}

async function status(req, res, next) {
  try {
    res.json(await service.changeStatus(req.params.id, req.body.estado, req.user.id));
  } catch (err) {
    next(err);
  }
}

module.exports = { list, availability, create, update, cancel, status };
