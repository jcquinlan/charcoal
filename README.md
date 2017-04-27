# charcoal.js
charcoal is an interface between JS variables and SCSS variables. It simply reads a specified JS file and translates any variables in that file into SCSS variables. That's it.

## Why?
I created this because our project lacked a single source of truth for information like colors and breakpoints that could be used in JS inline styling (a common paradigm in React) and SCSS. On paper, a developer doesn't need both SCSS and inline styles, but we found use cases for both, so this tool provides that single source of truth.

## Installation
`npm install node-charcoal` or `yarn add node-charcoal`

## How to use it.
There are two ways to use the tool, both are very simple.

1. Simple run the script through your terminal, passing the destination file and source file as arguments: 

`node charcoal.js testDir/jsVariables.js testDir/_variables.scss`

2. Setup a watcher in your `package.json` file to rerun charcoal anytime your source file changes:
```
"config": {
    "charcoalSrc": "test/vars.js",
    "charcoalDest": "test/_variables.scss"
  },
  "watch": {
    "charcoal": "test/vars.js"
  },
  "scripts": {
    "charcoal": "node src/charcoal.js $npm_package_config_charcoalSrc $npm_package_config_charcoalDest",
    "watch": "npm-watch"
  }
```

The second example uses `npm-watch` to watch the source file, but there are other options as well.

## Creating the Destination File
The destination file (which is most likely `_variables.scss` since this is supposed to interface with SCSS) needs to already exsit, so make sure that you've already created it before running the script. It it possible to use charcoal with a preexisting variable file, **just add `/* charcoal variables */` into your destination file** and your custom JS variables will be added below that comment. Anything above that comment won't be affected, like anything you don't need to share between Javascript and SCSS.
