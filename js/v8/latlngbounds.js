/**
 * @namespace WPGMZA
 * @module LatLngBounds
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.LatLngBounds = function(southWest, northEast)
	{
		
	}
	
	WPGMZA.LatLngBounds.prototype.isInInitialState = function()
	{
		return (this.north == undefined && this.south == undefined && this.west == undefined && this.east == undefined);
	}
	
	WPGMZA.LatLngBounds.prototype.extend = function(latLng)
	{
		if(this.isInInitialState())
		{
			this.north = this.south = this.west = this.east = new WPGMZA.LatLng(latLng);
			return;
		}
		
		if(!(latLng instanceof WPGMZA.LatLng))
			latLng = new WPGMZA.LatLng(latLng);
		
		if(latLng.lat < this.north)
			this.north = latLng.lat;
		
		if(latLng.lat > this.south)
			this.south = latLng.lat;
		
		if(latLng.lng < this.west)
			this.west = latLng.lng;
		
		if(latLng.lng > this.east)
			this.east = latLng.lng;
	}
	
});
