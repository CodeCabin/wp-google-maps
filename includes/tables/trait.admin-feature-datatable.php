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
		
		return apply_filters("wpgmza_admin_{$type}_datatable_action_buttons_sql", "REPLACE('
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
		',
		'{$id_placeholder}',
			id
		) AS `action`");
	}
}