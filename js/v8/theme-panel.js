/**
 * @namespace WPGMZA
 * @module ThemePanel
 * @requires WPGMZA
 * @gulp-requires core.js
 */
jQuery(function($) {
	
	WPGMZA.ThemePanel = function()
	{
		var self = this;
		
		this.element = $("#wpgmza-theme-panel");
		this.map = WPGMZA.maps[0];
		
		if(!this.element.length)
		{
			console.warn("No element to initialise theme panel on");
			return;
		}
		
		$("#wpgmza-theme-presets").owlCarousel({
			items: 5,
			dots: true
		});
		
		this.element.on("click", "#wpgmza-theme-presets label", function(event) {
			self.onThemePresetClick(event);
		});
		
		$("#wpgmza-open-theme-editor").on("click", function(event) {
			$('#wpgmza-map-theme-editor__holder').addClass('active');
			$("#wpgmza-theme-editor").addClass('active');
			WPGMZA.animateScroll($("#wpgmza-theme-editor"));
		});
		
		WPGMZA.themePanel = this;
		
		/*CodeMirror.fromTextArea($("textarea[name='wpgmza_theme_data']")[0], {
			lineNumbers: true,
			mode: "javascript"
		});*/
	}
	
	// NB: These aren't used anywhere, but they are recorded here for future use in making preview images
	WPGMZA.ThemePanel.previewImageCenter	= {lat: 33.701806462148646, lng: -118.15949896058983};
	WPGMZA.ThemePanel.previewImageZoom		= 11;
	
	WPGMZA.ThemePanel.prototype.onThemePresetClick = function(event)
	{
		var selectedData	= $(event.currentTarget).find("[data-theme-json]").attr("data-theme-json");
		var textarea		= $(this.element).find("textarea[name='wpgmza_theme_data']");
		var existingData	= textarea.val();
		var allPresetData	= [];
		
		$(this.element).find("[data-theme-json]").each(function(index, el) {
			allPresetData.push( $(el).attr("data-theme-json") );
		});
		
		// NB: This code will only prompt the user to overwrite if a custom theme is not being used. This way you can still flick through the unmodified themes
		if(existingData.length && allPresetData.indexOf(existingData) == -1)
		{
			if(!confirm(WPGMZA.localized_strings.overwrite_theme_data))
				return;
		}
		
		textarea.val(selectedData);
		
		this.updateMapTheme();
		WPGMZA.themeEditor.parse();
	}
	
	WPGMZA.ThemePanel.prototype.updateMapTheme = function()
	{
		var data;
		
		try{
			data = JSON.parse($("textarea[name='wpgmza_theme_data']").val());
		}catch(e) {
			alert(WPGMZA.localized_strings.invalid_theme_data);
			return;
		}
		
		this.map.setOptions({styles: data});
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ0aGVtZS1wYW5lbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBUaGVtZVBhbmVsXHJcbiAqIEByZXF1aXJlcyBXUEdNWkFcclxuICogQGd1bHAtcmVxdWlyZXMgY29yZS5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHRXUEdNWkEuVGhlbWVQYW5lbCA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdHRoaXMuZWxlbWVudCA9ICQoXCIjd3BnbXphLXRoZW1lLXBhbmVsXCIpO1xyXG5cdFx0dGhpcy5tYXAgPSBXUEdNWkEubWFwc1swXTtcclxuXHRcdFxyXG5cdFx0aWYoIXRoaXMuZWxlbWVudC5sZW5ndGgpXHJcblx0XHR7XHJcblx0XHRcdGNvbnNvbGUud2FybihcIk5vIGVsZW1lbnQgdG8gaW5pdGlhbGlzZSB0aGVtZSBwYW5lbCBvblwiKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQkKFwiI3dwZ216YS10aGVtZS1wcmVzZXRzXCIpLm93bENhcm91c2VsKHtcclxuXHRcdFx0aXRlbXM6IDUsXHJcblx0XHRcdGRvdHM6IHRydWVcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHR0aGlzLmVsZW1lbnQub24oXCJjbGlja1wiLCBcIiN3cGdtemEtdGhlbWUtcHJlc2V0cyBsYWJlbFwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRzZWxmLm9uVGhlbWVQcmVzZXRDbGljayhldmVudCk7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0JChcIiN3cGdtemEtb3Blbi10aGVtZS1lZGl0b3JcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHQkKCcjd3BnbXphLW1hcC10aGVtZS1lZGl0b3JfX2hvbGRlcicpLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuXHRcdFx0JChcIiN3cGdtemEtdGhlbWUtZWRpdG9yXCIpLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuXHRcdFx0V1BHTVpBLmFuaW1hdGVTY3JvbGwoJChcIiN3cGdtemEtdGhlbWUtZWRpdG9yXCIpKTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHRXUEdNWkEudGhlbWVQYW5lbCA9IHRoaXM7XHJcblx0XHRcclxuXHRcdC8qQ29kZU1pcnJvci5mcm9tVGV4dEFyZWEoJChcInRleHRhcmVhW25hbWU9J3dwZ216YV90aGVtZV9kYXRhJ11cIilbMF0sIHtcclxuXHRcdFx0bGluZU51bWJlcnM6IHRydWUsXHJcblx0XHRcdG1vZGU6IFwiamF2YXNjcmlwdFwiXHJcblx0XHR9KTsqL1xyXG5cdH1cclxuXHRcclxuXHQvLyBOQjogVGhlc2UgYXJlbid0IHVzZWQgYW55d2hlcmUsIGJ1dCB0aGV5IGFyZSByZWNvcmRlZCBoZXJlIGZvciBmdXR1cmUgdXNlIGluIG1ha2luZyBwcmV2aWV3IGltYWdlc1xyXG5cdFdQR01aQS5UaGVtZVBhbmVsLnByZXZpZXdJbWFnZUNlbnRlclx0PSB7bGF0OiAzMy43MDE4MDY0NjIxNDg2NDYsIGxuZzogLTExOC4xNTk0OTg5NjA1ODk4M307XHJcblx0V1BHTVpBLlRoZW1lUGFuZWwucHJldmlld0ltYWdlWm9vbVx0XHQ9IDExO1xyXG5cdFxyXG5cdFdQR01aQS5UaGVtZVBhbmVsLnByb3RvdHlwZS5vblRoZW1lUHJlc2V0Q2xpY2sgPSBmdW5jdGlvbihldmVudClcclxuXHR7XHJcblx0XHR2YXIgc2VsZWN0ZWREYXRhXHQ9ICQoZXZlbnQuY3VycmVudFRhcmdldCkuZmluZChcIltkYXRhLXRoZW1lLWpzb25dXCIpLmF0dHIoXCJkYXRhLXRoZW1lLWpzb25cIik7XHJcblx0XHR2YXIgdGV4dGFyZWFcdFx0PSAkKHRoaXMuZWxlbWVudCkuZmluZChcInRleHRhcmVhW25hbWU9J3dwZ216YV90aGVtZV9kYXRhJ11cIik7XHJcblx0XHR2YXIgZXhpc3RpbmdEYXRhXHQ9IHRleHRhcmVhLnZhbCgpO1xyXG5cdFx0dmFyIGFsbFByZXNldERhdGFcdD0gW107XHJcblx0XHRcclxuXHRcdCQodGhpcy5lbGVtZW50KS5maW5kKFwiW2RhdGEtdGhlbWUtanNvbl1cIikuZWFjaChmdW5jdGlvbihpbmRleCwgZWwpIHtcclxuXHRcdFx0YWxsUHJlc2V0RGF0YS5wdXNoKCAkKGVsKS5hdHRyKFwiZGF0YS10aGVtZS1qc29uXCIpICk7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0Ly8gTkI6IFRoaXMgY29kZSB3aWxsIG9ubHkgcHJvbXB0IHRoZSB1c2VyIHRvIG92ZXJ3cml0ZSBpZiBhIGN1c3RvbSB0aGVtZSBpcyBub3QgYmVpbmcgdXNlZC4gVGhpcyB3YXkgeW91IGNhbiBzdGlsbCBmbGljayB0aHJvdWdoIHRoZSB1bm1vZGlmaWVkIHRoZW1lc1xyXG5cdFx0aWYoZXhpc3RpbmdEYXRhLmxlbmd0aCAmJiBhbGxQcmVzZXREYXRhLmluZGV4T2YoZXhpc3RpbmdEYXRhKSA9PSAtMSlcclxuXHRcdHtcclxuXHRcdFx0aWYoIWNvbmZpcm0oV1BHTVpBLmxvY2FsaXplZF9zdHJpbmdzLm92ZXJ3cml0ZV90aGVtZV9kYXRhKSlcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRleHRhcmVhLnZhbChzZWxlY3RlZERhdGEpO1xyXG5cdFx0XHJcblx0XHR0aGlzLnVwZGF0ZU1hcFRoZW1lKCk7XHJcblx0XHRXUEdNWkEudGhlbWVFZGl0b3IucGFyc2UoKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLlRoZW1lUGFuZWwucHJvdG90eXBlLnVwZGF0ZU1hcFRoZW1lID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciBkYXRhO1xyXG5cdFx0XHJcblx0XHR0cnl7XHJcblx0XHRcdGRhdGEgPSBKU09OLnBhcnNlKCQoXCJ0ZXh0YXJlYVtuYW1lPSd3cGdtemFfdGhlbWVfZGF0YSddXCIpLnZhbCgpKTtcclxuXHRcdH1jYXRjaChlKSB7XHJcblx0XHRcdGFsZXJ0KFdQR01aQS5sb2NhbGl6ZWRfc3RyaW5ncy5pbnZhbGlkX3RoZW1lX2RhdGEpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRoaXMubWFwLnNldE9wdGlvbnMoe3N0eWxlczogZGF0YX0pO1xyXG5cdH1cclxuXHRcclxufSk7Il0sImZpbGUiOiJ0aGVtZS1wYW5lbC5qcyJ9
