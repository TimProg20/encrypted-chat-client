const keyModel = require("../models/keyModel.js");

function createTable(event, request)  {
  keyModel.tableName += request;
  keyModel.createTable();
}

function create(event, request) {
  console.log('create');
  console.log(request);
  return keyModel.insert(request);
}

function select() {
  return keyModel.select();
}

function update(event, request) {
  return keyModel.update(request.where, request.set);
}

function remove(event, request) {
  return keyModel.remove(request);
}

function dropTable() {
  keyModel.dropTable();
}

module.exports = {
  createTable,
  create,
  select,
  update,
  remove,
  dropTable
};