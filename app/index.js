
const path = require('path');
const Generator = require('yeoman-generator');
const askName = require('inquirer-npm-name');
const _ = require('lodash');
const extend = require('deep-extend');
const mkdirp = require('mkdirp');

function parseScopedName(name) {
  const nameFragments = name.split('/');
  const parseResult = {
    scopeName: '',
    localName: name
  };

  if (nameFragments.length > 1) {
    parseResult.scopeName = nameFragments[0];
    parseResult.localName = nameFragments[1];
  }

  return parseResult;
}

function makeName(name) {
  const parsedName = parseScopedName(name);
  name = parsedName.localName;
  name = _.kebabCase(name);
  return parsedName.scopeName ? `${parsedName.scopeName}/${name}` : name;
}

module.exports = class extends Generator {
  initializing() {
    this.props = {};
  }

  prompting() {
    return askName(
      {
        name: 'name',
        message: 'Your project name',
        default: makeName(path.basename(process.cwd())),
        filter: makeName,
      },
      this
    ).then(props => {
      this.props.name = props.name;
      Object.assign(this.props, parseScopedName(props.name));
    });
  }

  default() {
    if (path.basename(this.destinationPath()) !== this.props.localName) {
      this.log(
        `Your project must be inside a folder named ${this.props.localName}\nI'll automatically create this folder.`
      );
      mkdirp.sync(this.props.localName);
      this.destinationRoot(this.destinationPath(this.props.localName));
    }

    const readmeTpl = _.template(this.fs.read(this.templatePath('README.md')));

    this.composeWith(require.resolve('generator-node/generators/app'), {
      boilerplate: false,
      name: this.props.name,
      // projectRoot: 'generators',
      skipInstall: this.options.skipInstall,
      readme: readmeTpl({
        projectName: this.props.name,
        yoName: this.props.name
      })
    });

    this.fs.copy(
      this.templatePath('./main-directory'),
      this.destinationPath('.')
    );

  }

  writing() {
    const pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    const generatorGeneratorPkg = require('../package.json');

    extend(pkg, {
      "scripts": {
        "start": "rollup -c",
        "dev": "rollup -c -w"
      },
      type: 'module',
      dependencies: {
        'yeoman-generator': generatorGeneratorPkg.dependencies['yeoman-generator'],
        chalk: generatorGeneratorPkg.dependencies.chalk,
        yosay: generatorGeneratorPkg.dependencies.yosay
      },
      devDependencies: {
        "@rollup/plugin-babel": "^6.0.3",
        "@rollup/plugin-commonjs": "^25.0.3",
        "@rollup/plugin-node-resolve": "^15.1.0",
        "rollup": "^3.26.3",
        "rollup-plugin-browsersync": "^1.3.3"
      }
    });
    pkg.keywords = pkg.keywords || [];

    this.fs.writeJSON(this.destinationPath('package.json'), pkg);
  }

  conflicts() {
    this.fs.append(this.destinationPath('.eslintignore'), '**/templates\n');
  }
};
