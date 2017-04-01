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
            buildRegistItem(arr[i].replace(/index\.html/,'index.js'), tree.moduleName);
            buildExportHtmlItem(arr[i].replace(/index\.html/,'module.htm'), tree.moduleName);
            buildExportJsItem(arr[i].replace(/index\.html/,'module.js'), tree.moduleName);
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
var buildRegistItem = function (path, moduleName) {
    var alias = getAlias(path, moduleName);
    readFile(path).then(function (file) {
        fse.outputFileSync(path, file.replace("//m.regist('message');","m.regist('" +alias+ "')"));
        console.log("regist in " + path);
    })
}

// export module item whit html
var buildExportHtmlItem = function (path, moduleName) {
    var alias = getAlias(path, moduleName);
    readFile(path).then(function (file) {
        fse.outputFileSync(path, file.replace('Welcome to use NEJ UMI Module !!',"Welcome to module "+alias));
        console.log("export html in " + path);
    })
}

// export module item whit js
var buildExportJsItem = function (path, moduleName) {
    var alias = getAlias(path, moduleName);
    readFile(path).then(function (file) {
        // fse.outputFileSync(path, file);
        console.log("export js in " + path);
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