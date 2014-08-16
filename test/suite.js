var run = require('../src/run'),
	select = require('../src/select');

function failIf(condition, msg) {
	if (condition) {
		throw new Error(msg);
	}
}

module.exports = {
	"all": function(test, browser) {
		run(browser, {

			url: function() {
				var currentURL = browser.execute('return window.location.protocol + "//" + window.location.host + "/" + window.location.pathname;');
				browser.url(currentURL);
			},

			execute: {
				"function": function () {
					throw new Error("webfiberunit does not support execute(function)");
					var result = browser.execute(function() { return testFunction('a', 'b', 'c') });
					failIf(result.value !== "You passed a,b,c", "Did not get arguments");
				},
				"eval": function () {
					var result = browser.execute("return testFunction('a', 'b', 'c')");
					failIf(result.value !== "You passed a,b,c", "Did not get arguments");
				}
			},

			element: select.single.every(function(selector) {
				browser.element(selector);
			}),

			elements: select.multi.every(function(selector) {
				var arr = browser.elements(selector).value;
				failIf(arr.length != 3, "Not expected amount of elements");
			}),

			addValue: select.single.every('input-text', function(selector) {
				var uniqueString = (+new Date()).toString(36);
				browser.addValue(selector, uniqueString);
				var result = browser.execute('return document.getElementById("id-input-text").value');
				failIf(result.value != uniqueString, "Failed to add value: " + value);
			}),

			pause: function() {
				var date = +new Date();
				browser.pause(1000);
				failIf(+new Date() - date < 500, "Did not pause +/- one second");
			},
			/*
			waitFor: select.single.every(function(selector) {
				browser.waitFor(selector, 500);
			}),

			waitForChecked: select.single.every(function(selector) {
				browser.waitForChecked(selector, 500);
			}),

			waitForExist: select.single.every(function(selector) {
				browser.waitForExist(selector, 500);
			}),

			waitForVisible: select.single.every(function(selector) {
				browser.waitForExist(selector, 500);
			}),

			waitForSelected: select.single.every(function(selector) {
				browser.waitForSelected(selector, 500);
			}),

			waitForText: select.single.every(function(selector) {
				browser.waitForText(selector, 500);
			}),

			waitForValue: select.single.every(function(selector) {
				browser.waitForValue(selector, 500);
			}),
*/
			windowHandleMaximize: function(){
				browser.windowHandleMaximize();
			},

			window: function() {
				var value = browser.windowHandle().value;
				browser.window(value);
			},

			windowHandle: function() {
				var value = browser.windowHandle().value;
				failIf(!/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/.test(value), "Window handle not uuid: " + value);
			},

			windowHandles: function() {
				var arr = browser.windowHandles().value;
				arr.forEach(function(value) {
					failIf(!/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/.test(value), "One of window handles not uuid: " + value);
				});
			},

			windowHandlePosition: function() {
				browser.windowHandlePosition({ x: 0, y: 0});
			},

			windowHandleSize: function() {
				browser.windowHandleSize({ width: 800, height: 800 });
			},

			saveScreenshot: function() {
				throw new Error("Requires gm");
				browser.saveScreenshot('screenshot.png');
			},

			screenshot: function() {
				var value = browser.screenshot('screenshot.png').value;
				failIf(!/^\w{10}/.test(value), "Did not get base64: " + value);
			}
		});
		test.ok(true, "Completed");
	}
};