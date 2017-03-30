var fs = require('fs');
var fse = require('fs-extra');
var ejs = require('ejs');
var execSync = require('child_process').execSync;

if(!fs.existsSync('./test/test/a11md')){
    fse.outputFileSync('./test/test/a.md',"133331");
}
