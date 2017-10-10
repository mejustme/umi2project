var program = require('commander');
var argv = require('optimist').argv;
var path = require('path');

program
    .version('0.0.1')
    .option('-m, --moduleName', '指定模块名字')
    .option('-c, --configPath', '指定配置文件地址，默认是当前目录下')
    .parse(process.argv);

var moduleName = argv.moduleName || argv.m;
var configPath = argv.configPath || argv.c;

module.exports = (function () {
    return {
        params: {
            moduleName: moduleName?moduleName: null,
            configPath: configPath?path.resolve(process.cwd(), configPath): "./config.json"
        }
    }
})();

return module.exports;