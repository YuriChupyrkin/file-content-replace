const addImport = (fileContent, configItem) => {
  const importSrting = configItem.importSrting;
  const replaceStr = configItem.replace;
  if (typeof(importSrting) === 'string' && !fileContent.includes(importSrting)) {
    if (typeof(replaceStr) === 'string' && fileContent.includes(replaceStr)) {
      fileContent = fileContent.replace('*/\n', `*/\n\n${importSrting}`);
    }
  }

  return fileContent;
};

const replaceItem = (fileContent, configItem) => {
  if (typeof(configItem.replace) !== 'string' || typeof(configItem.with) !== 'string') {
    return fileContent;
  }

  fileContent = fileContent.replace(new RegExp(configItem.replace, 'g'), configItem.with);
  return fileContent;
};

function replace (fileContent, config) {
  const items = config.items;

  items.forEach((configItem) => {
    fileContent = addImport(fileContent, configItem);
    fileContent = replaceItem(fileContent, configItem);

  });

  return fileContent;
};

module.exports = replace;
