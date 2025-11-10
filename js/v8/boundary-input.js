/**
 * @namespace WPGMZA
 * @module BoundaryInput
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
    WPGMZA.BoundaryInput = function(element, options){
        this.element = $(element);
        this.dataAttributes = this.element.data();

        this.bounds = false;

        this.options = {};
        this.parseOptions(options);

        this.state = {
            initialized : false
        }

        this.bind();
    }

    WPGMZA.extend(WPGMZA.BoundaryInput, WPGMZA.EventDispatcher);

    WPGMZA.BoundaryInput.COORD_PATTERN = /^-?\d+(?:\.\d+)?$/;

    WPGMZA.BoundaryInput.createInstance = function(element, options) {
        return new WPGMZA.BoundaryInput(element, options);
    }

    WPGMZA.BoundaryInput.prototype.parseOptions = function(options){
        if(options){
            for(var i in options){
                this.options[i] = options[i];
            }
        }

        if(this.dataAttributes){
            for(var i in this.dataAttributes){
                this.options[i] = this.dataAttributes[i];
            }
        }
    }

    WPGMZA.BoundaryInput.prototype.bind = function(){
        this.element.find('.wpgmza-boundary-input-corner').each((index, component) => {
            $(component).find('.wpgmza-boundary-component-input').on('input', (event) => {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
            });

            $(component).find('.wpgmza-boundary-component-input').on('change', (event) => {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();

                this.commit();
            });
        })
    }

    WPGMZA.BoundaryInput.prototype.receive = function(southWest, northEast){
        const corners = {
            southWest : southWest ? southWest : false,
            northEast : northEast ? northEast : false
        };

        for(let corner in corners){
            let data = corners[corner];
            if(data){
                if(typeof data === 'string'){
                    let coord = data.split(',');
                    if(coord && coord.length >= 2){
                        let [lat, lng] = coord;
                        if(lat && lng){
                            data = {
                                lat : lat.trim(),
                                lng : lng.trim()
                            };
                        } else {
                            data = false;
                        }
                    } else {
                        data = false;
                    }
                }

                if(data && data instanceof Object && data.lat && data.lng){
                    this.element.find(`.wpgmza-boundary-input-corner[data-corner="${corner}"] .wpgmza-boundary-component-input[data-boundary-component="lat"]`).val(data.lat);
                    this.element.find(`.wpgmza-boundary-input-corner[data-corner="${corner}"] .wpgmza-boundary-component-input[data-boundary-component="lng"]`).val(data.lng);

                    corners[corner] = data;
                }
            }
        }

        this.setBounds(corners);
    }

    WPGMZA.BoundaryInput.prototype.commit = function(){
        const corners = {
            southWest : {
                lat : false,
                lng : false
            },
            northEast : {
                lat : false,
                lng : false
            }
        };

        for(let corner in corners){
            for(let coord in corners[corner]){
                corners[corner][coord] = this.element.find(`.wpgmza-boundary-input-corner[data-corner="${corner}"] .wpgmza-boundary-component-input[data-boundary-component="${coord}"]`).val().trim();
            }
        }

        this.setBounds(corners);
        if(this.options.update && typeof this.options.update === 'function'){
            const bounds = this.getBounds();
            if(bounds){
                this.options.update(this.getBounds());
            }
        }
    }

    WPGMZA.BoundaryInput.prototype.reset = function(){
        if(this.element.find(`.wpgmza-boundary-input-corner .wpgmza-boundary-component-input[data-boundary-component]`).length){
            this.element.find(`.wpgmza-boundary-input-corner .wpgmza-boundary-component-input[data-boundary-component]`).val("");
        }
    }

    WPGMZA.BoundaryInput.prototype.getBounds = function(){
        return this.bounds ? this.bounds : false;
    }

    WPGMZA.BoundaryInput.prototype.setBounds = function(corners){
        if(this.validateCorners(corners)){
            this.bounds = new WPGMZA.LatLngBounds(new WPGMZA.LatLng(corners.southWest), new WPGMZA.LatLng(corners.northEast));
        } else {
            this.bounds = false;
        }
    }

    WPGMZA.BoundaryInput.prototype.validateCorners = function(corners){
        if(corners && corners instanceof Object && corners.southWest && corners.northEast){
            if(corners.northEast.lat && corners.northEast.lng && corners.southWest.lat && corners.southWest.lng){
                let coords = [corners.northEast.lat, corners.northEast.lng, corners.southWest.lat, corners.southWest.lng];

                for(let coord of coords){
                    if(!WPGMZA.BoundaryInput.COORD_PATTERN.test(`${coord}`)) {
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    }
});