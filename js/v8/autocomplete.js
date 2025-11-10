/**
 * @namespace WPGMZA
 * @module Autocomplete
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
    /**
	 * Autocomplete base class 
	 */
	WPGMZA.Autocomplete = function(element, options) {
		WPGMZA.EventDispatcher.call(this);

        if(!options){
			options = {};
        }

        this.element = element;
        this.options = options;

        this.provider = false;

        this.state = {
            ready : false,
            busy : false,
            internal : false,
            term : false,
            items : []
        };

        this.components = {};

        if(this.canAutoload()){
            this.autoload();
        }
	}
	
	WPGMZA.extend(WPGMZA.Autocomplete, WPGMZA.EventDispatcher);

    /* Valid provider list */
    WPGMZA.Autocomplete.Providers = {
		GOOGLE_AUTOCOMPLETE : 1,
		GOOGLE_PLACES : 2,
		CLOUD_API : 3,
        NOMINATIM : 4,
        AZURE_MAPS : 5,
        LOCATION_IQ : 6
	};

    /* Default intervals */
    WPGMZA.Autocomplete.Intervals = {
        KEYSTROKE : 700,
        FOCUS : 400
    };
    
    /**
     * Static instance creation method
     * 
     * @param any element 
     * @param object options 
     * 
     * @return any
     */
	WPGMZA.Autocomplete.createInstance = function(element, options) {
		let constructor;
		
        let provider = WPGMZA.settings && WPGMZA.settings.address_provider ? WPGMZA.settings.address_provider : false;
        if(!provider){
            /* Provider unknown, use engine default */
            if(WPGMZA.settings && WPGMZA.settings.engine){
                switch(WPGMZA.settings.engine){
                    case 'google-maps':
                        /* Google Maps - Prefer autocomplete, with auto-swap to places */
                        provider = WPGMZA.Autocomplete.Providers.GOOGLE_AUTOCOMPLETE;
                        break;
                    case 'open-layers':
                    case 'open-layers-latest':
                    case 'leaflet':
                    case 'leaflet-stadia':
                    case 'leaflet-maptiler':
                    case 'leaflet-zerocost':
                        /* Nominatim */
                        provider = WPGMZA.Autocomplete.Providers.NOMINATIM;
                        break;
                    case 'leaflet-azure':
                        /* Azure */
                        provider = WPGMZA.Autocomplete.Providers.AZURE_MAPS;
                        break;
                    case 'leaflet-locationiq':
                        /* LocationIQ */
                        provider = WPGMZA.Autocomplete.Providers.LOCATION_IQ;
                        break;
                }
            }

            if(WPGMZA.CloudAPI && WPGMZA.CloudAPI.isBeingUsed){
                provider = WPGMZA.Autocomplete.Providers.CLOUD_API;
            }
        } else if (typeof provider === 'string'){
            switch(provider){
                case 'google-maps':
                    /* Google Maps - Prefer autocomplete, with auto-swap to places */
                    provider = WPGMZA.Autocomplete.Providers.GOOGLE_AUTOCOMPLETE;
                    break;
                case 'nominatim':
                    /* Nominatim */
                    provider = WPGMZA.Autocomplete.Providers.NOMINATIM;
                    break;
                case 'azure-maps':
                    /* Azure */
                    provider = WPGMZA.Autocomplete.Providers.AZURE_MAPS;
                    break;
                case 'location-iq':
                    /* Azure */
                    provider = WPGMZA.Autocomplete.Providers.LOCATION_IQ;
                    break;
            }
        }

        switch(provider){
            case WPGMZA.Autocomplete.Providers.GOOGLE_AUTOCOMPLETE:
            case WPGMZA.Autocomplete.Providers.GOOGLE_PLACES:
                /* Google Autocomplete */
                constructor = WPGMZA.GoogleAutocomplete;
                break;
            case WPGMZA.Autocomplete.Providers.CLOUD_API:
                /* Cloud (Legacy) Autocomplete */
                /* Note : Does not extend autocomplete base - Functions independently */
                constructor = WPGMZA.CloudAutocomplete;
                break;
            case WPGMZA.Autocomplete.Providers.NOMINATIM:
                /* Nominatim Autocomplete */
                constructor = WPGMZA.NominatimAutocomplete;
                break;
            case WPGMZA.Autocomplete.Providers.AZURE_MAPS:
                /* Azure Autocomplete */
                constructor = WPGMZA.AzureAutocomplete;
                break;
            case WPGMZA.Autocomplete.Providers.LOCATION_IQ:
                /* LocationIQ Autocomplete */
                constructor = WPGMZA.LocationIQAutocomplete;
                break;
            default:
                /* Use the base - Which will likely do nothing */
                constructor = WPGMZA.Autocomplete;
                break;
        }

        return new constructor(element, options);
	}

    /**
     * Check if we are allowed to autoload
     * 
     * This is true for all address inputs, with the exception of the marker address admin input 
     * 
     * @return bool
     */
    WPGMZA.Autocomplete.prototype.canAutoload = function(){
		if(this.element && this.element.id && this.element.id === 'wpgmza_add_address_map_editor'){
			return false;
		}
		return true;
    }

    /**
     * Autoload the instance
     * 
     * This is only helpful if you have extended the system into a sub-class as the default class will not
     * produce any UI
     * 
     * @return void
     */
    WPGMZA.Autocomplete.prototype.autoload = function(){
        this.provider = this.getProvider();
    }

    /**
     * Prepare the system for internal suggestions
     * 
     * Marks the instance as internal, generates components, links back to element and places placeholders
     * 
     * Once complete, binds the events to the element
     * 
     * @return void
     */
    WPGMZA.Autocomplete.prototype.prepare = function(){
        this.setInternal(true);
        this.generate();

        this.element.wpgmzaAutocomplete = this;
        this.element.setAttribute('data-address-provider', this.getProviderSlug());

        let placeholder = this.options.placeholder ? this.placeholder : false;
        if(!placeholder && !this.element.getAttribute('placeholder')){
            placeholder = WPGMZA.localized_strings && WPGMZA.localized_strings.autocomplete_placeholder ? WPGMZA.localized_strings.autocomplete_placeholder : false;
        }

        if(placeholder){
			this.element.setAttribute('placeholder', placeholder);
		}

        this.element.setAttribute('autocomplete', 'off');

        this.bind();
    }

    /**
     * Generate the components list element
     * 
     * We use this for presenting the list to the end user
     * 
     * @return void
     */
    WPGMZA.Autocomplete.prototype.generate = function(){
        if(!this.isInternal()){
            return;
        }

        this.components.list = document.createElement('div');

        this.components.list.classList.add('wpgmza-hidden');
        this.components.list.classList.add('wpgmza-internal-autocomplete-list');

		document.body.appendChild(this.components.list);
    }

    /**
     * Bind event listeners to the UI elements
     * 
     * Only runs in internal mode
     * 
     * @return void
     */
    WPGMZA.Autocomplete.prototype.bind = function(){
        if(!this.isInternal()){
            return;
        }

        this.element.addEventListener("keyup", (event) => {
			if(event.key.length > 1){
				/* Ignore these as they are likely mutators */
				if(event.key !== "Backspace"){
					return;
				}
			}

			if(this.state.timer){
				clearTimeout(this.state.timer);
			}

			/* We have a valid key so we can go about performing a search */

			this.state.timer = setTimeout(() => {
                if(this.element.value && this.element.value.trim() !== this.state.term){
                    this.setBusy(true);
				    this.find();
                }
			}, this.options.keystrokeInterval ? this.options.keystrokeInterval : WPGMZA.Autocomplete.Intervals.KEYSTROKE);
		});

		this.element.addEventListener("focusout", (event) => {
			setTimeout(() => {
                if(document.activeElement === this.element){
                    /* Has not actually lost focus yet */
                    return;
                }
				this.hide();
			}, this.options.focusInterval ? this.options.focusInterval : WPGMZA.Autocomplete.Intervals.FOCUS);
		});

		this.element.addEventListener("focusin", (event) => {
			this.show();
			this.autoplace();
		});

		this.element.addEventListener("click", (event) => {
			this.show();
			this.autoplace();
		});

		document.addEventListener("scroll", (event) => {
			this.hide();
		});
    }

    /**
     * Find locations based on the search term
     * 
     * This will only run if/when you have an extension class that contains additional logic for the requests
     * 
     * The base method will only set the search term, hide the popup and clear any pending items
     * 
     * @return void
     */
    WPGMZA.Autocomplete.prototype.find = function(){
        this.setTerm(this.element.value);
        
        if(this.getTerm()){
            /* We have a term, a request will likely run, clear the list */
            this.hide();
            
            this.clear();
        } else {
            this.setBusy(false);
        }
    }

    /**
     * Present items to the user to select from the list
     * 
     * This requires items to be stored in the state, with the correct formatting for our internal modules
     * 
     * Once ready we will bind event listeners and show the list
     * 
     * @return void
     */
    WPGMZA.Autocomplete.prototype.present = function(){
        if(this.state.items && this.state.items.length){
            let html = '';
			for(let location of this.state.items){
                if(location.address){
                    let dataAddress = location.address.replace(/<[^>]*>/g, '');
                    html += `<div class='wpgmza-internal-autocomplete-location' data-address='${dataAddress}' data-coordinates='${location.coordinates ? location.coordinates : ''}'>`;
                    if(location.display){
                        /* Has a different display value */
                        html += `<strong data-autocomplete-field='display'>${location.display}</strong>`;
					    html += `<span data-autocomplete-field='adr'>${location.address}</span>`;
                    } else {
                        /* Use address as if it was display */
                        html += `<strong data-autocomplete-field='display'>${location.address}</strong>`;
                    }

					if(location.type || location.country){
					    html += `<span data-autocomplete-meta-list>`;
                        if(location.type){
                            html += `<small data-autocomplete-field='type'>${location.type}</small>`;
                        }

                        if(location.country){
                            html += `<small data-autocomplete-field='country'>${location.country}</small>`;
                        }
                        html += `</span>`;

                    }

					html += `</div>`;
                }

                if(html && html.length){
                    this.components.list.innerHTML = html;

                    this.show();
                    this.autoplace();

                    /* Now bind the event listener, and make it fill the field on click */
                    const items = this.components.list.querySelectorAll('.wpgmza-internal-autocomplete-location');
                    for(let item of items){
                        item.addEventListener('click', (event) => {
                            event.preventDefault();

                            let address = item.getAttribute('data-address');
                            if(address){
                                this.element.value = address;
                            }
                            
                            this.hide();
                            this.clear();

                            this.state.term = "";
                        });
                    }
                }
			}
        } else {
            this.hide();
        }
    }

    /**
     * Show the suggestion list
     * 
     * Only works if we have items in the list
     * 
     * @return void
     */
    WPGMZA.Autocomplete.prototype.show = function(){
        if(!this.isInternal()){
            return;
        }

        if(this.components && this.components.list && this.state.items && this.state.items.length){
            this.components.list.classList.remove('wpgmza-hidden');
        }
	}

    /**
     * Hide the suggestion list
     * 
     * @return void
     */
	WPGMZA.Autocomplete.prototype.hide = function(){
        if(!this.isInternal()){
            return;
        }

        if(this.components && this.components.list){
            this.components.list.classList.add('wpgmza-hidden');
        }
	}

    /**
     * Correct placement of the autocomplete list
     * 
     * Useful as/when a content shift or browser scroll happens
     * 
     * @return void
     */
	WPGMZA.Autocomplete.prototype.autoplace = function(){
        if(!this.isInternal()){
            return;
        }

        if(this.components && this.components.list){
            const target = this.element;
            const boundingRect = target.getBoundingClientRect();
            if(boundingRect.width){
                this.components.list.style.width = `${boundingRect.width}px`;
                this.components.list.style.left = `${boundingRect.left}px`;
                this.components.list.style.top = `${boundingRect.bottom}px`;
            }
        }
	}

    /**
     * Clear the items and empty the HTML within the list
     * 
     * @return void
     */
    WPGMZA.Autocomplete.prototype.clear = function(){
        if(!this.isInternal()){
            return;
        }

        this.clearItems();
        this.components.list.innerHtml = "";
    }

    /**
     * Get the current search term
     * 
     * @return string
     */
    WPGMZA.Autocomplete.prototype.getTerm = function(){
        return this.state.term && typeof this.state.term === 'string' && this.state.term.length ? this.state.term : false;
    }

    /**
     * Set the current search term
     * 
     * @param string term
     * 
     * @return void
     */
    WPGMZA.Autocomplete.prototype.setTerm = function(term){
        if(term && term.trim() !== this.state.term){
            this.state.term = term.trim();
        }
    }

    /**
     * Clear the current items list
     * 
     * @return void
     */
    WPGMZA.Autocomplete.prototype.clearItems = function(){
        this.setItems([]);
    }

    /**
     * Set the current items list within the state controller
     * 
     * This must be an array, and will be passed through the remapItem method for filtering within any sub-class
     * 
     * @param array items 
     * 
     * @return void
     */
    WPGMZA.Autocomplete.prototype.setItems = function(items){
        let remapped = [];
        if(items && items instanceof Array){
            for(let item of items){
                let remap = this.remapItem(item);
                if(remap){
                    remapped.push(remap);
                }
            }
        }
        this.state.items = remapped;
    }

    /**
     * Remap a location item into our local structure
     * 
     * In this base method we do nothing with this, but in your sub class, you would convert the returned data into
     * the same structure we expect (display, address, coordinates, type)
     * 
     * @param object item 
     * 
     * @return object
     */
    WPGMZA.Autocomplete.prototype.remapItem = function(item){
        return item;
    }

    /**
     * Get the internal service provider
     * 
     * This can change internally, as seen in the Google Autocomplete module where we might switch between legacy and the places API
     * 
     * In this case we return false to prevent any application
     * 
     * @return int
     */
    WPGMZA.Autocomplete.prototype.getProvider = function() {
        return false;
    }

    /**
     * Converts a provider type (enum) into a string tag
     * 
     * @return string
     */
    WPGMZA.Autocomplete.prototype.getProviderSlug = function(){
        let slug = 'generic'
        switch(this.getProvider()){
            case WPGMZA.Autocomplete.Providers.GOOGLE_AUTOCOMPLETE:
                slug = 'google-autocomplete';
                break;
            case WPGMZA.Autocomplete.Providers.GOOGLE_PLACES:
                slug = 'google-places-search';
                break;
            case WPGMZA.Autocomplete.Providers.CLOUD_API:
                slug = 'legacy-cloud';
                break;
            case WPGMZA.Autocomplete.Providers.GOOGLE_PLACES:
                slug = 'nominatim';
                break;
        }
        return slug;
    }

    /**
     * Check if this autocomplete instance is being managed internally for it's UI or not
     * 
     * @return bool
     */
    WPGMZA.Autocomplete.prototype.isInternal = function(){
        return this.state.internal;
    }

    /**
     * Set this instance as an internal module
     * 
     * @param bool internal 
     * 
     * @return void
     */
    WPGMZA.Autocomplete.prototype.setInternal = function(internal){
        this.state.internal = internal;
    }

    /**
     * Check if this instance is ready to be used
     * 
     * @return bool
     */
    WPGMZA.Autocomplete.prototype.isReady = function(){
        return this.state.ready;
    }

    /**
     * Set this instance as ready to be used
     * 
     * You should do this in your sub modules during the prepare or autoload phases
     * 
     * @param bool ready 
     * 
     * @return void
     */
    WPGMZA.Autocomplete.prototype.setReady = function(ready){
        this.state.ready = ready;
    }

    /**
     * Mark this instance as busy or not
     * 
     * We will add a special attribute to the element or it's parent to help with styling this 
     * 
     * @param bool busy 
     * 
     * @return void
     */
    WPGMZA.Autocomplete.prototype.setBusy = function(busy){
        this.state.busy = busy;

        if(this.element){
            let target = this.element;
            if(target.parentNode && target.parentNode.classList){
                const parentClassList = ['wpgmza-address-container', 'wpgmza-marker-editor-address-field', 'wpgmza-directions-input-row'];
                for(let parentClass of parentClassList){
                    if(target.parentNode.classList.contains(parentClass)){
                        target = target.parentNode;
                    }
                }
            }

            target.setAttribute('data-autocomplete-state', busy ? 'busy' : '');
        }
    }
});