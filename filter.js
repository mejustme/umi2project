var ejs = require('ejs');

ejs.filters.toMdPath = function (umi, moduleName) {
    // var path = umi.split(moduleName)[1];  fix childe module same name
    var path = umi.match(new RegExp(moduleName+'(.*)$'))[1];
    if(path[path.length-1]!= '/'){
        path = path + '/'
    }
    return path
};

ejs.filters.toAliasPath = function (umi, moduleName, isall) {
    var shotUmi = umi.match(new RegExp(moduleName+'(.*)$'))[1];
    var alias = shotUmi.split('/').filter(function (value) {
        if(value!=='') return true;
    }).join('-');
    return alias;
};

ejs.filters.toFunctionViewImg = function (umi, moduleName) {
    var shotUmi = umi.match(new RegExp(moduleName+'(.*)$'))[1];
    return shotUmi.split('/').filter(function (value) {
        if(value!=='') return true;
    }).join('-');
};

ejs.filters.toFontLevel = function (indexFlag) {
    var long = 2 + (indexFlag.length-1)/2;
    return  new Array(long+1).join("#");
};

ejs.filters.toPureUMI = function (umi) {
    return umi.split('#')[1];
}

ejs.filters.toModuleHtml = function (umi, moduleName) {
    var path = umi.match(new RegExp(moduleName+'(.*)$'))[1];
    if(path === '/' || path === ''){  // for root
        path = '/layout/'
    }
    if(path[path.length-1]!= '/'){
        path = path + '/'
    }
    return 'module-' + moduleName + '/src' + path + 'index.html';
}

ejs.filters.jump = function (umi) {
    return umi.split("#")[1].split("/").join("")
}

ejs.filters.toBlank = function (indexFlag) {
    return new Array(indexFlag.length).join("   ")+'    ';
}

return exports;