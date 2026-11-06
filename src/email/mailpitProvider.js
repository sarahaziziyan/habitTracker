const nodemailer = require('nodemailer');
const config = require('../config');

const transport = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: false,
});

module.exports = {
  send: ({ to, subject, text, html }) =>
    transport.sendMail({ from: config.smtp.from, to, subject, text, html }),
};
