const service = require('./reportService');

const wrap = (fn) => async (req, res, next) => {
  try {
    res.json(await fn(req));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  dashboard: wrap(() => service.dashboard()),
  byDay: wrap((req) => service.reservationsByDay(req.query.fecha)),
  topTables: wrap((req) => service.mostReservedTables(req.query.limit)),
  frequentClients: wrap((req) => service.frequentClients(req.query.limit)),
  peakHours: wrap(() => service.peakHours()),
  cancelled: wrap((req) => service.cancelledReservations(req.query))
};
