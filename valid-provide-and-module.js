'use strict';

const path = require('path');
const pkgDir = require('pkg-dir');
const util = require('./util');

exports.rule = {
  meta: {
    docs: {
      description: 'require the first goog.provide() or goog.module() has an arg named like the file path'
    }
  },

  create: function(context) {
    const entryPoints = context.options[0].entryPoints || ['ol'];
    const relativeSourceRoot = context.options[0].root || 'src';
    let gotFirst = false;
    return {
      CallExpression: function(expression) {
        if (gotFirst) {
          return;
        }
        const isProvide = util.isProvideExpression(expression);
        const isModule = util.isModuleExpression(expression);

        if (isProvide || isModule) {
          const type = isProvide ? 'provide' : 'module';
          gotFirst = true;
          const parent = expression.parent;
          if (parent.type !== 'ExpressionStatement') {
            return context.report(expression, `Expected goog.${type}() to be in an expression statement`);
          }

          if (parent.parent.type !== 'Program') {
            return context.report(expression, `Expected goog.${type}() to be at the top level`);
          }

          if (expression.arguments.length !== 1) {
            return context.report(expression, `Expected one argument for goog.${type}()`);
          }

          const arg = expression.arguments[0];
          if (arg.type !== 'Literal' || !arg.value || typeof arg.value !== 'string') {
            return context.report(expression, `Expected goog.${type}() to be called with a string`);
          }

          const filePath = context.getFilename();
          const sourceRoot = path.join(pkgDir.sync(filePath), relativeSourceRoot);
          const requirePath = path.relative(sourceRoot, filePath);
          const ext = '.js';
          let name = arg.value;
          // special case for main entry point
          if (entryPoints.indexOf(name) !== -1) {
            name += '.index';
          }
          const expectedPath = name.split('.').join(path.sep) + ext;
          if (expectedPath.toLowerCase() !== requirePath.toLowerCase()) {
            return context.report(expression, `Expected goog.${type}('${name}') to be at ${expectedPath.toLowerCase()} instead of ${requirePath.toLowerCase()}`);
          }
        }
      }
    };
  }
};
