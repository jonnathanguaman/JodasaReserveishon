const service = require('./clientService');

async function listClients(req, res, next) {
  try {
    res.json(await service.listClients(req.query.search));
  } catch (err) {
    next(err);
  }
}

async function createClient(req, res, next) {
  try {
    res.status(201).json(await service.createClient(req.body));
  } catch (err) {
    next(err);
  }
}

async function updateClient(req, res, next) {
  try {
    res.json(await service.updateClient(req.params.id, req.body));
  } catch (err) {
    next(err);
  }
}

module.exports = { listClients, createClient, updateClient };
