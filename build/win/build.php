<?php

$ch = curl_init('http://localhost?wpgmza-build=true');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$result = curl_exec($ch);

if($result != 'Build successful')
{
	echo $result;
	exit(1);
}
