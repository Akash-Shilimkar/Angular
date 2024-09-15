process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: [
      'jasmine',
      '@angular-devkit/build-angular'
    ],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-mocha-reporter'),
      require('karma-junit-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    browsers: [
      'Chrome'
    ],
    customLaunchers: {
      ChromeHeadless_NoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    singleRun: true,
    restartOnFileChange: true,
    client: {
      jasmine: {
        random: false
      },
      clearContext: false
    },
    reporters: [
      'mocha',
      'junit'
    ],
    junitReporter: {
      useBrowserName: false,
      outputFile: 'junit-report.xml',
      suite: 'unit'
    },
    coverageReporter: {
      reporters: [
        {
          type: 'text'
        }
      ],
      check: {
        global: {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100
        }
      }
    }
  });
};
