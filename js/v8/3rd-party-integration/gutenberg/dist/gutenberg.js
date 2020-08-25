"use strict";

/**
 * @namespace WPGMZA.Integration
 * @module Gutenberg
 * @requires WPGMZA.Integration
 * @requires wp-i18n
 * @requires wp-blocks
 * @requires wp-editor
 * @requires wp-components
 * @gulp-requires ../../../core.js
 */

/**
 * Internal block libraries
 */
jQuery(function ($) {

	if (!window.wp || !wp.i18n || !wp.blocks || !wp.editor || !wp.components) return;

	var __ = wp.i18n.__;
	var registerBlockType = wp.blocks.registerBlockType;
	var _wp$editor = wp.editor,
	    InspectorControls = _wp$editor.InspectorControls,
	    BlockControls = _wp$editor.BlockControls;
	var _wp$components = wp.components,
	    Dashicon = _wp$components.Dashicon,
	    Toolbar = _wp$components.Toolbar,
	    Button = _wp$components.Button,
	    Tooltip = _wp$components.Tooltip,
	    PanelBody = _wp$components.PanelBody,
	    TextareaControl = _wp$components.TextareaControl,
	    CheckboxControl = _wp$components.CheckboxControl,
	    TextControl = _wp$components.TextControl,
	    SelectControl = _wp$components.SelectControl,
	    RichText = _wp$components.RichText;


	WPGMZA.Integration.Gutenberg = function () {
		registerBlockType('gutenberg-wpgmza/block', this.getBlockDefinition());
	};

	WPGMZA.Integration.Gutenberg.prototype.getBlockTitle = function () {
		return __("WP Google Maps");
	};

	WPGMZA.Integration.Gutenberg.prototype.getBlockInspectorControls = function (props) {

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

		var onOverrideWidthCheckboxChanged = function onOverrideWidthCheckboxChanged(value) {};

		return React.createElement(
			InspectorControls,
			{ key: "inspector" },
			React.createElement(
				PanelBody,
				{ title: __('Map Settings') },
				React.createElement(
					"p",
					{ "class": "map-block-gutenberg-button-container" },
					React.createElement(
						"a",
						{ href: WPGMZA.adminurl + "admin.php?page=wp-google-maps-menu&action=edit&map_id=1",
							target: "_blank",
							"class": "button button-primary" },
						React.createElement("i", { "class": "fa fa-pencil-square-o", "aria-hidden": "true" }),
						__('Go to Map Editor')
					)
				),
				React.createElement(
					"p",
					{ "class": "map-block-gutenberg-button-container" },
					React.createElement(
						"a",
						{ href: "https://www.wpgmaps.com/documentation/creating-your-first-map/",
							target: "_blank",
							"class": "button button-primary" },
						React.createElement("i", { "class": "fa fa-book", "aria-hidden": "true" }),
						__('View Documentation')
					)
				)
			)
		);
	};

	WPGMZA.Integration.Gutenberg.prototype.getBlockAttributes = function () {
		return {};
	};

	WPGMZA.Integration.Gutenberg.prototype.getBlockDefinition = function (props) {
		var _this = this;

		return {

			title: __("WP Google Maps"),
			description: __('The easiest to use Google Maps plugin! Create custom Google Maps with high quality markers containing locations, descriptions, images and links. Add your customized map to your WordPress posts and/or pages quickly and easily with the supplied shortcode. No fuss.'),
			category: 'common',
			icon: 'location-alt',
			keywords: [__('Map'), __('Maps'), __('Google')],
			attributes: this.getBlockAttributes(),

			edit: function edit(props) {
				return [!!props.isSelected && _this.getBlockInspectorControls(props), React.createElement(
					"div",
					{ className: props.className + " wpgmza-gutenberg-block" },
					React.createElement(Dashicon, { icon: "location-alt" }),
					React.createElement(
						"span",
						{ "class": "wpgmza-gutenberg-block-title" },
						__("Your map will appear here on your websites front end")
					)
				)];
			},
			// Defining the front-end interface
			save: function save(props) {
				// Rendering in PHP
				return null;
			}

		};
	};

	WPGMZA.Integration.Gutenberg.getConstructor = function () {
		return WPGMZA.Integration.Gutenberg;
	};

	WPGMZA.Integration.Gutenberg.createInstance = function () {
		var constructor = WPGMZA.Integration.Gutenberg.getConstructor();
		return new constructor();
	};

	// Allow the Pro module to extend and create the module, only create here when Pro isn't loaded
	if(!WPGMZA.isProVersion() && !(/^6/.test(WPGMZA.pro_version))) WPGMZA.integrationModules.gutenberg = WPGMZA.Integration.Gutenberg.createInstance();
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyIzcmQtcGFydHktaW50ZWdyYXRpb24vZ3V0ZW5iZXJnL2Rpc3QvZ3V0ZW5iZXJnLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBLkludGVncmF0aW9uXHJcbiAqIEBtb2R1bGUgR3V0ZW5iZXJnXHJcbiAqIEByZXF1aXJlcyBXUEdNWkEuSW50ZWdyYXRpb25cclxuICogQHJlcXVpcmVzIHdwLWkxOG5cclxuICogQHJlcXVpcmVzIHdwLWJsb2Nrc1xyXG4gKiBAcmVxdWlyZXMgd3AtZWRpdG9yXHJcbiAqIEByZXF1aXJlcyB3cC1jb21wb25lbnRzXHJcbiAqIEBndWxwLXJlcXVpcmVzIC4uLy4uLy4uL2NvcmUuanNcclxuICovXHJcblxyXG4vKipcclxuICogSW50ZXJuYWwgYmxvY2sgbGlicmFyaWVzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24gKCQpIHtcclxuXHJcblx0aWYgKCF3aW5kb3cud3AgfHwgIXdwLmkxOG4gfHwgIXdwLmJsb2NrcyB8fCAhd3AuZWRpdG9yIHx8ICF3cC5jb21wb25lbnRzKSByZXR1cm47XHJcblxyXG5cdHZhciBfXyA9IHdwLmkxOG4uX187XHJcblx0dmFyIHJlZ2lzdGVyQmxvY2tUeXBlID0gd3AuYmxvY2tzLnJlZ2lzdGVyQmxvY2tUeXBlO1xyXG5cdHZhciBfd3AkZWRpdG9yID0gd3AuZWRpdG9yLFxyXG5cdCAgICBJbnNwZWN0b3JDb250cm9scyA9IF93cCRlZGl0b3IuSW5zcGVjdG9yQ29udHJvbHMsXHJcblx0ICAgIEJsb2NrQ29udHJvbHMgPSBfd3AkZWRpdG9yLkJsb2NrQ29udHJvbHM7XHJcblx0dmFyIF93cCRjb21wb25lbnRzID0gd3AuY29tcG9uZW50cyxcclxuXHQgICAgRGFzaGljb24gPSBfd3AkY29tcG9uZW50cy5EYXNoaWNvbixcclxuXHQgICAgVG9vbGJhciA9IF93cCRjb21wb25lbnRzLlRvb2xiYXIsXHJcblx0ICAgIEJ1dHRvbiA9IF93cCRjb21wb25lbnRzLkJ1dHRvbixcclxuXHQgICAgVG9vbHRpcCA9IF93cCRjb21wb25lbnRzLlRvb2x0aXAsXHJcblx0ICAgIFBhbmVsQm9keSA9IF93cCRjb21wb25lbnRzLlBhbmVsQm9keSxcclxuXHQgICAgVGV4dGFyZWFDb250cm9sID0gX3dwJGNvbXBvbmVudHMuVGV4dGFyZWFDb250cm9sLFxyXG5cdCAgICBDaGVja2JveENvbnRyb2wgPSBfd3AkY29tcG9uZW50cy5DaGVja2JveENvbnRyb2wsXHJcblx0ICAgIFRleHRDb250cm9sID0gX3dwJGNvbXBvbmVudHMuVGV4dENvbnRyb2wsXHJcblx0ICAgIFNlbGVjdENvbnRyb2wgPSBfd3AkY29tcG9uZW50cy5TZWxlY3RDb250cm9sLFxyXG5cdCAgICBSaWNoVGV4dCA9IF93cCRjb21wb25lbnRzLlJpY2hUZXh0O1xyXG5cclxuXHJcblx0V1BHTVpBLkludGVncmF0aW9uLkd1dGVuYmVyZyA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJlZ2lzdGVyQmxvY2tUeXBlKCdndXRlbmJlcmctd3BnbXphL2Jsb2NrJywgdGhpcy5nZXRCbG9ja0RlZmluaXRpb24oKSk7XHJcblx0fTtcclxuXHJcblx0V1BHTVpBLkludGVncmF0aW9uLkd1dGVuYmVyZy5wcm90b3R5cGUuZ2V0QmxvY2tUaXRsZSA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiBfXyhcIldQIEdvb2dsZSBNYXBzXCIpO1xyXG5cdH07XHJcblxyXG5cdFdQR01aQS5JbnRlZ3JhdGlvbi5HdXRlbmJlcmcucHJvdG90eXBlLmdldEJsb2NrSW5zcGVjdG9yQ29udHJvbHMgPSBmdW5jdGlvbiAocHJvcHMpIHtcclxuXHJcblx0XHQvKlxyXG4gIDxUZXh0Q29udHJvbFxyXG4gIFx0XHRcdFx0bmFtZT1cIm92ZXJyaWRlV2lkdGhBbW91bnRcIlxyXG4gIFx0XHRcdFx0bGFiZWw9e19fKFwiT3ZlcnJpZGUgV2lkdGggQW1vdW50XCIpfVxyXG4gIFx0XHRcdFx0Y2hlY2tlZD17cHJvcHMub3ZlcnJpZGVXaWR0aEFtb3VudH1cclxuICBcdFx0XHRcdG9uQ2hhbmdlPXtvblByb3BlcnRpZXNDaGFuZ2VkfVxyXG4gIFx0XHRcdFx0Lz5cclxuICBcdFx0XHRcclxuICBcdFx0XHQ8U2VsZWN0Q29udHJvbFxyXG4gIFx0XHRcdFx0bmFtZT1cIm92ZXJyaWRlV2lkdGhVbml0c1wiXHJcbiAgXHRcdFx0XHRsYWJlbD17X18oXCJPdmVycmlkZSBXaWR0aCBVbml0c1wiKX1cclxuICBcdFx0XHRcdG9wdGlvbnM9e1tcclxuICBcdFx0XHRcdFx0e3ZhbHVlOiBcInB4XCIsIGxhYmVsOiBcInB4XCJ9LFxyXG4gIFx0XHRcdFx0XHR7dmFsdWU6IFwiJVwiLCBsYWJlbDogXCIlXCJ9LFxyXG4gIFx0XHRcdFx0XHR7dmFsdWU6IFwidndgXCIsIGxhYmVsOiBcInZ3XCJ9LFxyXG4gIFx0XHRcdFx0XHR7dmFsdWU6IFwidmhcIiwgbGFiZWw6IFwidmhcIn1cclxuICBcdFx0XHRcdF19XHJcbiAgXHRcdFx0XHRvbkNoYW5nZT17b25Qcm9wZXJ0aWVzQ2hhbmdlZH1cclxuICBcdFx0XHRcdC8+XHJcbiAgXHRcdFx0XHRcclxuICBcdFx0XHQ8Q2hlY2tib3hDb250cm9sXHJcbiAgXHRcdFx0XHRuYW1lPVwib3ZlcnJpZGVIZWlnaHRcIlxyXG4gIFx0XHRcdFx0bGFiZWw9e19fKFwiT3ZlcnJpZGUgSGVpZ2h0XCIpfVxyXG4gIFx0XHRcdFx0Y2hlY2tlZD17cHJvcHMub3ZlcnJpZGVXaWR0aH1cclxuICBcdFx0XHRcdG9uQ2hhbmdlPXtvblByb3BlcnRpZXNDaGFuZ2VkfVxyXG4gIFx0XHRcdFx0Lz5cclxuICBcdFx0XHRcdFxyXG4gIFx0XHRcdDxUZXh0Q29udHJvbFxyXG4gIFx0XHRcdFx0bmFtZT1cIm92ZXJyaWRlSGVpZ2h0QW1vdW50XCJcclxuICBcdFx0XHRcdGxhYmVsPXtfXyhcIk92ZXJyaWRlIEhlaWdodCBBbW91bnRcIil9XHJcbiAgXHRcdFx0XHRjaGVja2VkPXtwcm9wcy5vdmVycmlkZVdpZHRoQW1vdW50fVxyXG4gIFx0XHRcdFx0b25DaGFuZ2U9e29uUHJvcGVydGllc0NoYW5nZWR9XHJcbiAgXHRcdFx0XHQvPlxyXG4gIFx0XHRcdFxyXG4gIFx0XHRcdDxTZWxlY3RDb250cm9sXHJcbiAgXHRcdFx0XHRuYW1lPVwib3ZlcnJpZGVIZWlnaHRVbml0c1wiXHJcbiAgXHRcdFx0XHRsYWJlbD17X18oXCJPdmVycmlkZSBIZWlnaHQgVW5pdHNcIil9XHJcbiAgXHRcdFx0XHRvcHRpb25zPXtbXHJcbiAgXHRcdFx0XHRcdHt2YWx1ZTogXCJweFwiLCBsYWJlbDogXCJweFwifSxcclxuICBcdFx0XHRcdFx0e3ZhbHVlOiBcIiVcIiwgbGFiZWw6IFwiJVwifSxcclxuICBcdFx0XHRcdFx0e3ZhbHVlOiBcInZ3YFwiLCBsYWJlbDogXCJ2d1wifSxcclxuICBcdFx0XHRcdFx0e3ZhbHVlOiBcInZoXCIsIGxhYmVsOiBcInZoXCJ9XHJcbiAgXHRcdFx0XHRdfVxyXG4gIFx0XHRcdFx0b25DaGFuZ2U9e29uUHJvcGVydGllc0NoYW5nZWR9XHJcbiAgXHRcdFx0XHQvPlxyXG4gIFx0XHRcdFx0Ki9cclxuXHJcblx0XHR2YXIgb25PdmVycmlkZVdpZHRoQ2hlY2tib3hDaGFuZ2VkID0gZnVuY3Rpb24gb25PdmVycmlkZVdpZHRoQ2hlY2tib3hDaGFuZ2VkKHZhbHVlKSB7fTtcclxuXHJcblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcclxuXHRcdFx0SW5zcGVjdG9yQ29udHJvbHMsXHJcblx0XHRcdHsga2V5OiBcImluc3BlY3RvclwiIH0sXHJcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXHJcblx0XHRcdFx0UGFuZWxCb2R5LFxyXG5cdFx0XHRcdHsgdGl0bGU6IF9fKCdNYXAgU2V0dGluZ3MnKSB9LFxyXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXHJcblx0XHRcdFx0XHRcInBcIixcclxuXHRcdFx0XHRcdHsgXCJjbGFzc1wiOiBcIm1hcC1ibG9jay1ndXRlbmJlcmctYnV0dG9uLWNvbnRhaW5lclwiIH0sXHJcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxyXG5cdFx0XHRcdFx0XHRcImFcIixcclxuXHRcdFx0XHRcdFx0eyBocmVmOiBXUEdNWkEuYWRtaW51cmwgKyBcImFkbWluLnBocD9wYWdlPXdwLWdvb2dsZS1tYXBzLW1lbnUmYWN0aW9uPWVkaXQmbWFwX2lkPTFcIixcclxuXHRcdFx0XHRcdFx0XHR0YXJnZXQ6IFwiX2JsYW5rXCIsXHJcblx0XHRcdFx0XHRcdFx0XCJjbGFzc1wiOiBcImJ1dHRvbiBidXR0b24tcHJpbWFyeVwiIH0sXHJcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHsgXCJjbGFzc1wiOiBcImZhIGZhLXBlbmNpbC1zcXVhcmUtb1wiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLFxyXG5cdFx0XHRcdFx0XHRfXygnR28gdG8gTWFwIEVkaXRvcicpXHJcblx0XHRcdFx0XHQpXHJcblx0XHRcdFx0KSxcclxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxyXG5cdFx0XHRcdFx0XCJwXCIsXHJcblx0XHRcdFx0XHR7IFwiY2xhc3NcIjogXCJtYXAtYmxvY2stZ3V0ZW5iZXJnLWJ1dHRvbi1jb250YWluZXJcIiB9LFxyXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcclxuXHRcdFx0XHRcdFx0XCJhXCIsXHJcblx0XHRcdFx0XHRcdHsgaHJlZjogXCJodHRwczovL3d3dy53cGdtYXBzLmNvbS9kb2N1bWVudGF0aW9uL2NyZWF0aW5nLXlvdXItZmlyc3QtbWFwL1wiLFxyXG5cdFx0XHRcdFx0XHRcdHRhcmdldDogXCJfYmxhbmtcIixcclxuXHRcdFx0XHRcdFx0XHRcImNsYXNzXCI6IFwiYnV0dG9uIGJ1dHRvbi1wcmltYXJ5XCIgfSxcclxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwgeyBcImNsYXNzXCI6IFwiZmEgZmEtYm9va1wiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLFxyXG5cdFx0XHRcdFx0XHRfXygnVmlldyBEb2N1bWVudGF0aW9uJylcclxuXHRcdFx0XHRcdClcclxuXHRcdFx0XHQpXHJcblx0XHRcdClcclxuXHRcdCk7XHJcblx0fTtcclxuXHJcblx0V1BHTVpBLkludGVncmF0aW9uLkd1dGVuYmVyZy5wcm90b3R5cGUuZ2V0QmxvY2tBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHt9O1xyXG5cdH07XHJcblxyXG5cdFdQR01aQS5JbnRlZ3JhdGlvbi5HdXRlbmJlcmcucHJvdG90eXBlLmdldEJsb2NrRGVmaW5pdGlvbiA9IGZ1bmN0aW9uIChwcm9wcykge1xyXG5cdFx0dmFyIF90aGlzID0gdGhpcztcclxuXHJcblx0XHRyZXR1cm4ge1xyXG5cclxuXHRcdFx0dGl0bGU6IF9fKFwiV1AgR29vZ2xlIE1hcHNcIiksXHJcblx0XHRcdGRlc2NyaXB0aW9uOiBfXygnVGhlIGVhc2llc3QgdG8gdXNlIEdvb2dsZSBNYXBzIHBsdWdpbiEgQ3JlYXRlIGN1c3RvbSBHb29nbGUgTWFwcyB3aXRoIGhpZ2ggcXVhbGl0eSBtYXJrZXJzIGNvbnRhaW5pbmcgbG9jYXRpb25zLCBkZXNjcmlwdGlvbnMsIGltYWdlcyBhbmQgbGlua3MuIEFkZCB5b3VyIGN1c3RvbWl6ZWQgbWFwIHRvIHlvdXIgV29yZFByZXNzIHBvc3RzIGFuZC9vciBwYWdlcyBxdWlja2x5IGFuZCBlYXNpbHkgd2l0aCB0aGUgc3VwcGxpZWQgc2hvcnRjb2RlLiBObyBmdXNzLicpLFxyXG5cdFx0XHRjYXRlZ29yeTogJ2NvbW1vbicsXHJcblx0XHRcdGljb246ICdsb2NhdGlvbi1hbHQnLFxyXG5cdFx0XHRrZXl3b3JkczogW19fKCdNYXAnKSwgX18oJ01hcHMnKSwgX18oJ0dvb2dsZScpXSxcclxuXHRcdFx0YXR0cmlidXRlczogdGhpcy5nZXRCbG9ja0F0dHJpYnV0ZXMoKSxcclxuXHJcblx0XHRcdGVkaXQ6IGZ1bmN0aW9uIGVkaXQocHJvcHMpIHtcclxuXHRcdFx0XHRyZXR1cm4gWyEhcHJvcHMuaXNTZWxlY3RlZCAmJiBfdGhpcy5nZXRCbG9ja0luc3BlY3RvckNvbnRyb2xzKHByb3BzKSwgUmVhY3QuY3JlYXRlRWxlbWVudChcclxuXHRcdFx0XHRcdFwiZGl2XCIsXHJcblx0XHRcdFx0XHR7IGNsYXNzTmFtZTogcHJvcHMuY2xhc3NOYW1lICsgXCIgd3BnbXphLWd1dGVuYmVyZy1ibG9ja1wiIH0sXHJcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KERhc2hpY29uLCB7IGljb246IFwibG9jYXRpb24tYWx0XCIgfSksXHJcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxyXG5cdFx0XHRcdFx0XHRcInNwYW5cIixcclxuXHRcdFx0XHRcdFx0eyBcImNsYXNzXCI6IFwid3BnbXphLWd1dGVuYmVyZy1ibG9jay10aXRsZVwiIH0sXHJcblx0XHRcdFx0XHRcdF9fKFwiWW91ciBtYXAgd2lsbCBhcHBlYXIgaGVyZSBvbiB5b3VyIHdlYnNpdGVzIGZyb250IGVuZFwiKVxyXG5cdFx0XHRcdFx0KVxyXG5cdFx0XHRcdCldO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHQvLyBEZWZpbmluZyB0aGUgZnJvbnQtZW5kIGludGVyZmFjZVxyXG5cdFx0XHRzYXZlOiBmdW5jdGlvbiBzYXZlKHByb3BzKSB7XHJcblx0XHRcdFx0Ly8gUmVuZGVyaW5nIGluIFBIUFxyXG5cdFx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0fTtcclxuXHR9O1xyXG5cclxuXHRXUEdNWkEuSW50ZWdyYXRpb24uR3V0ZW5iZXJnLmdldENvbnN0cnVjdG9yID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIFdQR01aQS5JbnRlZ3JhdGlvbi5HdXRlbmJlcmc7XHJcblx0fTtcclxuXHJcblx0V1BHTVpBLkludGVncmF0aW9uLkd1dGVuYmVyZy5jcmVhdGVJbnN0YW5jZSA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBjb25zdHJ1Y3RvciA9IFdQR01aQS5JbnRlZ3JhdGlvbi5HdXRlbmJlcmcuZ2V0Q29uc3RydWN0b3IoKTtcclxuXHRcdHJldHVybiBuZXcgY29uc3RydWN0b3IoKTtcclxuXHR9O1xyXG5cclxuXHQvLyBBbGxvdyB0aGUgUHJvIG1vZHVsZSB0byBleHRlbmQgYW5kIGNyZWF0ZSB0aGUgbW9kdWxlLCBvbmx5IGNyZWF0ZSBoZXJlIHdoZW4gUHJvIGlzbid0IGxvYWRlZFxyXG5cdGlmKCFXUEdNWkEuaXNQcm9WZXJzaW9uKCkgJiYgISgvXjYvLnRlc3QoV1BHTVpBLnByb192ZXJzaW9uKSkpIFdQR01aQS5pbnRlZ3JhdGlvbk1vZHVsZXMuZ3V0ZW5iZXJnID0gV1BHTVpBLkludGVncmF0aW9uLkd1dGVuYmVyZy5jcmVhdGVJbnN0YW5jZSgpO1xyXG59KTsiXSwiZmlsZSI6IjNyZC1wYXJ0eS1pbnRlZ3JhdGlvbi9ndXRlbmJlcmcvZGlzdC9ndXRlbmJlcmcuanMifQ==
