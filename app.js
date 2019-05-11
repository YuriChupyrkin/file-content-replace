const loadConfig = require('./src/config-loader');
const fileUpdater = require('./src/file-updater');

async function run () {
  console.log('START...');
  const configPath = './config.json';
  try {
    const config = await loadConfig(configPath);
    await fileUpdater(config);

  } catch (error) {
    console.error('ERROR!');
    console.dir(error);
  }

  console.log('DONE!');
};

run();
