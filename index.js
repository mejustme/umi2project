var fs = require('fs');
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

// 解析文本UIM
var parse2Tree = function (data) {
    data = data.replace(/\n/g,'');
    var tree = {
            name: 'root',
            children: []
        },
        parentName;
    var list = data.split('#');
    list.forEach(function (value) {
        var items = value.split('/');
        parentName= 'root';
        for(var i=0; i<items.length; i++){
            if(!items[i] || items[i] === 'm') continue;
            traverseBuild (tree, parentName, items[i]);
            parentName = items[i];
        }
    });
    return  tree.children[0]; //返回真正的路径树
};

// 遍历树，找到父节点，如果孩子节点不存在，则插入孩子节点
var traverseBuild = function (tree, parentName, name) {
    var i;
    if(tree.name == parentName){
        var exist = false;
        for(i=0; i<tree.children.length; i++){
            if(tree.children[i].name ==  name) exist = true;
        }
        if(!exist){
            tree.children.push({
                name: name,
                children:[]
            });
        }
        return true;
    }
    for(i=0; i<tree.children.length; i++){
        if(traverseBuild(tree.children[i], parentName, name)) return true;
    }
};

var traverse = function (obj, callback) {
    var tempTree = obj.tree;
    var tempPath = obj.path;
    callback(obj);
    for(var i=0; i<tempTree.children.length; i++){
        obj.tree = tempTree.children[i];
        obj.path = tempPath + "/" + obj.tree.name;
        traverse(obj, callback);
    }
};

var buildModule = function (obj) {
    var cmd = "nei build -sk 3c0776c04ad289211f2987f78737873c -module {moduleName} -name {path} -author {author}".replace(/{(.+?)}/g, function ($0,$1) {
        return obj[$1];
    });

    console.log(cmd);
    exec(cmd, function(error, stdout, stderr) {
        if (error) {
            console.error(error);
            return;
        }
        console.log(stdout);
        console.log(stderr);
    });
};

readFile('./config.txt').then(function (data) {
    var tree = parse2Tree(data);
    var moduleName = tree.name;
    traverse({
        tree: tree,
        moduleName: moduleName,
        path: moduleName,
        author: "hzchenqinhui@corp.netease.com"
    },buildModule);
});

