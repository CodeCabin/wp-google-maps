/**
 * @namespace WPGMZA
 * @module Version
 * @requires WPGMZA
 * @gulp-requires core.js
 */
jQuery(function($) {

	function isPositiveInteger(x) {
		// http://stackoverflow.com/a/1019526/11236
		return /^\d+$/.test(x);
	}

	function validateParts(parts) {
		for (var i = 0; i < parts.length; ++i) {
			if (!isPositiveInteger(parts[i])) {
				return false;
			}
		}
		return true;
	}
	
	WPGMZA.Version = function()
	{
		
	}
	
	WPGMZA.Version.GREATER_THAN		= 1;
	WPGMZA.Version.EQUAL_TO			= 0;
	WPGMZA.Version.LESS_THAN		= -1;
	
	/**
	 * Compare two software version numbers (e.g. 1.7.1)
	 * Returns:
	 *
	 *  0 if they're identical
	 *  negative if v1 < v2
	 *  positive if v1 > v2
	 *  NaN if they in the wrong format
	 *
	 *  "Unit tests": http://jsfiddle.net/ripper234/Xv9WL/28/
	 *
	 *  Taken from http://stackoverflow.com/a/6832721/11236
	 */
	WPGMZA.Version.compare = function(v1, v2)
	{
		var v1parts = v1.match(/\d+/g);
		var v2parts = v2.match(/\d+/g);

		for (var i = 0; i < v1parts.length; ++i) {
			if (v2parts.length === i) {
				return 1;
			}

			if (v1parts[i] === v2parts[i]) {
				continue;
			}
			if (v1parts[i] > v2parts[i]) {
				return 1;
			}
			return -1;
		}

		if (v1parts.length != v2parts.length) {
			return -1;
		}

		return 0;
	}

});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ2ZXJzaW9uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIFZlcnNpb25cclxuICogQHJlcXVpcmVzIFdQR01aQVxyXG4gKiBAZ3VscC1yZXF1aXJlcyBjb3JlLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cclxuXHRmdW5jdGlvbiBpc1Bvc2l0aXZlSW50ZWdlcih4KSB7XHJcblx0XHQvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xMDE5NTI2LzExMjM2XHJcblx0XHRyZXR1cm4gL15cXGQrJC8udGVzdCh4KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHZhbGlkYXRlUGFydHMocGFydHMpIHtcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0aWYgKCFpc1Bvc2l0aXZlSW50ZWdlcihwYXJ0c1tpXSkpIHtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuVmVyc2lvbiA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLlZlcnNpb24uR1JFQVRFUl9USEFOXHRcdD0gMTtcclxuXHRXUEdNWkEuVmVyc2lvbi5FUVVBTF9UT1x0XHRcdD0gMDtcclxuXHRXUEdNWkEuVmVyc2lvbi5MRVNTX1RIQU5cdFx0PSAtMTtcclxuXHRcclxuXHQvKipcclxuXHQgKiBDb21wYXJlIHR3byBzb2Z0d2FyZSB2ZXJzaW9uIG51bWJlcnMgKGUuZy4gMS43LjEpXHJcblx0ICogUmV0dXJuczpcclxuXHQgKlxyXG5cdCAqICAwIGlmIHRoZXkncmUgaWRlbnRpY2FsXHJcblx0ICogIG5lZ2F0aXZlIGlmIHYxIDwgdjJcclxuXHQgKiAgcG9zaXRpdmUgaWYgdjEgPiB2MlxyXG5cdCAqICBOYU4gaWYgdGhleSBpbiB0aGUgd3JvbmcgZm9ybWF0XHJcblx0ICpcclxuXHQgKiAgXCJVbml0IHRlc3RzXCI6IGh0dHA6Ly9qc2ZpZGRsZS5uZXQvcmlwcGVyMjM0L1h2OVdMLzI4L1xyXG5cdCAqXHJcblx0ICogIFRha2VuIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvNjgzMjcyMS8xMTIzNlxyXG5cdCAqL1xyXG5cdFdQR01aQS5WZXJzaW9uLmNvbXBhcmUgPSBmdW5jdGlvbih2MSwgdjIpXHJcblx0e1xyXG5cdFx0dmFyIHYxcGFydHMgPSB2MS5tYXRjaCgvXFxkKy9nKTtcclxuXHRcdHZhciB2MnBhcnRzID0gdjIubWF0Y2goL1xcZCsvZyk7XHJcblxyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB2MXBhcnRzLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdGlmICh2MnBhcnRzLmxlbmd0aCA9PT0gaSkge1xyXG5cdFx0XHRcdHJldHVybiAxO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAodjFwYXJ0c1tpXSA9PT0gdjJwYXJ0c1tpXSkge1xyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmICh2MXBhcnRzW2ldID4gdjJwYXJ0c1tpXSkge1xyXG5cdFx0XHRcdHJldHVybiAxO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiAtMTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAodjFwYXJ0cy5sZW5ndGggIT0gdjJwYXJ0cy5sZW5ndGgpIHtcclxuXHRcdFx0cmV0dXJuIC0xO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiAwO1xyXG5cdH1cclxuXHJcbn0pOyJdLCJmaWxlIjoidmVyc2lvbi5qcyJ9
