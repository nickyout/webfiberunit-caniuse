var Csv = require('comma-separated-values');
/**
 * Create TestResult object based on browserInstance
 * @param {WebdriverConfig} webdriverConfig
 * @constructor
 */
var TestResult = function(webdriverConfig) {
	this.host = webdriverConfig.host;
	this.browser = webdriverConfig.browser;
	this.data = [];
};
/**
 * Add test data result
 * @param {String} command
 * @param {Error=} error
 */
TestResult.prototype.add = function(command, error) {
	var row = {
		date: +new Date(),
		host: this.host.host,
		platform: this.browser.platform,
		browserName: this.browser.browserName,
		version: this.browser.version,
		deviceName: this.browser.device,

		command: command,
		error: error && (error.message + '\n' + error.stack)
	};
	this.data.push(row);
};

TestResult.prototype.toCSV = function() {
	return new Csv(this.data, { header: true }).encode();
};

TestResult.prototype.toJSON = function() {
	return JSON.stringify(this.data, null, 4);
};

module.exports = TestResult;