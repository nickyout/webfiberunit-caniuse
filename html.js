/**
 * Write the results to readable html format.
 * Direct stdout to a file to create a (valid) html file.
 */
var arr = require('./result'),
	doc = require('./doc'),
	u = require('./src/util'),
	util = require('util'),
	ent = require('ent'),
	names = ['command', 'platform', 'deviceName', 'browserName', 'version'];

// Eliminate, preferring latest test results
u.sort(arr, ['date'], true);
u.uniq(arr, names);
u.sort(arr, ['command']);

var obj = u.nest(arr, names, true);

var str = '',
	write = function() {
		// Flatten flatten
		str += util.format.apply(util, Array.prototype.concat.apply([], Array.prototype.slice.call(arguments)));
	};

write(doc.header);

function writeDoc(name, args) {
	args || (args = []);
	var descr,
		fullName = name,
		lastName;

	args.forEach(function() {
		fullName += (fullName && '-') + 's';
	});

	//console.error("Trying fullname", fullName);
	if (descr = doc[fullName]) {
		write(descr, args);
		return true;
	} else {
		(lastName = name.match(/([^-]+)$/)) && (lastName = lastName[1]);

		if (lastName) {
			return writeDoc(name.replace(/-?[^-]+$/, ''), [lastName].concat(args))
		} else {
			return false;
		}
	}
}

u.forEachRecursive(obj, function(val, name, depth) {
	var htmlName = ent.encode(name);
	switch (depth) {
		case 1:
			write('<a href="#">');
			writeDoc(name) || write('<h3>%s</h3>', htmlName);
			write('</a>');
			write('<table><th>Platform</th><th>Device</th><th>Browser</th><th>Version</th><th>Pass</th>');
			break;
		case 2:
			write('<tr>');
		case 3:
		case 4:
			var span = u.nestedKeys(val, 5 - depth).length;
			write('<td rowspan="%d">%s</td>', span, htmlName);
			break;
		case 5:
			write('<td>%s</td>', htmlName);
			var pass = val.error === null,
				text = pass ? "yes" : "no",
				bgColor = pass ? "#66FF66" : "#FF6666",
				hoverText = ent.encode(val.error || "No error");

			write('<td style="background-color:%s;" title="%s">%s</td>', bgColor, hoverText, text);
			break;
	}
}, function(obj, name, depth) {
	switch (depth) {
		case 1:
			write('</table>');
			break;
		case 2:
			break;
		case 5:
			write('</tr>');
			break;
	}
});
write(doc.footer);
console.log(str);