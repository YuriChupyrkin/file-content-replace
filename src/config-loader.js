const fs = require('fs');

const loadConfig = async function (path) {
  let promise =  new Promise(function(resolve, reject){
    fs.readFile(path, 'utf-8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(JSON.parse(data));
    });
  });

  return promise;
};

module.exports = loadConfig;
