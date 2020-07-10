/**
 * @namespace WPGMZA
 * @module AdminMarkerDataTable
 * @requires WPGMZA.DataTable
 * @gulp-requires datatable.js
 */
jQuery(function($) {
	
	WPGMZA.AdminMarkerDataTable = function(element)
	{
		var self = this;
		
		this.preventCaching = true;
		
		WPGMZA.DataTable.call(this, element);
		
		// NB: Pro marker panel currently manages edit marker buttons
		
		$(element).on("click", "[data-delete-marker-id]", function(event) {
			self.onDeleteMarker(event);
		});
		
		$(element).find(".wpgmza.select_all_markers").on("click", function(event) {
			self.onSelectAll(event);
		});
		
		$(element).find(".wpgmza.bulk_delete").on("click", function(event) {
			self.onBulkDelete(event);
		});

		$(element).on("click", "[data-center-marker-id]", function(event) {
			self.onCenterMarker(event);
		});
	}
	
	WPGMZA.AdminMarkerDataTable.prototype = Object.create(WPGMZA.DataTable.prototype);
	WPGMZA.AdminMarkerDataTable.prototype.constructor = WPGMZA.AdminMarkerDataTable;
	
	WPGMZA.AdminMarkerDataTable.createInstance = function(element)
	{
		return new WPGMZA.AdminMarkerDataTable(element);
	}
	
	WPGMZA.AdminMarkerDataTable.prototype.getDataTableSettings = function()
	{
		var self = this;
		var options = WPGMZA.DataTable.prototype.getDataTableSettings.call(this);
		
		options.createdRow = function(row, data, index)
		{
			var meta = self.lastResponse.meta[index];
			row.wpgmzaMarkerData = meta;
		}
		
		return options;
	}
	
	WPGMZA.AdminMarkerDataTable.prototype.onEditMarker = function(event)
	{
		WPGMZA.animatedScroll("#wpgmaps_tabs_markers");
	}
	
	WPGMZA.AdminMarkerDataTable.prototype.onDeleteMarker = function(event)
	{
		var self	= this;
		var id		= $(event.currentTarget).attr("data-delete-marker-id");
		
		var data	= {
			action: 'delete_marker',
			security: WPGMZA.legacyajaxnonce,
			map_id: WPGMZA.mapEditPage.map.id,
			marker_id: id
		};
		
		$.post(ajaxurl, data, function(response) {
			
			WPGMZA.mapEditPage.map.removeMarkerByID(id);
			self.reload();
			
		});
	}
	
	// NB: Move this to UGM
	WPGMZA.AdminMarkerDataTable.prototype.onApproveMarker = function(event)
	{
		var self	= this;
		var cur_id	= $(this).attr("id");
		
		var data = {
			action:		'approve_marker',
			security:	WPGMZA.legacyajaxnonce,
			map_id:		WPGMZA.mapEditPage.map.id,
			marker_id:	cur_id
		};
		$.post(ajaxurl, data, function (response) {
			
			
			wpgmza_InitMap();
			wpgmza_reinitialisetbl();

		});
	}
	
	WPGMZA.AdminMarkerDataTable.prototype.onSelectAll = function(event)
	{
		$(this.element).find("input[name='mark']").prop("checked", true);
	}
	
	WPGMZA.AdminMarkerDataTable.prototype.onBulkDelete = function(event)
	{
		var self = this;
		var ids = [];
		var map = WPGMZA.maps[0];
		
		$(this.element).find("input[name='mark']:checked").each(function(index, el) {
			var row = $(el).closest("tr")[0];
			ids.push(row.wpgmzaMarkerData.id);
		});
		
		ids.forEach(function(marker_id) {
			var marker = map.getMarkerByID(marker_id);
			
			if(marker)
				map.removeMarker(marker);
		});
		
		WPGMZA.restAPI.call("/markers/", {
			method: "DELETE",
			data: {
				ids: ids
			},
			complete: function() {
				self.reload();
			}
		});
	}

	WPGMZA.AdminMarkerDataTable.prototype.onCenterMarker = function(event)
	{
		var id;

		//Check if we have selected the center on marker button or called this function elsewhere 
		if(event.currentTarget == undefined)
		{
			id = event;
		}
		else{
			id = $(event.currentTarget).attr("data-center-marker-id");
		}

		var marker = WPGMZA.mapEditPage.map.getMarkerByID(id);
		
		if(marker){
			var latLng = new WPGMZA.LatLng({
				lat: marker.lat,
				lng: marker.lng
			});
			
			//Set a static zoom level
			var zoom_value = 6;
			WPGMZA.mapEditPage.map.setCenter(latLng);
			WPGMZA.mapEditPage.map.setZoom(zoom_value);
			WPGMZA.animateScroll("#wpgmaps_tabs_markers");
		}


	}
	
	$(document).ready(function(event) {
		
		$("[data-wpgmza-admin-marker-datatable]").each(function(index, el) {
			WPGMZA.adminMarkerDataTable = WPGMZA.AdminMarkerDataTable.createInstance(el);
		});
		
	});
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ0YWJsZXMvYWRtaW4tbWFya2VyLWRhdGF0YWJsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBBZG1pbk1hcmtlckRhdGFUYWJsZVxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBLkRhdGFUYWJsZVxyXG4gKiBAZ3VscC1yZXF1aXJlcyBkYXRhdGFibGUuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0V1BHTVpBLkFkbWluTWFya2VyRGF0YVRhYmxlID0gZnVuY3Rpb24oZWxlbWVudClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdHRoaXMucHJldmVudENhY2hpbmcgPSB0cnVlO1xyXG5cdFx0XHJcblx0XHRXUEdNWkEuRGF0YVRhYmxlLmNhbGwodGhpcywgZWxlbWVudCk7XHJcblx0XHRcclxuXHRcdC8vIE5COiBQcm8gbWFya2VyIHBhbmVsIGN1cnJlbnRseSBtYW5hZ2VzIGVkaXQgbWFya2VyIGJ1dHRvbnNcclxuXHRcdFxyXG5cdFx0JChlbGVtZW50KS5vbihcImNsaWNrXCIsIFwiW2RhdGEtZGVsZXRlLW1hcmtlci1pZF1cIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2VsZi5vbkRlbGV0ZU1hcmtlcihldmVudCk7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0JChlbGVtZW50KS5maW5kKFwiLndwZ216YS5zZWxlY3RfYWxsX21hcmtlcnNcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRzZWxmLm9uU2VsZWN0QWxsKGV2ZW50KTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHQkKGVsZW1lbnQpLmZpbmQoXCIud3BnbXphLmJ1bGtfZGVsZXRlXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2VsZi5vbkJ1bGtEZWxldGUoZXZlbnQpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0JChlbGVtZW50KS5vbihcImNsaWNrXCIsIFwiW2RhdGEtY2VudGVyLW1hcmtlci1pZF1cIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2VsZi5vbkNlbnRlck1hcmtlcihldmVudCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkFkbWluTWFya2VyRGF0YVRhYmxlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoV1BHTVpBLkRhdGFUYWJsZS5wcm90b3R5cGUpO1xyXG5cdFdQR01aQS5BZG1pbk1hcmtlckRhdGFUYWJsZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXUEdNWkEuQWRtaW5NYXJrZXJEYXRhVGFibGU7XHJcblx0XHJcblx0V1BHTVpBLkFkbWluTWFya2VyRGF0YVRhYmxlLmNyZWF0ZUluc3RhbmNlID0gZnVuY3Rpb24oZWxlbWVudClcclxuXHR7XHJcblx0XHRyZXR1cm4gbmV3IFdQR01aQS5BZG1pbk1hcmtlckRhdGFUYWJsZShlbGVtZW50KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkFkbWluTWFya2VyRGF0YVRhYmxlLnByb3RvdHlwZS5nZXREYXRhVGFibGVTZXR0aW5ncyA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHR2YXIgb3B0aW9ucyA9IFdQR01aQS5EYXRhVGFibGUucHJvdG90eXBlLmdldERhdGFUYWJsZVNldHRpbmdzLmNhbGwodGhpcyk7XHJcblx0XHRcclxuXHRcdG9wdGlvbnMuY3JlYXRlZFJvdyA9IGZ1bmN0aW9uKHJvdywgZGF0YSwgaW5kZXgpXHJcblx0XHR7XHJcblx0XHRcdHZhciBtZXRhID0gc2VsZi5sYXN0UmVzcG9uc2UubWV0YVtpbmRleF07XHJcblx0XHRcdHJvdy53cGdtemFNYXJrZXJEYXRhID0gbWV0YTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIG9wdGlvbnM7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5BZG1pbk1hcmtlckRhdGFUYWJsZS5wcm90b3R5cGUub25FZGl0TWFya2VyID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0V1BHTVpBLmFuaW1hdGVkU2Nyb2xsKFwiI3dwZ21hcHNfdGFic19tYXJrZXJzXCIpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuQWRtaW5NYXJrZXJEYXRhVGFibGUucHJvdG90eXBlLm9uRGVsZXRlTWFya2VyID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGZcdD0gdGhpcztcclxuXHRcdHZhciBpZFx0XHQ9ICQoZXZlbnQuY3VycmVudFRhcmdldCkuYXR0cihcImRhdGEtZGVsZXRlLW1hcmtlci1pZFwiKTtcclxuXHRcdFxyXG5cdFx0dmFyIGRhdGFcdD0ge1xyXG5cdFx0XHRhY3Rpb246ICdkZWxldGVfbWFya2VyJyxcclxuXHRcdFx0c2VjdXJpdHk6IFdQR01aQS5sZWdhY3lhamF4bm9uY2UsXHJcblx0XHRcdG1hcF9pZDogV1BHTVpBLm1hcEVkaXRQYWdlLm1hcC5pZCxcclxuXHRcdFx0bWFya2VyX2lkOiBpZFxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0JC5wb3N0KGFqYXh1cmwsIGRhdGEsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcblx0XHRcdFxyXG5cdFx0XHRXUEdNWkEubWFwRWRpdFBhZ2UubWFwLnJlbW92ZU1hcmtlckJ5SUQoaWQpO1xyXG5cdFx0XHRzZWxmLnJlbG9hZCgpO1xyXG5cdFx0XHRcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHQvLyBOQjogTW92ZSB0aGlzIHRvIFVHTVxyXG5cdFdQR01aQS5BZG1pbk1hcmtlckRhdGFUYWJsZS5wcm90b3R5cGUub25BcHByb3ZlTWFya2VyID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGZcdD0gdGhpcztcclxuXHRcdHZhciBjdXJfaWRcdD0gJCh0aGlzKS5hdHRyKFwiaWRcIik7XHJcblx0XHRcclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHRhY3Rpb246XHRcdCdhcHByb3ZlX21hcmtlcicsXHJcblx0XHRcdHNlY3VyaXR5Olx0V1BHTVpBLmxlZ2FjeWFqYXhub25jZSxcclxuXHRcdFx0bWFwX2lkOlx0XHRXUEdNWkEubWFwRWRpdFBhZ2UubWFwLmlkLFxyXG5cdFx0XHRtYXJrZXJfaWQ6XHRjdXJfaWRcclxuXHRcdH07XHJcblx0XHQkLnBvc3QoYWpheHVybCwgZGF0YSwgZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcblx0XHRcdFxyXG5cdFx0XHRcclxuXHRcdFx0d3BnbXphX0luaXRNYXAoKTtcclxuXHRcdFx0d3BnbXphX3JlaW5pdGlhbGlzZXRibCgpO1xyXG5cclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuQWRtaW5NYXJrZXJEYXRhVGFibGUucHJvdG90eXBlLm9uU2VsZWN0QWxsID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0JCh0aGlzLmVsZW1lbnQpLmZpbmQoXCJpbnB1dFtuYW1lPSdtYXJrJ11cIikucHJvcChcImNoZWNrZWRcIiwgdHJ1ZSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5BZG1pbk1hcmtlckRhdGFUYWJsZS5wcm90b3R5cGUub25CdWxrRGVsZXRlID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0dmFyIGlkcyA9IFtdO1xyXG5cdFx0dmFyIG1hcCA9IFdQR01aQS5tYXBzWzBdO1xyXG5cdFx0XHJcblx0XHQkKHRoaXMuZWxlbWVudCkuZmluZChcImlucHV0W25hbWU9J21hcmsnXTpjaGVja2VkXCIpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsKSB7XHJcblx0XHRcdHZhciByb3cgPSAkKGVsKS5jbG9zZXN0KFwidHJcIilbMF07XHJcblx0XHRcdGlkcy5wdXNoKHJvdy53cGdtemFNYXJrZXJEYXRhLmlkKTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHRpZHMuZm9yRWFjaChmdW5jdGlvbihtYXJrZXJfaWQpIHtcclxuXHRcdFx0dmFyIG1hcmtlciA9IG1hcC5nZXRNYXJrZXJCeUlEKG1hcmtlcl9pZCk7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihtYXJrZXIpXHJcblx0XHRcdFx0bWFwLnJlbW92ZU1hcmtlcihtYXJrZXIpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdFdQR01aQS5yZXN0QVBJLmNhbGwoXCIvbWFya2Vycy9cIiwge1xyXG5cdFx0XHRtZXRob2Q6IFwiREVMRVRFXCIsXHJcblx0XHRcdGRhdGE6IHtcclxuXHRcdFx0XHRpZHM6IGlkc1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRjb21wbGV0ZTogZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0c2VsZi5yZWxvYWQoKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRXUEdNWkEuQWRtaW5NYXJrZXJEYXRhVGFibGUucHJvdG90eXBlLm9uQ2VudGVyTWFya2VyID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0dmFyIGlkO1xyXG5cclxuXHRcdC8vQ2hlY2sgaWYgd2UgaGF2ZSBzZWxlY3RlZCB0aGUgY2VudGVyIG9uIG1hcmtlciBidXR0b24gb3IgY2FsbGVkIHRoaXMgZnVuY3Rpb24gZWxzZXdoZXJlIFxyXG5cdFx0aWYoZXZlbnQuY3VycmVudFRhcmdldCA9PSB1bmRlZmluZWQpXHJcblx0XHR7XHJcblx0XHRcdGlkID0gZXZlbnQ7XHJcblx0XHR9XHJcblx0XHRlbHNle1xyXG5cdFx0XHRpZCA9ICQoZXZlbnQuY3VycmVudFRhcmdldCkuYXR0cihcImRhdGEtY2VudGVyLW1hcmtlci1pZFwiKTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgbWFya2VyID0gV1BHTVpBLm1hcEVkaXRQYWdlLm1hcC5nZXRNYXJrZXJCeUlEKGlkKTtcclxuXHRcdFxyXG5cdFx0aWYobWFya2VyKXtcclxuXHRcdFx0dmFyIGxhdExuZyA9IG5ldyBXUEdNWkEuTGF0TG5nKHtcclxuXHRcdFx0XHRsYXQ6IG1hcmtlci5sYXQsXHJcblx0XHRcdFx0bG5nOiBtYXJrZXIubG5nXHJcblx0XHRcdH0pO1xyXG5cdFx0XHRcclxuXHRcdFx0Ly9TZXQgYSBzdGF0aWMgem9vbSBsZXZlbFxyXG5cdFx0XHR2YXIgem9vbV92YWx1ZSA9IDY7XHJcblx0XHRcdFdQR01aQS5tYXBFZGl0UGFnZS5tYXAuc2V0Q2VudGVyKGxhdExuZyk7XHJcblx0XHRcdFdQR01aQS5tYXBFZGl0UGFnZS5tYXAuc2V0Wm9vbSh6b29tX3ZhbHVlKTtcclxuXHRcdFx0V1BHTVpBLmFuaW1hdGVTY3JvbGwoXCIjd3BnbWFwc190YWJzX21hcmtlcnNcIik7XHJcblx0XHR9XHJcblxyXG5cclxuXHR9XHJcblx0XHJcblx0JChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFxyXG5cdFx0JChcIltkYXRhLXdwZ216YS1hZG1pbi1tYXJrZXItZGF0YXRhYmxlXVwiKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xyXG5cdFx0XHRXUEdNWkEuYWRtaW5NYXJrZXJEYXRhVGFibGUgPSBXUEdNWkEuQWRtaW5NYXJrZXJEYXRhVGFibGUuY3JlYXRlSW5zdGFuY2UoZWwpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHR9KTtcclxuXHRcclxufSk7Il0sImZpbGUiOiJ0YWJsZXMvYWRtaW4tbWFya2VyLWRhdGF0YWJsZS5qcyJ9
