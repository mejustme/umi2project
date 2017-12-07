var program = require('commander');
var path = require('path');

program
    .version('0.0.1')
    .option('-m, --moduleName <moduleName>', '指定模块名字')
    .option('-c, --configPath <configPath>', '指定配置文件地址，默认是当前目录下')
    .parse(process.argv);

var moduleName = program.moduleName;
var configPath = program.configPath;

module.exports = (function () {
    return {
        params: {
            moduleName: moduleName?moduleName: null,
            configPath: configPath?path.resolve(process.cwd(), configPath): "./config.json"
        }
    }
})();

return module.exports;
