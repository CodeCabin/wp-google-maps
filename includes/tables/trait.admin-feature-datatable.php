<?php

namespace WPGMZA;

trait AdminFeatureDatatable
{
	protected function getActionButtons()
	{
		global $wpgmza;

		$buttonClass = $wpgmza->internalEngine->getButtonClass('button');

		$type			= $this->getFeatureType();
		$id_placeholder	= '__5d5621cf7b6bb90bfb7bda85a0df7293';
		
		$actionsHtml = "
			<div class=\'wpgmza-action-buttons wpgmza-flex\'>
				<a title=\'" . esc_attr('Edit this feature', 'wp-google-maps') . "\'
					class=\'wpgmza_edit_btn {$buttonClass}\'
					data-edit-{$type}-id=\'{$id_placeholder}\'>
					<i class=\'fa fa-edit\'> </i>
				</a>
				<a href=\'javascript: ;\' title=\'"
					. esc_attr( __('Delete this feature', 'wp-google-maps') ) . 
					"\' class=\'wpgmza_del_btn {$buttonClass}\' data-delete-{$type}-id=\'{$id_placeholder}\'>
					<i class=\'fa fa-times\'> </i>
				</a>
			</div>
		";

		if(!$wpgmza->internalEngine->isLegacy()){
			$actionsHtml = "<div class=\'wpgmza-action-buttons wpgmza-toolbar\'>
					<input type=\'checkbox\' id=\'wpgmza-toolbar-conditional-{$type}-{$id_placeholder}\'>
					<label class=\'wpgmza-button\' for=\'wpgmza-toolbar-conditional-{$type}-{$id_placeholder}\'><i class=\'fa fa-ellipsis-h\'></i></label>
					<div class=\'wpgmza-toolbar-list\'>
						<a title=\'Edit this feature\' class=\'wpgmza_edit_btn\' data-edit-{$type}-id=\'{$id_placeholder}\'>
							" . esc_attr( __('Edit', 'wp-google-maps') ) . "
						</a>
						<a href=\'javascript: ;\' title=\'"
							. esc_attr( __('Center the map to this feature', 'wp-google-maps') ) . 
							"\' data-fit-feature-bounds-id=\'{$id_placeholder}\'>
							" . esc_attr( __('Center', 'wp-google-maps') ) . "
						</a>
						<a href=\'javascript: ;\' title=\'"
							. esc_attr( __('Delete this feature', 'wp-google-maps') ) . 
							"\' class=\'wpgmza_del_btn\' data-delete-{$type}-id=\'{$id_placeholder}\'>
							" . esc_attr( __('Delete', 'wp-google-maps') ) . "
						</a>
					</div>
				</div>";
		}

		return apply_filters("wpgmza_admin_{$type}_datatable_action_buttons_sql", "REPLACE('{$actionsHtml}',
		'{$id_placeholder}',
			id
		) AS `action`");
	}
}