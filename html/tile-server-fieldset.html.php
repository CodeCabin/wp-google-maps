<tr data-required-map-engine="open-layers">
	<td><?php _e('Tile Server URL:', 'map-block'); ?></td>
	<td id="tile_server_controls">
	
		<select name="tile_server_url">
		
			<option 
				value="https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				data-usage-policy="https://wiki.openstreetmap.org/wiki/Tile_usage_policy">
				<?php
				_e('OpenStreetMap', 'map-block');
				?>
			</option>
			
			<option
				value="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png"
				data-usage-policy="https://foundation.wikimedia.org/wiki/Maps_Terms_of_Use"
				data-preview-image="https://wiki.openstreetmap.org/w/images/0/02/Wikimedia-tile.png">
				<?php
				_e('Wikimedia Maps', 'map-block');
				?>
			</option>
			
			<option value="http://tile.thunderforest.com/cycle/{z}/{x}/{y}.png"
				data-preview-image="http://b.tile.opencyclemap.org/cycle/16/33199/22539.png">
				<?php
				_e('OpenCycleMap', 'map-block');
				?>
			</option>
			
			<option value="http://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
				data-preview-image="https://wiki.openstreetmap.org/w/images/6/63/Humanitarian_style.png">
				<?php
				_e('Humanitarian', 'map-block');
				?>
			</option>
			
			<option value="https://{a-c}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
				data-preview-image="http://a.www.toolserver.org/tiles/bw-mapnik/9/264/179.png">
				<?php
				_e('Mapnik OSM B&amp;W', 'map-block');
				?>
			</option>
			
			<option value="https://tiles.wmflabs.org/osm-no-labels/{z}/{x}/{y}.png"
				data-preview-image="http://c.tiles.wmflabs.org/osm-no-labels/14/7452/6839.png">
				<?php
				_e('Mapnik OSM No Labels', 'map-block');
				?>
			</option>
			
			<option value="http://a.tile.stamen.com/toner/{z}/{x}/{y}.png"
				data-preview-image="http://a.tile.stamen.com/toner/10/529/366.png">
				<?php
				_e('Stamen Toner', 'map-block');
				?>
			</option>
			
			<option value="http://c.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg"
				data-preview-image="https://wiki.openstreetmap.org/w/images/d/d2/Tile_watercolor_stamen.jpg">
				<?php
				_e('Stamen Watercolor', 'map-block');
				?>
			</option>
			
			<option value="http://tile.thunderforest.com/transport/{z}/{x}/{y}.png"
				data-preview-image="http://a.tile2.opencyclemap.org/transport/13/4150/2819.png">
				<?php
				_e('Transport Map', 'map-block');
				?>
			</option>
			
			<option value="http://tile.thunderforest.com/landscape/{z}/{x}/{y}.png"
				data-preview-image="http://a.tile.thunderforest.com/landscape/14/4773/6144.png">
				<?php
				_e('Thunderforest Landscape', 'map-block');
				?>
			</option>
			
			<option value="http://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png"
				data-preview-image="http://a.tile.thunderforest.com/outdoors/14/4772/6144.png">
				<?php
				_e('Thunderforest Outdoors', 'map-block');
				?>
			</option>
			
			<option value="http://tile.memomaps.de/tilegen/{z}/{x}/{y}.png"
				data-preview-image="http://tile.memomaps.de/tilegen/12/2200/1343.png">
				<?php
				_e('Öpnvkarte', 'map-block');
				?>
			</option>
			
			<option value="http://www.openptmap.org/tiles/{z}/{x}/{y}.png"
				data-preview-image="http://www.openptmap.org/tiles//10/529/366.png">
				<?php
				_e('OpenPtMap', 'map-block');
				?>
			</option>
			
			<option value="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png">
				<?php
				_e('Carto Light (Positron)', 'map-block');
				?>
			</option>
			
			<option value="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
				data-preview-image="https://wiki.openstreetmap.org/w/images/b/ba/Cartodb_dark_tile.png">
				<?php
				_e('Carto Dark (Dark Matter)', 'map-block');
				?>
			</option>
			
			<option value="https://maps-cdn.salesboard.biz/styles/klokantech-3d-gl-style/{z}/{x}/{y}.png">
				<?php
				_e('Klokantech 3d', 'map-block');
				?>
			</option>
			
		</select>
		
		<div id="tile_server_url_preview" style="display: none;"><img/></div>
		
	</td>
</tr>