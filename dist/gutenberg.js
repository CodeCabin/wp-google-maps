/**
 * Internal block libraries
 */
var __ = wp.i18n.__;
var registerBlockType = wp.blocks.registerBlockType;

/**
 * Register block
 */

export default registerBlockType('gutenberg-boilerplate/block', {
	// Block Title
	title: __('Gutenberg Boilerplate'),
	// Block Description
	description: __('An example block.'),
	// Block Category
	category: 'common',
	// Block Icon
	icon: 'admin-site',
	// Block Keywords
	keywords: [__('Boilerplate'), __('Hello World'), __('Example')],
	attributes: {},
	// Defining the edit interface
	edit: function edit(props) {
		return React.createElement(
			'h2',
			null,
			__('Hello Backend')
		);
	},
	// Defining the front-end interface
	save: function save(props) {
		return React.createElement(
			'h2',
			null,
			__('Hello Frontend')
		);
	}
});