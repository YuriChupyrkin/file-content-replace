const path = require('path');
const fs = require('fs');

const replace = require('./replacer');

async function getFiles (dir, extension) {
  if (!fs.existsSync(dir)) {
    throw new Error('no dir found:' + dir);
  }

  let matchFiles = [];
  let files = fs.readdirSync(dir);

  for (let i = 0; i < files.length; i++) {
    let filePath = path.join(dir, files[i]);
    let stat = fs.lstatSync(filePath);
    if (stat.isDirectory()) {
      let foundFiles = await getFiles(filePath, extension); //recurse
      matchFiles = matchFiles.concat(foundFiles);
    } else if (path.extname(filePath) == extension &&
      filePath.includes('js/components/') &&
      !files[i].includes('_spec')) {
        matchFiles.push(filePath);
    };
  }

  return matchFiles;
}

async function update (config, files) {
  let readFilesCount = 0;
  let writeFilesCount = 0;
  let promises = [];

  files.forEach((filePath) => {
    let promise = new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, fileContent) => {
        readFilesCount++

        if (err) {
          console.error(err);
          throw new Error(`cannot read file: ${filePath}`);
        }

        const replacedContent = replace(fileContent, config);

        if (replacedContent !== fileContent) {
          fs.writeFile(filePath, replacedContent, (err) => {
            if (err) {
              console.error(err);
              throw new Error(`write file: ${filePath}`);
            }

            writeFilesCount++;
            console.log(`Updated: ${filePath}`);
            resolve();
          });
        } else {
          resolve();
        }

        console.log(`Progress: ${readFilesCount} / ${files.length}`);
      });
    });

    promises.push(promise);
  });

  await Promise.all(promises).then(() => {
    console.log(`Updated! Read count: ${readFilesCount}; Write count: ${writeFilesCount}`);
  });
};
const getComponentsWithEvents = async function (files) {
  let promises = [];
  let readFilesCount = 0;
  let components = [];

  files.forEach((filePath) => {
    let promise = new Promise((resolve, reject) => {

      fs.readFile(filePath, 'utf8', (err, fileContent) => {
        readFilesCount++

        if (err) {
          console.error(err);
          throw new Error(`cannot read file: ${filePath}`);
        }

        let match = fileContent.match('events: {');

        if (match && match.length > 0) {
          let fileName = path.basename(filePath).split('.js')[0];
          components.push(fileName);
        }

        resolve();
      });
    });

    promises.push(promise);
  });

  await Promise.all(promises).then(() => {
    console.log(`getComponentsWithEvents DONE! Read count: ${readFilesCount}`);
  });

  return components;
}

const updateFiles = async function (config) {
  const files = await getFiles(config.dir, config.extension);
  const components = await getComponentsWithEvents(files);

  console.log('Components with Events:');
  components.forEach((componentFileName) => {
    console.log(componentFileName);
  });

  console.log(`components found: ${components.length}`);
  console.warn('===========================================');
  console.warn('===========================================');
  console.warn('===========================================');
};

module.exports = updateFiles;
