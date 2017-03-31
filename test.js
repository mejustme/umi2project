var fs = require('fs');
var path = require('path');
var fse = require('fs-extra');
var ejs = require('ejs');
var execSync = require('child_process').execSync;
var readFile = require('./readFile');
var cwd = process.cwd();


console.log(cwd)

console.log(__dirname)

// fs.mkdirSync("ddd");

readFile('./data.json').then(function (data) {
    console.log(data)
})