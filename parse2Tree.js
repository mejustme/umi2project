
// 遍历树，找到父节点，如果孩子节点不存在，则插入孩子节点
var traverseBuild = function (tree, parentName, newNode) {
    var i;
    if(tree.umi == parentName){
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

// 解析配置
var parse2Tree = function (data, cmd) {
    var parentName;
    var tree = {
        name: 'root',
        children: [],
        umi: '#/m'
    };
    if(!data.umi) return;
    var list = Object.keys(data.umi);
    list.forEach(function (value) {
        var items = value.replace(/#/g, '').split('/');
        var uis = data.umi[value];
        parentName= '#/m';
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
            parentName = umi;
        }
    });
    tree.children[0].moduleName = tree.children[0].name;
    tree.children[0].author  = data.author;
    tree.children[0].dirName = cmd.params.moduleName?cmd.params.moduleName.replace(/module\-/g,""):tree.children[0].name;
    tree.children[0].out = cmd.params.moduleName?cmd.params.moduleName:('module-' + tree.children[0].name);
    tree.children[0].uis =  data.components || [];

    //返回真正的路径树
    return  tree.children[0];
};

return module.exports = parse2Tree;