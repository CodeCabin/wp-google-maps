/**
 * Polyfill for CSS.escape, with thanks to @mathias
 * @namespace WPGMZA
 * @module CSS
 * @requires WPGMZA
 * @gulp-requires core.js
 */

/*! https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
;(function(root, factory) {
	// https://github.com/umdjs/umd/blob/master/returnExports.js
	if (typeof exports == 'object') {
		// For Node.js.
		module.exports = factory(root);
	} else if (typeof define == 'function' && define.amd) {
		// For AMD. Register as an anonymous module.
		define([], factory.bind(root, root));
	} else {
		// For browser globals (not exposing the function separately).
		factory(root);
	}
}(typeof global != 'undefined' ? global : this, function(root) {

	if (root.CSS && root.CSS.escape) {
		return root.CSS.escape;
	}

	// https://drafts.csswg.org/cssom/#serialize-an-identifier
	var cssEscape = function(value) {
		if (arguments.length == 0) {
			throw new TypeError('`CSS.escape` requires an argument.');
		}
		var string = String(value);
		var length = string.length;
		var index = -1;
		var codeUnit;
		var result = '';
		var firstCodeUnit = string.charCodeAt(0);
		while (++index < length) {
			codeUnit = string.charCodeAt(index);
			// Note: there’s no need to special-case astral symbols, surrogate
			// pairs, or lone surrogates.

			// If the character is NULL (U+0000), then the REPLACEMENT CHARACTER
			// (U+FFFD).
			if (codeUnit == 0x0000) {
				result += '\uFFFD';
				continue;
			}

			if (
				// If the character is in the range [\1-\1F] (U+0001 to U+001F) or is
				// U+007F, […]
				(codeUnit >= 0x0001 && codeUnit <= 0x001F) || codeUnit == 0x007F ||
				// If the character is the first character and is in the range [0-9]
				// (U+0030 to U+0039), […]
				(index == 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
				// If the character is the second character and is in the range [0-9]
				// (U+0030 to U+0039) and the first character is a `-` (U+002D), […]
				(
					index == 1 &&
					codeUnit >= 0x0030 && codeUnit <= 0x0039 &&
					firstCodeUnit == 0x002D
				)
			) {
				// https://drafts.csswg.org/cssom/#escape-a-character-as-code-point
				result += '\\' + codeUnit.toString(16) + ' ';
				continue;
			}

			if (
				// If the character is the first character and is a `-` (U+002D), and
				// there is no second character, […]
				index == 0 &&
				length == 1 &&
				codeUnit == 0x002D
			) {
				result += '\\' + string.charAt(index);
				continue;
			}

			// If the character is not handled by one of the above rules and is
			// greater than or equal to U+0080, is `-` (U+002D) or `_` (U+005F), or
			// is in one of the ranges [0-9] (U+0030 to U+0039), [A-Z] (U+0041 to
			// U+005A), or [a-z] (U+0061 to U+007A), […]
			if (
				codeUnit >= 0x0080 ||
				codeUnit == 0x002D ||
				codeUnit == 0x005F ||
				codeUnit >= 0x0030 && codeUnit <= 0x0039 ||
				codeUnit >= 0x0041 && codeUnit <= 0x005A ||
				codeUnit >= 0x0061 && codeUnit <= 0x007A
			) {
				// the character itself
				result += string.charAt(index);
				continue;
			}

			// Otherwise, the escaped character.
			// https://drafts.csswg.org/cssom/#escape-a-character
			result += '\\' + string.charAt(index);

		}
		return result;
	};

	if (!root.CSS) {
		root.CSS = {};
	}

	root.CSS.escape = cssEscape;
	return cssEscape;

}));
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjc3MtZXNjYXBlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBQb2x5ZmlsbCBmb3IgQ1NTLmVzY2FwZSwgd2l0aCB0aGFua3MgdG8gQG1hdGhpYXNcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBDU1NcclxuICogQHJlcXVpcmVzIFdQR01aQVxyXG4gKiBAZ3VscC1yZXF1aXJlcyBjb3JlLmpzXHJcbiAqL1xyXG5cclxuLyohIGh0dHBzOi8vbXRocy5iZS9jc3Nlc2NhcGUgdjEuNS4xIGJ5IEBtYXRoaWFzIHwgTUlUIGxpY2Vuc2UgKi9cclxuOyhmdW5jdGlvbihyb290LCBmYWN0b3J5KSB7XHJcblx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL3VtZGpzL3VtZC9ibG9iL21hc3Rlci9yZXR1cm5FeHBvcnRzLmpzXHJcblx0aWYgKHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnKSB7XHJcblx0XHQvLyBGb3IgTm9kZS5qcy5cclxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290KTtcclxuXHR9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcblx0XHQvLyBGb3IgQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxyXG5cdFx0ZGVmaW5lKFtdLCBmYWN0b3J5LmJpbmQocm9vdCwgcm9vdCkpO1xyXG5cdH0gZWxzZSB7XHJcblx0XHQvLyBGb3IgYnJvd3NlciBnbG9iYWxzIChub3QgZXhwb3NpbmcgdGhlIGZ1bmN0aW9uIHNlcGFyYXRlbHkpLlxyXG5cdFx0ZmFjdG9yeShyb290KTtcclxuXHR9XHJcbn0odHlwZW9mIGdsb2JhbCAhPSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6IHRoaXMsIGZ1bmN0aW9uKHJvb3QpIHtcclxuXHJcblx0aWYgKHJvb3QuQ1NTICYmIHJvb3QuQ1NTLmVzY2FwZSkge1xyXG5cdFx0cmV0dXJuIHJvb3QuQ1NTLmVzY2FwZTtcclxuXHR9XHJcblxyXG5cdC8vIGh0dHBzOi8vZHJhZnRzLmNzc3dnLm9yZy9jc3NvbS8jc2VyaWFsaXplLWFuLWlkZW50aWZpZXJcclxuXHR2YXIgY3NzRXNjYXBlID0gZnVuY3Rpb24odmFsdWUpIHtcclxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09IDApIHtcclxuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignYENTUy5lc2NhcGVgIHJlcXVpcmVzIGFuIGFyZ3VtZW50LicpO1xyXG5cdFx0fVxyXG5cdFx0dmFyIHN0cmluZyA9IFN0cmluZyh2YWx1ZSk7XHJcblx0XHR2YXIgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aDtcclxuXHRcdHZhciBpbmRleCA9IC0xO1xyXG5cdFx0dmFyIGNvZGVVbml0O1xyXG5cdFx0dmFyIHJlc3VsdCA9ICcnO1xyXG5cdFx0dmFyIGZpcnN0Q29kZVVuaXQgPSBzdHJpbmcuY2hhckNvZGVBdCgwKTtcclxuXHRcdHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XHJcblx0XHRcdGNvZGVVbml0ID0gc3RyaW5nLmNoYXJDb2RlQXQoaW5kZXgpO1xyXG5cdFx0XHQvLyBOb3RlOiB0aGVyZeKAmXMgbm8gbmVlZCB0byBzcGVjaWFsLWNhc2UgYXN0cmFsIHN5bWJvbHMsIHN1cnJvZ2F0ZVxyXG5cdFx0XHQvLyBwYWlycywgb3IgbG9uZSBzdXJyb2dhdGVzLlxyXG5cclxuXHRcdFx0Ly8gSWYgdGhlIGNoYXJhY3RlciBpcyBOVUxMIChVKzAwMDApLCB0aGVuIHRoZSBSRVBMQUNFTUVOVCBDSEFSQUNURVJcclxuXHRcdFx0Ly8gKFUrRkZGRCkuXHJcblx0XHRcdGlmIChjb2RlVW5pdCA9PSAweDAwMDApIHtcclxuXHRcdFx0XHRyZXN1bHQgKz0gJ1xcdUZGRkQnO1xyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoXHJcblx0XHRcdFx0Ly8gSWYgdGhlIGNoYXJhY3RlciBpcyBpbiB0aGUgcmFuZ2UgW1xcMS1cXDFGXSAoVSswMDAxIHRvIFUrMDAxRikgb3IgaXNcclxuXHRcdFx0XHQvLyBVKzAwN0YsIFvigKZdXHJcblx0XHRcdFx0KGNvZGVVbml0ID49IDB4MDAwMSAmJiBjb2RlVW5pdCA8PSAweDAwMUYpIHx8IGNvZGVVbml0ID09IDB4MDA3RiB8fFxyXG5cdFx0XHRcdC8vIElmIHRoZSBjaGFyYWN0ZXIgaXMgdGhlIGZpcnN0IGNoYXJhY3RlciBhbmQgaXMgaW4gdGhlIHJhbmdlIFswLTldXHJcblx0XHRcdFx0Ly8gKFUrMDAzMCB0byBVKzAwMzkpLCBb4oCmXVxyXG5cdFx0XHRcdChpbmRleCA9PSAwICYmIGNvZGVVbml0ID49IDB4MDAzMCAmJiBjb2RlVW5pdCA8PSAweDAwMzkpIHx8XHJcblx0XHRcdFx0Ly8gSWYgdGhlIGNoYXJhY3RlciBpcyB0aGUgc2Vjb25kIGNoYXJhY3RlciBhbmQgaXMgaW4gdGhlIHJhbmdlIFswLTldXHJcblx0XHRcdFx0Ly8gKFUrMDAzMCB0byBVKzAwMzkpIGFuZCB0aGUgZmlyc3QgY2hhcmFjdGVyIGlzIGEgYC1gIChVKzAwMkQpLCBb4oCmXVxyXG5cdFx0XHRcdChcclxuXHRcdFx0XHRcdGluZGV4ID09IDEgJiZcclxuXHRcdFx0XHRcdGNvZGVVbml0ID49IDB4MDAzMCAmJiBjb2RlVW5pdCA8PSAweDAwMzkgJiZcclxuXHRcdFx0XHRcdGZpcnN0Q29kZVVuaXQgPT0gMHgwMDJEXHJcblx0XHRcdFx0KVxyXG5cdFx0XHQpIHtcclxuXHRcdFx0XHQvLyBodHRwczovL2RyYWZ0cy5jc3N3Zy5vcmcvY3Nzb20vI2VzY2FwZS1hLWNoYXJhY3Rlci1hcy1jb2RlLXBvaW50XHJcblx0XHRcdFx0cmVzdWx0ICs9ICdcXFxcJyArIGNvZGVVbml0LnRvU3RyaW5nKDE2KSArICcgJztcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKFxyXG5cdFx0XHRcdC8vIElmIHRoZSBjaGFyYWN0ZXIgaXMgdGhlIGZpcnN0IGNoYXJhY3RlciBhbmQgaXMgYSBgLWAgKFUrMDAyRCksIGFuZFxyXG5cdFx0XHRcdC8vIHRoZXJlIGlzIG5vIHNlY29uZCBjaGFyYWN0ZXIsIFvigKZdXHJcblx0XHRcdFx0aW5kZXggPT0gMCAmJlxyXG5cdFx0XHRcdGxlbmd0aCA9PSAxICYmXHJcblx0XHRcdFx0Y29kZVVuaXQgPT0gMHgwMDJEXHJcblx0XHRcdCkge1xyXG5cdFx0XHRcdHJlc3VsdCArPSAnXFxcXCcgKyBzdHJpbmcuY2hhckF0KGluZGV4KTtcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gSWYgdGhlIGNoYXJhY3RlciBpcyBub3QgaGFuZGxlZCBieSBvbmUgb2YgdGhlIGFib3ZlIHJ1bGVzIGFuZCBpc1xyXG5cdFx0XHQvLyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gVSswMDgwLCBpcyBgLWAgKFUrMDAyRCkgb3IgYF9gIChVKzAwNUYpLCBvclxyXG5cdFx0XHQvLyBpcyBpbiBvbmUgb2YgdGhlIHJhbmdlcyBbMC05XSAoVSswMDMwIHRvIFUrMDAzOSksIFtBLVpdIChVKzAwNDEgdG9cclxuXHRcdFx0Ly8gVSswMDVBKSwgb3IgW2Etel0gKFUrMDA2MSB0byBVKzAwN0EpLCBb4oCmXVxyXG5cdFx0XHRpZiAoXHJcblx0XHRcdFx0Y29kZVVuaXQgPj0gMHgwMDgwIHx8XHJcblx0XHRcdFx0Y29kZVVuaXQgPT0gMHgwMDJEIHx8XHJcblx0XHRcdFx0Y29kZVVuaXQgPT0gMHgwMDVGIHx8XHJcblx0XHRcdFx0Y29kZVVuaXQgPj0gMHgwMDMwICYmIGNvZGVVbml0IDw9IDB4MDAzOSB8fFxyXG5cdFx0XHRcdGNvZGVVbml0ID49IDB4MDA0MSAmJiBjb2RlVW5pdCA8PSAweDAwNUEgfHxcclxuXHRcdFx0XHRjb2RlVW5pdCA+PSAweDAwNjEgJiYgY29kZVVuaXQgPD0gMHgwMDdBXHJcblx0XHRcdCkge1xyXG5cdFx0XHRcdC8vIHRoZSBjaGFyYWN0ZXIgaXRzZWxmXHJcblx0XHRcdFx0cmVzdWx0ICs9IHN0cmluZy5jaGFyQXQoaW5kZXgpO1xyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBPdGhlcndpc2UsIHRoZSBlc2NhcGVkIGNoYXJhY3Rlci5cclxuXHRcdFx0Ly8gaHR0cHM6Ly9kcmFmdHMuY3Nzd2cub3JnL2Nzc29tLyNlc2NhcGUtYS1jaGFyYWN0ZXJcclxuXHRcdFx0cmVzdWx0ICs9ICdcXFxcJyArIHN0cmluZy5jaGFyQXQoaW5kZXgpO1xyXG5cclxuXHRcdH1cclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fTtcclxuXHJcblx0aWYgKCFyb290LkNTUykge1xyXG5cdFx0cm9vdC5DU1MgPSB7fTtcclxuXHR9XHJcblxyXG5cdHJvb3QuQ1NTLmVzY2FwZSA9IGNzc0VzY2FwZTtcclxuXHRyZXR1cm4gY3NzRXNjYXBlO1xyXG5cclxufSkpOyJdLCJmaWxlIjoiY3NzLWVzY2FwZS5qcyJ9
