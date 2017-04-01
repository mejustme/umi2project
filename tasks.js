var fs = require('fs');
var nodePath = require('path');
var fse = require('fs-extra');
var ejs = require('ejs');
var execSync = require('child_process').execSync;
var readFile = require('./readFile');

// build project with nei
var buildProject = function (obj) {
    obj.cwd = obj.out;
    runNei("module", obj);
    for(var i=0; i<obj.tree.uis.length; i++){
        obj.uiName = /^ux-/.test(obj.tree.uis[i])? obj.tree.uis[i] : "ux-"+ obj.tree.uis[i];
        if(obj.moduleName == obj.tree.name && obj.isRoot){
            runNei("moduleComponent", obj);
        }else {
            var cwd = "module-"+obj.moduleName+"/src/"+obj.path+"/"+"component";
            // console.log(cwd);
            fse.mkdirsSync(cwd);
            obj.cwd = cwd;
            runNei("component", obj);
        }
    }
};

var runNei = function (type, obj) {
    var cmd = "nei build -sk {type} -module {moduleName} -name {path} -author {author}";
    if(type != 'module'){
        cmd = cmd.replace(/path/, "uiName");
    }
    cmd = cmd.replace(/type/, type).replace(/{(.+?)}/g, function ($0,$1) {
        return obj[$1];
    });
    console.log(cmd);
    execSync(cmd,{
        cwd: obj.cwd
    });
};

// build design.md item
var buildDesignItem = function (umi, moduleName) {
    var shotUmi = umi.match(new RegExp(moduleName+'(.*)$'))[1];
    var mddir = "module-"+moduleName+"/design"+shotUmi;
    if(mddir[mddir.length-1]!='/'){
        mddir = mddir+ '/';
    }
    var imgName = shotUmi.split('/').filter(function (value) {
        if(value!=='') return true;
    }).join('-');

    fse.mkdirsSync(mddir);
    readFile(nodePath.resolve(__dirname, './template/design.ejs')).then(function (template) {
        var file = ejs.render(template, {
            umi: umi,
            imgName: imgName
        });
        var path = mddir+'design.md';

        if(!fs.existsSync(path)){
            console.log("build " + path);
            fse.outputFileSync(path, file);
        }else {
            console.log("already exist "+path);
        }

        // build sequence img
        var moduleDesignImg = "module-"+ moduleName+ '/arch/design/' + imgName+  '.png';
        if(!fs.existsSync(moduleDesignImg)){
            console.log("build " + moduleDesignImg);
            fse.copySync(nodePath.resolve(__dirname,'./template/a-b.png'), moduleDesignImg);
        }else {
            console.log("already exist " + moduleDesignImg);
        }

        // build module function img
        var moduleFuntionImg = "module-"+ moduleName+ '/arch/f-' + imgName+  '.png';
        if(!fs.existsSync(moduleFuntionImg)){
            console.log("build " + moduleFuntionImg);
            fse.copySync(nodePath.resolve(__dirname,'./template/f-a-b.png'), moduleFuntionImg);
        }else {
            console.log("already exist " + moduleFuntionImg);
        }
    });
};


// build design
var buildDesign =  function (obj) {
    if(obj.isRoot){
        var root = "module-" + obj.moduleName;
        fse.mkdirsSync(root + "/arch/design");
        fse.mkdirsSync(root + "/design");
        if(!fs.existsSync(root + '/arch/design/umi.png')){
            fse.copySync(nodePath.resolve(__dirname,'./template/umi.png'), root + '/arch/design/umi.png');
            console.log("build " + root + "/arch/design/umi.png");
        }else {
            console.log("already exist "+ root + "/arch/design/umi.png");
        }
        console.log("build " + root + "/arch/design");
        console.log("build " + root + "/design");
        return;
    }
    buildDesignItem(obj.tree.umi, obj.moduleName);

};

// build readme
var buildReadme = function (tree) {
    readFile(nodePath.resolve(__dirname,'./template/README.ejs')).then(function (template) {
        var file = ejs.render(template, {
            tree: tree,
            moduleName: tree.moduleName
        });
        var path =  tree.out +'/README.md';
        fse.outputFileSync(path, file);

        console.log("build " + path);
    })
};

// build module config
var buildModuleConfig = function (tree) {
    readFile(nodePath.resolve(__dirname,'./template/config.ejs')).then(function (template) {
        var file = ejs.render(template, {
            tree: tree,
            author: tree.author,
            moduleName: tree.moduleName
        });
        file = file.replace(/,(?=\s*\r?\n\s*})/g,'');
        var path = tree.out + '/src/config.js';
        fse.outputFileSync(path, file);

        console.log("build " + path);

        buildRegistExport(tree)
    })
}

// build regist and export module
var buildRegistExport = function (tree) {
    var path = "module-"+ tree.moduleName+ '/src/config.js';
    readFile(path).then(function (file) {
        // arr like 'module-column/src/layout/index.html'
        var arr = file.match(/[^\s"]+index\.html(?=")/g);
        for(var i=0; i<arr.length; i++){
            var isParent = false;
            var temp = arr[i].split('index.html')[0];
            if(temp.indexOf('layout')!=-1){
                isParent = tree;
            }else {
                for(var j=0; j<arr.length; j++){
                    if(j==i) continue;
                    if(arr[j].indexOf(temp)!=-1){
                        isParent = tree;
                        break;
                    }
                }
            }

            buildRegistItem(arr[i].replace(/index\.html/,'index.js'), tree.moduleName, isParent);
            buildExportHtmlItem(arr[i].replace(/index\.html/,'module.htm'), tree.moduleName, isParent);
            buildExportJsItem(arr[i].replace(/index\.html/,'module.js'), tree.moduleName, isParent);
        }
    })
}

var getAlias = function (path, moduleName) {
    var shotPath = path.match(/src(\/.+\/)/)[1];
    var alias = shotPath.split('/').filter(function (value) {
        if(value!=='') return true;
    }).join('-');
    return alias=='layout'? moduleName: moduleName+'-'+alias;
}
// regist module item
var buildRegistItem = function (path, moduleName, isParent) {
    var alias = getAlias(path, moduleName);
    readFile(path).then(function (file) {
        fse.outputFileSync(path, file.replace("m.regist('MODULE_ALIAS')","m.regist('" +alias+ "')"));
        console.log("regist in " + path);
    })
}

// export module item whit html
var buildExportHtmlItem = function (path, moduleName, isParent) {
    var alias = getAlias(path, moduleName);
    readFile(path).then(function (file) {
        if(isParent){
            file = file.replace('<p>Welcome to use NEJ UMI Module !!</p>',function ($0) {
                return $0 + '\n' + '    <div id="j-' +alias+ '-child"></div>';
            })
            console.log("export html in " + path);
        }
        file =  file.replace('Welcome to use NEJ UMI Module !!',"module "+alias)
        fse.outputFileSync(path,file);
    })
}

// export module item whit js
var buildExportJsItem = function (path, moduleName, isParent) {
    var alias = getAlias(path, moduleName);
    readFile(path).then(function (file) {
        if(isParent){
            file = file.replace('// EXPORTS_PARENT',
                `this.__export = {
            parent: "j-` + alias + `-child"
        };`);
            console.log("export js in " + path);
        }

        if(alias == moduleName){
            // inject to body
            file = file.replace(/pro\._doBuild(.+\r?\n.+)+};/,function ($0) {
                return $0 + `

    // todo repalce ftl 暴露的节点
    pro.__doParseParent = function (){
        return document.body;
    }; `
            })
            console.log("inject root module in document.body " + path);
        }
        fse.outputFileSync(path,file);

    })
}

// build umi
var buildUMI = function (tree) {

}

return module.exports = {
    buildProject: buildProject,
    runNei: runNei,
    buildDesign: buildDesign,
    buildReadme: buildReadme,
    buildModuleConfig: buildModuleConfig,
    buildUMI: buildUMI
};