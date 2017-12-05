'use strict';

const util = require('./util');

/**
 * Unfortunately fragile RegExp to follow.  Here is the logic:
 *
 * 1. check if a name looks like a const (ol.foo.BOO_HOO must have a "_")
 *   if so, require the "namespace" (ol.foo)
 * 2. check if a name looks like a class (ol.foo.Bar or ol.foo.XYZ)
 *   if so, require the class (ol.foo.Bar)
 * 3. otherwise, unless it's an external dependency (ol.ext.*), lop off the last
 *   part of a name and require the rest (e.g. ol.foo.bar would require ol.foo,
 *   but ol.ext.foo would require ol.ext.foo)
 */


exports.rule = {
  meta: {
    docs: {
      description: 'ensure there are goog.require() calls for all used symbols'
    },
    fixable: 'code'
  },

  create: function(context) {
    const defined = {};
    const prefixes = context.options[0].prefixes || ['ol'];
    const exceptions = context.options[0].exceptions || [];
    const joined = prefixes.join('|');
    const CONST_RE = new RegExp(`^((?:${joined})(\\.[a-z]\\w*)*)\\.[A-Z]+_([_A-Z])+$`);
    const CLASS_RE = new RegExp(`^((?:${joined})(\\.[a-z]\\w*)*\\.[A-Z]\\w*)(\\.\\w+)*$`);
    const STARTS_WITH = new RegExp(`^(?:${joined})\\..*`);

    const fixedRequires = new Set();
    let provideOrModuleElement;

    function fixRequire(fixer, node, symbol) {
      if (provideOrModuleElement && !fixedRequires.has(symbol)) {
        fixedRequires.add(symbol);
        return fixer.insertTextAfter(provideOrModuleElement, `\ngoog.require('${symbol}');`);
      }
    };

    return {

      ExpressionStatement: function(statement) {
        if (util.isProvideStatement(statement) || util.isModuleStatement(statement)) {
          provideOrModuleElement = statement;
        }

        if (util.isRequireStatement(statement) || util.isRequireVariableDeclaration(statement) || util.isProvideStatement(statement)) {
          const expression = statement.expression;
          const arg = expression.arguments[0];
          if (!arg || !arg.value) {
            return;
          }
          defined[arg.value] = true;
        }
      },

      MemberExpression: function(expression) {
        const parent = expression.parent;
        if (parent.type === 'AssignmentExpression') {
          const name = util.getName(expression);
          if (name && STARTS_WITH.test(name)) {
            defined[name] = true;
            return;
          }
        }

        if (parent.type !== 'MemberExpression') {
          const name = util.getName(expression);
          if (name && STARTS_WITH.test(name) && !defined[name] && exceptions.indexOf(name) < 0) {
            // check if the name looks like a const
            let match = name.match(CONST_RE);
            if (match) {
              if (!defined[match[1]]) {
                context.report({
                  node: expression,
                  message: `A. missing goog.require('${match[1]}')`,
                  fix: function(fixer) {
                    return fixRequire(fixer, expression, match[1]);
                  }
                });
              }
              return;
            }
            // check if the name looks like a class
            match = name.match(CLASS_RE);
            if (match) {
              const className = match[1];
              const parts = className.split('.');
              const lastPart = parts[parts.length - 1];
              if (lastPart.toUpperCase() === lastPart) {
                // unfortunately ambiguous:
                // ol.has.WEBGL -> require('ol.has')
                // ol.source.XYZ -> require('ol.source.XYZ')
                const objectName = parts.slice(0, -1).join('.');
                if (!defined[className] && !defined[objectName]) {
                  context.report({
                    node: expression,
                    message: `B. missing goog.require('${className}') or goog.require('${objectName}')`,
                    fix: function(fixer) {
                      return fixRequire(fixer, expression, className);
                    }
                  });
                }
                return;
              }
              const parentObjectName = className.split('.').slice(0, -1).join('.'); // app.constants.RouteType enum in constants namespace
              if (!defined[className] && !defined[parentObjectName]) {
                  context.report({
                    node: expression,
                    message: `C. missing goog.require('${className}') or goog.require('${parentObjectName}')`,
                    fix: function(fixer) {
                      return fixRequire(fixer, expression, className);
                    }
                  });
              }
              return;
            }
            // otherwise, assume the object should be required
            const parts = name.split('.');
            if (parts[1] !== 'ext') {
              // unless it's an ol.ext.*
              parts.pop();
            }
            const objectName = parts.join('.');
            const parentObjectName = parts.slice(0, -1).join('.'); // app.widgets.sortable.dragOptionsDirective.module
            if (!defined[objectName] && !defined[parentObjectName]) {
              context.report({
                node: expression,
                message: `D. missing goog.require('${objectName}') or goog.require('${parentObjectName}')`,
                fix: function(fixer) {
                  return fixRequire(fixer, expression, objectName);
                }
              });
            }
          }
        }
      }
    };
  }
};
