/**
 * @namespace WPGMZA
 * @module FeaturePanel
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	WPGMZA.FeaturePanel = function(element, mapEditPage)
	{
		var self = this;
		
		WPGMZA.EventDispatcher.apply(this, arguments);
		
		this.map = mapEditPage.map;
		this.drawingManager = mapEditPage.drawingManager;
		this.writersblock = false;
		
		this.feature = null;
		
		this.element = element;

		this.initDefaults();
		this.setMode(WPGMZA.FeaturePanel.MODE_ADD);
		
		this.drawingInstructionsElement = $(this.element).find(".wpgmza-feature-drawing-instructions");
		this.drawingInstructionsElement.detach();
		
		this.editingInstructionsElement = $(this.element).find(".wpgmza-feature-editing-instructions");
		this.editingInstructionsElement.detach();
		
		
		$("#wpgmaps_tabs_markers").on("tabsactivate", function(event, ui) {
			if($.contains(ui.newPanel[0], self.element[0]))
				self.onTabActivated(event);
		});
		
		$("#wpgmaps_tabs_markers").on("tabsactivate", function(event, ui) {
			if($.contains(ui.oldPanel[0], self.element[0]))
				self.onTabDeactivated(event);
		});

		$('.grouping').on('feature-block-opened', function(event){
			var feature = $(event.currentTarget).data('feature');
			if(feature === self.featureType){
				self.onTabActivated(event);
			} else {
				self.onTabDeactivated(event);
			}
		});

		$('.grouping').on('feature-block-closed', function(event){
			self.onTabDeactivated(event);
			mapEditPage.drawingManager.setDrawingMode(WPGMZA.DrawingManager.MODE_NONE);
		});

		// NB: Removed to get styling closer
		/*$(element).closest(".wpgmza-accordion").find("h3[data-add-caption]").on("click", function(event) {
			if(self.mode == "add")
				self.onAddFeature(event);
		});*/

		$(document.body).on("click", "[data-edit-" + this.featureType + "-id]", function(event) {
			self.onEditFeature(event);
		});
		
		$(document.body).on("click", "[data-delete-" + this.featureType + "-id]", function(event) {
			self.onDeleteFeature(event);
		});
		
		$(this.element).find(".wpgmza-save-feature").on("click", function(event) {
			self.onSave(event);
		});
		
		this.drawingManager.on(self.drawingManagerCompleteEvent, function(event) {
			self.onDrawingComplete(event);
		});
		
		this.drawingManager.on("drawingmodechanged", function(event) {
			self.onDrawingModeChanged(event);
		});
		
		$(this.element).on("change input", function(event) {
			self.onPropertyChanged(event);
		});
	}

	
	
	WPGMZA.extend(WPGMZA.FeaturePanel, WPGMZA.EventDispatcher);
	
	WPGMZA.FeaturePanel.MODE_ADD			= "add";
	WPGMZA.FeaturePanel.MODE_EDIT			= "edit";
	
	WPGMZA.FeaturePanel.prevEditableFeature = null;
	
	Object.defineProperty(WPGMZA.FeaturePanel.prototype, "featureType", {
		
		"get": function() {
			return $(this.element).attr("data-wpgmza-feature-type");
		}
		
	});
	
	Object.defineProperty(WPGMZA.FeaturePanel.prototype, "drawingManagerCompleteEvent", {
		
		"get": function() {
			return this.featureType + "complete";
		}
		
	});
	
	Object.defineProperty(WPGMZA.FeaturePanel.prototype, "featureDataTable", {
		
		"get": function() {
			return $("[data-wpgmza-datatable][data-wpgmza-feature-type='" + this.featureType + "']")[0].wpgmzaDataTable;
		}
		
	});
	
	Object.defineProperty(WPGMZA.FeaturePanel.prototype, "featureAccordion", {
		
		"get": function() {
			return $(this.element).closest(".wpgmza-accordion");
		}
		
	});
	
	Object.defineProperty(WPGMZA.FeaturePanel.prototype, "map", {
		
		"get": function() {
			return WPGMZA.mapEditPage.map;
		}
		
	});
	
	Object.defineProperty(WPGMZA.FeaturePanel.prototype, "mode", {
		
		"get": function() {
			return this._mode;
		}
		
	});
	
	WPGMZA.FeaturePanel.prototype.initPreloader = function()
	{
		if(this.preloader)
			return;
		
		this.preloader = $(WPGMZA.preloaderHTML);
		this.preloader.hide();
		
		$(this.element).append(this.preloader);
	}
	
	WPGMZA.FeaturePanel.prototype.initDataTable = function()
	{
		var el = $(this.element).find("[data-wpgmza-datatable][data-wpgmza-rest-api-route]");
		
		this[this.featureType + "AdminDataTable"] = new WPGMZA.AdminFeatureDataTable( el );
	}
	
	WPGMZA.FeaturePanel.prototype.initDefaults = function()
	{
		$(this.element).find("[data-ajax-name]:not([type='radio'])").each(function(index, el) {
			
			var val = $(el).val();
			
			if(!val)
				return;
			
			$(el).attr("data-default-value", val);
			
		});
	}
	
	WPGMZA.FeaturePanel.prototype.setCaptionType = function(type, id)
	{
		var args = arguments;
		var icons = {
			add: "fa-plus-circle",
			save: "fa-pencil-square-o"
		};
		
		switch(type)
		{
			case WPGMZA.FeaturePanel.MODE_ADD:
			case WPGMZA.FeaturePanel.MODE_EDIT:
			
				this.featureAccordion.find("[data-add-caption][data-edit-caption]").each(function(index, el) {
					
					var text = $(el).attr("data-" + type + "-caption");
					var icon = $(el).find("i.fa");
					
					if(id)
						text += " " + id;
				
					$(el).text(text);
					
					if(icon.length)
					{
						// Need to recreate the icon as text() will have wiped it out
						icon = $("<i class='fa' aria-hidden='true'></i>");
						
						icon.addClass(icons[type]);
						
						$(el).prepend(" ");
						$(el).prepend(icon);
					}
				
				});

				this.sidebarTriggerDelegate('feature-caption-loaded');
				
				break;
				
			default:
				throw new Error("Invalid type");
				break;
		}
	}
	
	WPGMZA.FeaturePanel.prototype.setMode = function(type, id)
	{
		this._mode = type;
		this.setCaptionType(type, id);
	}
	
	WPGMZA.FeaturePanel.prototype.setTargetFeature = function(feature)
	{
		var self = this;

		// TODO: Implement fitBounds for all features
		//var bounds = feature.getBounds();
		//map.fitBounds(bounds);
		

		if(WPGMZA.FeaturePanel.prevEditableFeature) {
			var prev = WPGMZA.FeaturePanel.prevEditableFeature;
			
			prev.setEditable(false);
			prev.setDraggable(false);

			prev.off("change");
		}
		if(feature) {
			feature.setEditable(true);
			feature.setDraggable(true);

			feature.on("change", function(event) {
				self.onFeatureChanged(event);
			});
			this.setMode(WPGMZA.FeaturePanel.MODE_EDIT);
			this.drawingManager.setDrawingMode(WPGMZA.DrawingManager.MODE_NONE);
			
			this.showInstructions();
		} else {
			this.setMode(WPGMZA.FeaturePanel.MODE_ADD);
		}
		this.feature = WPGMZA.FeaturePanel.prevEditableFeature = feature;
	}
	
	WPGMZA.FeaturePanel.prototype.reset = function()
	{
		$(this.element).find("[data-ajax-name]:not([data-ajax-name='map_id']):not([type='color']):not([type='checkbox']):not([type='radio'])").val("");
		$(this.element).find("select[data-ajax-name]>option:first-child").prop("selected", true);
		$(this.element).find("[data-ajax-name='id']").val("-1");
		
		$(this.element).find("input[type='checkbox']").prop("checked", false);
		
		if(!WPGMZA.InternalEngine.isLegacy()){
			if(typeof WritersBlock !== 'undefined' && this.writersblock != false && this.writersblock.ready){
				this.writersblock.setContent("");

				if(this.writersblock.elements && this.writersblock.elements._codeEditor){
					/* We have an HTML code block */
					this.writersblock.elements._codeEditor.value = "";
				}
			} else {
				$("#wpgmza-description-editor").val("");
			}


			$(this.element).find('input.wpgmza-color-input').each(function(){
				if(this.wpgmzaColorInput){
					this.wpgmzaColorInput.parseColor($(this).data('default-value') || this.value);
				}
			});
		} else {
			if(tinyMCE.get("wpgmza-description-editor")) {
				tinyMCE.get("wpgmza-description-editor").setContent("");
			} else {
				$("#wpgmza-description-editor").val("");
			}
		}


		$('#wpgmza-description-editor').val("");

		$(this.element).find('.wpgmza-image-single-input').trigger('change');
		
		this.showPreloader(false);
		this.setMode(WPGMZA.FeaturePanel.MODE_ADD);
		
		$(this.element).find("[data-ajax-name][data-default-value]").each(function(index, el) {
			
			$(el).val( $(el).data("default-value") );
			
		});
	}
	
	WPGMZA.FeaturePanel.prototype.select = function(arg) {
		var id, expectedBaseClass, self = this;
		
		this.reset();
		
		if(WPGMZA.isNumeric(arg))
			id = arg;
		else
		{
			expectedBaseClass = WPGMZA[ WPGMZA.capitalizeWords(this.featureType) ];
			
			if(!(feature instanceof expectedBaseClass))
				throw new Error("Invalid feature type for this panel");
			
			id = arg.id;
		}
		
		this.showPreloader(true);
		this.sidebarTriggerDelegate('edit');

		if(WPGMZA.InternalEngine.isLegacy()){
			/* Only applies in legacy */
			WPGMZA.animateScroll($(".wpgmza_map"));
		}
		
		WPGMZA.restAPI.call("/" + this.featureType + "s/" + id + "?skip_cache=1", {
			
			success: function(data, status, xhr) {
				
				var functionSuffix 		= WPGMZA.capitalizeWords(self.featureType);
				var getByIDFunction		= "get" + functionSuffix + "ByID";
				var feature				= self.map[getByIDFunction](id);
				
				self.populate(data);
				self.showPreloader(false);
				self.setMode(WPGMZA.FeaturePanel.MODE_EDIT, id);
				
				self.setTargetFeature(feature);
				
			}
			
		});
	}
	
	WPGMZA.FeaturePanel.prototype.showPreloader = function(show)
	{
		this.initPreloader();
		
		if(arguments.length == 0 || show)
		{
			this.preloader.fadeIn();
			this.element.addClass("wpgmza-loading");
		}
		else
		{
			this.preloader.fadeOut();
			this.element.removeClass("wpgmza-loading");
		}
	}
	
	WPGMZA.FeaturePanel.prototype.populate = function(data)
	{
		var value, target, name;
		
		for(name in data)
		{
			target = $(this.element).find("[data-ajax-name='" + name + "']");
			value = data[name];
			
			switch((target.attr("type") || "").toLowerCase())
			{
				case "checkbox":
				case "radio":
				
					target.prop("checked", data[name] == 1);
				
					break;
				
				case "color":
				
					// NB: Account for legacy color format
					if(!value.match(/^#/))
						value = "#" + value;
					
				default:
				
					if(typeof value == "object")
						value = JSON.stringify(value);
				
					$(this.element).find("[data-ajax-name='" + name + "']:not(select)").val(value);

					if($(this.element).find("[data-ajax-name='" + name + "']:not(select)").hasClass('wpgmza-color-input')){
						/* Need to update the preview here, for UI reasons, perhaps a change listener would be better but for now this will do fine */
						let colorInput = $(this.element).find("[data-ajax-name='" + name + "']:not(select)").get(0);
						if(colorInput.wpgmzaColorInput){
							colorInput.wpgmzaColorInput.parseColor(colorInput.value);
						}
					}

					if($(this.element).find("[data-ajax-name='" + name + "']:not(select)").hasClass('wpgmza-image-single-input')){
						/* Need to update the preview here, for UI reasons, perhaps a change listener would be better but for now this will do fine */
						let imageInputSingle = $(this.element).find("[data-ajax-name='" + name + "']:not(select)").get(0);
						if(imageInputSingle.wpgmzaImageInputSingle){
							imageInputSingle.wpgmzaImageInputSingle.parseImage(imageInputSingle.value);
						}
					}
					
					$(this.element).find("select[data-ajax-name='" + name + "']").each(function(index, el) {
						
						if(typeof value == "string" && data[name].length == 0)
							return;
						
						$(el).val(value);
						
					});
				
					break;
			}
		}
	}
	
	WPGMZA.FeaturePanel.prototype.serializeFormData = function()
	{
		var fields = $(this.element).find("[data-ajax-name]");
		var data = {};
		
		fields.each(function(index, el) {
			
			var type = "text";
			if($(el).attr("type"))
				type = $(el).attr("type").toLowerCase();
			
			switch(type)
			{
				case "checkbox":
					data[$(el).attr("data-ajax-name")] = $(el).prop("checked") ? 1 : 0;
					break;
				
				case "radio":
					if($(el).prop("checked"))
						data[$(el).attr("data-ajax-name")] = $(el).val();
					break;
					
				default:
					data[$(el).attr("data-ajax-name")] = $(el).val()
					break;
			}
			
		});
		
		return data;
	}
	
	WPGMZA.FeaturePanel.prototype.discardChanges = function() {
		if(!this.feature)
			return;
			
		var feature = this.feature;
		
		this.setTargetFeature(null);
		
		if(feature && feature.map)
		{
			this.map["remove" + WPGMZA.capitalizeWords(this.featureType)](feature);
			
			if(feature.id > -1)
				this.updateFeatureByID(feature.id);
		}
	}
	
	WPGMZA.FeaturePanel.prototype.updateFeatureByID = function(id)
	{
		var self = this;
		var feature;
		
		var route				= "/" + this.featureType + "s/";
		var functionSuffix 		= WPGMZA.capitalizeWords(self.featureType);
		var getByIDFunction		= "get" + functionSuffix + "ByID";
		var removeFunction		= "remove" + functionSuffix;
		var addFunction			= "add" + functionSuffix;
		
		WPGMZA.restAPI.call(route + id, {
			success: function(data, status, xhr) {
				
				if(feature = self.map[getByIDFunction](id))
					self.map[removeFunction](feature);
				
				feature	= WPGMZA[WPGMZA.capitalizeWords(self.featureType)].createInstance(data);
				self.map[addFunction](feature);
				
			}
		});
	}
	
	WPGMZA.FeaturePanel.prototype.showInstructions = function()
	{
		switch(this.mode)
		{
			case WPGMZA.FeaturePanel.MODE_ADD:
				if(WPGMZA.InternalEngine.isLegacy()){
					$(this.map.element).append(this.drawingInstructionsElement);
					$(this.drawingInstructionsElement).hide().fadeIn();
				} else {
					$(this.element).prepend(this.drawingInstructionsElement);
				}
				break;
			
			default:
				if(WPGMZA.InternalEngine.isLegacy()){
					$(this.map.element).append(this.editingInstructionsElement);
					$(this.editingInstructionsElement).hide().fadeIn();
				} else {
					$(this.element).prepend(this.editingInstructionsElement);
				}
				break;
		}
	}
	
	WPGMZA.FeaturePanel.prototype.onTabActivated = function() {
		this.reset();
		this.drawingManager.setDrawingMode(this.featureType);
		this.onAddFeature(event);

		if(WPGMZA.InternalEngine.isLegacy()){
			/* Only applies in legacy */
			$(".wpgmza-table-container-title").hide();
			$(".wpgmza-table-container").hide();

			var featureString = this.featureType.charAt(0).toUpperCase() + this.featureType.slice(1);
			
			$("#wpgmza-table-container-"+featureString).show();
			$("#wpgmza-table-container-title-"+featureString).show();
		}

	}
	
	WPGMZA.FeaturePanel.prototype.onTabDeactivated = function()
	{
		this.discardChanges();
		this.setTargetFeature(null);
	}
	
	WPGMZA.FeaturePanel.prototype.onAddFeature = function(event)
	{
		this.drawingManager.setDrawingMode(this.featureType);
		
		//if(this.featureType != "marker")
		//	WPGMZA.animateScroll(WPGMZA.mapEditPage.map.element);
	}
	
	WPGMZA.FeaturePanel.prototype.onEditFeature = function(event)
	{
		var self		= this;
		var name		= "data-edit-" + this.featureType + "-id";
		var id			= $(event.currentTarget).attr(name);

		this.discardChanges();
		
		this.select(id);
	}
	
	WPGMZA.FeaturePanel.prototype.onDeleteFeature = function(event)
	{
		var self		= this;
		var name		= "data-delete-" + this.featureType + "-id";
		var id			= $(event.currentTarget).attr(name);
		var route		= "/" + this.featureType + "s/";
		var feature		= this.map["get" + WPGMZA.capitalizeWords(this.featureType) + "ByID"](id);

		var result = confirm(WPGMZA.localized_strings.general_delete_prompt_text);
		if (result) {	
			this.featureDataTable.dataTable.processing(true);
			WPGMZA.restAPI.call(route + id, {
				method: "DELETE",
				success: function(data, status, xhr) {
					
					self.map["remove" + WPGMZA.capitalizeWords(self.featureType)](feature);
					self.featureDataTable.reload();
					
				}
			});
		}
	}
	
	WPGMZA.FeaturePanel.prototype.onDrawingModeChanged = function(event)
	{
		$(this.drawingInstructionsElement).detach();
		$(this.editingInstructionsElement).detach();
		
		if(this.drawingManager.mode == this.featureType)
		{
			this.showInstructions();
		}
	}
	
	WPGMZA.FeaturePanel.prototype.onDrawingComplete = function(event)
	{
		var self			= this;
		var property		= "engine" + WPGMZA.capitalizeWords(this.featureType);
		var engineFeature	= event[property];
		var formData		= this.serializeFormData();
		var geometryField	= $(self.element).find("textarea[data-ajax-name$='data']");
		
		delete formData.polydata;
		
		var nativeFeature = WPGMZA[WPGMZA.capitalizeWords(this.featureType)].createInstance(
			formData,
			engineFeature
		);
		
		this.drawingManager.setDrawingMode(WPGMZA.DrawingManager.MODE_NONE);
		this.map["add" + WPGMZA.capitalizeWords(this.featureType)](nativeFeature);
		
		this.setTargetFeature(nativeFeature);
		
		// NB: This only applies to some features, maybe updateGeometryFields would be better
		if(geometryField.length)
			geometryField.val(JSON.stringify(nativeFeature.getGeometry()));
		
		if(this.featureType != "marker") {
			//WPGMZA.animateScroll( $(this.element).closest(".wpgmza-accordion") );
		}
	}
	
	WPGMZA.FeaturePanel.prototype.onPropertyChanged = function(event)
	{
		var self = this;
		var feature = this.feature;
		
		if(!feature)
			return;	// No feature, we're likely in drawing mode and not editing a feature right now

		/* Track changed fields */
		if(!feature._dirtyFields){
			feature._dirtyFields = [];
		}
		
		// Gather all the fields from our inputs and set those properties on the feature
		$(this.element)
			.find(":input[data-ajax-name]")
			.each(function(index, el) {
				
				var key = $(el).attr("data-ajax-name");

				if(feature[key] && feature._dirtyFields.indexOf(key) === -1){
					if(feature[key] !== $(el).val()){
						feature._dirtyFields.push(key);
					}
				}

				feature[key] = $(el).val();
			});
		

		// Now cause the feature to update itself
		feature.updateNativeFeature();
	}
	
	WPGMZA.FeaturePanel.prototype.onFeatureChanged = function(event)
	{
		var geometryField = $(this.element).find("textarea[data-ajax-name$='data']");
		
		if(!geometryField.length)
			return;
		
		geometryField.val(JSON.stringify(this.feature.getGeometry()));
	}
	
	WPGMZA.FeaturePanel.prototype.onSave = function(event) {
		
		WPGMZA.EmbeddedMedia.detatchAll();
		
		var self		= this;
		var id			= $(self.element).find("[data-ajax-name='id']").val();
		var data		= this.serializeFormData();
		
		var route		= "/" + this.featureType + "s/";
		var isNew		= id == -1;


		if (this.featureType == 'circle') {
			if (!data.center) {
				alert(WPGMZA.localized_strings.no_shape_circle);
				return;
			}
		}
		if (this.featureType == 'rectangle') {
			if (!data.cornerA) {
				alert(WPGMZA.localized_strings.no_shape_rectangle);
				return;
			}
		}
		if (this.featureType == 'polygon') {
			if (!data.polydata) {
				alert(WPGMZA.localized_strings.no_shape_polygon);
				return;
			}
		}
		if (this.featureType == 'polyline') {
			if (!data.polydata) {
				alert(WPGMZA.localized_strings.no_shape_polyline);
				return;
			}
		}

		if(!isNew)
			route += id;
		
		WPGMZA.mapEditPage.drawingManager.setDrawingMode(WPGMZA.DrawingManager.MODE_NONE);
		this.showPreloader(true);

		self.sidebarTriggerDelegate('busy');
		
		WPGMZA.restAPI.call(route, {
			method:		"POST",
			data:		data,
			success:	function(data, status, xhr) {
				
				var feature;
				
				var functionSuffix 		= WPGMZA.capitalizeWords(self.featureType);
				var getByIDFunction		= "get" + functionSuffix + "ByID";
				var removeFunction		= "remove" + functionSuffix;
				var addFunction			= "add" + functionSuffix;
				
				if(feature = self.map[getByIDFunction](id)){
					self.map[removeFunction](feature);
				}
				
				self.setTargetFeature(null);
				self.showPreloader(false);
				
				feature	= WPGMZA[WPGMZA.capitalizeWords(self.featureType)].createInstance(data);
				self.map[addFunction](feature);
				
				self.featureDataTable.reload();
				self.onTabActivated(event);

				self.reset();
				
				if(!isNew){
					self.sidebarTriggerDelegate('saved');
				} else {
					self.sidebarTriggerDelegate('created');
				}

				WPGMZA.notification(WPGMZA.capitalizeWords(self.featureType) + " " + (isNew ? "Added" : "Saved"));
			}
		})
	}

	WPGMZA.FeaturePanel.prototype.sidebarTriggerDelegate = function(type){
		var eventType = 'sidebar-delegate-' + type;
		$(this.element).trigger({type: eventType, feature: this.featureType});
	}

	WPGMZA.FeaturePanel.prototype.initWritersBlock = function(element){
		if(element){
			if(!WPGMZA.InternalEngine.isLegacy() && typeof WritersBlock !== 'undefined'){
				this.writersblock = new WritersBlock(element, this.getWritersBlockConfig());

				if(this.writersblock.elements && this.writersblock.elements.editor){
					$(this.writersblock.elements.editor).on('click', '.wpgmza-embedded-media', (event) => {
						event.stopPropagation();
						if(event.currentTarget){
							if(!event.currentTarget.wpgmzaEmbeddedMedia){
								event.currentTarget.wpgmzaEmbeddedMedia = WPGMZA.EmbeddedMedia.createInstance(event.currentTarget, this.writersblock.elements.editor);
							} 
								
							event.currentTarget.wpgmzaEmbeddedMedia.onSelect();
						}
					});

					$(this.writersblock.elements.editor).on('media_resized', () => {
						this.writersblock.onEditorChange();
					});
				}
			}
		}
	}

	WPGMZA.FeaturePanel.prototype.getWritersBlockConfig = function(){
		return {
			customTools : [
				{
					tag : 'shared-blocks',
					tools : {
						'custom-media' : {
							icon : 'fa fa-file-image-o',
							title : 'Upload Media',
							action : (editor) => {
    							if(typeof wp !== 'undefined' && typeof wp.media !== 'undefined' && typeof WPGMZA.openMediaDialog !== 'undefined'){
    								WPGMZA.openMediaDialog(
    									(mediaId, mediaUrl, media) => {
	    								    if(mediaUrl){
	    								    	if(media.type){
	    								    		switch(media.type){
	    								    			case 'image':
	    								    				// editor.writeHtml(`<div class='wpgmza-embedded-media'><img src='${mediaUrl}' /></div>`);
	    								    				editor.writeHtml(`<img class='wpgmza-embedded-media' src='${mediaUrl}' />`);
	    								    				break;
	    								    			case 'video':
	    								    				editor.writeHtml(`<video class='wpgmza-embedded-media' controls src='${mediaUrl}'></video>`);
	    								    				break;
	    								    			case 'audio':
	    								    				editor.writeHtml(`<audio controls src='${mediaUrl}'></audio>`);
	    								    				break;
	    								    		}
	    								    	} else {
	    								    		/* Should be localized */
	    								    		WPGMZA.notification("We couldn't determine the type of media being added");
	    								    	}
	    								    }
    									},
    									{
    										title: 'Select media',
											button: {
												text: 'Add media',
											},
											multiple: false,	
    										library: {
										            type: [ 'video', 'image', 'audio' ]
										    }
    									}
    								);
    							}
							}
						},
						'code-editor' : {
							icon : 'fa fa-code',
							title : 'Code Editor (HTML)',
							action : (editor) => {
								if(!editor._codeEditorActive){
									/* No code editor active yet */
									if(!editor.elements._codeEditor){
										editor.elements._codeEditor = editor.createElement('textarea', ['writersblock-wpgmza-code-editor']);

										editor.elements._codeEditor.setAttribute('placeholder', '<!-- Add HTML Here -->');
										editor.elements.wrap.appendChild(editor.elements._codeEditor);

										editor.elements._codeEditor.__editor = editor;

										/* Use a trigger to update the source based on HTML edits made by the user */
										$(editor.elements._codeEditor).on('wpgmza-writersblock-code-edited', function(){
											const target = $(this).get(0);

											if(target.__editor){
												/* We do have the HTML editor, lets grab the latest input value here, clean it a bit and then send it back */
												let editedHtml = target.__editor.elements._codeEditor.value;
												editedHtml = editedHtml.replaceAll("\n", "");
												
												/* Use the DOM to correct any HTML entered by the user, this allows us to clean up on the fly */
												const validator = document.createElement('div');

												validator.innerHTML = editedHtml;
												if(validator.innerHTML === editedHtml){
													/* HTML is the same as validated by the DOM */
													target.__editor.elements.editor.innerHTML = validator.innerHTML;
													target.__editor.onEditorChange();
												} 
											}
											


										});

										$(editor.elements._codeEditor).on('change input', function(){
											$(this).trigger('wpgmza-writersblock-code-edited');
										});
									}


									editor.elements.editor.classList.add('wpgmza-hidden');
									editor.elements._codeEditor.classList.remove('wpgmza-hidden');
									
									let toolbarItems = editor.elements.toolbar.querySelectorAll('a.tool');
									for(let tool of toolbarItems){
										if(tool.getAttribute('data-value') !== 'codeeditor'){
											tool.classList.add('wpgmza-writersblock-disabled');
										} else {
											tool.classList.add('wpgmza-writersblock-hold-state');
										}
									}

									if(editor.elements.editor.innerHTML && editor.elements.editor.innerHTML.trim().length > 0){
										let sourceHtml = editor.elements.editor.innerHTML;
										sourceHtml = sourceHtml.replaceAll(/<\/(\w+)>/g, "</$1>\n");
										editor.elements._codeEditor.value = sourceHtml;
									}

									editor._codeEditorActive = true;
								} else {
									/* Dispose of the code editor and resync the DOM */
									if(editor.elements._codeEditor){
										editor.elements.editor.classList.remove('wpgmza-hidden');
										editor.elements._codeEditor.classList.add('wpgmza-hidden');

										let toolbarItems = editor.elements.toolbar.querySelectorAll('a.tool');
										for(let tool of toolbarItems){
											if(tool.getAttribute('data-value') !== 'codeeditor'){
												tool.classList.remove('wpgmza-writersblock-disabled');
											} else {
												tool.classList.remove('wpgmza-writersblock-hold-state');
											}
										}
										
										$(editor.elements._codeEditor).trigger('wpgmza-writersblock-code-edited');
									}
									editor._codeEditorActive = false;
								}
							}
						}
					}
				}
			],
			enabledTools : [
				'p', 'h1', 'h2',
				'createlink', 'unlink',
				'bold', 'italic', 'underline', 'strikeThrough',
				'justifyLeft', 'justifyCenter', 'justifyRight',
				'insertUnorderedList', 'insertOrderedList', 
				'insertHorizontalRule', 'custom-media', 'code-editor'
			],
			events : {
				onUpdateSelection : (packet) => {
					if(packet.instance){
						/* WritersBlock will use the last interaction, which means with 'click' events it can be behind by one interaction */
						setTimeout(
							() => {
								const pingedSelection = window.getSelection();
								if(pingedSelection && pingedSelection.toString().trim().length === 0){
									/* Force hide for continuity */
									this.writersblock.hidePopupTools();
								}
							}, 10
						);
					}
				},
			}
		}
	}

	WPGMZA.FeaturePanel.prototype.hasDirtyField = function(field){
		if(this.feature && this.feature._dirtyFields){
			if(this.feature._dirtyFields instanceof Array){
				if(this.feature._dirtyFields.indexOf(field) !== -1){
					return true;
				}
			}
		} else if(!this.feature){
			// Assume all fields are dirty as we are probably adding a new feature
			// This could probably be made a bit more complex, but no reason right now
			return true;
		}
		return false;
	}
	
});
