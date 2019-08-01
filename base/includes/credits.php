<?php

if(!defined('ABSPATH'))
	exit;

?>

<div class="wrap about-wrap">

<h1><?php 

global $wpgmza;
printf(__("Welcome to WP Google Maps version %s","wp-google-maps"), $wpgmza->getBasicVersion());

?></h1>

<div class="about-text"><?php _e("Thank you for updating! WP Google Maps version 7 helps you build amazing maps through a simple interface and powerful functionality along with world class support.","wp-google-maps"); ?></div>

<div class="wpgmza-badge" style=''></div>

<h2 class="nav-tab-wrapper wp-clearfix">
	<a href="admin.php?page=wp-google-maps-menu&action=welcome_page" class="nav-tab"><?php _e("Welcome","wp-google-maps"); ?></a>
	<a href="admin.php?page=wp-google-maps-menu&action=credits" class="nav-tab nav-tab-active"><?php _e("Credits","wp-google-maps"); ?></a>

</h2>

<p class="about-description"><?php _e("WP Google Maps is created by an international team of developers.","wp-google-maps"); ?></p>
<h3 class="wp-people-group"><?php _e("Project Leaders","wp-google-maps"); ?></h3>
<ul class="wp-people-group " id="wp-people-group-project-leaders">

<li class="wp-person" id="wp-person-nickduncan">
	<a href="https://profiles.wordpress.org/nickduncan/" class="web"><img src="https://secure.gravatar.com/avatar/38d79f24b5a649e132f8ed93f6dc2d37?s=60&amp;d=mm&amp;r=g" srcset="https://secure.gravatar.com/avatar/38d79f24b5a649e132f8ed93f6dc2d37?s=64&d=mm&r=g 2x" class="gravatar" alt="">
Nick Duncan</a>
	<span class="title"><?php _e("Founder &amp; Lead Developer","wp-google-maps"); ?></span>
</li>
	<li class="wp-person" id="wp-person-perry">
		<a href="https://github.com/orgs/CodeCabin/people/PerryRylance" class="web"><img src="https://avatars3.githubusercontent.com/u/14136738?s=96&v=4" srcset="https://avatars3.githubusercontent.com/u/14136738?s=96&v=4 2x" class="gravatar" alt="">
	Perry Rylance</a>
		<span class="title"><?php _e("Lead Developer &amp; Support","wp-google-maps"); ?></span>
	</li>
</ul>
<h3 class="wp-people-group"><?php _e("Contributors","wp-google-maps"); ?></h3>
<ul class="wp-people-group " id="wp-people-group-core-developers">

	<li class="wp-person" id="wp-person-dylanauty">
		<a href="https://profiles.wordpress.org/dylanauty/" class="web"><img src="https://secure.gravatar.com/avatar/3e032ec3258ebc08eeed69568141164a?s=64&d=mm&r=g" srcset="https://secure.gravatar.com/avatar/3e032ec3258ebc08eeed69568141164a?s=64&d=mm&r=g 2x" class="gravatar" alt="">
	Dylan Auty</a>
		<span class="title"><?php _e("Support &amp; Developer","wp-google-maps"); ?></span>
	</li>

	<li class="wp-person" id="wp-person-dylanauty">
		<a href="https://github.com/JarekCodeCabin" class="web"><img src="https://avatars3.githubusercontent.com/u/25925938?s=460&v=4" srcset="https://avatars3.githubusercontent.com/u/25925938?s=460&v=4 2x" class="gravatar" alt="">
	Jarek Kacprzak</a>
		<span class="title"><?php _e("Support &amp; Developer","wp-google-maps"); ?></span>
	</li>	



	<li class="wp-person" id="wp-person-tamduncan">
		<a href="https://twitter.com/thebossybabe" class="web"><img src="https://pbs.twimg.com/profile_images/378800000229252467/623181616d530dc6e8088939814b0f5d_400x400.jpeg" srcset="https://pbs.twimg.com/profile_images/378800000229252467/623181616d530dc6e8088939814b0f5d_400x400.jpeg 2x" class="gravatar" alt="">
	Tam Duncan</a>
		<span class="title"><?php _e("Marketing","wp-google-maps"); ?></span>
	</li>
	<li class="wp-person" id="wp-person-dylank">
		<a href="https://github.com/orgs/CodeCabin/people/dylank6169" class="web"><img src="https://avatars3.githubusercontent.com/u/25743655?s=96&v=4" srcset="https://avatars3.githubusercontent.com/u/25743655?s=96&v=4 2x" class="gravatar" alt="">
	Dylan Kotzé</a>
		<span class="title"><?php _e("Support &amp; Developer","wp-google-maps"); ?></span>
	</li>
	<li class="wp-person" id="wp-person-trevor">
		<a href="https://github.com/orgs/CodeCabin/people/andtrev" class="web"><img src="https://avatars3.githubusercontent.com/u/13884866?s=96&v=4"  class="gravatar" alt="">
	Trevor Anderson</a>
		<span class="title"><?php _e("Support &amp; Developer","wp-google-maps"); ?></span>
	</li>		

	<li class="wp-person" id="wp-person-veronique">
		<a href="https://github.com/orgs/CodeCabin/people/VeroniqueSmit" class="web"><img src="https://avatars1.githubusercontent.com/u/22832458?s=96&v=4"  class="gravatar" alt="">
	Veronique Smit</a>
		<span class="title"><?php _e("Support","wp-google-maps"); ?></span>
	</li>	

	<li class="wp-person" id="wp-person-pat">
		<a href="https://github.com/patdumond" class="web"><img src="https://avatars3.githubusercontent.com/u/9320495?s=460&v=4"  class="gravatar" alt="">
	Pat Dumond</a>
		<span class="title"><?php _e("Documentation","wp-google-maps"); ?></span>
	</li>	
	<li class="wp-person" id="wp-person-nathanmiller">
		<a href="https://profiles.wordpress.org/jarryd-long/" class="web"><img src="https://ca.slack-edge.com/T0CCUAUDD-U0CDJ724Q-g4e0ca967af9-1024" srcset="https://ca.slack-edge.com/T0CCUAUDD-U0CDJ724Q-g4e0ca967af9-1024 2x" class="gravatar" alt="">
	Nathan Miller</a>
		<span class="title"><?php _e("Support","wp-google-maps"); ?></span>
	</li>

	<li class="wp-person" id="wp-person-gerardarall">
		<a href="https://github.com/arall" class="web"><img src="https://avatars2.githubusercontent.com/u/1453137?s=60&v=4" srcset="https://avatars2.githubusercontent.com/u/1453137?s=60&v=4 2x" class="gravatar" alt="">
	Gerard Arall</a>
		<span class="title"><?php _e("Security suggestions","wp-google-maps"); ?></span>
	</li>


<p class="clear"><?php _e("Want to see your name on this page?","wp-google-maps"); ?> <a href="https://github.com/CodeCabin/wp-google-maps/"><?php _e("Get involved on GitHub.","wp-google-maps"); ?></a></p>

                <a class="button-primary" style='padding:10px; height:inherit;' href="admin.php?page=wp-google-maps-menu&override=1"><?php echo __("OK! Let's start","wp-google-maps"); ?></a>

</div>