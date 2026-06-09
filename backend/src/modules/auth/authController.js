const authService = require('./authService');

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  res.json({ success: true });
}

function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { login, logout, me };
