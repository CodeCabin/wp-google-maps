<?php
	if(!defined('ABSPATH'))
		exit;

	global $wpgmza;

?>
<div class="wpgmza-writeup-tabs">
    <a href="admin.php?page=wp-google-maps-menu&amp;action=welcome_page" class="tab"><?php _e("Welcome","wp-google-maps"); ?></a>
    <a href="admin.php?page=wp-google-maps-menu&amp;action=credits" class="tab tab-active"><?php _e("Credits","wp-google-maps"); ?></a>
</div>

<div id="wpgmza-credits-page" class="wrap wpgmza-wrap wpgmza-writeup-block wpgmza-shadow-high">

	<h1><?php _e("Welcome to Atlas Novus", "wp-google-maps"); ?></h1>
    <h2><?php printf(__("WP Go Maps version %s","wp-google-maps"), $wpgmza->getBasicVersion()); ?></h2>

    <hr>

    <h3><?php _e("WP Go Maps helps you create maps that you'll love!","wp-google-maps"); ?></h3>
    <h3><?php _e("Created by an international team of exceptional developers, with a passion for mapping","wp-google-maps"); ?></h3>

    <hr>

	<h2><?php _e("Project Leaders","wp-google-maps"); ?></h2>

	<div class="credit-container">
		<div class="member">
			<a href="https://profiles.wordpress.org/nickduncan/" class="web" target="_BLANK">
				<div class="wpgmza-rounded-image">
					<img 
						class="wpgmza-developer-avatar gravatar"
						src="<?php echo plugin_dir_url(WPGMZA_FILE); ?>images/38d79f24b5a649e132f8ed93f6dc2d37.jpg" 
						alt="Nick Duncan"/>
				</div>
				Nick Duncan
			</a>
			<span class="title">
				<?php _e("Founder &amp; Lead Developer","wp-google-maps"); ?>
			</span>
		</div>

		<div class="member">
			<a href="https://profiles.wordpress.org/dylanauty/" class="web" target="_BLANK">
				<div class="wpgmza-rounded-image">
					<img 
						class="wpgmza-developer-avatar gravatar"
						src="<?php echo plugin_dir_url(WPGMZA_FILE); ?>images/3e032ec3258ebc08eeed69568141164a.jpg" 
						alt="Dylan Auty"/>
				</div>
				Dylan Auty
			</a>
			<span class="title">
				<?php _e("Lead Developer &amp; Support","wp-google-maps"); ?>
			</span>
		</div>
	</div>

	<hr>

	<h2><?php _e("Contributors","wp-google-maps"); ?></h2>

	<div class="credit-container">
		<div class="member">
			<a href="https://twitter.com/thebossybabe" class="web" target="_BLANK">
				<div class="wpgmza-rounded-image">
					<img 
						class="wpgmza-developer-avatar gravatar"
						src="<?php echo plugin_dir_url(WPGMZA_FILE); ?>images/tam-duncan.png" 
						alt="Tam Duncan"/>
				</div>
				Tam Duncan</a>
			<span class="title">
				<?php _e("Marketing","wp-google-maps"); ?>
			</span>
		</div>

		<div class="member">
			<a href="https://profiles.wordpress.org/stevendebeer/" class="web" target="_BLANK">
				<div class="wpgmza-rounded-image">
					<img 
						class="wpgmza-developer-avatar gravatar"
						src="<?php echo plugin_dir_url(WPGMZA_FILE); ?>images/0d92d7c9c787-512.jpeg" 
						alt="Support &amp; Developer"/>
				</div>
				Steven De Beer
			</a>
			<span class="title">
				<?php esc_html_e("Support &amp; Developer","wp-google-maps"); ?>
			</span>
		</div>

		<div class="member">
			<a href="https://profiles.wordpress.org/matthewlau/" class="web" target="_BLANK">
				<div class="wpgmza-rounded-image">
					<img 
						class="wpgmza-developer-avatar gravatar"
						src="<?php echo plugin_dir_url(WPGMZA_FILE); ?>images/matthew.png" 
						alt="Matthew Lau"/>
				</div>
				Matthew Lau</a>
			<span class="title">
				<?php esc_html_e("Support &amp; Developer","wp-google-maps"); ?>
			</span>
		</div>

		<div class="member">
			<a href="https://twitter.com/glen_smith" class="web" target="_BLANK">
				<div class="wpgmza-rounded-image">
					<img 
						class="wpgmza-developer-avatar gravatar"
						src="<?php echo plugin_dir_url(WPGMZA_FILE); ?>images/8afc912f69e8-512.jpeg" 
						alt="Glen Smith"/>
				</div>
				Glen Smith</a>
			<span class="title">
				<?php _e("Quality Assurance","wp-google-maps"); ?>
			</span>
		</div>

	</div>

	<div class="credit-container">
		<div class="member">
			<a href="https://hackerone.com/jerbinessim" class="web" target="_BLANK">
				<div class="wpgmza-rounded-image">
					<img 
						class="wpgmza-developer-avatar gravatar"
						src="<?php echo plugin_dir_url(WPGMZA_FILE); ?>images/d32b41e4f213.png" 
						alt="Nessim Jerbi"/>
				</div>
				Nessim Jerbi</a>
			<span class="title">
				<?php _e("Security Analyst","wp-google-maps"); ?>
			</span>
		</div>
	</div>

	<hr>

	<h2><?php _e("Security","wp-google-maps"); ?></h2>
	<div class="credit-container">
		<ul class="list-chain">
			<li>Visse</li>
			<li>Mohammed Adam</li>
			<li>Thomas Chauchefoin</li>
			<li>Nessim Jerbi</li>
			<li>Gerard Arall</li>
			<li>David Clough</li>
			<li>Rezaduty</li>
		</ul>

	</div>

	<p>
		<em><?php _e("Special thanks to our amazing community, for all your security reports and contributions", "wp-google-maps"); ?></em>
	</p>

	<hr>

	<h2><?php _e("Core Contributions","wp-google-maps"); ?></h2>
	<div class="credit-container">
		<ul class="list-chain">
			<!-- Actionable code changes from community -->
			<li title="Stability Improvements | GitHub: @shazahm1">Steven Zahm</li>
			<li title="Stability Improvements | GitHub: @CNick">CNick</li>
			<li title="Optimization | GitHub: @Lowwebtech">Lowwebtech</li>
			<li title="Localization Improvements | GitHub: @garretthyder">Garrett Hyder</li>
			<li title="Stability Improvements | GitHub: @KZeni">Kurt Zenisek</li>
			<li title="Core Improvements | GitHub: @nicoletta-maia">Nicoletta Maia</li>

			<!-- Issue Reporters -->
			<li title="Issue Reporter | GitHub: @AmitT">Amit Tal</li>
			<li title="Issue Reporter | GitHub: @Gismo1337">Sebastian Richter</li>
			<li title="Issue Reporter | GitHub: @dmitriyKharlashin">Dmitriy Kharlashin</li>
			<li title="Issue Reporter | GitHub: @MikeNGarrett">Mike Garrett</li>
			<li title="Issue Reporter | GitHub: @frank6tg">Frank Gomez</li>
			<li title="Issue Reporter | GitHub: @Tes3awy">Osama Abbas</li>
			<li title="Issue Reporter | GitHub: @MrKoopie">D Koop</li>
			<li title="Issue Reporter | GitHub: @DavidHepper">David Hepper</li>
			<li title="Issue Reporter | GitHub: @stevengliebe">Steven Gliebe</li>
			<li title="Issue Reporter | GitHub: @aamorozov">Andrey Morozov</li>
			<li title="Issue Reporter | GitHub: @Tanmccuin">Tanner McCuin</li>
			<li title="Issue Reporter | GitHub: @stephangriesel">Stephan Griesel</li>
			<li title="Issue Reporter | GitHub: @nickw108">Nick Weisser</li>
			<li title="Issue Reporter | GitHub: @waded">Wade Dorrell</li>
			<li title="Issue Reporter">Dani Haberer</li>

			<!-- Issue Reporters - Internal -->
			<li title="Issue Reporter | GitHub: @patdumond">Patricia Dumond</li>
			<li title="Issue Reporter | GitHub: @DiegoSilva776">Diego Silva</li>

			<!-- Previous Internal Developers -->
			<li title="Version 8 Developer">Perry Rylance <code>V8</code></li>
			<li title="Version 7 Developer">Dylan Kotze <code>V7</code></li>
			<li title="Version 7 Developer">Trevor Anderson <code>V7</code></li>
			<li title="Version 6 Developer">Jarek Kacprzak <code>V6</code></li>
			<li title="Version 6 Developer">Jarryd Long <code>V6</code></li>
		</ul>

	</div>
	
	<p>
		<em><?php _e("Special thanks to all the developers who have helped improve our architecture", "wp-google-maps"); ?></em>
	</p>

	<hr>

	<h2><?php _e("Translators","wp-google-maps"); ?></h2>
	<div class="credit-container">
		<ul class="list-chain">
			<li>Pedro Ponz</li>
			<li>Neno</li>
			<li>Martin Sleipner</li>
			<li>Lyubomir Kolev</li>
			<li>Suha Karalar</li>
			<li>Konstantinos Koukoulakis</li>
			<li>Tommaso Mori</li>
			<li>Arnaud Thomas</li>
			<li>Borisa Djuraskovic</li>
			<li>Matteo Ender</li>
			<li>Fernando</li>
			<li>Alessio Cornale</li>
			<li>Michik1712</li>
			<li>Alejandro Catalán</li>
			<li>Petr Aubrecht</li>
			<li>Updownbikes</li>
		</ul>

	</div>
	
	<p>
		<em><?php _e("Special thanks to our amazing community, for all your translation contributions", "wp-google-maps"); ?></em>
	</p>

	<hr>

	<h3>
		<?php _e("Want to see your name on this page?","wp-google-maps"); ?>
		<a href="https://github.com/CodeCabin/wp-google-maps/">
			<?php _e("Get involved on GitHub.","wp-google-maps"); ?>
		</a>
	</h3>

	<hr>

	<h2><?php _e("Ready to get started?", "wp-google-maps"); ?></h2>                
    <a class="wpgmza-button" href="<?php echo admin_url('admin.php?page=wp-google-maps-menu&amp;action=installer&amp;autoskip=true'); ?>">
        <?php echo __("Let's get started","wp-google-maps"); ?>
        <i class="fa fa-chevron-right" aria-hidden="true"></i>
    </a>

</div>