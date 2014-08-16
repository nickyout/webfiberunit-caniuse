var fs = require('fs'),
	TestResult = require('./TestResult'),
	format = require('webfiberunit').utils.format,
	sprintf = require('sprintf-js').sprintf,
	separator = "-";

function normalizeConfig(browser) {
	return {
		host: { host: browser.options.hostname },
		browser: {
			browserName: browser.desiredCapabilities.browserName || 'any',
			version: browser.desiredCapabilities.version || 'any',
			platform: browser.desiredCapabilities.platform || 'any',
			device: browser.desiredCapabilities.deviceName || 'any'
		}
	};
}

/**
 * Simplest runner. Run task, catch error, write result.
 * @param {TestResult} result
 * @param {Function} fn
 * @param {String} command
 */
function run(result, fn, command) {
	var error = null,
		errorStr = '-';
	try {
		fn();
	} catch (err) {
		error = err;
		errorStr = error.toString().split(/\s*[\n\r]\s*/).slice(0,2).join(' -> ');
	}
	result.add(command, error);
	console.log(sprintf("%-5s %-30s %s", error ? "error" : "ok", command, errorStr).substr(0, process.stdout.columns));
}

/**
 * Recursively calls all functions inside run(). Passes property names as command and type names
 * @param {TestResult} result
 * @param {Object} suite
 * @param {Array=} parentNames
 */
function runBundle(result, suite, parentNames) {
	parentNames || (parentNames = []);
	var val,
		names,
		joined;

	for (var name in suite) {
		val =  suite[name];
		names = parentNames.concat(name),
		joined = names.join(separator);
		switch (typeof val) {
			case "function":
				run(result, val, joined);
				break;
			case "object":
				runBundle(result, val, names);
				break;
		}
	}
}

/**
 *
 * @param {WebdriverIO} browser
 * @param {Object} testSuite
 * @param {String=} path
 * @param {String=} [ext='.json']
 */
function runAndWrite(browser, testSuite, path, ext) {
	console.log(sprintf("%'-"+process.stdout.columns+"s", ''));
	var webdriverConfig = normalizeConfig(browser),
		result = new TestResult(webdriverConfig),
		arr = [],
		date = +new Date();

	// Determine ext & path
	path || (path = 'result/'+date+'_%OS%_%DEVICE%_%BROWSER%_%BROWSER_VERSION%');
	ext || (ext = path.match(/\.\w+$/)) && (ext = ext[0]) || (ext = '.json');
	new RegExp('\\' + ext + '$').test(path) || (path += ext);
	path = format(webdriverConfig, path).replace(/\(\)/g, '');

	// Run tests
	runBundle(result, testSuite, [], arr);

	// Output result
	var outstr = 'invalid format: ' + ext;
	switch (ext) {
		case '.json':
			outstr = result.toJSON();
			break;
		case '.csv':
			outstr = result.toCSV();
			break;
	}
	fs.writeFileSync(path, result.toJSON());
	console.log(sprintf("%'-"+process.stdout.columns+"s", ''));
	console.log('Written result to', path);
}

module.exports = runAndWrite;