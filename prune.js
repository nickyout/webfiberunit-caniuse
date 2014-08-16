/**
 * Removes duplicate outcomes, preferring latest.
 * @type {arr|exports}
 */
var arr = require('./result/index'),
	u = require('./src/util'),
	names = ['command', 'platform', 'deviceName', 'browserName', 'version'],
	glob = require('glob'),
	path = require('path'),
	fs = require('fs');

// Eliminate, preferring latest test results
u.sort(arr, ['date'], true);
u.uniq(arr, names);

// Read file, put into giant array, remove file
glob.sync(path.resolve('result','*.json')).forEach(function (filePath) {
	arr.push.apply(arr, require(filePath));
	fs.unlinkSync(filePath);
});

// Write into single file date+'_all.json'
fs.writeFileSync(path.resolve('result',(+new Date()) + '_all.json'), JSON.stringify(arr, null, 4));
