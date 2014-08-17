var run = require('../src/run'),
	select = require('../src/select'),
	path = require('path'),
	u = require('lodash'),
	testFiles = ["index.html", "README.md"],
	url = 'http://localhost/webfiberunit-caniuse/test/index.html';

function createUniqueString() {
	return ((+new Date())* 1000 + ~~(Math.random()  * 1000)).toString(36);
}

function resolvePath(file) {
	return path.resolve(process.cwd(), file);
}

function failIf(condition, msg) {
	if (condition) {
		throw new Error(msg);
	}
}

function warnEq(expect, actual, msg) {
	msg || (msg = "Unexpected value");
	if (!u.isEqual(expect, actual)) {
		return msg + ": " + JSON.stringify(expect) + " != " + JSON.stringify(actual);
	}
	return null;
}

function testEq(descr, expect, actual) {
	failIf(expect && (typeof actual === "undefined" || actual === null), "Returned no " + descr);
	return warnEq(expect, actual, "Unexpected " + descr);
}

module.exports = {
	"all": function(test, browser) {
		browser.url(url);
		run(browser, {

			url: function() {
				var currentURL = browser.execute('return window.location.protocol + "//" + window.location.host + "/" + window.location.pathname;');
				browser.url(currentURL);
			},

			execute: {
				"function": function () {
					throw new Error("webfiberunit does not support execute(function)");
					var result = browser.execute(function() { return testFunction('a', 'b', 'c') });
					return testEq("return value", "You passed a,b,c", result.value);
				},
				"eval": function () {
					var result = browser.execute("return testFunction('a', 'b', 'c')");
					return testEq("return value", "You passed a,b,c", result.value);
				}
			},

			click: select.single.every('button', function(selector) {
				var arr1 = browser.execute('return window.clickHistory["id-button"] || []').value;
				browser.click(selector);
				var arr2 = browser.execute('return window.clickHistory["id-button"] || []').value;
				failIf(arr1.length + 1 !== arr2.length, "No click registered");
			}),

			element: select.single.every(function(selector) {
				browser.element(selector);
			}),

			elements: select.multi.every(function(selector) {
				var arr = browser.elements(selector).value;
				failIf(arr.length == 0, "Found no elements");
				return testEq("amount of elements", 3, arr.length);
			}),

			clearElement: select.single.every('input text', function(selector) {
				browser.clearElement(selector);
			}),

			addValue: {
				'text': select.single.every('text', function(selector, elementTagName, elementID) {
					var uniqueString = createUniqueString(),
						value;
					browser.clearElement(selector);
					browser.addValue(selector, uniqueString);
					value = browser.execute('return document.getElementById("'+elementID+'").value').value;
					return testEq("text", uniqueString, value);
				}),

				/**
				 * Note: file paths must be absolute
				 */
				'input file html5': function(){
					var file = resolvePath(testFiles[0]),
						prev,
						now;
					// Prevent equal input
					testFiles.reverse();
					prev = browser.execute("return window.inputFileHistory").value;
					browser.addValue('input[id="id-input-file-html5"]', file);
					now = browser.execute("return window.inputFileHistory").value;
					failIf(now.length === prev.length, "File select did not occur");
					return warnEq(1, now[now.length-1].length, "Did not select multiple");
				},
				'input file html5 multiple': {
					'newline': function() {
						var prev,
							now,
							arr = testFiles.map(resolvePath);
						// Prevent equal input
						testFiles.reverse();
						prev = browser.execute("return window.inputFileHistory").value;
						browser.addValue('input[id="id-input-file-html5-multiple"]', arr.join("\n"));
						now = browser.execute("return window.inputFileHistory").value;
						failIf(now.length === prev.length, "File select did not occur: " + JSON.stringify(prev) + "==" + JSON.stringify(now));
						return warnEq(testFiles.length, now[now.length-1].length, "Did not select multiple");
					},

					'quotes': function() {
						var prev,
							now,
							arr = testFiles.map(resolvePath);
						// Prevent equal input
						testFiles.reverse();
						prev = browser.execute("return window.inputFileHistory").value;
						browser.addValue('input[id="id-input-file-html5-multiple"]', '"' + arr.join('""') + '"');
						now = browser.execute("return window.inputFileHistory").value;
						failIf(now.length === prev.length, "File select did not occur");
						return warnEq(testFiles.length, now[now.length-1].length, "Did not select multiple");
					}
				}
			},

			chooseFile: {
				'input file html5': function() {
					var file = resolvePath(testFiles[0]),
						prev,
						now;
					// Prevent equal input
					testFiles.reverse();
					prev = browser.execute("return window.inputFileHistory").value;
					browser.chooseFile('input[id="id-input-file-html5"]', file);
					now = browser.execute("return window.inputFileHistory").value;
					failIf(now.length === prev.length, "File select did not occur");
					return warnEq(1, now[now.length-1].length, "Did not select multiple");
				}
			},

			/**
			 * Note: keys does not need a selector.
			 * It apparently passes keys to the 'active element', i.e. the last element acted upon
			 */
			keys: select.single.every('input text', function(selector) {
				var uniqueString = createUniqueString(),
					value;
				browser.clearElement(selector);
				browser.keys(uniqueString);
				value = browser.execute('return document.getElementById("id-input-text").value').value;
				return testEq("value", uniqueString, value);
			}),

			getText: select.single.every('span', function(selector) {
				var value = browser.getText(selector);
				failIf(!value, "Returned no value");
				return warnEq("Span 1", value, "Did not get expected text");
			}),

			getTagName: select.single.every(function(selector, elementTagName) {
				var value = browser.getTagName(selector);
				return testEq("element tag name", elementTagName, value);
			}),

			getValue: select.single.every('input text', function(selector) {
				var uniqueString = createUniqueString(),
					value;
				browser.clearElement(selector);
				browser.addValue(selector, uniqueString);
				return testEq("value", uniqueString, browser.getValue(selector));
			}),

			elementActive: function() {
				browser.elementActive();
			},

			elementIdDisplayed: select.single.css(function(selector, elementTagName) {
				var id = browser.element(selector).value.ELEMENT;
				failIf(!browser.elementIdDisplayed(id).value, "Element expected to be displayed: " + elementTagName);
			}),

			elementIdEnabled: select.single.css(function(selector, elementTagName) {
				var id = browser.element(selector).value.ELEMENT;
				failIf(!browser.elementIdEnabled(id).value, "Element expected to be enabled: " + elementTagName);
			}),

			elementIdName: select.single.css(function(selector, elementTagName) {
				var id = browser.element(selector).value.ELEMENT;
				return testEq("tag name", elementTagName, browser.elementIdName(id).value);
			}),

			elementIdSelected: select.single.css('input checkbox', function(selector) {
				var id = browser.element(selector).value.ELEMENT;
				failIf(!browser.elementIdSelected(id).value, "Expected element to be selected: " + selector);
			}),

			elementIdClick: select.single.css('button', function(selector) {
				var id = browser.element(selector).value.ELEMENT;
				var arr1 = browser.execute('return window.clickHistory["id-button"] || []').value;
				browser.elementIdClick(id);
				var arr2 = browser.execute('return window.clickHistory["id-button"] || []').value;
				failIf(arr1.length + 1 !== arr2.length, "No click registered");
			}),

			elementIdAttribute: select.single.css("input checkbox", function(selector) {
				var id = browser.element(selector).value.ELEMENT;
				var value = browser.elementIdAttribute(id, 'checked').value;
				failIf(value === null, "Expected attribute not set");
			}),

			elementIdClear: select.single.css('input text', function(selector) {
				var id = browser.element(selector).value.ELEMENT;
				browser.elementIdClear(id);
			}),

			elementIdLocation: select.single.css(function(selector) {
				var id = browser.element(selector).value.ELEMENT;
				var size = browser.elementIdLocation(id).value;
				failIf(!size, "Returned no value");
				return warnEq(typeof size.x === "undefined" || typeof size.y === "undefined", false, "Unexpected location format: " + JSON.stringify(size));
			}),

			elementIdLocationInView: select.single.css(function(selector) {
				var id = browser.element(selector).value.ELEMENT;
				var size = browser.elementIdLocationInView(id).value;
				failIf(!size, "Returned no value");
				return warnEq(typeof size.x === "undefined" || typeof size.y === "undefined", false, "Unexpected location format: " + JSON.stringify(size));
			}),

			elementIdSize: select.single.css(function(selector) {
				var id = browser.element(selector).value.ELEMENT;
				var size = browser.elementIdSize(id).value;
				failIf(!size, "Returned no value");
				return warnEq(typeof size.width === "undefined" || typeof size.height === "undefined", false, "Unexpected size format " + JSON.stringify(size));
			}),

			elementIdText: select.single.css("span", function(selector) {
				var id = browser.element(selector).value.ELEMENT,
					value = browser.elementIdText(id).value;
				return testEq("text", "Span 1", value);
			}),

			elementIdValue: select.single.css('input text', function(selector) {
				var id = browser.element(selector).value.ELEMENT,
					uniqueString = createUniqueString(),
					value;
				browser.addValue(selector, uniqueString);
				value = browser.elementIdValue(id).value;
				return testEq("value", uniqueString, value);
			}),

			elementIdCssProperty: {
				'color hex': function () {
					var id = browser.element('[id="id-textarea"]').value.ELEMENT,
						value = browser.elementIdCssProperty(id, 'background-color').value;
					return testEq("css value", '#ABCDEF', value);
				},

				'color rgba': function () {
					var id = browser.element('[id="id-input-text"]').value.ELEMENT,
						value = browser.elementIdCssProperty(id, 'background-color').value;
					return testEq("css value", 'rgba(171, 205, 239, 1)', value);
				}
			},

			getCssProperty: {
				'color hex': function () {
					return testEq("css value", '#ABCDEF', browser.getCssProperty('[id="id-textarea"]', 'background-color').value);
				},

				'color rgba': function () {
					return testEq("css value", 'rgba(171, 205, 239, 1)', browser.getCssProperty('[id="id-input-text"]', 'background-color').value);
				}
			},

			getAttribute: select.single.css("input checkbox", function(selector) {
				var value = browser.getAttribute(selector, 'checked');
				failIf(value === null, "Expected attribute not set");
			}),

			alertAccept: function() {
				browser.click('[id="id-input-alert"]');
				browser.alertAccept();
			},

			alertDismiss: function() {
				browser.click('[id="id-input-alert"]');
				browser.alertDismiss();
			},

			alertText: function() {
				browser.click('[id="id-input-alert"]');
				var value = browser.alertText().value;
				browser.alertAccept();
				return testEq("alert text", "alert-text", value);
			},

			pause: function() {
				var date = +new Date();
				browser.pause(1000);
				failIf(+new Date() - date < 500, "Did not pause +/- one second");
			},

			implicitWait: function() {
				var date = +new Date();
				browser.implicitWait(1000);
				failIf(+new Date() - date < 500, "Did not pause +/- one second");
			},

			isEnabled: select.single.every(function(selector) {
				browser.isEnabled(selector, 500);
			}),

			isExisting: select.single.every(function(selector) {
				browser.isExisting(selector, 500);
			}),

			isSelected: select.single.every(function(selector) {
				browser.isSelected(selector, 500);
			}),

			isVisible: select.single.every(function(selector) {
				browser.isVisible(selector, 500);
			}),

			waitFor: select.single.every(function(selector) {
				browser.waitFor(selector, 500);
			}),

			waitForChecked: select.single.every(/checkbox|radio/, function(selector) {
				browser.waitForChecked(selector, 500);
			}),

			waitForExist: select.single.every(function(selector) {
				browser.waitForExist(selector, 500);
			}),

			waitForVisible: select.single.every(function(selector) {
				browser.waitForExist(selector, 500);
			}),

			waitForSelected: select.single.every(/checkbox|radio/, function(selector) {
				browser.waitForSelected(selector, 500);
			}),

			waitForEnabled: select.single.every(/checkbox|radio/, function(selector) {
				browser.waitForEnabled(selector, 500);
			}),

			waitForText: select.single.every('span', function(selector) {
				browser.waitForText(selector, 500);
			}),

			waitForValue: select.single.every('input text', function(selector) {
				browser.waitForValue(selector, 500);
			}),

			title: function() {
				var title = browser.title().value;
				failIf(!/Test\ page/.test(title), "Did not get correct title: ", title);
			},

			getTitle: function() {
				var title = browser.getTitle();
				failIf(!/Test\ page/.test(title), "Did not get correct title: ", title);
			},

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

			getCurrentTabId: function() {
				var value = browser.getCurrentTabId();
				failIf(!/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/.test(value), "Tab id not uuid: " + value);
			},

			getTabIds: function() {
				var arr = browser.getTabIds();
				arr.forEach(function(value) {
					failIf(!/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/.test(value), "One of window handles not uuid: " + value);
				});
			},

			switchTab: function() {
				var value = browser.getCurrentTabId();
				browser.switchTab(value);
			},

			saveScreenshot: function() {
				// Currently kills process
				throw new Error("Requires gm");
				browser.saveScreenshot('screenshot.png');
			},

			screenshot: function() {
				var value = browser.screenshot('screenshot.png').value;
				// Probably valid format
				failIf(!/^[\w+/]{10}/.test(value), "Did not get base64: " + value);
			},

			scroll: select.single.every(function(selector) {
				browser.scroll(selector);
			}),

			"scroll-x y": function() {
				browser.scroll(0,0);
			},

			/**
			 * Cookie object:
			 * {string} name - The name of the cookie.
			 * {string} value - The cookie value.
			 * {string=} path - The cookie path.
			 * {string=} domain	- The domain the cookie is visible to.
			 * {boolean=} secure - Whether the cookie is a secure cookie.
			 * {boolean=} httpOnly - Whether the cookie is an httpOnly cookie.
			 * {number=} expiry	- When the cookie expires, specified in seconds since midnight, January 1, 1970 UTC
			 * (i.e. you can use +new Date()).
			 * @see https://code.google.com/p/selenium/wiki/JsonWireProtocol#Cookie_JSON_Object
			 */
			setCookie: function() {
				browser.setCookie({ name: createUniqueString(), value: createUniqueString() });
			},

			getCookie: {
				"name": function() {
					var setCookie = { name: createUniqueString(), value: createUniqueString() },
						getCookie;
					browser.setCookie(setCookie);
					getCookie = browser.getCookie(setCookie.name);
					return testEq("cookie", setCookie.name, getCookie.name) || testEq("cookie", setCookie.value, getCookie.value);
				},

				" ": function() {
					browser.deleteCookie();
					var ex = [
							{ name: createUniqueString(), value: createUniqueString() },
							{ name: createUniqueString(), value: createUniqueString() }
						],
						ac;
					browser.setCookie(ex[0]);
					browser.setCookie(ex[1]);
					ac = browser.getCookie();
					return testEq("cookies equal", true, ex[0].name == ac[0].name || ex[1].name == ac[0].name);
				}
			},

			deleteCookie: {
				"name": function() {
					var setCookie = { name: createUniqueString(), value: createUniqueString() },
						getCookie;
					browser.setCookie(setCookie);
					browser.deleteCookie(setCookie.name);
					return testEq("empty cookie", null, browser.getCookie(setCookie.name));
				},

				" ": function() {
					var actual;
					browser.setCookie({ name: createUniqueString(), value: createUniqueString() });
					browser.setCookie({ name: createUniqueString(), value: createUniqueString() });
					browser.deleteCookie();
					actual = browser.getCookie();
					return testEq("cookie amount", 0, actual.length);
				}
			},

			imeAvailableEngines: function() {
				browser.imeAvailableEngines();
			},

			imeActiveEngine: function() {
				browser.imeActiveEngine();
			},

			imeActivated: function() {
				browser.imeActivated();
			},

			imeActivate: function() {
				var engineName = browser.imeActiveEngine();
				browser.imeDeactivate(engineName);
				browser.imeActivate(engineName);
			},

			imeDeactivate: function() {
				var engineName = browser.imeActiveEngine();
				browser.imeDeactivate(engineName);
				browser.imeActivate(engineName);
			}
		});
		test.ok(true, "Completed");
	}
};