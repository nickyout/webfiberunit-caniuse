var glob = require('glob'),
	path = require('path'),
	fs = require('fs'),
	arr = [];

// Into giant array
glob.sync(path.resolve(__dirname, '*.json')).forEach(function (filePath) {
	arr.push.apply(arr, require(filePath));
});

// And return
module.exports = arr;