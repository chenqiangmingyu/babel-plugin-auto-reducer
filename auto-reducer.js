/**
 * @file auto-reducer.js
 * @author chenqiang
 */

var fs = require('fs');
var path = require('path');

function AutoReducer(types, options) {
    var defaultOptions = {
        include: './src',
        filename: 'redux.js'
    };

    this.types = types;
    this.cwd = process.cwd();
    this.options = Object.assign(defaultOptions, options || {});
    this.sDir = path.join(this.cwd, this.options.include);
}

AutoReducer.prototype = {
    constructor: AutoReducer,

    run: function (node) {
        var reducers = this.listFiles(this.sDir, this.options.filename);

        this.buildImportDeclarations(node, reducers);
        this.buildExportDefaultDeclaration(node, reducers);
    },

    buildImportDeclarations: function (node, reducers) {
        var ctx = this;
        var declarations = reducers.map(function (reducer) {
            const value = path.relative(ctx.cwd, reducer);

            return ctx.types.ImportDeclaration(
                [
                    ctx.types.importDefaultSpecifier(
                        ctx.types.identifier(ctx.getIdentifier(path.relative(ctx.sDir, reducer)))
                    )
                ],
                ctx.types.StringLiteral(value)
            );
        });

        node.insertBefore(declarations);
    },

    buildExportDefaultDeclaration(node, reducers) {
        var ctx = this;
        var kvPairs = reducers.map(function (reducer) {
            const identifier = ctx.getIdentifier(path.relative(ctx.sDir, reducer));

            return ctx.types.objectProperty(
                ctx.types.identifier(identifier),
                ctx.types.identifier(identifier)
            );
        });

        kvPairs.unshift(node.node.declaration.arguments[0].properties[0])

        node.node.declaration.arguments = [
            ctx.types.objectExpression(kvPairs)
        ];
    },

    getIdentifier: function (reducer) {
        var identifiers = '';
        var fragments = reducer
            .replace(this.options.filename, '')
            .split(/[/.]/g);

        fragments.forEach(function (frag, index) {
            if (frag) {
                if (index !== 0) {
                    frag = frag.charAt(0) + frag.substr(1);
                }

                identifiers += frag;
            }
        });

        return identifiers;
    },

    listFiles: function (path, it, rets) {
        rets = rets || [];

        var dirList = fs.readdirSync(path);

        for (var i = 0, l = dirList.length; i < l; i++) {
            var item = dirList[i];

            if (fs.statSync(path + '/' + item).isDirectory()) {
                this.listFiles(path + '/' + item, it, rets);
            }
            else if (fs.statSync(path + '/' + item).isFile()) {
                if (item === it) {
                    rets.push(path + '/' + item);
                }
            }
        }

        return rets;
    }
};

module.exports = AutoReducer;
