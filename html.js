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

var outputStr = '',
	write = function() {
		// Flatten flatten
		var args = Array.prototype.concat.apply([], Array.prototype.slice.call(arguments)).map(function(val, index) {
			if (typeof val === "string" && index !== 0) {
				return ent.encode(val);
			} else {
				return val;
			}
		});
		outputStr += util.format.apply(util, args);
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

function writeCells(obj, nestedKeyDepth) {
	var colspan, totalColspan = 0;
	u.forEachAsc(obj, function(val, childName) {
		colspan = u.nestedKeys(val, nestedKeyDepth).length;
		totalColspan += colspan;
		write('<td colspan="%s">%s</td>', colspan, childName);

	});
	write('</tr>');
	return totalColspan
}

function writeParagraph(name, lastName) {
	var thisCommand = name.split('-'),
		lastCommand = lastName.split('-'),
		max = thisCommand.length,
		i=-1,
		subCommand;
	while (++i < max) {
		if (thisCommand[i] != lastCommand[i]) {
			subCommand = thisCommand.slice(0, i+1);
			console.error(subCommand.join('-'));
			writeDoc(subCommand.join('-')) || write('<h%s>%s</h%s>', (3 + i), subCommand.join('-'), (3 + i));
		}
	}
}

function writeResultCell(val) {
	var text = "",
		bgColor,
		hoverText = '',
		first = true,
		bestCode = 2;
	u.forEachAsc(val, function(childVal, childName) {
		// Add all passes to hovertext
		hoverText+= util.format("%s: %s\n", childName, (childVal.message || "No problems").replace(/[\n\r]/g, '').substr(0, 50));
		if (childVal.code < bestCode) {
			bestCode = childVal.code;
			// Ordered by number: if earliest version is success, assume all versions will be supported
			text = first ? childName : 'All';

		}
		first = false;
	});
	switch (bestCode) {
		case 0:
			bgColor = "#66FF66";
			break;
		case 1:
			bgColor = "#FFFF66";
			break;
		case 2:
			bgColor = "#FF6666";
	}
	write('<td style="background-color:%s;" title="%s">%s</td>', bgColor, hoverText, text || "-");
}

var lastName = '',
	totalColspan = 0,
	currentColspan = 0,
	rowTitles = ['Platform', 'Device', 'Browser', 'Version'];
u.forEachRecursive(obj, function(val, name, depth) {

	if (currentColspan == totalColspan) {
		write('</tr>');
		write('<tr>');
		rowTitles[depth - 1] && write('<th scope="row">%s</th>', rowTitles[depth - 1]);
		currentColspan = 0;
	}

	switch (depth) {
		// Command, children are Platform
		case 1:
			// Make title
			writeParagraph(name, lastName);
			lastName = name;

			write('<table>');
			write('<tr>');
			write('<th scope="row">%s</th>', rowTitles[0]);
			totalColspan = currentColspan = writeCells(val, 3);
			break;
		// Platform, children are Device
		case 2:
			currentColspan += writeCells(val, 2);
			break;
		// Device, children are Browser
		case 3:
			currentColspan += writeCells(val, 1);
			break;
		// Browser
		case 4:
			writeResultCell(val);
			break;
		// Browser version
		case 5:
			break;
	}

}, function(obj, name, depth) {
	switch (depth) {
		case 1:
			write('</tr>');
			write('</table>');
			break;
	}
});
write(doc.footer);
console.log(outputStr);