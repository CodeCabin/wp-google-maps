<?php

if(!defined('ABSPATH'))
	return;

?><tr data-required-maps-engine='google-maps'>
	<td>
		<label><?php _e('Load Maps Engine API:', 'wp-google-maps'); ?></label>
	</td>
	<td>
		<select name="wpgmza_load_engine_api_condition">
			<option value="where-required">
				<?php
				_e('Where required', 'wp-google-maps');
				?>
			</option>
			<option value="always">
				<?php
				_e('Always', 'wp-google-maps');
				?>
			</option>
			<option value="only-front-end">
				<?php
				_e('Only Front End', 'wp-google-maps');
				?>
			</option>
			<option value="only-back-end">
				<?php
				_e('Only Back End', 'wp-google-maps');
				?>
			</option>
			<option value="never">
				<?php
				_e('Never', 'wp-google-maps');
				?>
			</option>
		</select>
	</td>
</tr>
<tr>
	<td>
		<label><?php _e('Always include engine API on pages:'); ?></label>
	</td>
	<td>
		<input name="wpgmza_always_include_engine_api_on_pages" placeholder="<?php _e('Page IDs'); ?>"/>
	</td>
</tr>
<tr>
	<td>
		<label><?php _e('Always exclude engine API on pages:'); ?></label>
	</td>
	<td>
		<input name="wpgmza_always_exclude_engine_api_on_pages" placeholder="<?php _e('Page IDs'); ?>"/>
	</td>
</tr>
<tr>
	<td>
		<label><?php _e('Prevent other plugins and theme loading API:', 'wp-google-maps'); ?></label>
	</td>
	<td>
		<input name="wpgmza_prevent_other_plugins_and_theme_loading_api" type="checkbox"/>
	</td>
</tr>