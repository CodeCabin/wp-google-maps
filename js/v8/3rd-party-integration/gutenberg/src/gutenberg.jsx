/**
 * @namespace WPGMZA.Integration
 * @module Gutenberg
 * @requires WPGMZA.Integration
 * @requires wp-i18n
 * @requires wp-blocks
 * @requires wp-components
 */

/**
 * Internal block libraries
 */
jQuery(function($) {

	if(!window.wp || !wp.i18n || !wp.blocks || !wp.editor || !wp.components)
		return;
	
	const { __ } = wp.i18n;

	const { registerBlockType } = wp.blocks;

	const {
		InspectorControls,
		BlockControls
	} = wp.editor;

	const {
		Dashicon,
		Toolbar,
		Button,
		Tooltip,
		PanelBody,
		TextareaControl,
		CheckboxControl,
		TextControl,
		SelectControl,
		RichText
	} = wp.components;
	
	WPGMZA.Integration.Gutenberg = function()
	{
		registerBlockType( 'gutenberg-wpgmza/block', this.getBlockDefinition() );
	}
	
	WPGMZA.Integration.Gutenberg.prototype.getBlockTitle = function()
	{
		return __("WP Go Maps");
	}
	
	WPGMZA.Integration.Gutenberg.prototype.getBlockInspectorControls = function(props)
	{
		
		
		/*
		<TextControl
						name="overrideWidthAmount"
						label={__("Override Width Amount")}
						checked={props.overrideWidthAmount}
						onChange={onPropertiesChanged}
						/>
					
					<SelectControl
						name="overrideWidthUnits"
						label={__("Override Width Units")}
						options={[
							{value: "px", label: "px"},
							{value: "%", label: "%"},
							{value: "vw`", label: "vw"},
							{value: "vh", label: "vh"}
						]}
						onChange={onPropertiesChanged}
						/>
						
					<CheckboxControl
						name="overrideHeight"
						label={__("Override Height")}
						checked={props.overrideWidth}
						onChange={onPropertiesChanged}
						/>
						
					<TextControl
						name="overrideHeightAmount"
						label={__("Override Height Amount")}
						checked={props.overrideWidthAmount}
						onChange={onPropertiesChanged}
						/>
					
					<SelectControl
						name="overrideHeightUnits"
						label={__("Override Height Units")}
						options={[
							{value: "px", label: "px"},
							{value: "%", label: "%"},
							{value: "vw`", label: "vw"},
							{value: "vh", label: "vh"}
						]}
						onChange={onPropertiesChanged}
						/>
						*/
		
		const onOverrideWidthCheckboxChanged = value => {
			
			
			
		};
		
		return (
			<InspectorControls key="inspector">
				<PanelBody title={ __( 'Map Settings' ) } >
					
					<p class="map-block-gutenberg-button-container">
						<a href={WPGMZA.adminurl + "admin.php?page=wp-google-maps-menu&action=edit&map_id=1"} 
							target="_blank" 
							class="button button-primary">
							<i class="fa fa-pencil-square-o" aria-hidden="true"></i>
							{__('Go to Map Editor')}
						</a>
					</p>
					
					<p class="map-block-gutenberg-button-container">
						<a href="https://www.wpgmaps.com/documentation/creating-your-first-map/"
							target="_blank"
							class="button button-primary">
							<i class="fa fa-book" aria-hidden="true"></i>
							{__('View Documentation')}
						</a>
					</p>
					
				</PanelBody>
			</InspectorControls>
		);
	}
	
	WPGMZA.Integration.Gutenberg.prototype.getBlockAttributes = function()
	{
		return {};
	}
	
	WPGMZA.Integration.Gutenberg.prototype.getBlockDefinition = function(props)
	{
		return {
			
			title: 			 WPGMZA.InternalEngine.isLegacy() ? __("WP Go Maps") : __("Map"),
			description: 	__( 'The easiest to use Google Maps plugin! Create custom Google Maps with high quality markers containing locations, descriptions, images and links. Add your customized map to your WordPress posts and/or pages quickly and easily with the supplied shortcode. No fuss.' ),
			category: 		 !WPGMZA.InternalEngine.isLegacy() && this.verifyCategory("wpgmza-gutenberg") ? "wpgmza-gutenberg" : 'common',
			icon: 			'location-alt',
			keywords: [
				__( 'Map' ),
				__( 'Maps' ),
				__( 'Google' ),
			],
			attributes: 	this.getBlockAttributes(),
			
			edit: props => {
				return [
					!! props.isSelected && (
						this.getBlockInspectorControls(props)
					),
					<div className={ props.className + " wpgmza-gutenberg-block" }>
						
						<Dashicon icon="location-alt"/>
						
						<span class="wpgmza-gutenberg-block-title">
							{ __("Your map will appear here on your websites front end") }
						</span>
						
					</div>
				];
			},
			// Defining the front-end interface
			save: props => {
				// Rendering in PHP
				return null;
			}
			
		};
	}

	WPGMZA.Integration.Gutenberg.prototype.verifyCategory = function(category){
		if(wp.blocks && wp.blocks.getCategories){
			const categories = wp.blocks.getCategories();
			for(let i in categories){
				if(categories[i].slug === category){
					return true;
				}
			}
		}
		return false;
	};
	
	WPGMZA.Integration.Gutenberg.getConstructor = function()
	{
		return WPGMZA.Integration.Gutenberg;
	}
	
	WPGMZA.Integration.Gutenberg.createInstance = function()
	{
		var constructor = WPGMZA.Integration.Gutenberg.getConstructor();
		return new constructor();
	}
	
	// Allow the Pro module to extend and create the module, only create here when Pro isn't loaded
	if(!WPGMZA.isProVersion() && !(/^6/.test(WPGMZA.pro_version)))
		WPGMZA.integrationModules.gutenberg = WPGMZA.Integration.Gutenberg.createInstance();
	
});
