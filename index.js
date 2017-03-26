var fs = require('fs');
var fse = require('fs-extra');
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;

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
        for(var i=0; i<items.length; i++){
            if(!items[i] || items[i] === 'm') continue;
            var newNode = {
                name: items[i],
                children:[],
                uis: i==items.length-1? uis: []
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
            var dirpath = "module-"+obj.moduleName+"/src/"+obj.path+"/"+"component";
            // console.log(dirpath);
            fse.mkdirsSync(dirpath);
            obj.cwd = dirpath;
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
    var result = execSync(cmd,{
            cwd: obj.cwd
        }
    );
    // console.log(result.toString())
};

readFile('./config.json').then(function (json) {
    var data = JSON.parse(json);
    var tree = parse2Tree(data);
    // console.log(JSON.stringify(tree));
    fs.mkdirSync(tree.out);
    traverse({
        tree: tree,
        moduleName: tree.moduleName,
        path: 'layout',
        author: tree.author || "hzchenqinhui@corp.netease.com",
        out: tree.out,
        isRoot: true,
        module: "3c0776c04ad289211f2987f78737873c",
        moduleComponent: "a55cd53d266bfcc60759ef842bb6ac96",
        component: "06df877b5c39bb823ea7d72b97c63ead"
    },build);
});

