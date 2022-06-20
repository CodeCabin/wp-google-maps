/**
 * @namespace WPGMZA
 * @module XMLParseWebWorker
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.loadXMLAsWebWorker = function()
	{
		// tXml by Tobias Nickel
		/**
		 * @author: Tobias Nickel
		 * @created: 06.04.2015
		 * I needed a small xmlparser chat can be used in a worker.
		 */
		function tXml(a,d){function c(){for(var l=[];a[b];){if(60==a.charCodeAt(b)){if(47===a.charCodeAt(b+1)){b=a.indexOf(">",b);break}else if(33===a.charCodeAt(b+1)){if(45==a.charCodeAt(b+2)){for(;62!==a.charCodeAt(b)||45!=a.charCodeAt(b-1)||45!=a.charCodeAt(b-2)||-1==b;)b=a.indexOf(">",b+1);-1===b&&(b=a.length)}else for(b+=2;62!==a.charCodeAt(b);)b++;b++;continue}var c=f();l.push(c)}else c=b,b=a.indexOf("<",b)-1,-2===b&&(b=a.length),c=a.slice(c,b+1),0<c.trim().length&&l.push(c);b++}return l}function l(){for(var c=
		b;-1===g.indexOf(a[b]);)b++;return a.slice(c,b)}function f(){var d={};b++;d.tagName=l();for(var f=!1;62!==a.charCodeAt(b);){var e=a.charCodeAt(b);if(64<e&&91>e||96<e&&123>e){for(var g=l(),e=a.charCodeAt(b);39!==e&&34!==e&&!(64<e&&91>e||96<e&&123>e)&&62!==e;)b++,e=a.charCodeAt(b);f||(d.attributes={},f=!0);if(39===e||34===e){var e=a[b],h=++b;b=a.indexOf(e,h);e=a.slice(h,b)}else e=null,b--;d.attributes[g]=e}b++}47!==a.charCodeAt(b-1)&&("script"==d.tagName?(f=b+1,b=a.indexOf("\x3c/script>",b),d.children=
		[a.slice(f,b-1)],b+=8):"style"==d.tagName?(f=b+1,b=a.indexOf("</style>",b),d.children=[a.slice(f,b-1)],b+=7):-1==k.indexOf(d.tagName)&&(b++,d.children=c(g)));return d}d=d||{};var g="\n\t>/= ",k=["img","br","input","meta","link"],h=null;if(d.searchId){var b=(new RegExp("s*ids*=s*['\"]"+d.searchId+"['\"]")).exec(a).index;-1!==b&&(b=a.lastIndexOf("<",b),-1!==b&&(h=f()));return b}b=0;h=c();d.filter&&(h=tXml.filter(h,d.filter));d.simplify&&(h=tXml.simplefy(h));return h}
		tXml.simplify=function(a){var d={};if(1===a.length&&"string"==typeof a[0])return a[0];a.forEach(function(a){d[a.tagName]||(d[a.tagName]=[]);if("object"==typeof a){var c=tXml.simplefy(a.children);d[a.tagName].push(c);a.attributes&&(c._attributes=a.attributes)}else d[a.tagName].push(a)});for(var c in d)1==d[c].length&&(d[c]=d[c][0]);return d};tXml.filter=function(a,d){var c=[];a.forEach(function(a){"object"===typeof a&&d(a)&&c.push(a);a.children&&(a=tXml.filter(a.children,d),c=c.concat(a))});return c};
		tXml.domToXml=function(a){function d(a){if(a)for(var f=0;f<a.length;f++)if("string"==typeof a[f])c+=a[f].trim();else{var g=a[f];c+="<"+g.tagName;var k=void 0;for(k in g.attributes)c=-1===g.attributes[k].indexOf('"')?c+(" "+k+'="'+g.attributes[k].trim()+'"'):c+(" "+k+"='"+g.attributes[k].trim()+"'");c+=">";d(g.children);c+="</"+g.tagName+">"}}var c="";d(O);return c};"object"!==typeof window&&(module.exports=tXml);
		
		var worker = self;
		var inputData;
		var dataForMainThread = [];
		var filesLoaded = 0;
		var totalFiles;
		
		function onXMLLoaded(request)
		{
			if(request.readyState != 4 || request.status != 200)
				return;
			
			var start	= new Date().getTime();
			var xml		= tXml(request.responseText);
			
			convertAndAppend(xml);
			
			if(++filesLoaded >= totalFiles)
			{
				worker.postMessage(dataForMainThread);
				return;
			}
			
			loadNextFile();
		}
		
		function convertAndAppend(xml)
		{
			var root	= xml[0];
			var markers	= root.children[0];
			var json	= [];
			var remap	= {
				"marker_id":	"id",
				"linkd":		"link"
			};
			
			for(var i = 0; i < markers.children.length; i++)
			{
				var data = {};
				
				markers.children[i].children.forEach(function(node) {
					
					var key = node.tagName;
					
					if(remap[key])
						key = remap[key];
					
					if(node.attributes["data-json"])
						data[key] = JSON.parse(node.children[0]);
					else
					{
						if(node.children.length)
							data[key] = node.children[0];
						else
							data[key] = "";
					}
					
				});
				
				dataForMainThread.push(data);
			}
		}
		
		function loadNextFile()
		{
			var url = inputData.urls[filesLoaded];
			var request = new XMLHttpRequest();
			
			request.onreadystatechange = function() {
				onXMLLoaded(this);
			};
			
			request.open("GET", inputData.protocol + url, true);
			request.send();
		}
		
		self.addEventListener("message", function(event) {
			
			var data = event.data;
			
			switch(data.command)
			{
				case "load":
				
					inputData = data;
					dataForMainThread = [];
					filesLoaded = 0;
					totalFiles = data.urls.length;
					
					loadNextFile();
					
					break;
				
				default:
					throw new Error("Unknown command");
					break;
			}
			
		}, false);
		
	}
	
});