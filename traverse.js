var traverse = function (obj, callback) {
    var tempTree = obj.tree;
    var tempPath = obj.path;
    if(tempTree.children.length === 0 && tempTree.umi[tempTree.umi.length-1] != '/'){
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

return module.exports = traverse;