/**
 * @namespace WPGMZA
 * @module DataTable
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.DataTable = function(element)
	{
		$.fn.dataTable.ext.errMode = "throw";
		
		this.element = element;
		this.element.wpgmzaDataTable = this;
		this.dataTableElement = this.getDataTableElement();

		var settings = this.getDataTableSettings();
		
		this.phpClass			= $(element).attr("data-wpgmza-php-class");
		this.dataTable			= $(this.dataTableElement).DataTable(settings);
		this.wpgmzaDataTable	= this;
		
		this.dataTable.ajax.reload();
	}
	
	Object.defineProperty(WPGMZA.DataTable.prototype, "canSendCompressedRequests", {
		
		"get": function() {
			
			return (
				WPGMZA.serverCanInflate == 1 && 
				"Uint8Array" in window && 
				"TextEncoder" in window && 
				!WPGMZA.settings.forceDatatablesPOST && 
				WPGMZA.settings.useCompressedDataTablesRequests
			);
			
		}
		
	});
	
	WPGMZA.DataTable.prototype.getDataTableElement = function()
	{
		return $(this.element).find("table");
	}
	
	/*WPGMZA.DataTable.AjaxURL = function(dataTable)
	{
		this.dataTable = dataTable;
	}
	
	WPGMZA.DataTable.AjaxURL.prototype.toString = function()
	{
		var data 		= this.dataTable.onAJAXRequest(data, settings);
		var element 	= this.dataTable.element;
		var route 		= $(element).attr("data-wpgmza-rest-api-route");
		
		console.log(data);
		
		return "placeholder";
	}*/
	
	var blank = function() {
		
	};
	
	blank.prototype.toString = function()
	{
		return "";
	}
	
	WPGMZA.DataTable.prototype.getDataTableSettings = function()
	{
		var self = this;
		var element = this.element;
		var options = {};
		var route;
		var method = this.canSendCompressedRequests ? "GET" : "POST";
		var url;
		
		if($(element).attr("data-wpgmza-datatable-options"))
			options = JSON.parse($(element).attr("data-wpgmza-datatable-options"));
		
		if(route = $(element).attr("data-wpgmza-rest-api-route"))
		{
			url = WPGMZA.resturl + route;
			
			options.deferLoading = true;
			
			options.ajax = {
				cache: true,
				url: url,
				method: method,	// We don't use GET because the request can get bigger than some browsers maximum URL lengths
				data: function(data, settings) {
					
					var request = self.onAJAXRequest(data, settings);
					
					if(self.canSendCompressedRequests)
					{
						// NB: We use a custom base64 encoding because percent signs are not permitted in the REST URL, and slashes would indicate a path. This is a resource, and not a path
						var customBase64Encoded = request.wpgmzaDataTableRequestData.replace(/\//g, "-");
						
						self.dataTable.ajax.url(url + customBase64Encoded);
						return {};
					}
					
					return request;
					
				},
				beforeSend: function(xhr) {
					xhr.setRequestHeader('X-WP-Nonce', WPGMZA.restnonce);
				}
			};
			
			options.processing = true;
			options.serverSide = true;
		}
		
		if(WPGMZA.AdvancedTableDataTable && this instanceof WPGMZA.AdvancedTableDataTable && WPGMZA.settings.wpgmza_default_items)
			options.iDisplayLength = parseInt(WPGMZA.settings.wpgmza_default_items);
		
		options.aLengthMenu = [5, 10, 25, 50, 100];
		
		var languageURL;

		if(WPGMZA.locale)
			switch(WPGMZA.locale.substr(0, 2))
			{
				case "af":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Afrikaans.json";
					break;

				case "sq":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Albanian.json";
					break;

				case "am":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Amharic.json";
					break;

				case "ar":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Arabic.json";
					break;

				case "hy":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Armenian.json";
					break;

				case "az":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Azerbaijan.json";
					break;

				case "bn":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Bangla.json";
					break;

				case "eu":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Basque.json";
					break;

				case "be":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Belarusian.json";
					break;

				case "bg":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Bulgarian.json";
					break;

				case "ca":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Catalan.json";
					break;

				case "zh":
					if(WPGMZA.locale == "zh_TW")
						languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Chinese-traditional.json";
					else
						languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Chinese.json";
					break;

				case "hr":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Croatian.json";
					break;

				case "cs":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Czech.json";
					break;

				case "da":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Danish.json";
					break;

				case "nl":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Dutch.json";
					break;

				/*case "en":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/English.json";
					break;*/

				case "et":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Estonian.json";
					break;

				case "fi":
					if(WPGMZA.locale.match(/^fil/))
						languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Filipino.json";
					else
						languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Finnish.json";
					break;

				case "fr":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/French.json";
					break;

				case "gl":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Galician.json";
					break;

				case "ka":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Georgian.json";
					break;

				case "de":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/German.json";
					break;

				case "el":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Greek.json";
					break;

				case "gu":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Gujarati.json";
					break;

				case "he":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Hebrew.json";
					break;

				case "hi":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Hindi.json";
					break;

				case "hu":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Hungarian.json";
					break;

				case "is":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Icelandic.json";
					break;

				/*case "id":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Indonesian-Alternative.json";
					break;*/
				
				case "id":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Indonesian.json";
					break;

				case "ga":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Irish.json";
					break;

				case "it":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Italian.json";
					break;

				case "ja":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Japanese.json";
					break;

				case "kk":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Kazakh.json";
					break;

				case "ko":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Korean.json";
					break;

				case "ky":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Kyrgyz.json";
					break;

				case "lv":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Latvian.json";
					break;

				case "lt":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Lithuanian.json";
					break;

				case "mk":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Macedonian.json";
					break;

				case "ml":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Malay.json";
					break;

				case "mn":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Mongolian.json";
					break;

				case "ne":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Nepali.json";
					break;

				case "nb":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Norwegian-Bokmal.json";
					break;
				
				case "nn":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Norwegian-Nynorsk.json";
					break;
				
				case "ps":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Pashto.json";
					break;

				case "fa":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Persian.json";
					break;

				case "pl":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Polish.json";
					break;

				case "pt":
					if(WPGMZA.locale == "pt_BR")
						languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Portuguese-Brasil.json";
					else
						languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Portuguese.json";
					break;
				
				case "ro":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Romanian.json";
					break;

				case "ru":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Russian.json";
					break;

				case "sr":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Serbian.json";
					break;

				case "si":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Sinhala.json";
					break;

				case "sk":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Slovak.json";
					break;

				case "sl":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Slovenian.json";
					break;

				case "es":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Spanish.json";
					break;

				case "sw":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Swahili.json";
					break;

				case "sv":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Swedish.json";
					break;

				case "ta":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Tamil.json";
					break;

				case "te":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/telugu.json";
					break;

				case "th":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Thai.json";
					break;

				case "tr":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Turkish.json";
					break;

				case "uk":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Ukrainian.json";
					break;

				case "ur":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Urdu.json";
					break;

				case "uz":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Uzbek.json";
					break;

				case "vi":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Vietnamese.json";
					break;

				case "cy":
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Welsh.json";
					break;
			}
		
		if(languageURL)
			options.language = {
				"processing": "test",
				"url": languageURL
			};
		
		return options;
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
		
		$.extend(data, params);
		
		var uncompressed = {
			wpgmzaDataTableRequestData: data
		};
		
		if(!this.canSendCompressedRequests)
			return uncompressed;
		
		var string		= JSON.stringify(data);
		var encoder		= new TextEncoder();
		var input		= encoder.encode(string);
		var compressed	= pako.deflate(input);
		
		var raw			= Array.prototype.map.call(compressed, function(ch) {
			return String.fromCharCode(ch);
		}).join("");
		
		var base64		= btoa(raw);
		
		return {
			wpgmzaDataTableRequestData: base64
		};
	}
	
	WPGMZA.DataTable.prototype.onAJAXResponse = function(response)
	{
		
	}
	
	WPGMZA.DataTable.prototype.reload = function()
	{
		this.dataTable.ajax.reload(null, false); // null callback, false for resetPaging
	}
	
});