<div id="wpgmza-credits-page" class="wrap about-wrap">

	<h1>
		<?php 
		global $wpgmza;
		printf(__("Welcome to WP Go Maps version %s","wp-google-maps"), $wpgmza->getBasicVersion());
		?>
	</h1>

	<div class="about-text">
		<?php _e("Thank you for updating! WP Go Maps helps you build amazing maps through a simple interface and powerful functionality along with world class support.","wp-google-maps"); ?>
	</div>

	<h2 class="nav-tab-wrapper wp-clearfix">
	
		<a href="admin.php?page=wp-google-maps-menu&amp;action=welcome_page" class="nav-tab">
			<?php _e("Welcome","wp-google-maps"); ?>
		</a>
		<a href="admin.php?page=wp-google-maps-menu&amp;action=credits" class="nav-tab nav-tab-active">
			<?php _e("Credits","wp-google-maps"); ?>
		</a>

	</h2>

	<p class="about-description">
		<?php _e("WP Go Maps is created by an international team of developers.","wp-google-maps"); ?>
	</p>
	<h3 class="wp-people-group">
		<?php _e("Project Leaders","wp-google-maps"); ?>
	</h3>
	<ul class="wp-people-group " id="wp-people-group-project-leaders">

		<li class="wp-person" id="wp-person-nickduncan">
			<a href="https://profiles.wordpress.org/nickduncan/" class="web" target="_BLANK">
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
		<li class="wp-person" id="wp-person-dylanauty">
			<a href="https://profiles.wordpress.org/dylanauty/" class="web" target="_BLANK">
				<img 
					class="wpgmza-developer-avatar gravatar"
					src="<?php echo plugin_dir_url(WPGMZA_FILE); ?>images/3e032ec3258ebc08eeed69568141164a.jpg" 
					alt="Dylan Auty"/>
				Dylan Auty
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

		<li class="wp-person" id="wp-person-perry">
			<a href="https://profiles.wordpress.org/stevendebeer/" class="web" target="_BLANK">
				<img 
					class="wpgmza-developer-avatar gravatar"
					src="<?php echo plugin_dir_url(WPGMZA_FILE); ?>images/0d92d7c9c787-512.jpeg" 
					alt="Support &amp; Developer"/>
				Steven De Beer
			</a>
			<span class="title">
				<?php _e("Support &amp; Developer","wp-google-maps"); ?>
			</span>
		</li>
		
		<li class="wp-person" id="wp-person-pat">
			<a href="https://profiles.wordpress.org/matthewlau/" class="web" target="_BLANK">
				<img 
					class="wpgmza-developer-avatar gravatar"
					src="<?php echo plugin_dir_url(WPGMZA_FILE); ?>images/matthew.png" 
					alt="Matthew Lau"/>
				Matthew Lau</a>
			<span class="title">
				<?php _e("Support &amp; Developer","wp-google-maps"); ?>
			</span>
		</li>

		<li class="wp-person" id="wp-person-pat">
			<a href="https://twitter.com/glen_smith" class="web" target="_BLANK">
				<img 
					class="wpgmza-developer-avatar gravatar"
					src="<?php echo plugin_dir_url(WPGMZA_FILE); ?>images/8afc912f69e8-512.jpeg" 
					alt="Glen Smith"/>
				Glen Smith</a>
			<span class="title">
				<?php _e("Quality Assurance","wp-google-maps"); ?>
			</span>
		</li>

		<li class="wp-person" id="wp-person-gerardarall">
			<a href="https://hackerone.com/jerbinessim" class="web" target="_BLANK">
				<img 
					class="wpgmza-developer-avatar gravatar"
					src="<?php echo plugin_dir_url(WPGMZA_FILE); ?>images/d32b41e4f213.png" 
					alt="Nessim Jerbi"/>
				Nessim Jerbi</a>
			<span class="title">
				<?php _e("Security Analyst","wp-google-maps"); ?>
			</span>
		</li>
	</ul>

	<p class="clear">
		<?php _e("Want to see your name on this page?","wp-google-maps"); ?>
		<a href="https://github.com/CodeCabin/wp-google-maps/">
			<?php _e("Get involved on GitHub.","wp-google-maps"); ?>
		</a>
	</p>

	<a class="button-primary" style='padding:10px; height:inherit;' href="admin.php?page=wp-google-maps-menu&amp;action=installer&amp;autoskip=true&amp;override=1">
		<?php echo __("OK! Let's start","wp-google-maps"); ?>
	</a>

</div>