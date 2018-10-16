/**
 * @namespace WPGMZA.Integration
 * @module Gutenberg
 * @requires WPGMZA.Integration
 * @requires wp-i18n
 * @requires wp-blocks
 * @requires wp-editor
 * @requires wp-components
 */

/**
 * Internal block libraries
 */
jQuery(function($) {
	
	if(!wp || !wp.i18n || !wp.blocks)
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
		TextControl,
		RichText
	} = wp.components;
	
	WPGMZA.Integration.Gutenberg = function()
	{
		registerBlockType( 'gutenberg-wpgmza/block', this.getBlockDefinition() );
	}
	
	WPGMZA.Integration.Gutenberg.prototype.getBlockTitle = function()
	{
		return __("WP Google Maps");
	}
	
	WPGMZA.Integration.Gutenberg.prototype.getBlockInspectorControls = function(props)
	{
		return (
			<InspectorControls key="inspector">
				<PanelBody title={ __( 'Map Settings' ) } >
					
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
			
			title: 			__("WP Google Maps"),
			description: 	__( 'The easiest to use Google Maps plugin! Create custom Google Maps with high quality markers containing locations, descriptions, images and links. Add your customized map to your WordPress posts and/or pages quickly and easily with the supplied shortcode. No fuss.' ),
			category: 		'common',
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
							{ __("WP Google Maps") }
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
	if(!WPGMZA.isProVersion())
		WPGMZA.integrationModules.gutenberg = WPGMZA.Integration.Gutenberg.createInstance();
	
});
