# Custom ESLint Rules for Google Compiler projects

This package is used as an ESLint plugin for the Google Compiler projects.  The
rules are meant to help with the transition away from the Closure Library and
may be removed when that is complete.


# Example use

In your .eslintrc.yaml:
```yaml
{
  extends: [
    ...,
    '.eslintrc-googshift.yaml'
  ]
}
```

In a dedicated eslintrc file .eslintrc-googshift.yaml:
```yaml
{
  plugins: [
    'googshift'
  ],
  rules: {
    'googshift/no-duplicate-requires': 'error',

    'googshift/no-missing-requires': ['error', {
      prefixes: ['app', 'ol', 'ngeo'],
      exceptions: ['ngeo.module.requires.push']
    }],

    'googshift/no-unused-requires': 'error',

    'googshift/one-provide-or-module': ['error', {
      entryPoints: ['app'],
      root: 'suissealpine/static'
    }],

    'googshift/requires-first': 'error',

    'googshift/valid-provide-and-module': ['error', {
      entryPoints: ['app'],
      root: 'suissealpine/static'
    }],

    'googshift/valid-requires': 'error'
  }
}

```


# Acknowledgments

This work is a continuation and generalization of an initial work from Tim Schaub.
