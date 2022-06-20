<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

class Polyline extends Feature
{
	public function __construct($id_or_fields=-1, $read_mode=Crud::SINGLE_READ)
	{
		global $wpdb;
		
		Crud::__construct("{$wpdb->prefix}wpgmza_polylines", $id_or_fields, $read_mode);
	}
}