async function createKeyTable(request) {

  await window.electronAPI.createKeyTable(request);
}

async function createKey(request) {

  const result = await window.electronAPI.createKey(request);

  return result;
}

async function selectKeys(request) {

  const result = await window.electronAPI.selectKeys(request);

  return result;
}

async function updateKeys(request) {

  const result = await window.electronAPI.updateKeys(request);

  return result;
}

async function removeKeys(request) {

  const result = await window.electronAPI.removeKeys(request);

  return result;
}

async function dropTableKeys(request) {
  await window.electronAPI.dropTableKeys(request);
}