module.exports = {
  send: async ({ to, subject, text }) => {
    console.log('--- EMAIL ---\nTo: ' + to + '\nSubject: ' + subject + '\n' + text + '\n-------------');
  },
};
