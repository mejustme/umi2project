var fs = require('fs');
var fse = require('fs-extra');
var ejs = require('ejs');
var execSync = require('child_process').execSync;

fse.copySync('./template/umi.png','umi.png');
