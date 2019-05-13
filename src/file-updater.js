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

const isDiffTagAndFileName = async function (files) {
  let promises = [];
  let readFilesCount = 0;
  let diffs = [];

  files.forEach((filePath) => {
    let promise = new Promise((resolve, reject) => {

      fs.readFile(filePath, 'utf8', (err, fileContent) => {
        readFilesCount++

        if (err) {
          console.error(err);
          throw new Error(`cannot read file: ${filePath}`);
        }

        let match = fileContent.match('tag: \'[a-zA-Z-]+\'');

        if (match && match.length > 0) {
          let tagName = match[0].split("'")[1];
          let fileName = path.basename(filePath).split('.js')[0];

          if (tagName !== fileName) {
            diffs.push(fileName);
          }
        }

        resolve();
      });
    });

    promises.push(promise);
  });

  await Promise.all(promises).then(() => {
    console.log(`isDiffTagAndFileName DONE! Read count: ${readFilesCount}`);
  });

  return diffs;
}

const updateFiles = async function (config) {
  const files = await getFiles(config.dir, config.extension);
  const diffs = await isDiffTagAndFileName(files);

  console.log('DIFF:');
  diffs.forEach((diffFileName) => {
    console.log(diffFileName);
  });

  console.log(`diffs found: ${diffs.length}`);
  console.warn('===========================================');
  console.warn('===========================================');
  console.warn('===========================================');
};

module.exports = updateFiles;
