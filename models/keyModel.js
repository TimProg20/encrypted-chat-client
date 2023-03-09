const db = require('electron-db');

let message = {

  tableName: 'chatKeys',
  createTable: createTable,
  tableIsValid: tableIsValid,
  selectFirst: selectFirst,
  select: select,
  insert: insert,
  update: update,
  remove: remove,
  dropTable,
}

module.exports = message;

function createTable() {

  db.createTable(this.tableName, (success, result) => {
    console.log(result);
  });
}

function tableIsValid() {
  return db.valid(this.tableName);
}

function selectFirst(data) {

  if (!this.tableIsValid()) {

    return {
      success: false,
      result: "Table is invalid"
    };
  }

  let response;

  db.getRows(this.tableName, data, (success, result) => {

    if (!success) {

      response = {
        success: false,
        result: result
      };
    }

    response = {
      success: true,
      result: (result.length === 0) ? null : result[0]
    };
  });

  return response;
}

function select(data = null) {

  if (!this.tableIsValid()) {

    return {
      success: false,
      result: "Table is invalid"
    };
  }

  let response;

  if (data === null) {

    db.getAll(this.tableName, (success, result) => {

      response = {
        success: success,
        result: result
      };
    });

  } else {

    db.getRows(this.tableName, data, (success, result) => {

      response = {
        success: success,
        result: result
      };
    });

  }

  return response;
}

function insert(data) {

  if (!this.tableIsValid()) {

    return {
      success: false,
      result: "Table is invalid"
    };
  }

  let response;
            
  db.insertTableContent(this.tableName, data, (success, result) => {
    response = {
      success: success,
      result: result
    }
  });

  return response;
}

function update(where, set) {

  if (!this.tableIsValid()) {

    return {
      success: false,
      result: "Table is invalid"
    };
  }

  let response;

  db.updateRow(this.tableName, where, set, (success, result) => {
    response = {
      success: success,
      result: result
    }
  });

  return response;
}

function remove(request) {

  if (!this.tableIsValid()) {

    return {
      success: false,
      result: "Table is invalid"
    };
  }

  let response;

  console.log(request);
            
  db.deleteRow(this.tableName, request, (success, result) => {
    response = {
      success: success,
      result: result
    }
  });

  return response;
}

function dropTable() {
  db.dropTable(this.tableName);
}