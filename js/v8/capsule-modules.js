/**
 * @namespace WPGMZA
 * @module CapsuleModules
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	WPGMZA.CapsuleModules = function(){

		WPGMZA.EventDispatcher.call(this);
		
		this.proxies = {};
		this.capsules = [];
		this.prepareCapsules();
		this.flagCapsules();
	}

	WPGMZA.extend(WPGMZA.CapsuleModules, WPGMZA.EventDispatcher);

	WPGMZA.CapsuleModules.getConstructor = function(){
		if(WPGMZA.isProVersion())
			return WPGMZA.ProCapsuleModules;
		
		return WPGMZA.CapsuleModules;
	}


	WPGMZA.CapsuleModules.createInstance = function(){
		const constructor = WPGMZA.CapsuleModules.getConstructor();
		return new constructor();
	}

	WPGMZA.CapsuleModules.prototype.proxyMap = function(id, settings){
		if(!this.proxies[id]){
			this.proxies[id] = Object.create(this);
			
			this.proxies[id].id = id;

			this.proxies[id].markers = [];

			this.proxies[id].showPreloader = function(){};
			this.proxies[id].getMarkerByID = function(){ return {}; };

			this.proxies[id].markerFilter = WPGMZA.MarkerFilter.createInstance(this.proxies[id]);
		}

		if(settings){
			this.proxies[id].settings = settings;
		}

		return this.proxies[id];
	}

	WPGMZA.CapsuleModules.prototype.flagCapsules = function(){
		if(this.capsules){
			for(let i in this.capsules){
				if(this.capsules[i].element){
					$(this.capsules[i].element).addClass('wpgmza-capsule-module');
				}
			}
		}
	}

	WPGMZA.CapsuleModules.prototype.prepareCapsules = function(){
		this.registerStoreLocator();
	}

	WPGMZA.CapsuleModules.prototype.registerStoreLocator = function(){
		$('.wpgmza-store-locator').each((index, element) => {
			const mapId = $(element).data('map-id');
			const url = $(element).data('url');
			if(mapId && !WPGMZA.getMapByID(mapId)){
				if(url){
					const settings = $(element).data('map-settings');
					const mapProxy = this.proxyMap(mapId, settings);

					const capsule = {
						type : 'store_locator',
						element : element,
						instance : WPGMZA.StoreLocator.createInstance(mapProxy, element)
					};

					capsule.instance.isCapsule = true;
					capsule.instance.redirectUrl = url;

					this.capsules.push(capsule);
				} else {
					console.warn("WPGMZA: You seem to have added a stadalone store locator without a map page URL. Please add a URL to your shortcode [wpgmza_store_locator id=\"" + mapId + "\" url=\"{URL}\"] and try again");
				}
			}
		});
	}
});