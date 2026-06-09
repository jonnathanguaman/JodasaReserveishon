const service = require('./tableService');

async function listTables(req, res, next) {
  try {
    res.json(await service.listTables());
  } catch (err) {
    next(err);
  }
}

async function createTable(req, res, next) {
  try {
    res.status(201).json(await service.createTable(req.body));
  } catch (err) {
    next(err);
  }
}

async function updateTable(req, res, next) {
  try {
    res.json(await service.updateTable(req.params.id, req.body));
  } catch (err) {
    next(err);
  }
}

module.exports = { listTables, createTable, updateTable };
