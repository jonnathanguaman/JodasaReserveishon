const service = require('./userService');

async function listUsers(req, res, next) {
  try {
    res.json(await service.listUsers());
  } catch (err) {
    next(err);
  }
}

async function createUser(req, res, next) {
  try {
    res.status(201).json(await service.createUser(req.body));
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, createUser };
