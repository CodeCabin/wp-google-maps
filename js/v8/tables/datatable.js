/**
 * @namespace WPGMZA
 * @module DataTable
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.DataTable = function(element)
	{
		var self = this;
		if(!$.fn.dataTable)
		{
			console.warn("The dataTables library is not loaded. Cannot create a dataTable. Did you enable 'Do not enqueue dataTables'?");
			
			if(WPGMZA.settings.wpgmza_do_not_enqueue_datatables && WPGMZA.getCurrentPage() == WPGMZA.PAGE_MAP_EDIT)
				alert("You have selected 'Do not enqueue DataTables' in WP Google Maps' settings. No 3rd party software is loading the DataTables library. Because of this, the marker table cannot load. Please uncheck this option to use the marker table.");
			
			return;
		}
		
		if($.fn.dataTable.ext)
			$.fn.dataTable.ext.errMode = "throw";
		else
		{
			var version = $.fn.dataTable.version ? $.fn.dataTable.version : "unknown";
			
			console.warn("You appear to be running an outdated or modified version of the dataTables library. This may cause issues with table functionality. This is usually caused by 3rd party software loading an older version of DataTables. The loaded version is " + version + ", we recommend version 1.10.12 or above.");
		}
		
		this.element = element;
		this.element.wpgmzaDataTable = this;
		this.dataTableElement = this.getDataTableElement();

		var settings = this.getDataTableSettings();
		
		this.phpClass			= $(element).attr("data-wpgmza-php-class");
		this.wpgmzaDataTable	= this;
		
		this.useCompressedPathVariable = (WPGMZA.restAPI.isCompressedPathVariableSupported && WPGMZA.settings.enable_compressed_path_variables);
		this.method = (this.useCompressedPathVariable ? "GET" : "POST");
		
		if(this.getLanguageURL() == undefined || this.getLanguageURL() == "//cdn.datatables.net/plug-ins/1.10.12/i18n/English.json") 
		{
			this.dataTable			= $(this.dataTableElement).DataTable(settings);
			this.dataTable.ajax.reload();
		}
		else{
		
			$.ajax(this.getLanguageURL(), {

				success: function(response, status, xhr)
				{
					self.languageJSON = response;
					self.dataTable = $(self.dataTableElement).DataTable(settings);
					self.dataTable.ajax.reload();
				}
				
			  });
		}
	}
	
	WPGMZA.DataTable.prototype.getDataTableElement = function()
	{
		return $(this.element).find("table");
	}
	
	/**
	 * This function wraps the request so it doesn't collide with WP query vars,
	 * it also adds the PHP class so that the controller knows which class to 
	 * instantiate
	 * @return object
	 */
	WPGMZA.DataTable.prototype.onAJAXRequest = function(data, settings)
	{
		// TODO: Move this to the REST API module and add useCompressedPathVariable
		var params = {
			"phpClass":	this.phpClass
		};
		
		var attr = $(this.element).attr("data-wpgmza-ajax-parameters");
		if(attr)
			$.extend(params, JSON.parse(attr));
		
		return $.extend(data, params);
	}
	
	WPGMZA.DataTable.prototype.onDataTableAjaxRequest = function(data, callback, settings)
	{
		var self = this;
		var element = this.element;
		var route = $(element).attr("data-wpgmza-rest-api-route");
		var params = this.onAJAXRequest(data, settings);
		var draw = params.draw;
		
		delete params.draw;
		
		if(!route)
			throw new Error("No data-wpgmza-rest-api-route attribute specified");
		
		var options = {
			method: "POST",
			useCompressedPathVariable: true,
			data: params,
			dataType: "json",
			cache: !this.preventCaching,
			beforeSend: function(xhr) {
				// Put draw in header, for compressed requests
				xhr.setRequestHeader("X-DataTables-Draw", draw);
			},
			success: function(response, status, xhr) {
				
				response.draw = draw;
				self.lastResponse = response;
				
				callback(response);
				self.onAJAXResponse(response);
				
			}
		};
		
		return WPGMZA.restAPI.call(route, options);
	}
	
	WPGMZA.DataTable.prototype.getDataTableSettings = function()
	{
		var self = this;
		var element = this.element;
		var options = {};
		
		if($(element).attr("data-wpgmza-datatable-options"))
			options = JSON.parse($(element).attr("data-wpgmza-datatable-options"));
	
		options.deferLoading = true;
		options.processing = true;
		options.serverSide = true;
		options.ajax = function(data, callback, settings) { 
			return WPGMZA.DataTable.prototype.onDataTableAjaxRequest.apply(self, arguments); 
		}
		
		if(WPGMZA.AdvancedTableDataTable && this instanceof WPGMZA.AdvancedTableDataTable && WPGMZA.settings.wpgmza_default_items)
			options.iDisplayLength = parseInt(WPGMZA.settings.wpgmza_default_items);
		
		options.aLengthMenu = [[5, 10, 25, 50, 100, -1], ["5", "10", "25", "50", "100", WPGMZA.localized_strings.all]];
		
		var languageURL = this.getLanguageURL();
		if(languageURL)
			options.language = {
				"url": languageURL
			};
		
		return options;
	}
	
	WPGMZA.DataTable.prototype.getLanguageURL = function()
	{
		if(!WPGMZA.locale)
			return null;
		
		var languageURL;
		
		switch(WPGMZA.locale.substr(0, 2))
		{
			case "af":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Afrikaans.json";
				break;

			case "sq":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Albanian.json";
				break;

			case "am":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Amharic.json";
				break;

			case "ar":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Arabic.json";
				break;

			case "hy":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Armenian.json";
				break;

			case "az":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Azerbaijan.json";
				break;

			case "bn":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Bangla.json";
				break;

			case "eu":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Basque.json";
				break;

			case "be":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Belarusian.json";
				break;

			case "bg":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Bulgarian.json";
				break;

			case "ca":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Catalan.json";
				break;

			case "zh":
				if(WPGMZA.locale == "zh_TW")
					languageURL = WPGMZA.pluginDirURL + "languages/datatables/Chinese-traditional.json";
				else
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Chinese.json";
				break;

			case "hr":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Croatian.json";
				break;

			case "cs":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Czech.json";
				break;

			case "da":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Danish.json";
				break;

			case "nl":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Dutch.json";
				break;

			/*case "en":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/English.json";
				break;*/

			case "et":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Estonian.json";
				break;

			case "fi":
				if(WPGMZA.locale.match(/^fil/))
					languageURL = WPGMZA.pluginDirURL + "languages/datatables/Filipino.json";
				else
					languageURL = WPGMZA.pluginDirURL + "languages/datatables/Finnish.json";
				break;

			case "fr":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/French.json";
				break;

			case "gl":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Galician.json";
				break;

			case "ka":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Georgian.json";
				break;

			case "de":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/German.json";
				break;

			case "el":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Greek.json";
				break;

			case "gu":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Gujarati.json";
				break;

			case "he":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Hebrew.json";
				break;

			case "hi":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Hindi.json";
				break;

			case "hu":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Hungarian.json";
				break;

			case "is":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Icelandic.json";
				break;

			/*case "id":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Indonesian-Alternative.json";
				break;*/
			
			case "id":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Indonesian.json";
				break;

			case "ga":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Irish.json";
				break;

			case "it":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Italian.json";
				break;

			case "ja":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Japanese.json";
				break;

			case "kk":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Kazakh.json";
				break;

			case "ko":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Korean.json";
				break;

			case "ky":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Kyrgyz.json";
				break;

			case "lv":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Latvian.json";
				break;

			case "lt":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Lithuanian.json";
				break;

			case "mk":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Macedonian.json";
				break;

			case "ml":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Malay.json";
				break;

			case "mn":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Mongolian.json";
				break;

			case "ne":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Nepali.json";
				break;

			case "nb":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Norwegian-Bokmal.json";
				break;
			
			case "nn":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Norwegian-Nynorsk.json";
				break;
			
			case "ps":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Pashto.json";
				break;

			case "fa":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Persian.json";
				break;

			case "pl":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Polish.json";
				break;

			case "pt":
				if(WPGMZA.locale == "pt_BR")
					languageURL = WPGMZA.pluginDirURL + "languages/datatables/Portuguese-Brasil.json";
				else
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Portuguese.json";
				break;
			
			case "ro":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Romanian.json";
				break;

			case "ru":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Russian.json";
				break;

			case "sr":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Serbian.json";
				break;

			case "si":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Sinhala.json";
				break;

			case "sk":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Slovak.json";
				break;

			case "sl":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Slovenian.json";
				break;

			case "es":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Spanish.json";
				break;

			case "sw":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Swahili.json";
				break;

			case "sv":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Swedish.json";
				break;

			case "ta":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Tamil.json";
				break;

			case "te":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/telugu.json";
				break;

			case "th":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Thai.json";
				break;

			case "tr":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Turkish.json";
				break;

			case "uk":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Ukrainian.json";
				break;

			case "ur":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Urdu.json";
				break;

			case "uz":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Uzbek.json";
				break;

			case "vi":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Vietnamese.json";
				break;

			case "cy":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Welsh.json";
				break;
		}
		
		return languageURL;
	}
	
	WPGMZA.DataTable.prototype.onAJAXResponse = function(response)
	{
		
	}
	
	WPGMZA.DataTable.prototype.reload = function()
	{
		this.dataTable.ajax.reload(null, false); // null callback, false for resetPaging
	}
	
});