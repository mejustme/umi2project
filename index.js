var fs = require('fs');
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
            traverse (tree, parentName, items[i]);
            parentName = items[i];
        }
    });
    console.dir(tree);
};

// 遍历树，找到父节点，如果孩子节点不存在，则插入孩子节点
var traverse = function (tree, parentName, name) {
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
         if(traverse(tree.children[i], parentName, name)) return true;
    }
};

readFile('./config.txt').then(function (data) {
    parse2Tree(data);
});

