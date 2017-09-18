var program = require('commander');
var argv = require('optimist').argv;
var path = require('path');

program
    .version('0.0.1')
    .option('-mn, --moduleName', '指定模块名字')
    .option('-cp, --configPath', '指定配置文件地址，默认是当前目录下')
    .parse(process.argv);

module.exports = (function () {
    return {
        params: {
            moduleName: argv.moduleName?argv.moduleName: null,
            configPath: argv.configPath?path.resolve(process.cwd(), argv.configPath): "./config.json"
        }
    }
})();

return module.exports;