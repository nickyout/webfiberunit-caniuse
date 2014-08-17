var separator = "-";

function asc(a, b) {
	return (isNaN(a) || isNaN(b)) ? (1 - 2 * (a < b)) : (+a - +b);
}

function recursiveSort(headers, target, row, removeUsed) {
	var name = headers[0],
		val = row[name];
	removeUsed && delete row[name];
	if (headers.length > 1) {
		target[val] || (target[val] = {});
		recursiveSort(headers.slice(1), target[val], row, removeUsed);
	} else {
		target[val] = row;
	}
}

function eq(headers, a, b) {
	var equality = true, i= 0, name, max = headers.length;
	while (name = headers[i++]) {
		equality = equality && (a[name] === b[name]);
	}
	return equality;
}

function uniqObj(arr, fn) {
	var i = arr.length, j;
	while (i--) {
		j = arr.length;
		while (j--) {
			if (i !== j && fn(arr[i], arr[j])) {
				arr.splice(i, 1);
				break;
			}
		}
	}
	return arr;
}

function order(header, reverse, a, b) {
	var value= 0, i= 0, name, max = header.length, fac = reverse ? -1 : 1;
	while (name = header[i++]) {
		value += Math.pow(2, max-i) * (1 - 2 * +(a[name] < b[name])) * fac;
	}
	return value;
}

function nestedKeys(obj, path) {
	path || (path = '');
	var sep = path && separator,
		arr = Object.keys(obj),
		el;
	for (var name in obj) {
		arr.push(path + sep + name);
		el = obj[name];
		if (el && typeof el === "object") {
			arr.push.apply(arr, this.nestedKeys(el, name));
		}
	}
	return arr;
}

module.exports = {
	/**
	 * Nest by property values, provided in array headers, in order
	 * @param {Array.<Object>} arr
	 * @param {Array.<String>} headers - properties to nest
	 * @param {Boolean} [removeUsed=false]
	 * @returns {Object}
	 */
	nest: function(arr, headers, removeUsed) {
		var obj = {};
		arr.forEach(function(row) {
			recursiveSort(headers, obj, row, removeUsed);
		});
		return obj;
	},

	/**
	 * Eliminates duplicates. Two objects are considered duplicates if all their properties specified in header are equal.
	 * Mutates same array.
	 * @param {Array.<Object>} arr
	 * @param {Array.<String>} headers
	 * @returns {Array} arr
	 */
	uniq: function(arr, headers) {
		uniqObj(arr, eq.bind(null, headers));
		return arr;
	},

	/**
	 * Sorts by properties as defined in headers, each in ascending order.
	 * Mutates same array.
	 * @param {Array.<Object>} arr
	 * @param {Array.<String>} headers
	 * @param {Boolean} [descending=false] does the sort descending instead of ascending
	 * @returns {Array} arr
	 */
	sort: function(arr, headers, descending) {
		arr.sort(order.bind(null, headers, descending));
		return arr;
	},

	/**
	 *
	 * @param {Object} obj
	 * @param {Number=0} maxDepth
	 * @param {String=} path - path prefix to use
	 * @returns {Array}
	 */
	nestedKeys: function nestedKeys(obj, maxDepth, path) {
		maxDepth || (maxDepth = 0);
		path || (path = '');
		var sep = path && separator,
			keys = Object.keys(obj),
			arr = [];

		if (maxDepth == 1) {
			return keys;
		}
		var i= 0, el, name;
		while (name = keys[i++]) {
			el = obj[name];
			if (el && typeof el === "object") {
				arr.push.apply(arr, nestedKeys(el, maxDepth - 1, path + sep + name));
			} else {
				arr.push(path + sep + name);
			}
		}
		return arr;
	},

	/**
	 * Recursive for each for objects.
	 * Calls properties in ascending order ( 'a' < 'b', but '10.0' > '9.0')
	 * @param {Object} obj
	 * @param {Function} fn - called with (obj, name, depthIndex)
	 * @param {Function=} fnClose - called only for objects, after each of its properties have been iterated over.
	 * Called with (obj, name, depthIndex).
	 * @param {Number} [depthIndex=0] - what depthIndex the given object is supposed to have. Every nest deeper is +1.
	 */
	forEachRecursive: function forEachRecursive(obj, fn, fnClose, depthIndex) {
		depthIndex || (depthIndex = 0);
		depthIndex++;
		var arr = Object.keys(obj).sort(asc),
			i = 0, name, val;
		while (name = arr[i++]) {
			val = obj[name];
			fn(val, name, depthIndex);
			if (val && typeof val === "object") {
				forEachRecursive(val, fn, fnClose, depthIndex);
				fnClose && fnClose(val, name, depthIndex);
			}
		}
	},

	forEachAsc: function(obj, fn) {
		var arr = Object.keys(obj).sort(asc),
			i = 0, name, val;
		while (name = arr[i++]) {
			val = obj[name];
			fn(val, name, obj);
		}
	}
};