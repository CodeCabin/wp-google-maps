<?php

if(!defined('ABSPATH'))
	exit;

?>

<div id="wpgmza-credits-page" class="wrap about-wrap">

	<h1>
		<?php 
		global $wpgmza;
		printf(__("Welcome to WP Google Maps version %s","wp-google-maps"), $wpgmza->getBasicVersion());
		?>
	</h1>

	<div class="about-text">
		<?php _e("Thank you for updating! WP Google Maps helps you build amazing maps through a simple interface and powerful functionality along with world class support.","wp-google-maps"); ?>
	</div>

	<h2 class="nav-tab-wrapper wp-clearfix">
	
		<a href="admin.php?page=wp-google-maps-menu&action=welcome_page" class="nav-tab">
			<?php _e("Welcome","wp-google-maps"); ?>
		</a>
		<a href="admin.php?page=wp-google-maps-menu&action=credits" class="nav-tab nav-tab-active">
			<?php _e("Credits","wp-google-maps"); ?>
		</a>

	</h2>

	<p class="about-description">
		<?php _e("WP Google Maps is created by an international team of developers.","wp-google-maps"); ?>
	</p>
	<h3 class="wp-people-group">
		<?php _e("Project Leaders","wp-google-maps"); ?>
	</h3>
	<ul class="wp-people-group " id="wp-people-group-project-leaders">

		<li class="wp-person" id="wp-person-nickduncan">
			<a href="https://profiles.wordpress.org/nickduncan/" class="web">
				<img 
					class="wpgmza-developer-avatar gravatar"
					src="<?php echo plugin_dir_url(WPGMZA_FILE); ?>images/38d79f24b5a649e132f8ed93f6dc2d37.jpg" 
					alt="Nick Duncan"/>
				Nick Duncan
			</a>
			<span class="title">
				<?php _e("Founder &amp; Lead Developer","wp-google-maps"); ?>
			</span>
		</li>
		<li class="wp-person" id="wp-person-perry">
			<a href="https://github.com/orgs/CodeCabin/people/PerryRylance" class="web">
				<img 
					class="wpgmza-developer-avatar gravatar"
					src="<?php echo plugin_dir_url(WPGMZA_FILE); ?>images/9761763c79d8b3dbf5b2981b332156de.jpg" 
					alt="Perry Rylance"/>
				Perry Rylance
			</a>
			<span class="title">
				<?php _e("Lead Developer &amp; Support","wp-google-maps"); ?>
			</span>
		</li>
	</ul>
	<h3 class="wp-people-group">
		<?php _e("Contributors","wp-google-maps"); ?>
	</h3>
	<ul class="wp-people-group " id="wp-people-group-core-developers">

		<li class="wp-person" id="wp-person-dylanauty">
			<a href="https://profiles.wordpress.org/dylanauty/" class="web">
				<img 
					class="wpgmza-developer-avatar gravatar"
					src="<?php echo plugin_dir_url(WPGMZA_FILE); ?>images/3e032ec3258ebc08eeed69568141164a.jpg" 
					alt="Dylan Auty"/>
				Dylan Auty
			</a>
			<span class="title">
				<?php _e("Support &amp; Developer","wp-google-maps"); ?>
			</span>
		</li>
		
		<li class="wp-person" id="wp-person-tamduncan">
			<a href="https://twitter.com/thebossybabe" class="web">
				<img 
					class="wpgmza-developer-avatar gravatar"
					src="<?php echo plugin_dir_url(WPGMZA_FILE); ?>images/tam-duncan.png" 
					alt="Tam Duncan"/>
				Tam Duncan</a>
			<span class="title">
				<?php _e("Marketing","wp-google-maps"); ?>
			</span>
		</li>
		
		<li class="wp-person" id="wp-person-dylank">
			<a href="https://github.com/orgs/CodeCabin/people/dylank6169" class="web">
				<img 
					class="wpgmza-developer-avatar gravatar"
					src="<?php echo plugin_dir_url(WPGMZA_FILE); ?>images/25743655.png" 
					alt="Dylan Kotzé"/>
				Dylan Kotzé</a>
			<span class="title">
				<?php _e("Support &amp; Developer","wp-google-maps"); ?>
			</span>
		</li>
		
		<li class="wp-person" id="wp-person-pat">
			<a href="https://github.com/patdumond" class="web">
				<img 
					class="wpgmza-developer-avatar gravatar"
					src="<?php echo plugin_dir_url(WPGMZA_FILE); ?>images/9320495.jpg" 
					alt="Pat Dumond"/>
				Pat Dumond</a>
			<span class="title">
				<?php _e("Documentation","wp-google-maps"); ?>
			</span>
		</li>

		<li class="wp-person" id="wp-person-gerardarall">
			<a href="https://github.com/arall" class="web">
				<img 
					class="wpgmza-developer-avatar gravatar"
					src="<?php echo plugin_dir_url(WPGMZA_FILE); ?>images/1453137.jpg" 
					alt="Gerard Arall"/>
				Gerard Arall</a>
			<span class="title">
				<?php _e("Security suggestions","wp-google-maps"); ?>
			</span>
		</li>

		<p class="clear">
			<?php _e("Want to see your name on this page?","wp-google-maps"); ?>
			<a href="https://github.com/CodeCabin/wp-google-maps/">
				<?php _e("Get involved on GitHub.","wp-google-maps"); ?>
			</a>
		</p>

		<a class="button-primary" style='padding:10px; height:inherit;' href="admin.php?page=wp-google-maps-menu&override=1">
			<?php echo __("OK! Let's start","wp-google-maps"); ?>
		</a>

	</div>