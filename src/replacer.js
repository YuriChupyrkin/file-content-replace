function replace (fileContent, config) {
  console.log(config.dir);
  return Date.now().toString();
}

module.exports = replace;
