const config = require('../config');

const providers = {
  password: () => require('./passwordProvider'),
  // google: () => require('./googleProvider'),   // add later
};

const load = providers[config.authProvider];
if (!load) throw new Error('Unknown AUTH_PROVIDER: ' + config.authProvider);

// Contract: provider.router is an Express router mounted at /auth
// It must set req.session.userId on successful login.
module.exports = load();
