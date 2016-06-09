// conf.js
exports.config = {
  framework: 'jasmine',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['spec.js'],

  onPrepare: function() {

    browser.driver.get('http://localhost:8100/');
    browser.driver.findElement(by.id('username')).sendKeys('7878787878');
    browser.driver.findElement(by.id('password')).sendKeys('123456');
    browser.driver.findElement(by.id('signin')).click();
    // browser.waitForAngular();

    // Login takes some time, so wait until it's done.
    // For the test app's login, we know it's done when it redirects to
    // index.html.
    return browser.driver.wait(function() {
      return browser.driver.getCurrentUrl().then(function(url) {
        return /map/.test(url);
      });
    }, 10000);
  }
}
