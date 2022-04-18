const app = require('./app');

init().then(r => console.debug( 'expect "undefined": ' + r));

/**
 * Start Express server
 * @returns {Promise<void>}
 */
async function init() {
  try {
    app.listen(3001, () => {
      console.log('Express App Listening on Port 3001');
    });
  } catch (error) {
    console.error(`An error occurred: ${JSON.stringify(error)}`);
    process.exit(1);
  }
}
