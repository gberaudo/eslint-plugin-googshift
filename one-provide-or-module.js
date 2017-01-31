'use strict';

const util = require('./util');

exports.rule = {
  meta: {
    docs: {
      description: 'disallow multiple goog.provide() or goog.module() calls'
    }
  },

  create: function(context) {
    let hasProvide = false;
    let hasModule = false;

    return {
      ExpressionStatement: function(statement) {
        if (util.isModuleStatement(statement)) {
          if (hasModule) {
            const name = statement.expression.arguments[0].value;
            context.report(statement, `Extra goog.module('${name}')`);
          } else if (hasProvide) {
            const name = statement.expression.arguments[0].value;
            context.report(statement, `Forbidden goog.module('${name}'), a goog.provide() is already present`);
          } else {
            hasModule = true;
          }
        }
        if (util.isProvideStatement(statement)) {
          if (hasModule) {
            const name = statement.expression.arguments[0].value;
            context.report(statement, `Forbidden goog.provide('${name}'), a goog.module() is already present`);
          } else if (hasProvide) {
            const name = statement.expression.arguments[0].value;
            context.report(statement, `Extra goog.provide('${name}')`);
          } else {
            hasProvide = true;
          }
        }
      }
    };
  }
};
