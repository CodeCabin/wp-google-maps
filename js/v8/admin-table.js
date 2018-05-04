/**
 * @namespace WPGMZA
 * @module AdminTable
 * @requires WPGMZA.DataTable
 */
(function($) {
	
	WPGMZA.AdminTable = function(element, settings)
	{
		WPGMZA.DataTable.call(this, element, settings);
		
		var self = this;
		
		this.settings = {};
		$.extend(this.settings, settings);
		
		this.objectType = $(element).attr("data-object-type");
		this.capitalizedSingularObjectType = this.objectType.charAt(0).toUpperCase() + this.objectType.slice(1).replace(/s$/, "");
		this.markerDragNoticeIssued = false;
		
		element.adminTable = this;
	}
	
	WPGMZA.AdminTable.prototype = Object.create(WPGMZA.DataTable.prototype);
	WPGMZA.AdminTable.prototype.constructor = WPGMZA.AdminTable;
	
	WPGMZA.AdminTable.prototype.getDataTableSettings = function()
	{
		var self = this;
		var settings = WPGMZA.DataTable.prototype.getDataTableSettings.call(this);
		
		settings["initComplete"] = function(settings, json) {
			self.onInitComplete(settings, json);
		};
		
		return settings;
	}
	
	WPGMZA.AdminTable.prototype.onInitComplete = function(settings, json)
	{
		// TODO: Localize these strings, or better still, move the code to PHP
		var self = this;
		var element = this.element;
		
		// Additional column headers
		$(element).find("thead>tr, tfoot>tr").prepend("<th>Mark</th>");
		$(element).find("thead>tr, tfoot>tr").append("<th>Actions</th>");
		
		// Action buttons
		$(element).on("click", "button[data-action]", function(event) {
			var action = $(event.currentTarget).attr("data-action");
			var actionFunctionName = action + self.capitalizedSingularObjectType;
			var objectID = $(event.target).closest("[data-id]").attr("data-id");
			
			if($(event.currentTarget).hasClass("wpgmza-edit-marker-location") && !self.markerDragNoticeIssued)
			{
				var timeout = parseInt(WPGMZA.settings.scroll_animation_milliseconds || 400);
				
				setTimeout(function() {
					$(".wpgmza-engine-map").after("<p class='notice notice-info animated bounce'>\
						" + WPGMZA.localized_strings.marker_drag_notice + "\
					</p>");
				}, timeout);
				
				self.markerDragNoticeIssued = true;
			}
			
			switch(action)
			{
				case "edit":
					var getFunctionName = "get" + self.capitalizedSingularObjectType + "ByID";
					var object = WPGMZA.mapEditPage.map[getFunctionName](objectID);
				
					WPGMZA.mapEditPage[actionFunctionName](object);
					WPGMZA.mapEditPage.map.setZoom(16);
					
					WPGMZA.animateScroll($("#map-edit-tabs"));
					
					break;
					
				case "delete":
					actionFunctionName += "ByID";
					WPGMZA.mapEditPage[actionFunctionName](objectID);
					self.refresh();
					break;
			}
		});
		
		// Bulk controls
		$(element).after(
			'<div class="wpgmza-bulk-buttons">' +
				'&#x21b3;' +
				'<button type="button" class="button button-primary select-all">Select All</button>' +
				'<button type="button" class="button button-primary bulk-delete">Bulk Delete</button>' +
			'</div>'
		);
		
		var buttons = $(element).next(".wpgmza-bulk-buttons");
		
		buttons.find(".select-all").on("click", function(event) {
			$(element).find("input[type='checkbox'].mark").prop("checked", "true");
		});
		
		var deleteFunctionName = "delete" + this.capitalizedSingularObjectType + "ByID";
		buttons.find(".bulk-delete").on("click", function(event) {
			$(element).find("input[data-mark-id]:checked").each(function(index, el) {
				var objectID = parseInt($(el).attr("data-mark-id"));
				WPGMZA.mapEditPage[deleteFunctionName](objectID);
			});
			
			self.refresh();
		});
	}
	
	WPGMZA.AdminTable.prototype.onCreatedRow = function(row, data, index)
	{
		WPGMZA.DataTable.prototype.onCreatedRow.call(this, row, data, index);
		
		var td = $('<td class="wpgmza-actions"/>');
		var meta = this.lastResponseMeta[index];
		
		$(row).prepend(
			$("<td><input type='checkbox' class='mark' data-mark-id='" + meta.id + "'/></td>")
		);
		
		$(td).append("<button data-action='edit' type='button' class='button button-primary wpgmza-edit'><i class='fa fa-pencil-square-o' aria-hidden='true'></i></button>");
		$(td).append(" ");
		
		if(this.objectType == "markers")
		{
			$(td).append("<button data-action='edit' type='button' class='button button-primary wpgmza-edit wpgmza-edit-marker-location'><i class='fa fa-map-marker' aria-hidden='true'></i></button>");
			$(td).append(" ");
		}
		
		$(td).append("<button data-action='delete' type='button' class='button button-primary wpgmza-delete'><i class='fa fa-trash-o' aria-hidden='true'></i></button>");
		
		if(this.objectType == "markers")
		{
			$(td).find(".wpgmza-edit").attr("title", WPGMZA.localized_strings.edit_this_marker);
			$(td).find(".wpgmza-edit-marker-location").attr("title", WPGMZA.localized_strings.edit_this_marker_location);
			$(td).find(".wpgmza-delete").attr("title", WPGMZA.localized_strings.delete_this_marker);
		}
		
		$(row).append(td);
		
		this.trigger({
			type: "admintable.rowcreated",
			row: row,
			data: data,
			index: index,
			meta: meta
		});
	}
	
	WPGMZA.AdminTable.prototype.onAJAXRequest = function(data, settings)
	{
		WPGMZA.DataTable.prototype.onAJAXRequest.call(this, data, settings);
		
		if(!WPGMZA.mapEditPage)
			return data;	// Still initializing
		
		$.extend(data, {
			"exclude_ids": WPGMZA.mapEditPage.deleteIDs[this.objectType].join(",")
		});
		
		//console.log(data);
		
		return data;
	}
	
})(jQuery);