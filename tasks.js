var fs = require('fs');
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
    readFile('./template/design.ejs').then(function (template) {
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
            fse.copySync('./template/a-b.png', moduleDesignImg);
        }else {
            console.log("already exist " + moduleDesignImg);
        }

        // build module function img
        var moduleFuntionImg = "module-"+ moduleName+ '/arch/f-' + imgName+  '.png';
        if(!fs.existsSync(moduleFuntionImg)){
            console.log("build " + moduleFuntionImg);
            fse.copySync('./template/f-a-b.png', moduleFuntionImg);
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
        if(!fs.existsSync(root + '/arch/umi.png')){
            fse.copySync('./template/umi.png', root + '/arch/umi.png');
            console.log("build " + root + "/arch/umi.png");
        }else {
            console.log("already exist "+ root + "/arch/umi.png");
        }
        console.log("build " + root + "/arch/design");
        console.log("build " + root + "/design");
        return;
    }
    buildDesignItem(obj.tree.umi, obj.moduleName);

};

// build readme
var buildReadme = function (tree) {
    readFile('./template/README.ejs').then(function (template) {
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
    readFile('./template/config.ejs').then(function (template) {
        var file = ejs.render(template, {
            tree: tree,
            author: tree.author,
            moduleName: tree.moduleName
        });
        file = file.replace(/,(?=\s*\r?\n\s*})/g,'');
        var path = tree.out + '/src/config.js';
        fse.outputFileSync(path, file);

        console.log("build " + path);
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