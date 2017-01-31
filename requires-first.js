'use strict';

const util = require('./util');

exports.rule = {
  meta: {
    docs: {
      description: 'require that all goog.require() precede other statements (except goog.provide(), goog.module() and goog.module.declareLegacyNamespace())'
    }
  },

  create: function(context) {
    return {
      Program: function(program) {
        let otherSeen = false;

        program.body.forEach(statement => {
          if (util.isRequireStatement(statement) || util.isRequireVariableDeclaration(statement)) {
            if (otherSeen) {
              return context.report(statement, 'Expected goog.require() to precede other statements');
            }
          } else if (!util.isProvideStatement(statement) && !util.isModuleStatement(statement) && !util.isModuleLegacyStatement(statement)) {
            otherSeen = true;
          }
        });

      }
    };
  }
};
