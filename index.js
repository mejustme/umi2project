var fs         = require('fs');
var fse        = require('fs-extra');
var cmd        = require('./cmd');
var readFile   = require('./readFile');
var parse2Tree = require('./parse2Tree');
var traverse   = require('./traverse');
var tasks      = require('./tasks');
                 require('./filter');

var buildProject      = tasks.buildProject;
var buildDesign       = tasks.buildDesign;
var buildReadme       = tasks.buildReadme;
var buildModuleConfig = tasks.buildModuleConfig;
var buildUMI          = tasks.buildUMI;

module.exports = function () {
    readFile(cmd.params.configPath).then(function (json) {
        var data = JSON.parse(json);
        var tree = parse2Tree(data, cmd);
        // console.log(JSON.stringify(tree));
        if(!fs.existsSync(tree.out)){
            fs.mkdirSync(tree.out);
        }
        var obj = {
            tree: tree,
            dirName: tree.dirName,
            moduleName: tree.moduleName,
            path: 'layout',
            author: tree.author || "hzchenqinhui@corp.netease.com",
            out: tree.out,
            isRoot: true,
            module: "3c0776c04ad289211f2987f78737873c",
            moduleComponent: "a55cd53d266bfcc60759ef842bb6ac96",
            component: "06df877b5c39bb823ea7d72b97c63ead"
        };
        tree.author= obj.author;

        // build project with nei
        traverse(obj, buildProject);

        // build design.md
        obj.tree = tree;
        obj.isRoot= true;
        traverse(obj, buildDesign);

        // build readme.md
        buildReadme(tree);

        // build umi.md for auto get umi image
        // rule: http://knsv.github.io/mermaid/#installation
        buildUMI(tree)

        // build module config export regist for auto run all module
        buildModuleConfig(tree)

        // copy config file to module
        var configPath = tree.out + '/config.json';
        fse.copySync(cmd.params.configPath, configPath);
        console.log("copy config.json to" + configPath);
    });
}

return module.exports;