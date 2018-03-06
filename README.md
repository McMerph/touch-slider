# Touch slider
Touch slider - is a touch slider with hardware accelerated transitions. It is intended to be used in websites.

## Usage
Add repo of this project to 'dependencies' in package.json of your project.

    // package.json
    "dependencies": {
        ...
        "touch-slider": "git+https://github.com/McMerph/touch-slider.git",
        ...
    }
    
Install library via `npm i`

If you want to be up-to-date you should edit package.json of your project like this ([npm issue](https://github.com/npm/npm/issues/1727))
    
    // package.json
    "scripts": {
        ...
        "postinstall": "npm update && npm install git+https://github.com/McMerph/touch-slider.git",
        ...
      }


## Development
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites
You need to install node.js and npm  

[Download Node.js and npm](https://nodejs.org/en/download/) - pre-built installer

### Installing
Install required packages from npm  
    
    npm i
    
### Demo

To run demo

    npm run demo
    
### Build
    
To build

    npm run build
        

## Built With
* [Node.js](https://nodejs.org/en/) - JavaScript runtime
* [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript that compiles to plain JavaScript
* [WebPack](https://webpack.github.io/) - Module Bundler
