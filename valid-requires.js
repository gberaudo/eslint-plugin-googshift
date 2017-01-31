'use strict';

const util = require('./util');

exports.rule = {
  meta: {
    docs: {
      description: 'require that all goog.require() have a valid arg and appear at the top level'
    }
  },

  create: function(context) {
    return {
      CallExpression: function(expression) {
        if (util.isRequireExpression(expression)) {
          const parent = expression.parent;
          const parentIsExpression = parent.type === 'ExpressionStatement';
          const parentIsVariableDeclarator = parent.type === 'VariableDeclarator';
          if (!parentIsExpression && !parentIsVariableDeclarator) {
            return context.report(expression, 'Expected goog.require() to be in an expression or variable declarator statement');
          }

          const expectedProgram = parentIsExpression ? parent.parent : parent.parent.parent;
          if (expectedProgram.type !== 'Program') {
            return context.report(expression, 'Expected goog.require() to be at the top level');
          }

          if (expression.arguments.length !== 1) {
            return context.report(expression, 'Expected one argument for goog.require()');
          }

          const arg = expression.arguments[0];
          if (arg.type !== 'Literal' || !arg.value || typeof arg.value !== 'string') {
            return context.report(expression, 'Expected goog.require() to be called with a string');
          }
        }
      }
    };
  }
};
