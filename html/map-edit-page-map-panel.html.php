<div id="wpgmza_map_panel">
	<!--<p>
		<?php
		_e("Tip: Use your mouse to change the layout of your map. When you have positioned the map to your desired location, press \"Save Map\" to keep your settings.","wp-google-maps");
		?>
	</p>-->
	
	<div>
		<div id="wpgmza-map-container"/>
	
		<div id="map-edit-tabs" class="wpgmza-tabs" data-wpgmza-wp-action-before="wpgmza_map_editor_tab_container_before" data-wpgmza-wp-action-after="wpgmza_map_editor_tab_container_after">
			<ul data-wpgmza-wp-action-before="wpgmza_map_editor_tab_before" data-wpgmza-wp-action-after="wpgmza_map_editor_tab_after">
				<li>
					<a href="#wpgmza-markers-tab">
						<?php
						_e("Markers","wp-google-maps");
						?>
					</a>
				</li>
				<li class="wpgmza-free-version-only">
					<a href="#advanced-markers">
						<?php
						_e("Advanced markers","wp-google-maps");
						?>
					</a>
				</li>
				<li>
					<a href="#polygons">
						<?php
						_e("Polygon","wp-google-maps");
						?>
					</a>
				</li>
				<li>
					<a href="#polylines">
						<?php
						_e("Polylines","wp-google-maps");
						?>
					</a>
				</li>
				<li>
					<a href="#heatmaps">
						<?php
						_e("Heatmaps","wp-google-maps");
						?>
					</a>
				</li>
				<li>
					<a href="#settings">
						<?php
						_e("Settings","wp-google-maps");
						?>
					</a>
				</li>
			</ul>
			<div id="wpgmza-markers-tab" class="add-marker no-submit" data-wpgmza-wp-action-before="wpgmza_markers_tab_before" data-wpgmza-wp-action-after="wpgmza_markers_tab_after">
				<fieldset class="wpgmza-pro-version-only">
					<label>
						<?php
						_e("Title","wp-google-maps");
						?>
					</label>
					<input name="title"/>
				</fieldset>
				<fieldset>
					<label>
						<?php
						_e("Address/GPS","wp-google-maps");
						?>
					</label>
					<div>
						<input name="address"/>
						<div class="wpgmza-right-click-hint">
							<small>
								<?php
								_e("Or right click on the map","wp-google-maps");
								?>
							</small>
						</div>
						<div id="geocoder-error" class="error" style="display: none;">
							<?php
							_e("Sorry, we couldn't find this address", "wp-google-maps");
							?>
						</div>
					</div>
				</fieldset>
				<fieldset class="wpgmza-admin-only">
					<label>
						<?php
						_e("Animation","wp-google-maps");
						?>
					</label>
					<select name="animation">
						<option value="0">
							<?php
							_e("None","wp-google-maps");
							?>
						</option>
						<option value="1">
							<?php
							_e("Bounce","wp-google-maps");
							?>
						</option>
						<option value="2">
							<?php
							_e("Drop","wp-google-maps");
							?>
						</option>
					</select>
				</fieldset>
				<fieldset class="wpgmza-admin-only">
					<label>
						<?php
						_e("InfoWindow open by default","wp-google-maps");
						?>
					</label>
					<select name="infoopen">
						<option value="0">
							<?php
							_e("No","wp-google-maps");
							?>
						</option>
						<option value="1">
							<?php
							_e("Yes","wp-google-maps");
							?>
						</option>
					</select>
				</fieldset>
				<fieldset id="marker-buttons" class="wpgmza-admin-only">
					<button id="add-marker" type="button" class="button button-primary">
						<i class="fa fa-plus" aria-hidden="true"></i>
						<?php _e("Add Marker","wp-google-maps"); ?>
					</button>
					
					<button id="update-marker" type="button" class="update-marker button button-primary">
						<i class="fa fa-pencil-square-o" aria-hidden="true"></i>
						<?php _e("Update Marker","wp-google-maps"); ?>
					</button>
					
					<button id="cancel-marker-edit" type="button" class="update-marker button button-primary">
						<i class="fa fa-check-circle" aria-hidden="true"></i>
						<?php _e("Finish Editing", "wp-google-maps"); ?>
					</button>
					
					<button id="delete-marker" type="button" class="delete-marker button button-primary">
						<i class="fa fa-trash-o" aria-hidden="true"></i>
						<?php _e("Delete Marker", "wp-google-maps"); ?>
					</button>
				</fieldset>
				
				<div class="wpgmza-admin-only" smart:import-php="<?php
					echo WPGMZA_DIR . 'html/map-edit-page-marker-list.html.php';
				?>"></div>
			</div>
			<div id="advanced-markers" class="wpgmza-free-version-only no-submit" data-wpgmza-wp-action-before="wpgmza_advanced_markers_before" data-wpgmza-wp-action-after="wpgmza_advanced_markers_after">
				<div class="update-nag update-att">
					<i class="fa fa-arrow-circle-right"></i>
					<a target="_blank" href="<?php
					echo WPGMZA\Plugin::getProLink(array(
						'utm_source'	=> 'plugin',
						'utm_medium'	=> 'link',
						'utm_campaign'	=> 'advanced_markers'
					));
					?>">
						<?php
						_e("Add advanced markers","wp-google-maps");
						?>
					</a>
					<?php
					_e("with the Pro version","wp-google-maps");
					?>
				</div>
				
				<fieldset>
					<label>
						<?php
						_e("Address/GPS","wp-google-maps");
						?>
					</label>
					<div>
						<input name="address_or_gps" disabled/>
						<div>
							<small>
								<?php
								_e("Or right click on the map","wp-google-maps");
								?>
							</small>
						</div>
					</div>
				</fieldset>
				<fieldset>
					<label>
						<?php
						_e("Animation","wp-google-maps");
						?>
					</label>
					<select disabled>
						<option value="0">
							<?php
							_e("None","wp-google-maps");
							?>
						</option>
					</select>
				</fieldset>
				<fieldset>
					<label>
						<?php
						_e("InfoWindow open by default","wp-google-maps");
						?>
					</label>
					<select disabled>
						<option value="0">
							<?php
							_e("No","wp-google-maps");
							?>
						</option>
						<option value="1">
							<?php
							_e("Yes","wp-google-maps");
							?>
						</option>
					</select>
				</fieldset>
				<fieldset>
					<label>
						<?php
						_e("Title","wp-google-maps");
						?>
					</label>
					<input disabled/>
				</fieldset>
				<fieldset>
					<label>
						<?php
						_e("Description","wp-google-maps");
						?>
					</label>
					<textarea id="description" class="description" disabled></textarea>
				</fieldset>
				<fieldset>
					<label>
						<?php
						_e("Pic URL","wp-google-maps");
						?>
					</label>
					<div>
						<input disabled/>
						<button type="button" class="wpgmza-upload-marker-picture" disabled>
							<?php
							_e('Upload Image', 'wp-google-maps');
							?>
						</button>
					</div>
				</fieldset>
				<fieldset>
					<label>
						<?php
						_e("Link URL","wp-google-maps");
						?>
					</label>
					<div>
						<input disabled/>
					</div>
				</fieldset>
				<fieldset>
					<label>
						<?php
						_e("Custom Marker","wp-google-maps");
						?>
					</label>
					<input disabled type="file"/>
				</fieldset>
				<fieldset>
					<label>
						<?php
						_e("Category","wp-google-maps");
						?>
					</label>
					<select disabled>
						<option>
							<?php
							_e("Select","wp-google-maps");
							?>
						</option>
					</select>
				</fieldset>
				<fieldset>
					<label></label>
					<button class="button-primary" type="button" disabled>
						<?php
						_e("Add Marker","wp-google-maps");
						?>
					</button>
				</fieldset>
				
				<div class="update-nag update-att">
					<?php
					_e("Add custom icons, titles, descriptions, pictures and links to your markers with the","wp-google-maps");
					?>
					
					"<a target="_blank"
						href="<?php
						echo WPGMZA\Plugin::getProLink(array(
							'utm_source'	=> 'plugin',
							'utm_medium'	=> 'link',
							'utm_campaign'	=> 'below_marker'
						));
					?>"><?php 
						_e("Pro Edition","wp-google-maps");
					?></a>"
					
					<?php
					_e("of this plugin for just","wp-google-maps");
					?>
					
					<strong>$39.99</strong>
				</div>
				
				<div class="update-nag update-att">
					<a target="_blank"
						href="<?php
						echo WPGMZA\Plugin::getProLink(array(
							'utm_source'	=> 'plugin',
							'utm_medium'	=> 'link',
							'utm_campaign'	=> 'csv_link'
						));
					?>"><?php 
						_e("Purchase the Pro Edition","wp-google-maps");
					?></a>
					
					<?php
					_e("of WP Google Maps and save your markers to a CSV file!","wp-google-maps");
					?>
				</div>
			</div>
			<div id="polygons" class="add-polygon no-submit" data-wpgmza-wp-action-before="wpgmza_polygons_tab_before" data-wpgmza-wp-action-after="wpgmza_polygons_tab_after">
				<fieldset>
					<label>
						<?php _e("Name", "wp-google-maps"); ?>
					</label>
					<input name="polygon-name"/>
				</fieldset>
				<fieldset>
					<label>
						<?php _e("Title", "wp-google-maps"); ?>
					</label>
					<div>
						<input name="polygon-title" disabled 
							placeholder="<?php _e("Pro version only", "wp-google-maps"); 
						?>"/>
						<br/>
						<a class="wpgmza-free-version-only" href="<?php 
								echo WPGMZA\Plugin::getProLink(array(
									'utm_source'	=> 'plugin',
									'utm_medium'	=> 'link',
									'utm_campaign'	=> 'polygons'
								));
							?>">
							<?php
							_e("Get the Pro add-on", "wp-google-maps");
							?>
						</a>
					</div>
				</fieldset>
				<fieldset>
					<label>
						<?php _e("Link", "wp-google-maps"); ?>
					</label>
					<input name="polygon-link" disabled 
						placeholder="<?php _e("Pro version only", "wp-google-maps"); 
					?>"/>
				</fieldset>
				<fieldset>
					<label>
						<?php _e("Line Color", "wp-google-maps"); ?>
					</label>
					<input name="polygon-strokeColor" type="color"/>
				</fieldset>
				<fieldset>
					<label>
						<?php _e("Line Opacity", "wp-google-maps"); ?>
					</label>
					<div>
						<input name="polygon-strokeOpacity" type="number" min="0" max="1" step="0.01" value="0.5"/>
						<p>
							<small>
								0 - 1.0 <?php _e("eg 0.5 for 50%", "wp-google-maps"); ?>
							</small>
						</p>
					</div>
				</fieldset>
				<fieldset>
					<label>
						<?php _e("Fill Color", "wp-google-maps"); ?>
					</label>
					<input name="polygon-fillColor" type="color" value="#66ff00"/>
				</fieldset>
				<fieldset>
					<label>
						<?php _e("Fill Opacity", "wp-google-maps"); ?>
					</label>
					<div>
						<input name="polygon-fillOpacity" type="number" min="0" max="1" step="0.01" value="1.0"/>
						<p>
							<small>
								0 - 1.0 <?php _e("eg 0.5 for 50%", "wp-google-maps"); ?>
							</small>
						</p>
					</div>
				</fieldset>
				<fieldset>
					<label>
						<?php _e("On Hover Line Color", "wp-google-maps"); ?>
					</label>
					<input class="wpgmza-free-version-only" name="polygon-hoverStrokeColor" disabled placeholder="Pro version only"/>
					<input class="wpgmza-pro-version-only" name="polygon-hoverStrokeColor" type="color" value="#333333"/>
				</fieldset>
				<fieldset>
					<label>
						<?php _e("On Hover Fill Color", "wp-google-maps"); ?>
					</label>
					<input class="wpgmza-free-version-only" name="polygon-hoverFillColor" disabled placeholder="Pro version only"/>
					<input class="wpgmza-pro-version-only" name="polygon-hoverFillColor" type="color" value="#ff0000"/>
				</fieldset>
				<fieldset>
					<label>
						<?php _e("On Hover Opacity", "wp-google-maps"); ?>
					</label>
					<div>
						<input class="wpgmza-free-version-only" name="polygon-hoverOpacity" disabled placeholder="Pro version only"/>
						<input class="wpgmza-pro-version-only" name="polygon-hoverOpacity" type="number" min="0" max="1" step="0.01" value="1.0"/>
						<p>
							<small>
								0 - 1.0 <?php _e("eg 0.5 for 50%", "wp-google-maps"); ?>
							</small>
						</p>
					</div>
				</fieldset>
				
				<fieldset id="polygon-buttons">
					<button id="draw-polygon" type="button" class="button button-primary">
						<i class="fa fa-pencil" aria-hidden="true"></i>
						<?php _e("Draw Polygon","wp-google-maps"); ?>
					</button>
					
					<button id="finish-editing-polygon" type="button" class="update-polygon button button-primary">
						<i class="fa fa-pencil-square-o" aria-hidden="true"></i>
						<?php _e("Finish Editing","wp-google-maps"); ?>
					</button>
					
					<button id="delete-polygon" type="button" class="delete-polygon button button-primary">
						<i class="fa fa-trash-o" aria-hidden="true"></i>
						<?php _e("Delete Polygon", "wp-google-maps"); ?>
					</button>
				</fieldset>
			</div>
			<div id="polylines" class="add-polyline no-submit" data-wpgmza-wp-action-before="wpgmza_polylines_tab_before" data-wpgmza-wp-action-after="wpgmza_polylines_tab_after">
				<fieldset>
					<label>
						<?php
						_e("Title", "wp-google-maps");
						?>
					</label>
					<input name="polyline-title"/>
				</fieldset>
				<fieldset>
					<label>
						<?php
						_e("Line Color", "wp-google-maps");
						?>
					</label>
					<input name="polyline-strokeColor" type="color"/>
				</fieldset>
				<fieldset>
					<label>
						<?php
						_e("Opacity", "wp-google-maps");
						?>
					</label>
					<div>
						<input name="polyline-strokeOpacity" type="number" min="0" max="1"step="0.01" value="0.8"/>
						<p>
							<small>
								0 - 1.0 <?php _e("eg 0.5 for 50%", "wp-google-maps"); ?>
							</small>
						</p>
					</div>
				</fieldset>
				<fieldset>
					<label>
						<?php
						_e("Line Thickness", "wp-google-maps");
						?>
					</label>
					<div>
						<input name="polyline-strokeWeight" type="number" min="1" max="50" value="1"/>
						<p>
							<small>
								1 - 50
							</small>
						</p>
					</div>
				</fieldset>
				<fieldset id="polyline-buttons">
					<button id="draw-polyline" type="button" class="button button-primary">
						<i class="fa fa-pencil" aria-hidden="true"></i>
						<?php _e("Draw Polyline","wp-google-maps"); ?>
					</button>
					
					<button id="finish-editing-polyline" type="button" class="update-polyline button button-primary">
						<i class="fa fa-pencil-square-o" aria-hidden="true"></i>
						<?php _e("Finish Editing","wp-google-maps"); ?>
					</button>
					
					<button id="delete-polyline" type="button" class="delete-polyline button button-primary">
						<i class="fa fa-trash-o" aria-hidden="true"></i>
						<?php _e("Delete Polyline", "wp-google-maps"); ?>
					</button>
				</fieldset>
			</div>
			<div id="heatmaps" class="add-heatmap no-submit">
				<div class="update-nag update-att wpgmza-free-version-only">
					<a target="_blank"
						href="<?php
						echo urlencode(WPGMZA\Plugin::getProLink(array(
							'utm_source'	=> 'plugin',
							'utm_medium'	=> 'link',
							'utm_campaign'	=> 'heatmaps'
						)));
					?>"><?php 
						_e("Add dynamic heatmap data","wp-google-maps");
					?></a>
					
					<?php
					_e("with the Pro version.","wp-google-maps");
					?>
					
					<a target="_blank" href="https://www.wpgmaps.com/demo/heatmaps-demo/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=heatmap_demo">
						<?php
						_e("View a demo.","wp-google-maps");
						?>
					</a>
				</div>
			</div>
			
			<div id="settings" data-wpgmza-wp-action-before="wpgmza_settings_tab_before" data-wpgmza-wp-action-after="wpgmza_settings_tab_after" smart:import-php="<?php 
				echo WPGMZA_DIR . 'html/map-edit-page-settings-panel.html.php'; 
			?>"></div>
		</div>
		
		<div id="wpgmza-markers-tab-instructions" class="update-nag update-blue update-slim">
			<ul>
				<li>
					<?php
					_e('Enter an address and click "add marker"', 'wp-google-maps');
					?>
				</li>
				<li>
					<?php
					_e('Or right click on the map then "add marker"', 'wp-google-maps');
					?>
				</li>
				<li>
					<?php
					_e('Click on any marker to edit it', 'wp-google-maps');
					?>
				</li>
				<li>
					<?php
					_e('Save changes by clicking "Update Marker"', 'wp-google-maps');
					?>
				</li>
				<li>
					<?php
					_e('Delete the marker using the button below', 'wp-google-maps');
					?>
				</li>
			</ul>
		</div>
		
		<div id="polygon-instructions" class="update-nag update-blue update-slim">
			<ul>
				<li>
					<?php
					_e('Click "Draw Polygon" to start drawing', 'wp-google-maps');
					?>
				</li>
				<li>
					<?php
					_e('Click on a polygon to edit it', 'wp-google-maps');
					?>
				</li>
				<li>
					<?php
					_e('Click on the map to insert a vertex', 'wp-google-maps');
					?>
				</li>
				<li class='wpgmza-engine-google-maps-only'>
					<?php
					_e('Right click on a vertex to delete it', 'wp-google-maps');
					?>
				</li>
				<li class='wpgmza-engine-osm-only'>
					<?php
					_e('Shift + click on a vertex to delete it', 'wp-google-maps');
					?>
				</li>
				<li>
					<?php
					_e('Drag a vertex to move it', 'wp-google-maps');
					?>
				</li>
				<li>
					<?php
					_e('Close the polygon to finish', 'wp-google-maps');
					?>
				</li>
				<li>
					<?php
					_e('To delete a polygon use the button below', 'wp-google-maps');
					?>
				</li>
			</ul>
		</div>
		
		<div id="polyline-instructions" class="update-nag update-blue update-slim">
			<ul>
				<li>
					<?php
					_e('Click "Draw Polyline" to start drawing', 'wp-google-maps');
					?>
				</li>
				<li>
					<?php
					_e('Click on a polyline to edit it', 'wp-google-maps');
					?>
				</li>
				<li>
					<?php
					_e('Click on the map to insert a vertex', 'wp-google-maps');
					?>
				</li>
				<li class='wpgmza-engine-google-maps-only'>
					<?php
					_e('Right click on a vertex to delete it', 'wp-google-maps');
					?>
				</li>
				<li class='wpgmza-engine-osm-only'>
					<?php
					_e('Shift + click on a vertex to delete it', 'wp-google-maps');
					?>
				</li>
				<li>
					<?php
					_e('Drag a vertex to move it', 'wp-google-maps');
					?>
				</li>
				<li>
					<?php
					_e('Click your last vertex twice to finish', 'wp-google-maps');
					?>
				</li>
				<li>
					<?php
					_e('To delete a polyline use the button below', 'wp-google-maps');
					?>
				</li>
			</ul>
		</div>
	</div>
</div>