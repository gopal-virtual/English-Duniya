// spec.js
describe('Zaya App', function() {


  it('it should load quiz', function() {


    browser.get('http://localhost:8100/main.html#/quiz/practice/cfd671c9-0e4a-478c-95b2-9238cad2d1f9/questions');
    // browser.pause();
    // return browser.driver.wait(function() {
    //   return browser.driver.getCurrentUrl().then(function(url) {
    //     return /cfd671c9-0e4a-478c-95b2-9238cad2d1f9/.test(url);
    //   });
    // }, 10000);
    // expect(browser.getTitle()).toEqual('English Dunyia');
  });

  it('it should slect an option', function() {
    browser.waitForAngular();
    element(by.css('#q0 > div:nth-child(1) > div')).click()
  })
});
