/**
 * @file index.js
 * @author chenqiang
 */

const AutoReducer = require('./auto-reducer');

module.exports = function ({types: t}) {
    return {
        visitor: {
            ExportDefaultDeclaration: function (path, _ref = {opts: {}}) {
                new AutoReducer(t, _ref.opts).run(path);
            }
        }
    };
};
