<?php

namespace WPGMZA;

class Pro9Compatibility{
	public function __construct(){
        $this->validateInternalEngine();
	}
	
	public function validateInternalEngine(){
        global $wpgmza_pro_version;
        if(!empty($wpgmza_pro_version)) {
		    if(version_compare($wpgmza_pro_version, '9.0.0', '<')){
                /* Pro is lower than X */
		        $settings = new GlobalSettings();
                if(!empty($settings) && !empty($settings->internal_engine)){
                    if($settings->internal_engine !== 'legacy'){
                        /* Pro version requirement has not been met, force the system back to legacy */
                        $settings->internal_engine = 'legacy';
                    }

                    if(!empty($settings->enable_batch_loading)){
                        /* Can't use this with legacy and Pro below requirements */
                        $settings->enable_batch_loading = "";
                        $settings->fetchMarkersBatchSize = "";
                    }
                }
            }
        }

		
		
	}
}