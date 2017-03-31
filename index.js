var fs = require('fs');
var fse = require('fs-extra');
var ejs = require('ejs');
var execSync = require('child_process').execSync;
ejs.filters.toMdPath = function (umi, moduleName) {
    var path = umi.split(moduleName)[1];
    if(path[path.length-1]!= '/'){
        path = path + '/'
    }
    return path
};

ejs.filters.toAliasPath = function (umi, moduleName) {
    var shotUmi = umi.split(moduleName)[1];
    return shotUmi.split('/').filter(function (value) {
        if(value!=='') return true;
    }).join('-');
};

ejs.filters.toFunctionViewImg = function (umi, moduleName) {
    var shotUmi = umi.split(moduleName)[1];
    return shotUmi.split('/').filter(function (value) {
            if(value!=='') return true;
        }).join('-');
};

ejs.filters.toFontLevel = function (indexFlag) {
    var long = 2 + (indexFlag.length-1)/2;
    return  new Array(long+1).join("#");
};

var readFile = function (path) {
    return  new Promise(function (resolve, reject) {
        fs.readFile(path,'utf8',function (err, data) {
            if(err){
                reject(err);
            }else {
                resolve(data);
            }
        })
    })
};

// 解析配置
var parse2Tree = function (data) {
    var parentName;
    var tree = {
            name: 'root',
            children: []
        };
    if(!data.umi) return;
    var list = Object.keys(data.umi);
    list.forEach(function (value) {
        var items = value.replace(/#/g, '').split('/');
        var uis = data.umi[value];
        parentName= 'root';
        items = items.filter(function (value) {
            if(value!=='') return true;
        });
        // console.log(items);
        var umi = '#';
        for(var i=0; i<items.length; i++){
            umi = umi +'/' +items[i];
            if(items[i] === 'm') continue;
            var newNode = {
                name: items[i],
                children:[],
                uis: i==items.length-1? uis: [],
                umi: umi
            };
            traverseBuild (tree, parentName, newNode);
            parentName = items[i];
        }
    });
    tree.children[0].moduleName = tree.children[0].name;
    tree.children[0].author = data.author;
    tree.children[0].out = 'module-' + tree.children[0].name;
    tree.children[0].uis =  data.components || [];

    return  tree.children[0]; //返回真正的路径树
};

// 遍历树，找到父节点，如果孩子节点不存在，则插入孩子节点
var traverseBuild = function (tree, parentName, newNode) {
    var i;
    if(tree.name == parentName){
        var exist = false;
        for(i=0; i<tree.children.length; i++){
            if(tree.children[i].name ==  newNode.name) exist = true;
        }
        if(!exist){
            tree.children.push(newNode);
        }
        return true;
    }
    for(i=0; i<tree.children.length; i++){
        if(traverseBuild(tree.children[i], parentName, newNode)) return true;
    }
};

var traverse = function (obj, callback) {
    var tempTree = obj.tree;
    var tempPath = obj.path;
    if(tempTree.children.length == 0 && tempTree.umi[tempTree.umi.length-1] != '/'){
        tempTree.umi =  tempTree.umi  + '/'; // 叶子节点
    }
    callback(obj);
    for(var i=0; i<tempTree.children.length; i++){
        obj.tree = tempTree.children[i];
        obj.path = tempPath == "layout" ? obj.tree.name : (tempPath + '/' + obj.tree.name);
        obj.isRoot =false;
        traverse(obj, callback);
    }
};

var build = function (obj) {
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

var buildDesign =  function (obj) {
    if(obj.isRoot){
        var root = "module-" + obj.moduleName;
        fse.mkdirsSync(root + "/arch/design");
        fse.mkdirsSync(root + "/design");
        console.log("build " + root + "/arch/design");
        console.log("build" + root + "/design");
        return;
    }
    buildDesignItem(obj.tree.umi, obj.moduleName);

};

var buildDesignItem = function (umi, moduleName) {
    var shotUmi = umi.split(moduleName)[1]; // 此时 可能 模块名称和全局模块一样名称 todo
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
    });
};

var buildReadme = function (tree, moduleName) {
    readFile('./template/README.ejs').then(function (template) {
        var file = ejs.render(template, {
            tree: tree,
            moduleName: moduleName
        });
        var root = "module-"+moduleName;
        var path = root+'/README.md';
        fse.outputFileSync(path, file);
        console.log("build " + path);
    })
};

readFile('./config.json').then(function (json) {
    var data = JSON.parse(json);
    var tree = parse2Tree(data);
    // console.log(JSON.stringify(tree));
    if(!fs.existsSync(tree.out)){
        fs.mkdirSync(tree.out);
    }

    // make nei
    var obj = {
        tree: tree,
        moduleName: tree.moduleName,
        path: 'layout',
        author: tree.author || "hzchenqinhui@corp.netease.com",
        out: tree.out,
        isRoot: true,
        module: "3c0776c04ad289211f2987f78737873c",
        moduleComponent: "a55cd53d266bfcc60759ef842bb6ac96",
        component: "06df877b5c39bb823ea7d72b97c63ead"
    };
    traverse(obj, build);

    // make design.md
    obj.tree = tree;
    obj.isRoot= true;
    traverse(obj, buildDesign);

    // make readme.md
    buildReadme(tree, tree.moduleName)
});

