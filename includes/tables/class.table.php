<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

class Table extends Factory
{
	private $_table_name;
	private $_document;
	private $_element;
	
	public function __construct($table_name)
	{
		if(empty($table_name))
			throw new \Exception('Invalid table name');
		
		$this->_table_name = $table_name;

		$this->_document = new DOMDocument();
		$this->loadDocument();
		$this->_element = $this->getElement();
	}
	
	protected function loadDocument()
	{
		$this->_document->loadHTML('<div data-wpgmza-table/>');
	}
	
	protected function getElement()
	{
		return $this->_document->querySelector('[data-wpgmza-table]');
	}
	
	public function __get($name)
	{
		if(isset($this->{"_$name"}))
			return $this->{"_$name"};
		
		return $this->{$name};
	}
	
	public function __set($name, $value)
	{
		if(isset($this->{"_$name"}))
			throw new \Exception('Property is read only');
		
		$this->{$name} = $value;
	}
	
	public function html()
	{
		return $this->_document->saveInnerBody();
	}
	
	public function data($params)
	{
		throw new \Exception('Abstract function called');
	}
}