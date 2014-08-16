var util = require('util');
/**
 * Creates several test functions using the selector (with %s placeholders) and arrObj as
 * a collection of arguments for the selector placeholders.
 *
 * The resulting test suite will be an object with the same properties as arrObj,
 * but, instead of the arrays, a function with the resulting selector as its argument.
 * *
 * @param {String} selector - passed through util.format
 * @param {Object.<Array|String>} arrObj - each property is used as arguments for util.format
 * @param {Function} fn - expect call ({String} selector)
 * @param {String|RegExp=} only - include only these of the given object
 * @returns {Object.<Function>} the test suite
 * @method
 */
function cluster(selector, arrObj, only, fn) {
	fn || (fn = only) && (only = null);
	var i= 0, arr, returnObj = {};
	for (var name in arrObj) {
		if (only && name.search(only) === -1) {
			continue;
		}
		arr = arrObj[name];
		returnObj[name] = fn.bind(null, util.format.apply(util, [selector].concat(arr)), name);
	}
	return returnObj;
}

var select;
module.exports = select = {
	'cluster': cluster,
	'single': {
		'every': function(only, fn) {
			return {
				'xpath': select.single.xpath(only, fn),
				'css': select.single.css(only, fn),
				'text': select.single.text(only, fn)
			}
		},
		'text': function(only, fn) {
			return cluster('=%s', {
				'span': 'Span 1',
				'a': 'A 1'
			}, only, fn);
		},
		'css': function(only, fn) {
			return cluster('%s[id="%s"]', {
				'span': ['span', 'id-span1'],
				'a': ['a', 'id-a1'],
				'input text': ['input', 'id-input-text']
			}, only, fn);
		},
		'xpath': function(only, fn) {
			return cluster('//body/%s[@id="%s"]', {
				'span': ['span', 'id-span1'],
				'a': ['a', 'id-a1'],
				'input text': ['input', 'id-input-text']
			}, only, fn);
		}
	},
	'multi': {
		'every': function(only, fn) {
			return {
				'xpath': select.multi.xpath(only, fn),
				'css': select.multi.css(only, fn),
				'partial text': select.multi.text(only, fn)
			}
		},
		'text': function(only, fn) {
			return cluster('*=%s', {
				'span': 'Span',
				'a': 'A'
			}, only, fn);
		},
		'css': function(only, fn) {
			return cluster('%s', {
				'span': 'span',
				'a': 'a'
			}, only, fn);
		},
		'xpath': function(only, fn) {
			return cluster('//body/%s[contains(@id,"%s")]', {
				'span': ['span', 'id-span'],
				'a': ['a', 'id-a']
			}, only, fn);
		}
	}
};