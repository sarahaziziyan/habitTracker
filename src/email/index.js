const config = require('../config');

const providers = {
  mailpit: () => require('./mailpitProvider'),
  console: () => require('./consoleProvider'),
  // ses: () => require('./sesProvider'),   // add later
  // resend: () => require('./resendProvider'),
};

const load = providers[config.emailProvider];
if (!load) throw new Error('Unknown EMAIL_PROVIDER: ' + config.emailProvider);
const provider = load();

// Contract: provider.send({ to, subject, text, html }) returns a Promise
async function sendEmail(message) {
  return provider.send(message);
}

module.exports = { sendEmail };
