/**
 * Registers the map block 
 * 
 * This module is now loaded via the block.json and should be up to spec with the latest releases of Gutenberg (as of 2023-08-07)
 * 
 * Pro module is still extendable, but we move to a more uniform plain JS implementation, than we might have previously used
 * 
 * All blocks will follow this standard moving forward
 * 
 * @since 9.0.21
 * @for map
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
		WPGMZA.Integration.Gutenberg = function () {
			blocks.registerBlockType('gutenberg-wpgmza/block', this.getBlockDefinition());
		}

		WPGMZA.Integration.Gutenberg.prototype.getBlockDefinition = function () {
			return {
				attributes : this.getAttributes(),
				edit: (props) => {

					var blockProps = useBlockProps({
						className: props.className + " wpgmza-gutenberg-block", key: "preview-wrapper"
					});

					let inspector = [];
					if(!!props.isSelected){
						let controls = this.getBlockInspectorControls(props);
						inspector.push(controls);
					}

					let panel = React.createElement(
						"div",
						{ ...blockProps },
						React.createElement(Dashicon, { icon: "location-alt" }),
						React.createElement(
							"span",
							{ "className": "wpgmza-gutenberg-block-title" },
							__("Your map will appear here on your websites front end")
						)
					);

					inspector.push(panel);
					return inspector;
				},
				save: (props) => {
					const blockProps = useBlockProps.save();
					// Rendering in PHP
					return null;
				}

			};
		}

		WPGMZA.Integration.Gutenberg.prototype.getBlockInspectorControls = function (props) {
			var onOverrideWidthCheckboxChanged = function onOverrideWidthCheckboxChanged(value) {};
			return React.createElement(
				InspectorControls,
				{ key: "inspector" },
				React.createElement(
					PanelBody,
					{ title: __('Map Settings') },
					React.createElement(
						"p",
						{ "className": "map-block-gutenberg-button-container" },
						React.createElement(
							"a",
							{ href: WPGMZA.adminurl + "admin.php?page=wp-google-maps-menu&action=edit&map_id=1",
								target: "_blank",
								"className": "button button-primary" },
							React.createElement("i", { "className": "fa fa-pencil-square-o", "aria-hidden": "true" }),
							__('Go to Map Editor')
						)
					),
					React.createElement(
						"p",
						{ "className": "map-block-gutenberg-button-container" },
						React.createElement(
							"a",
							{ href: "https://docs.wpgmaps.com/rYX4-creating-your-first-map",
								target: "_blank",
								"className": "button button-primary" },
							React.createElement("i", { "className": "fa fa-book", "aria-hidden": "true" }),
							__('View Documentation')
						)
					)
				)
			);
		};

		WPGMZA.Integration.Gutenberg.prototype.getAttributes = function (props) {
			return {};
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

		WPGMZA.Integration.Gutenberg.getConstructor = function () {
			return WPGMZA.Integration.Gutenberg;
		};

		WPGMZA.Integration.Gutenberg.createInstance = function () {
			var constructor = WPGMZA.Integration.Gutenberg.getConstructor();
			return new constructor();
		};

		if(!WPGMZA.isProVersion() && !(/^6/.test(WPGMZA.pro_version))){
			WPGMZA.integrationModules.gutenberg = WPGMZA.Integration.Gutenberg.createInstance();
		}
	});
})( window.wp.blocks, window.wp.element, window.wp.components, window.wp.i18n, window.wp);