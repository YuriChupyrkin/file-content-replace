const loadConfig = require('./config-loader');
const fileUpdater = require('./file-updater');

async function run () {
  console.log('HELLO WORD');
  const configPath = '../config.json';
  try {
    const config = await loadConfig(configPath);
    const result = await fileUpdater(config);

  } catch (error) {
    console.error('ERROR!');
    console.dir(error);
  }

  console.log('END');
};

run();
