/**
 * Registers a block and manages all functionality related to that block
 * 
 * In this case, we should/could move over to the block.json approach, but out of respect for legacy block (wpgmza) we are maintaining this structure
 * 
 * Although, this is an attempt at cleaning things up, and making it more modular as we move towards the more native approach in the future.
 * 
 * This should ultimately stranlate well to the newer approach in the future, for now this should meet our needs
 * 
 * @since 9.0.0
 * @for store-locator
*/

(function( blocks, element, components, i18n, wp) {
    var el = element.createElement;

	var __ = i18n.__;
	var Dashicon = components.Dashicon;
	var blockEditor = wp.blockEditor;
	var useBlockProps = blockEditor.useBlockProps;
	var InspectorControls = blockEditor.InspectorControls;
	var PanelBody = components.PanelBody;

	jQuery(($) => {
		/**
		 * Scalable module defined here
		 * 
		 * This allows Pro to improve on basic functionality, and helps stay within our architecture
		*/
		WPGMZA.Integration.Blocks.StoreLocator = function(){
			blocks.registerBlockType('gutenberg-wpgmza/store-locator', this.getDefinition());
		}

		WPGMZA.Integration.Blocks.StoreLocator.createInstance = function() {
			if(WPGMZA.isProVersion()){
				return new WPGMZA.Integration.Blocks.ProStoreLocator();
			}
			return new WPGMZA.Integration.Blocks.StoreLocator();
		}

		WPGMZA.Integration.Blocks.StoreLocator.prototype.onEdit = function(props){
			const inspector = this.getInspector(props);
			const preview = this.getPreview(props);
	
			return [
				inspector,
				preview
			];
		}

		WPGMZA.Integration.Blocks.StoreLocator.prototype.getInspector = function(props){
			let inspector = [];
			if(!!props.isSelected){
				let panel = React.createElement(
					wp.blockEditor.InspectorControls,
					{ key: "inspector" },
					React.createElement(
						wp.components.PanelBody,
						{ title: wp.i18n.__('Defaults') },
						React.createElement(
							wp.components.TextControl,
							{ 
								label : wp.i18n.__("Address"),
								name : 'default_address',
								value : props.attributes.default_address,
								onChange : (value) => {
									props.setAttributes({default_address : value});
								}
							}
						),
						React.createElement(wp.components.SelectControl, {
							name: "default_radius",
							label: wp.i18n.__("Radius"),
							value: props.attributes.default_radius,
							options: this.getRadiusOptions(),
							onChange : (value) => {
								props.setAttributes({default_radius : value});
							}
						}),
					),
					React.createElement(
						wp.components.PanelBody,
						{ title: wp.i18n.__('Separation Redirect') },
						React.createElement(
							wp.components.TextControl,
							{ 
								label : wp.i18n.__("URL"),
								name : 'url',
								value : props.attributes.url,
								onChange : (value) => {
									props.setAttributes({url : value});
								}
							}
						),
						React.createElement(
							"small",
							null,
							wp.i18n.__("Only set this if your map is located on another page")
						)
					)
				);
	
				inspector.push(panel);
			}
			return inspector;
		}

		WPGMZA.Integration.Blocks.StoreLocator.prototype.getPreview = function(props){
			let blockProps = useBlockProps({
				className: props.className + " wpgmza-gutenberg-block-module", key: 'store-locator-preview'
			});
			
			return React.createElement(
				"div",
				{ ...blockProps },
				React.createElement(wp.components.Dashicon, { icon: "store" }),
				React.createElement(
					"span",
					{ "className": "wpgmza-gutenberg-block-title" },
					wp.i18n.__("Your store locator will appear here on your websites front end")
				),
				React.createElement(
					"div",
					{ "className": "wpgmza-gutenberg-block-hint"},
					wp.i18n.__("If used on map page, remember to disable the store locator in your map settings (Maps > Edit > Settings > Store Locator)")
				)
			)
		}

		WPGMZA.Integration.Blocks.StoreLocator.prototype.getDefinition = function(){
			return {
				attributes : this.getAttributes(),
				edit : (props) => {
					return this.onEdit(props);
				},
				save : (props) => { 
					const blockProps = useBlockProps.save();
					return null; 
				}
			};
		}

		WPGMZA.Integration.Blocks.StoreLocator.prototype.getAttributes = function(){
			return {
				url : {type : 'string'},
				default_address : {type : 'string'},
				default_radius : {type : 'string'},
			}
		}

		WPGMZA.Integration.Blocks.StoreLocator.prototype.getRadiusOptions = function(){
			let options =  [
				{
					key: "none",
					value: "none",
					label: wp.i18n.__("Default (As set in map)")
				}
			];
	
			const defaults = "1,2,5,10,25,50,100,200,300";
			let radii = false;
			if(WPGMZA.settings && WPGMZA.settings.storeLocatorRadii){
				if(WPGMZA.settings.storeLocatorRadii.length){
					radii = WPGMZA.settings.storeLocatorRadii;
				}
			}
	
			radii = radii ? radii : defaults;
			radii = radii.split(',');
	
			for(let radius of radii){
				options.push({
					key : parseInt(radius.trim()),
					value : parseInt(radius.trim()),
					label : parseInt(radius.trim())
				});
			}
	
			return options;
		}
	
		WPGMZA.Integration.Blocks.StoreLocator.prototype.getKeywords = function(){
			/* Deprecated - Use Block JSON */
			return [
				'Store Locator', 
				'Store', 
				'Store Finder', 
				'Map', 
				'Maps'
			];
		}
	
		/*
		 * Register the block, but only if we dont have Pro
		 *
		 * If the user is using Pro, it will register the module, with additional options etc
		*/
		if(!WPGMZA.isProVersion()){
			WPGMZA.Integration.Blocks.instances.storeLocator = WPGMZA.Integration.Blocks.StoreLocator.createInstance(); 
		}
	});
})(window.wp.blocks, window.wp.element, window.wp.components, window.wp.i18n, window.wp);