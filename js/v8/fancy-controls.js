/**
 * @namespace WPGMZA
 * @module FancyControls
 * @requires WPGMZA
 * @gulp-requires core.js
 */
jQuery(function($) {
	
	WPGMZA.FancyControls = {
		
		formatToggleSwitch: function(el)
		{
			var div			= $("<div class='switch'></div>");
			var input		= el;
			var container	= el.parentNode;
			var text		= $(container).text().trim();
			var label		= $("<label></label>");
			
			$(input).addClass("cmn-toggle cmn-toggle-round-flat");
			$(input).attr("id", $(input).attr("name"));
			
			$(label).attr("for", $(input).attr("name"));
			
			$(div).append(input);
			$(div).append(label);
			
			$(container).replaceWith(div);
			
			$(div).wrap($("<div></div>"));
			$(div).after(text);
		},
		
		formatToggleButton: function(el)
		{
			var div			= $("<div class='switch'></div>");
			var input		= el;
			var container	= el.parentNode;
			var text		= $(container).text().trim();
			var label		= $("<label></label>");
			
			$(input).addClass("cmn-toggle cmn-toggle-yes-no");
			$(input).attr("id", $(input).attr("name"));
			
			$(label).attr("for", $(input).attr("name"));
			
			$(label).attr("data-on", WPGMZA.localized_strings.yes);
			$(label).attr("data-off", WPGMZA.localized_strings.no);
			
			$(div).append(input);
			$(div).append(label);
			
			$(container).replaceWith(div);
			
			$(div).wrap($("<div></div>"));
			$(div).after(text);
		}
		
	};
	
	$(".wpgmza-fancy-toggle-switch").each(function(index, el) {
		WPGMZA.FancyControls.formatToggleSwitch(el);
	});
	
	$(".wpgmza-fancy-toggle-button").each(function(index, el) {
		WPGMZA.FancyControls.formatToggleButton(el);
	});
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJmYW5jeS1jb250cm9scy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBGYW5jeUNvbnRyb2xzXHJcbiAqIEByZXF1aXJlcyBXUEdNWkFcclxuICogQGd1bHAtcmVxdWlyZXMgY29yZS5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHRXUEdNWkEuRmFuY3lDb250cm9scyA9IHtcclxuXHRcdFxyXG5cdFx0Zm9ybWF0VG9nZ2xlU3dpdGNoOiBmdW5jdGlvbihlbClcclxuXHRcdHtcclxuXHRcdFx0dmFyIGRpdlx0XHRcdD0gJChcIjxkaXYgY2xhc3M9J3N3aXRjaCc+PC9kaXY+XCIpO1xyXG5cdFx0XHR2YXIgaW5wdXRcdFx0PSBlbDtcclxuXHRcdFx0dmFyIGNvbnRhaW5lclx0PSBlbC5wYXJlbnROb2RlO1xyXG5cdFx0XHR2YXIgdGV4dFx0XHQ9ICQoY29udGFpbmVyKS50ZXh0KCkudHJpbSgpO1xyXG5cdFx0XHR2YXIgbGFiZWxcdFx0PSAkKFwiPGxhYmVsPjwvbGFiZWw+XCIpO1xyXG5cdFx0XHRcclxuXHRcdFx0JChpbnB1dCkuYWRkQ2xhc3MoXCJjbW4tdG9nZ2xlIGNtbi10b2dnbGUtcm91bmQtZmxhdFwiKTtcclxuXHRcdFx0JChpbnB1dCkuYXR0cihcImlkXCIsICQoaW5wdXQpLmF0dHIoXCJuYW1lXCIpKTtcclxuXHRcdFx0XHJcblx0XHRcdCQobGFiZWwpLmF0dHIoXCJmb3JcIiwgJChpbnB1dCkuYXR0cihcIm5hbWVcIikpO1xyXG5cdFx0XHRcclxuXHRcdFx0JChkaXYpLmFwcGVuZChpbnB1dCk7XHJcblx0XHRcdCQoZGl2KS5hcHBlbmQobGFiZWwpO1xyXG5cdFx0XHRcclxuXHRcdFx0JChjb250YWluZXIpLnJlcGxhY2VXaXRoKGRpdik7XHJcblx0XHRcdFxyXG5cdFx0XHQkKGRpdikud3JhcCgkKFwiPGRpdj48L2Rpdj5cIikpO1xyXG5cdFx0XHQkKGRpdikuYWZ0ZXIodGV4dCk7XHJcblx0XHR9LFxyXG5cdFx0XHJcblx0XHRmb3JtYXRUb2dnbGVCdXR0b246IGZ1bmN0aW9uKGVsKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgZGl2XHRcdFx0PSAkKFwiPGRpdiBjbGFzcz0nc3dpdGNoJz48L2Rpdj5cIik7XHJcblx0XHRcdHZhciBpbnB1dFx0XHQ9IGVsO1xyXG5cdFx0XHR2YXIgY29udGFpbmVyXHQ9IGVsLnBhcmVudE5vZGU7XHJcblx0XHRcdHZhciB0ZXh0XHRcdD0gJChjb250YWluZXIpLnRleHQoKS50cmltKCk7XHJcblx0XHRcdHZhciBsYWJlbFx0XHQ9ICQoXCI8bGFiZWw+PC9sYWJlbD5cIik7XHJcblx0XHRcdFxyXG5cdFx0XHQkKGlucHV0KS5hZGRDbGFzcyhcImNtbi10b2dnbGUgY21uLXRvZ2dsZS15ZXMtbm9cIik7XHJcblx0XHRcdCQoaW5wdXQpLmF0dHIoXCJpZFwiLCAkKGlucHV0KS5hdHRyKFwibmFtZVwiKSk7XHJcblx0XHRcdFxyXG5cdFx0XHQkKGxhYmVsKS5hdHRyKFwiZm9yXCIsICQoaW5wdXQpLmF0dHIoXCJuYW1lXCIpKTtcclxuXHRcdFx0XHJcblx0XHRcdCQobGFiZWwpLmF0dHIoXCJkYXRhLW9uXCIsIFdQR01aQS5sb2NhbGl6ZWRfc3RyaW5ncy55ZXMpO1xyXG5cdFx0XHQkKGxhYmVsKS5hdHRyKFwiZGF0YS1vZmZcIiwgV1BHTVpBLmxvY2FsaXplZF9zdHJpbmdzLm5vKTtcclxuXHRcdFx0XHJcblx0XHRcdCQoZGl2KS5hcHBlbmQoaW5wdXQpO1xyXG5cdFx0XHQkKGRpdikuYXBwZW5kKGxhYmVsKTtcclxuXHRcdFx0XHJcblx0XHRcdCQoY29udGFpbmVyKS5yZXBsYWNlV2l0aChkaXYpO1xyXG5cdFx0XHRcclxuXHRcdFx0JChkaXYpLndyYXAoJChcIjxkaXY+PC9kaXY+XCIpKTtcclxuXHRcdFx0JChkaXYpLmFmdGVyKHRleHQpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0fTtcclxuXHRcclxuXHQkKFwiLndwZ216YS1mYW5jeS10b2dnbGUtc3dpdGNoXCIpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsKSB7XHJcblx0XHRXUEdNWkEuRmFuY3lDb250cm9scy5mb3JtYXRUb2dnbGVTd2l0Y2goZWwpO1xyXG5cdH0pO1xyXG5cdFxyXG5cdCQoXCIud3BnbXphLWZhbmN5LXRvZ2dsZS1idXR0b25cIikuZWFjaChmdW5jdGlvbihpbmRleCwgZWwpIHtcclxuXHRcdFdQR01aQS5GYW5jeUNvbnRyb2xzLmZvcm1hdFRvZ2dsZUJ1dHRvbihlbCk7XHJcblx0fSk7XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoiZmFuY3ktY29udHJvbHMuanMifQ==
