<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

/**
 * Used to facilitate communication and caching between the client and the Nominatim Geocoding service
 */
#[\AllowDynamicProperties]
class NominatimGeocodeCache
{
	/**
	 * Constructor.
	 */
	public function __construct()
	{
		global $wpdb;
		
		$this->table = $wpdb->prefix . "wpgmza_nominatim_geocode_cache";
		
		if(!$wpdb->get_var("SHOW TABLES LIKE '{$this->table}'"))
		{
			require_once(ABSPATH . '/wp-admin/includes/upgrade.php');
			
			\dbDelta("CREATE TABLE {$this->table} (
				id int(11) NOT NULL AUTO_INCREMENT,
				query VARCHAR(512),
				response TEXT,
				PRIMARY KEY  (id)
			) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1");
		}
	}
	
	/**
	 * Returns the cached result from the local geocode cache
	 * @param string $query The address being queried
	 * @return object|null The cached geocode result, or null where no result is found
	 */
	public function get($query)
	{
		global $wpdb;
		
		// Check the cache first, as per the nominatim usage policy
		$stmt = $wpdb->prepare("SELECT response FROM {$this->table} WHERE query=%s LIMIT 1", array($query));
		
		/* Developer Hook (Filter) - Modify DB connction for nominatim query */
		$stmt = apply_filters( 'wpgmza_ol_nomination_cache_query_get', $stmt, $query );

		$string = $wpdb->get_var($stmt);
		$json = null;
		
		if(!empty($string))
			$json = json_decode(stripslashes($string));
		
		return $json;
	}
	
	/**
	 * Caches the supplied response, from the supplied query
	 * @param string $query The queried address
	 * @param string $response The returned response to cache
	 */
	public function set($query, $response)
	{
		global $wpdb;
		
		$query = sanitize_text_field($query);

		if(empty($query)){
			throw new \Exception("First argument cannot be empty");
		}

		if(!empty($response)){
			if(is_string($response)){
				try{
					$json = json_decode(stripslashes($response));
					$response = $json;
				} catch(\Exception $ex){
					$response = false;
				} catch(\Error $err){

					$response = false;
				}

			}

			if(!empty($response)){
				if(is_object($response)){
					$response = array($response);
				}

				if(is_array($response)){
					$response = $this->sanitizeDataRecursive($response);
				} else {
					throw new \Exception("Response data must be array of objects");
				}
			} else {
				throw new \Exception("Malformed response data");
			}
		} else {
			throw new \Exception("Response data cannot be empty");
		}


		if(!empty($response) && is_array($response)){
			$response = json_encode($response);

			/* Remove old cache results */
			$wpdb->query($wpdb->prepare("DELETE FROM {$this->table} WHERE query = %s", array($query)));

			/* Store new cache result */
			$stmt = $wpdb->prepare("INSERT INTO {$this->table} (query, response) VALUES (%s, %s)", array(
				$query,
				$response
			));

			/* Developer Hook (Filter) - Modify nominatim cache store */
			$stmt = apply_filters( 'wpgmza_ol_nomination_cache_query_set', $stmt, $query, $response );

			$wpdb->query($stmt);
		} else {
			throw new \Exception("Malformed response data");
		}
	}

	/**
	 * Clears the cache
	 */
	public function clear()
	{
		global $wpdb;
				
		$stmt = $wpdb->query("TRUNCATE TABLE {$this->table}");
	}

	/**
	 * Queries the nominatim directly, as if it was a client side request
	 * 
	 * This offloads the process from the client, adding security and reliability to the request
	 * 
	 * Ideally this would be in some nominatim shared class, but this was a later addition to mitigate cache poisoning and
	 * as such needs to exist here fro backwards compat, and long term reuse. 
	 * 
	 * We'll likely streamline this down the road into one geocoder system or something
	 * 
	 * @param object $query
	 * 
	 * @return array
	 */
	public function queryNominatimProxy($query){
		if(!empty($query) && !empty($query->q)){
            $args = array(
                'q' => $query->q,
                'format' => !empty($query->format) ? $query->format : 'json'
            );

			if(!empty($query->countrycodes)){
				$args['countrycodes'] = $query->countrycodes;
			}

            $endpoint = 'https://nominatim.openstreetmap.org/search';

            $url = add_query_arg($args, $endpoint);

            $siteUrl = get_site_url();
            $response = wp_remote_get($url, 
                array(
                    'headers' => array(
                        'User-Agent' => 'WPGoMapsGeocoder (' . $siteUrl . ')', 
                        'Referer' => $siteUrl
                    ),
                    'timeout' => 10
                )
            );

            if(!is_wp_error($response)){
                try {
                    $response = wp_remote_retrieve_body($response);
                    $json = json_decode($response);

                    if(!empty($json)){
                        return $json;
                    } else {
						/* Check if the user has been blocked by OSM/Nominatim */
						if(strpos($response, 'Access blocked') !== FALSE){
							$notice = strip_tags($response);
							$notice = str_replace("Access blocked", "", $notice);
							return (object) array(
								'error' => $notice
							);
						}
					}
                } catch (\Exception $ex){
                    return false;
                } catch (\Error $err){
                    return false;
                }
            }
        }
        return false;
	}

	public function sanitizeDataRecursive($data){
		if(!is_array($data) && !is_object($data)){
			return sanitize_text_field($data);
		}

		foreach($data as $key => $value){
			if(is_array($value) || is_object($value)){
				$value = $this->sanitizeDataRecursive($value);
			} else if(is_float($value)){
				$value = floatval($value);
			} else if(is_int($value)){
				$value = intval($value);
			} else {
				$value = sanitize_text_field($value);
			}

			if(is_object($data)){
				$data->{$key} = $value;
			} else if(is_array($data)){
				$data[$key] = $value;
			}
		}
		return $data;
	}
}

/**
 * Bind function to clear the Nominatim cache.
 * @deprecated This will be moved to the REST API in the future
 */
function clear_nominatim_cache()
{
	global $wpgmza;
	
	if(!$wpgmza->isUserAllowedToEdit() || empty($_POST['wpgmza_security']) || !wp_verify_nonce($_POST['wpgmza_security'], 'wpgmza_ajaxnonce')){
		http_response_code(401);
		return;
	}
	
	$cache = new NominatimGeocodeCache();
	$cache->clear();

	wp_send_json(array(
		'success' => 1
	));
	exit;
}

add_action('wp_ajax_wpgmza_clear_nominatim_cache', 			'WPGMZA\\clear_nominatim_cache');
