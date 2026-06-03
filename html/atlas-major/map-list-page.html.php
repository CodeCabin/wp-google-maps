<?php
if(!defined('ABSPATH'))
    exit;
?>

<div id='WPGMMapList' class="wpgmza-wrap wpgmza-atlas-major">

	<style>
	/* ============================================
	   ATLAS MAJOR — MAP LIST PAGE
	   Scoped to .wpgmza-atlas-major
	   ============================================ */
	.wpgmza-atlas-major {
		--am-bg:           #f5f5f4;
		--am-surface:      #ffffff;
		--am-border:       #e5e5e4;
		--am-border-subtle:#f0efee;
		--am-text-1:       #1a1a19;
		--am-text-2:       #5c5c5a;
		--am-text-3:       #9c9c99;
		--am-accent:       #e8473f;
		--am-accent-hover: #d43b34;
		--am-accent-soft:  #fef2f1;
		--am-accent-border:#fecaca;
		--am-pro:          #7c3aed;
		--am-pro-soft:     #f5f3ff;
		--am-pro-border:   #ddd6fe;
		--am-pro-text:     #6d28d9;
		--am-sans:         'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
		--am-radius:       8px;
		--am-radius-sm:    5px;
		--am-radius-lg:    12px;
		--am-ease:         cubic-bezier(0.4, 0, 0.2, 1);
	}

	.wpgmza-atlas-major * {
		box-sizing: border-box;
	}

	/* ============================================
	   PAGE SHELL
	   ============================================ */
	.wpgmza-atlas-major .am-page-shell {
		/*background: var(--am-bg);*/
		min-height: 100%;
		padding: 0;
		font-family: var(--am-sans);
		color: var(--am-text-1);
		-webkit-font-smoothing: antialiased;
	}

	/* ============================================
	   TOP BAR
	   ============================================ */
	.wpgmza-atlas-major .am-top-bar {
		display: flex;
		align-items: center;
		/* justify-content: space-between; */
		/* background: var(--am-surface); */
		/* border-bottom: 1px solid var(--am-border); */
		padding: 0 28px 0 32px;
		height: 54px;
		flex-shrink: 0;
		gap: 20px;
		margin-top: 20px;
	}

	.wpgmza-atlas-major .am-top-bar-left {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.wpgmza-atlas-major .am-page-heading {
		font-size: 24px;
		font-weight: 700;
		font-family: var(--am-sans);
		color: var(--am-text-1);
		letter-spacing: -0.02em;
		margin: 0;
		padding: 0;
		border: none;
		display: inline-flex;
		align-items: center;
	}
	.wpgmza-atlas-major .am-page-heading-logo {
		height: auto;
		width: 191px;
		display: block;
	}

	.wpgmza-atlas-major .am-top-bar-right {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	/* ============================================
	   BUTTONS
	   ============================================ */
	.wpgmza-atlas-major .am-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 7px 14px;
		border-radius: var(--am-radius-sm);
		font-size: 13px;
		font-weight: 600;
		font-family: var(--am-sans);
		cursor: pointer;
		border: 1px solid transparent;
		transition: all 0.12s var(--am-ease);
		text-decoration: none;
		letter-spacing: 0.01em;
		line-height: 1;
	}

	.wpgmza-atlas-major .am-btn-secondary {
		background: var(--am-surface);
		color: var(--am-text-2);
		border-color: var(--am-border);
	}
	.wpgmza-atlas-major .am-btn-secondary:hover {
		border-color: var(--am-text-3);
		color: var(--am-text-1);
	}

	.wpgmza-atlas-major .am-btn-accent {
		background: var(--am-accent);
		color: #ffffff;
		border-color: var(--am-accent);
	}
	.wpgmza-atlas-major .am-btn-accent:hover {
		background: var(--am-accent-hover);
		border-color: var(--am-accent-hover);
		color: #ffffff;
	}

	.wpgmza-atlas-major .am-btn-pro {
		background: var(--am-pro-soft);
		color: var(--am-pro-text);
		border-color: var(--am-pro-border);
	}
	.wpgmza-atlas-major .am-btn-pro:hover {
		background: var(--am-pro);
		color: #ffffff;
		border-color: var(--am-pro);
	}

	.wpgmza-atlas-major .am-btn svg {
		width: 14px;
		height: 14px;
		stroke: currentColor;
		fill: none;
		stroke-width: 1.8;
		stroke-linecap: round;
		stroke-linejoin: round;
		flex-shrink: 0;
	}

	/* ============================================
	   TOOLBAR DROPDOWN (pro feature)
	   ============================================ */
	.wpgmza-atlas-major .am-dropdown {
		position: relative;
	}

	.wpgmza-atlas-major .am-dropdown input[type="checkbox"] {
		display: none;
	}

	.wpgmza-atlas-major .am-dropdown-toggle {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 7px 14px;
		border-radius: var(--am-radius-sm);
		font-size: 13px;
		font-weight: 600;
		font-family: var(--am-sans);
		cursor: pointer;
		border: 1px solid var(--am-accent);
		background: var(--am-accent);
		color: #ffffff;
		transition: all 0.12s var(--am-ease);
		user-select: none;
		letter-spacing: 0.01em;
		line-height: 1;
	}
	.wpgmza-atlas-major .am-dropdown-toggle:hover {
		background: var(--am-accent-hover);
		border-color: var(--am-accent-hover);
	}

	.wpgmza-atlas-major .am-dropdown-toggle svg {
		width: 14px;
		height: 14px;
		stroke: currentColor;
		fill: none;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		flex-shrink: 0;
	}

	.wpgmza-atlas-major .am-dropdown-menu {
		display: none;
		position: absolute;
		top: calc(100% + 6px);
		right: 0;
		background: var(--am-surface);
		border: 1px solid var(--am-border);
		border-radius: var(--am-radius);
		box-shadow: 0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
		min-width: 180px;
		z-index: 100;
		overflow: hidden;
	}

	.wpgmza-atlas-major .am-dropdown input:checked ~ .am-dropdown-menu {
		display: block;
	}

	.wpgmza-atlas-major .am-dropdown-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 14px;
		font-size: 13px;
		font-weight: 500;
		color: var(--am-text-1);
		cursor: pointer;
		transition: background 0.1s;
		border-bottom: 1px solid var(--am-border-subtle);
		font-family: var(--am-sans);
	}
	.wpgmza-atlas-major .am-dropdown-item:last-child {
		border-bottom: none;
	}
	.wpgmza-atlas-major .am-dropdown-item:hover {
		background: var(--am-bg);
	}

	.wpgmza-atlas-major .am-dropdown-item svg {
		width: 14px;
		height: 14px;
		stroke: currentColor;
		fill: none;
		stroke-width: 1.8;
		stroke-linecap: round;
		stroke-linejoin: round;
		color: var(--am-text-3);
		flex-shrink: 0;
	}

	/* ============================================
	   PAGE CONTENT AREA
	   ============================================ */
	.wpgmza-atlas-major .am-content {
		padding: 24px;
	}

	/* ============================================
	   NOTICE / NAG CARDS
	   ============================================ */
	.wpgmza-atlas-major .am-notice-card {
		background: var(--am-surface);
		border: 1px solid var(--am-border);
		border-radius: var(--am-radius-lg);
		padding: 18px 20px;
		margin-bottom: 16px;
	}

	.wpgmza-atlas-major .am-notice-card h3 {
		font-size: 14px;
		font-weight: 700;
		color: var(--am-text-1);
		margin: 0 0 6px;
		letter-spacing: -0.01em;
		font-family: var(--am-sans);
		border: none;
	}

	.wpgmza-atlas-major .am-notice-card p {
		font-size: 13px;
		color: var(--am-text-2);
		line-height: 1.6;
		margin: 0 0 10px;
	}
	.wpgmza-atlas-major .am-notice-card p:last-child {
		margin-bottom: 0;
	}

	.wpgmza-atlas-major .am-notice-card a.button-border.button-border__green {
		display: inline-flex;
		align-items: center;
		padding: 4px 10px;
		border-radius: var(--am-radius-sm);
		font-size: 12px;
		font-weight: 600;
		font-family: var(--am-sans);
		background: var(--am-accent-soft);
		color: var(--am-accent);
		border: 1px solid var(--am-accent-border);
		text-decoration: none;
		transition: all 0.12s var(--am-ease);
	}
	.wpgmza-atlas-major .am-notice-card a.button-border.button-border__green:hover {
		background: var(--am-accent);
		color: #ffffff;
		border-color: var(--am-accent);
	}

	.wpgmza-atlas-major .am-notice-card .wpgmza-button.wpgmza_close_review_nag {
		display: inline-flex;
		align-items: center;
		padding: 6px 12px;
		border-radius: var(--am-radius-sm);
		font-size: 12px;
		font-weight: 600;
		font-family: var(--am-sans);
		background: var(--am-bg);
		color: var(--am-text-2);
		border: 1px solid var(--am-border);
		text-decoration: none;
		transition: all 0.12s var(--am-ease);
		cursor: pointer;
	}
	.wpgmza-atlas-major .am-notice-card .wpgmza-button.wpgmza_close_review_nag:hover {
		border-color: var(--am-text-3);
		color: var(--am-text-1);
	}

	/* ============================================
	   UPSELL BANNER
	   ============================================ */
	.wpgmza-atlas-major .am-upsell-banner {
		display: flex;
		align-items: center;
		gap: 12px;
		background: var(--am-pro-soft);
		border: 1px solid var(--am-pro-border);
		border-radius: var(--am-radius-lg);
		padding: 14px 18px;
		margin-bottom: 16px;
		flex-wrap: wrap;
	}

	.wpgmza-atlas-major .am-upsell-banner .am-upsell-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: var(--am-pro);
		border-radius: var(--am-radius-sm);
		flex-shrink: 0;
	}
	.wpgmza-atlas-major .am-upsell-banner .am-upsell-icon svg {
		width: 16px;
		height: 16px;
		stroke: #ffffff;
		fill: none;
		stroke-width: 1.8;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.wpgmza-atlas-major .am-upsell-banner .am-upsell-text {
		flex: 1;
		font-size: 13px;
		color: var(--am-pro-text);
		font-family: var(--am-sans);
		min-width: 180px;
	}
	.wpgmza-atlas-major .am-upsell-banner .am-upsell-text a {
		color: var(--am-pro-text);
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 2px;
	}
	.wpgmza-atlas-major .am-upsell-banner .am-upsell-text a:hover {
		color: var(--am-pro);
	}

	/* Upsell banner CTA — mimic the `.wpgmza-upsell-button` style used in
	   the map editor: solid purple by default, darker + slight lift on
	   hover. Overrides the default `.am-btn-pro` pastel look. */
	.wpgmza-atlas-major .am-upsell-banner .am-btn-pro {
		flex-shrink: 0;
		background: var(--am-pro);
		color: #ffffff;
		border-color: var(--am-pro);
		font-size: 12px;
	}
	.wpgmza-atlas-major .am-upsell-banner .am-btn-pro:hover {
		background: #6d28d9; /* --am-pro-hover from the editor stylesheet */
		border-color: #6d28d9;
		color: #ffffff;
		transform: translateY(-1px);
	}

	/* ============================================
	   DATATABLE — port of Atlas Novus rules
	   Atlas Major skips Novus's wp-google-maps-admin.css, so the same
	   datatable rules need to live here. Selectors mirror Novus 1:1
	   (`.wpgmza-datatable-container` etc.) and the wrapper class
	   `.wpgmza-atlas-major` keeps them scoped to this UI build.
	   Source: css/atlas-novus/wp-google-maps-admin.css (~L347-569,L6645-6662)
	   ============================================ */

	/* Header borders + center alignment */
	.wpgmza-atlas-major .wpgmza-datatable-container table.dataTable thead th,
	.wpgmza-atlas-major .wpgmza-datatable-container table.dataTable thead td {
		border-bottom: 1px solid var(--wpgmza-color-light);
		border-top: 1px solid var(--wpgmza-color-light);
		text-align: center;
	}

	.wpgmza-atlas-major .wpgmza-datatable-container table.dataTable tr td[data-wpgmza-column-name="mark"],
	.wpgmza-atlas-major .wpgmza-datatable-container table.dataTable tr th[data-wpgmza-column-name="mark"] {
		max-width: 30px;
	}

	/* Cell borders */
	.wpgmza-atlas-major .wpgmza-datatable-container table.dataTable.row-border tbody tr td,
	.wpgmza-atlas-major .wpgmza-datatable-container table.dataTable.display tbody tr td {
		border-top: 0;
		border-bottom: 1px solid var(--wpgmza-color-light);
	}

	.wpgmza-atlas-major .wpgmza-datatable-container table.dataTable.no-footer {
		border: none;
	}

	/* Kill DataTables built-in ordering column tint */
	.wpgmza-atlas-major .wpgmza-datatable-container table.dataTable.display tbody tr > .dt-ordering-1,
	.wpgmza-atlas-major .wpgmza-datatable-container table.dataTable.order-column.stripe tbody tr > .dt-ordering-1 {
		background: none;
	}

	.wpgmza-atlas-major .wpgmza-datatable-container table.dataTable.display tbody tr {
		background: none !important;
	}

	/* Last cell padding — first-child padding-left:20px removed per design;
	   leading column (checkbox / ID) now sits flush with the table edge. */
	.wpgmza-atlas-major .wpgmza-datatable-container table.dataTable.display tbody tr td:last-child,
	.wpgmza-atlas-major .wpgmza-datatable-container table.dataTable.display thead tr th:last-child {
		padding-right: 20px;
	}

	/* Container width + vertical padding */
	.wpgmza-atlas-major .wpgmza-datatable-container .dataTable {
		width: 100% !important;
		padding-top: 20px;
		padding-bottom: 20px;
	}

	/* DT toolbar spacing (length / info / search / paging) */
	.wpgmza-atlas-major .wpgmza-datatable-container .dt-length,
	.wpgmza-atlas-major .wpgmza-datatable-container .dt-info,
	.wpgmza-atlas-major .wpgmza-datatable-container .wpgmza-marker-listing__actions {
		padding-left: 20px;
	}
	.wpgmza-atlas-major .wpgmza-datatable-container .dt-search,
	.wpgmza-atlas-major .wpgmza-datatable-container .dt-paging {
		padding-right: 20px;
	}

	/* Inputs inside DT toolbar */
	.wpgmza-atlas-major .wpgmza-datatable-container .dt-input {
		font-size: 11px;
		padding: 3px 7px;
	}
	.wpgmza-atlas-major .wpgmza-datatable-container select.dt-input {
		padding-right: 18px;
	}

	/* Body cells */
	.wpgmza-atlas-major .wpgmza-datatable-container .dataTable tbody tr td {
		text-align: center;
		box-shadow: none;
	}

	/* Pagination buttons */
	.wpgmza-atlas-major .wpgmza-datatable-container .dt-paging .dt-paging-button:hover {
		background: var(--wpgmza-color-light);
		border: 1px solid var(--wpgmza-color-light);
		color: var(--wpgmza-color-charcoal) !important;
		border-radius: 4px;
	}
	.wpgmza-atlas-major .wpgmza-datatable-container .dt-paging .dt-paging-button.current {
		background: var(--wpgmza-color-dark);
		border: 1px solid var(--wpgmza-color-dark);
		border-radius: 4px;
		color: var(--wpgmza-color-white) !important;
	}
	.wpgmza-atlas-major .wpgmza-datatable-container .dt-paging .dt-paging-button.current:hover {
		background: var(--wpgmza-color-grey-900);
		border: 1px solid var(--wpgmza-color-grey-900);
		color: var(--wpgmza-color-white) !important;
	}

	/* Map row hover */
	.wpgmza-atlas-major .wpgmza-datatable-container.wpgmza-datatable-container-maps table.dataTable.display tbody tr > td {
		transition: background-color 0.2s ease;
		box-shadow: none;
	}
	.wpgmza-atlas-major .wpgmza-datatable-container.wpgmza-datatable-container-maps table.dataTable.display tbody tr:hover > td,
	.wpgmza-atlas-major .wpgmza-datatable-container.wpgmza-datatable-container-maps table.dataTable.display tbody tr:hover > td.dt-ordering-1 {
		cursor: pointer;
		background: var(--wpgmza-color-grey-50);
	}

	/* Processing (loading) overlay */
	.wpgmza-atlas-major .wpgmza-datatable-container .dt-processing:before {
		content: "";
		height: 60px;
		width: 60px;
		display: block;
		position: absolute;
		border: 5px solid var(--wpgmza-color-grey-500);
		border-radius: 60px;
		left: calc(50% - 30px);
		top: calc(50% - 30px);
		border-bottom-color: transparent;
		box-sizing: border-box;
		-webkit-animation: wpgmzaLoadCircle 1s forwards;
		animation: wpgmzaLoadCircle 1s forwards;
		animation-iteration-count: infinite;
	}
	.wpgmza-atlas-major .wpgmza-datatable-container .dt-processing:after {
		content: "\f041";
		font-family: "FontAwesome";
		width: 60px;
		height: 60px;
		position: absolute;
		font-size: 25px;
		left: calc(50% - 30px);
		top: calc(50% - 30px);
		text-align: center;
		line-height: 60px;
		color: var(--wpgmza-color-grey-700);
		-webkit-animation: wpgmzaPulseFade 1s forwards;
		animation: wpgmzaPulseFade 1s forwards;
		animation-iteration-count: infinite;
	}
	.wpgmza-atlas-major .wpgmza-datatable-container .dt-processing {
		background: var(--wpgmza-color-white);
		color: var(--wpgmza-color-dark) !important;
		font-size: 14px !important;
		height: 70px;
		width: 200px;
		text-align: center;
		left: 50%;
		margin-left: 0;
		transform: translate(-50%, -50%);
		margin-top: 0;
		border-radius: 4px;
		line-height: 180px;
		padding-top: 10px;
		box-shadow: var(--wpgmza-shadow-common);
	}
	.wpgmza-atlas-major .wpgmza-datatable-container .dt-processing > div {
		display: none;
	}

	/* Action button group inside the Action column */
	.wpgmza-atlas-major .wpgmza-datatable-container .wpgmza-action-group {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
	}
	.wpgmza-atlas-major .wpgmza-datatable-container .wpgmza-action-group > * {
		margin-right: 5px;
	}
	.wpgmza-atlas-major .wpgmza-datatable-container .wpgmza-action-group > *:last-child {
		margin-right: 0;
	}

	/* DT layout row spacing */
	.wpgmza-atlas-major .wpgmza-datatable-container div.dt-container div.dt-layout-row {
		margin: 0;
	}

	/* Hide marker-listing action labels (icons only, like Novus) */
	.wpgmza-atlas-major #wpgmza-admin-map-table-container .wpgmza-marker-listing__actions span {
		display: none;
	}

	/* Responsive column hiding (mirrors Novus @media max-width:948px) */
	@media screen and (max-width:1550px){
		.wpgmza-atlas-major .wpgmza-datatable-container .wpgmza-action-group > * {
			width: 100%;
			margin-bottom: 5px;
			margin-right: 0;
		}
		.wpgmza-atlas-major .wpgmza-datatable-container .wpgmza-action-group > *:last-child {
			margin-bottom: 0;
		}
	}
	@media screen and (max-width:948px){
		.wpgmza-atlas-major #wpgmza-admin-map-table-container div:not([data-wpgmza-pro-datatable]) .dataTable thead tr th:nth-child(3),
		.wpgmza-atlas-major #wpgmza-admin-map-table-container div:not([data-wpgmza-pro-datatable]) .dataTable thead tr th:nth-child(4),
		.wpgmza-atlas-major #wpgmza-admin-map-table-container div:not([data-wpgmza-pro-datatable]) .dataTable thead tr th:nth-child(5),
		.wpgmza-atlas-major #wpgmza-admin-map-table-container div:not([data-wpgmza-pro-datatable]) .dataTable tbody tr td:nth-child(3),
		.wpgmza-atlas-major #wpgmza-admin-map-table-container div:not([data-wpgmza-pro-datatable]) .dataTable tbody tr td:nth-child(4),
		.wpgmza-atlas-major #wpgmza-admin-map-table-container div:not([data-wpgmza-pro-datatable]) .dataTable tbody tr td:nth-child(5) {
			display: none;
		}
		.wpgmza-atlas-major #wpgmza-admin-map-table-container div[data-wpgmza-pro-datatable] .dataTable thead tr th:nth-child(4),
		.wpgmza-atlas-major #wpgmza-admin-map-table-container div[data-wpgmza-pro-datatable] .dataTable thead tr th:nth-child(5),
		.wpgmza-atlas-major #wpgmza-admin-map-table-container div[data-wpgmza-pro-datatable] .dataTable thead tr th:nth-child(6),
		.wpgmza-atlas-major #wpgmza-admin-map-table-container div[data-wpgmza-pro-datatable] .dataTable tbody tr td:nth-child(4),
		.wpgmza-atlas-major #wpgmza-admin-map-table-container div[data-wpgmza-pro-datatable] .dataTable tbody tr td:nth-child(5),
		.wpgmza-atlas-major #wpgmza-admin-map-table-container div[data-wpgmza-pro-datatable] .dataTable tbody tr td:nth-child(6) {
			display: none;
		}
	}

	/* ============================================
	   COLUMN WIDTHS — map list table
	   Widths target the <th> by ID (class.datatable.php:110 sets
	   id="wpgmza_map_list_{name}"). Browsers propagate column widths
	   from the header cell, so the <td>s inherit naturally.

	   `table-layout: fixed` is used so the widths are honoured exactly
	   and the two "flexible" columns (Title + Shortcode) share the
	   remaining space evenly.
	   ============================================ */
	.wpgmza-atlas-major .wpgmza-datatable-container-maps table.dataTable {
		table-layout: fixed;
	}
	#wpgmza_map_list_map_title { text-align:left; }
	.wpgmza-atlas-major #wpgmza_map_list_mark      { width: 40px; }   /* Pro bulk checkbox */
	.wpgmza-atlas-major #wpgmza_map_list_id        { width: 60px; }
	.wpgmza-atlas-major #wpgmza_map_list_width     { width: 80px; }
	.wpgmza-atlas-major #wpgmza_map_list_height    { width: 80px; }
	.wpgmza-atlas-major #wpgmza_map_list_type      { width: 100px; }
	.wpgmza-atlas-major #wpgmza_map_list_action    { width: 260px; }
	/* Title + Shortcode columns left unsized — they share the remaining
	   space evenly under table-layout: fixed */

	/* Keep long text (Title links etc.) from overflowing the cell.
	   Excluded: the Shortcode cell. The shortcode TD only contains an
	   <input class="wpgmza_copy_shortcode"> whose width:100% means it
	   already fills the cell — but the PHP-built column HTML (see
	   class.admin-map-datatable.php:138) has leading/trailing whitespace
	   from the SQL `REPLACE('\n  <input.../>\n', ...)` literal, which
	   browsers treat as text-content overflow on a nowrap cell and
	   render as a stray "..." next to the input. `:has()` lets us
	   target only the cells that actually need clipping. */
	.wpgmza-atlas-major .wpgmza-datatable-container-maps table.dataTable tbody td:not(:has(.wpgmza_copy_shortcode)) {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.wpgmza-atlas-major .wpgmza-datatable-container-maps table.dataTable tbody td .wpgmza_copy_shortcode {
		width: 100%;
		box-sizing: border-box;
	}

	/* ============================================
	   PERSISTENT NOTICES CONTAINER
	   ============================================ */
	.wpgmza-atlas-major .wpgmza-persistent-notice-container {
		margin-bottom: 12px;
	}

	/* ============================================
	   WP ADMIN OVERRIDES — clean up WP defaults
	   ============================================ */
	.wpgmza-atlas-major h1,
	.wpgmza-atlas-major h2,
	.wpgmza-atlas-major h3 {
		font-family: var(--am-sans);
	}
	.wpgmza-atlas-major a {
		color: var(--am-text-1);
	}
	.wpgmza-atlas-major a:hover {
		color: var(--am-accent);
	}

	/* ============================================
	   FOOTER & SHOWCASE — align with page content
	   These are rendered after #WPGMMapList by admin_footer hooks
	   ============================================ */
	.wpgmza-support-notice-container {
		max-width: calc(100% - 8px);
		margin: 0 24px 16px;
		padding: 0 !important;
		font-family: var(--am-sans);
	}
	.wpgmza-support-notice-container .wpgmza-support-notice {
		background: var(--am-surface);
		border: 1px solid var(--am-border);
		border-radius: var(--am-radius-lg);
		padding: 14px 18px;
		box-shadow: none;
		font-size: 13px;
		color: var(--am-text-2);
		line-height: 1.6;
	}
	.wpgmza-support-notice-container .wpgmza-support-notice strong {
		color: var(--am-text-1);
		font-size: 13px;
	}
	.wpgmza-support-notice-container .wpgmza-support-notice a {
		color: var(--am-pro-text);
		font-weight: 500;
	}

	.wpgmza-atlas-major.wpgmza-demo-showcase-grid {
		margin: 0 24px 24px;
		padding: 0 !important;
	}

	/* ============================================
	   MOBILE — narrow viewport adjustments
	   ============================================ */
	@media screen and (max-width: 1100px) {
		/* Top bar: logo shrinks, new-map dropdown moves below */
		.wpgmza-atlas-major .am-top-bar {
			flex-wrap: wrap;
			padding: 10px 14px;
			height: auto;
			gap: 10px;
		}
		.wpgmza-atlas-major .am-page-heading-logo {
			width: 140px;
		}
		.wpgmza-atlas-major .am-top-bar-right {
			width: 100%;
			justify-content: flex-end;
		}

		/* Content area: tighter padding on mobile */
		.wpgmza-atlas-major .am-content {
			padding: 14px;
		}

		/* Upsell + review nag cards: stack the CTA below the text */
		.wpgmza-atlas-major .am-upsell-banner {
			flex-direction: column;
			align-items: flex-start;
			gap: 10px;
		}
		.wpgmza-atlas-major .am-upsell-banner .am-btn-pro {
			align-self: stretch;
			justify-content: center;
		}

		/* Map list datatable: keep only Title + Action visible on mobile.
		   Headers are targeted by ID (#wpgmza_map_list_{name} — set in
		   class.datatable.php:110). Body cells don't get IDs or the
		   data-wpgmza-column-name attribute so they're targeted by
		   nth-child position. Basic columns: 1=ID, 2=Title, 3=Width,
		   4=Height, 5=Type, 6=Action, 7=Shortcode. Pro adds a mark
		   column at position 1, shifting all indexes by +1 (handled
		   with a separate Pro selector group below). */
		.wpgmza-atlas-major .wpgmza-datatable-container-maps table.dataTable {
			table-layout: auto !important;
		}
		/* Override DataTables 2.x autoWidth colgroup. After init,
		   DataTables inserts <colgroup><col data-dt-column="N"
		   style="width:Xpx"></colgroup> with calculated content widths.
		   Those inline col widths win over cell widths and don't fill
		   100% of the table — leaving slack as dead space. Force all
		   cols to auto so the Title cell can expand to fill the
		   reclaimed width. !important beats the inline style. */
		.wpgmza-atlas-major .wpgmza-datatable-container-maps colgroup col {
			width: auto !important;
		}
		/* Headers — hide all but Title + Action (Basic + Pro mark) */
		.wpgmza-atlas-major #wpgmza_map_list_id,
		.wpgmza-atlas-major #wpgmza_map_list_width,
		.wpgmza-atlas-major #wpgmza_map_list_height,
		.wpgmza-atlas-major #wpgmza_map_list_type,
		.wpgmza-atlas-major #wpgmza_map_list_shortcode,
		.wpgmza-atlas-major #wpgmza_map_list_mark {
			display: none !important;
		}
		/* Headers — Title takes all remaining width; Action shrinks */
		.wpgmza-atlas-major #wpgmza_map_list_map_title {
			width: auto !important;
		}
		.wpgmza-atlas-major #wpgmza_map_list_action {
			width: 1% !important;
			white-space: nowrap !important;
		}
		/* Body cells — hide by nth-child (Basic: ID=1, Width=3,
		   Height=4, Type=5, Shortcode=7) */
		.wpgmza-atlas-major .wpgmza-datatable-container-maps table.dataTable tbody tr td:nth-child(1),
		.wpgmza-atlas-major .wpgmza-datatable-container-maps table.dataTable tbody tr td:nth-child(3),
		.wpgmza-atlas-major .wpgmza-datatable-container-maps table.dataTable tbody tr td:nth-child(4),
		.wpgmza-atlas-major .wpgmza-datatable-container-maps table.dataTable tbody tr td:nth-child(5),
		.wpgmza-atlas-major .wpgmza-datatable-container-maps table.dataTable tbody tr td:nth-child(7) {
			display: none !important;
		}
		.wpgmza-atlas-major .wpgmza-datatable-container-maps table.dataTable tbody tr td:nth-child(2) {
			width: auto !important;
		}
		.wpgmza-atlas-major .wpgmza-datatable-container-maps table.dataTable tbody tr td:nth-child(6) {
			width: 1% !important;
			white-space: nowrap !important;
		}
		/* Pro variant: mark column at position 1 shifts everything +1.
		   First reset display so the basic-rule hides don't bleed in,
		   then hide Pro's actual hidden columns and resize as needed. */
		.wpgmza-atlas-major .wpgmza-datatable-container-maps table.dataTable[data-wpgmza-pro-datatable] tbody tr td {
			display: table-cell !important;
		}
		.wpgmza-atlas-major .wpgmza-datatable-container-maps table.dataTable[data-wpgmza-pro-datatable] tbody tr td:nth-child(2),
		.wpgmza-atlas-major .wpgmza-datatable-container-maps table.dataTable[data-wpgmza-pro-datatable] tbody tr td:nth-child(4),
		.wpgmza-atlas-major .wpgmza-datatable-container-maps table.dataTable[data-wpgmza-pro-datatable] tbody tr td:nth-child(5),
		.wpgmza-atlas-major .wpgmza-datatable-container-maps table.dataTable[data-wpgmza-pro-datatable] tbody tr td:nth-child(6),
		.wpgmza-atlas-major .wpgmza-datatable-container-maps table.dataTable[data-wpgmza-pro-datatable] tbody tr td:nth-child(8) {
			display: none !important;
		}
		.wpgmza-atlas-major .wpgmza-datatable-container-maps table.dataTable[data-wpgmza-pro-datatable] tbody tr td:nth-child(3) {
			width: auto !important;
		}
		.wpgmza-atlas-major .wpgmza-datatable-container-maps table.dataTable[data-wpgmza-pro-datatable] tbody tr td:nth-child(7) {
			width: 1% !important;
			white-space: nowrap !important;
		}

		/* Action column: stack buttons vertically so they don't squish */
		.wpgmza-atlas-major .wpgmza-datatable-container-maps table.dataTable td[data-wpgmza-column-name="action"],
		.wpgmza-atlas-major .wpgmza-datatable-container-maps table.dataTable tbody td:last-child {
			white-space: normal;
		}
		.wpgmza-atlas-major .wpgmza-datatable-container .wpgmza-action-group {
			flex-direction: column;
			gap: 4px;
			align-items: stretch;
		}
		.wpgmza-atlas-major .wpgmza-datatable-container .wpgmza-action-group > * {
			margin-right: 0;
		}


		/* Search + length select on their own lines for the DataTable toolbar */
		.wpgmza-atlas-major .wpgmza-datatable-container .dt-search,
		.wpgmza-atlas-major .wpgmza-datatable-container .dt-paging,
		.wpgmza-atlas-major .wpgmza-datatable-container .dt-length,
		.wpgmza-atlas-major .wpgmza-datatable-container .dt-info {
			padding-left: 12px;
			padding-right: 12px;
			width: 100%;
			box-sizing: border-box;
		}

		/* Demo showcase + footer support card: tighter margins */
		.wpgmza-atlas-major.wpgmza-demo-showcase-grid {
			margin: 0 14px 16px;
		}
		.wpgmza-support-notice-container {
			margin: 0 14px 12px;
		}
	}

	@media screen and (max-width: 480px) {
		.wpgmza-atlas-major .am-page-heading-logo { width: 120px; }
	}
	</style>

	<div class="am-page-shell">

		<!-- Top Bar -->
		<div class="am-top-bar">
			<div class="am-top-bar-left">
				<h1 class="am-page-heading">
					<img class="am-page-heading-logo"
						src="<?php echo WPGMZA_PLUGIN_DIR_URL . 'images/wpgomaps-logo.webp'; ?>"
						alt="<?php esc_attr_e('WP Go Maps', 'wp-google-maps'); ?>" />
				</h1>
			</div>

			<div class="am-top-bar-right">

				<!-- Pro feature: new map / wizard dropdown -->
				<div class="am-dropdown wpgmza-pro-feature wpgmza-pro-feature-hide">
					<input type="checkbox" id="wpgmza-toolbar-conditional-map-list">
					<label class="am-dropdown-toggle" for="wpgmza-toolbar-conditional-map-list">
						<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
						<?php esc_html_e("New Map", "wp-google-maps"); ?>
					</label>
					<div class="am-dropdown-menu">
						<div class="am-dropdown-item wpgmza-pro-new" data-action="new-map">
							<svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
							<?php _e("New Map", "wp-google-maps"); ?>
						</div>
						<div class="am-dropdown-item wpgmza-pro-wizard" data-action="wizard">
							<svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></svg>
							<?php _e("Map Wizard", "wp-google-maps"); ?>
						</div>
					</div>
				</div>

			</div>
		</div>

		<!-- Page Content -->
		<div class="am-content">

			<!-- Persistent notices slot (JS-managed) -->
			<div class="wpgmza-persistent-notice-container"></div>

			<!-- Review nag card -->
			<div class='wpgmza-review-nag am-notice-card'>
				<?php
				echo sprintf( __( '<h3>We need your love!</h3><p>If you are enjoying our plugin, please consider <a href="%1$s" target="_blank" class="button-border button-border__green">reviewing WP Go Maps</a>. It would mean the world to us! If you are experiencing issues with the plugin, please <a href="%2$s" target="_blank"  class="button-border button-border__green">contact us</a> and we will help you as soon as humanly possible!</p>', 'wp-google-maps' ),
					'https://wordpress.org/support/view/plugin-reviews/wp-google-maps?filter=5',
					'http://www.wpgmaps.com/contact-us/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=maplist-contactus-atlas-major-v10'
				);
				?>

				<p>
					<a href='admin.php?page=wp-google-maps-menu&amp;wpgmza-close-review-nag' class='wpgmza_close_review_nag wpgmza-button' title="<?php esc_html_e("We will not nag you again, promise!","wp-google-maps"); ?>">
						<?php esc_html_e("No thanks!","wp-google-maps"); ?>
					</a>
				</p>
			</div>

			<!-- Upsell banner -->
			<div class='wpgmza_upgrade_nag am-upsell-banner'>
				<div class="am-upsell-icon">
					<svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></svg>
				</div>
				<div class="am-upsell-text">
					<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=mappage_1-atlas-major-v10<?php echo wpgmzaGetUpsellLinkParams() ?>"
						target="_BLANK"
						title="<?php esc_html_e("Pro Version", "wp-google-maps"); ?>">
						<?php esc_html_e("Create unlimited maps", "wp-google-maps"); ?>
					</a>
					<?php esc_html_e("with the", "wp-google-maps"); ?>
					<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=mappage_2-atlas-major-v10<?php echo wpgmzaGetUpsellLinkParams() ?>"
						title="Pro Version"
						target="_BLANK">
						<?php esc_html_e("Pro Version", "wp-google-maps"); ?>
					</a>
					<?php esc_html_e("of WP Go Maps", "wp-google-maps"); ?>
				</div>
				<a target="_BLANK"
					class="am-btn am-btn-pro wpgmza-button wpgmza-button-call-to-action"
					href="<?php echo esc_attr(\WPGMZA\Plugin::getProLink("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=mappage-cta-btn-atlas-major-v10" . wpgmzaGetUpsellLinkParams())); ?>">
					<?php _e('Unlock Unlimited Maps', 'wp-google-maps'); ?>
				</a>
			</div>

			<!-- Map datatable — uses the same container/classes as Atlas Novus
			     so the JS bootstrap and DataTables styling behave identically. -->
			<div id="wpgmza-admin-map-table-container" class="wpgmza-card wpgmza-shadow-high wpgmza-datatable-container wpgmza-datatable-container-maps wpgmza-pad-y-20 wpgmza-pad-x-0"></div>

		</div><!-- /.am-content -->

	</div><!-- /.am-page-shell -->

</div><!-- /#WPGMMapList -->
