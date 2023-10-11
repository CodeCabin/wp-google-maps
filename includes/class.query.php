<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

#[\AllowDynamicProperties]
class Query
{
	const WHERE			= "where";
	const HAVING		= "having";
	
	private $_type;
	private $_table;
	
	private $_fields;
	
	private $_join;
	private $_where;
	
	private $_union;
	
	private $_groupBy;
	private $_orderBy;
	private $_having;
	
	private $_limit;
	
	private $_params;
	
	public function __construct($parts=null)
	{
		$this->_type = null;
		$this->_table = null;
		
		$this->_fields	= new QueryFragment();

		$this->_join 	= new QueryFragment();
		$this->_where 	= new QueryFragment();
		
		$this->_union	= new QueryFragment();
		
		$this->_groupBy = new QueryFragment();
		$this->_orderBy = new QueryFragment();
		$this->_having 	= new QueryFragment();
		
		$this->_placeholders = array();
		$this->_params	= new QueryFields();
	}
	
	public function __get($name)
	{
		if(isset($this->{"_$name"}))
		{
			if($this->{"_$name"} instanceof QueryFragment)
				return $this->{"_$name"};
			
			return $this->{"_$name"};
		}
		
		return $this->{$name};
	}
	
	public function __set($name, $value)
	{
		if(isset($this->{"_$name"}) && is_array($this->{"_$name"}) && $name != 'fields' && $name != 'limit')
			throw new \Exception('Property is read only');
		
		switch($name)
		{
			case 'type':
				$value = strtoupper($value);
				$this->{"_$name"} = $value;
				
				$this->assertTypeValid();
				
				break;
			
			case 'table':
				$this->{"_$name"} = $value;
				
				$this->assertTableValid();
				
				break;
				
			case 'fields':
				if(!is_array($value))
					throw new \Exception('Fields must be an array');
				
				foreach($value as $k => $v)
					$this->_fields->{$k} = $v;

				break;
				
			case 'limit':
				if(!preg_match('/\d+\s*,\s*\d+/', $value))
					throw new \Exception('Invalid SQL limit');
			
				$this->_limit = $value;

				break;
				
			default:
				$this->{$name} = $value;
				break;
		}
		
	}
	
	private function assertTypeValid()
	{
		switch($this->_type)
		{
			case 'INSERT':
			case 'SELECT':
			case 'UPDATE':
			case 'DELETE':
				break;
			
			default:
				throw new \Exception('Invalid query type');
				break;
		}
	}
	
	private function assertTableValid()
	{
		if(!is_string($this->_table) || empty($this->_table))
			throw new \Exception('Invalid table');
	}
	
	public function in($field, $set, $placeholder='%d')
	{
		if(!is_string($field))
			throw new \Exception('Invalid field name');
		
		if(!is_array($set))
			throw new \Exception('Set must be an array');
		
		if(empty($set))
			return;
		
		$count = count($set);
		
		$placeholders = implode(', ', array_fill(0, $count, $placeholder));
		
		$this->_where[] = "$field IN ($placeholders)";
		
		foreach($set as $item)
			$this->_params[] = $item;
		
		return $this;
	}
	
	public function build()
	{
		global $wpdb;
		
		$this->assertTypeValid();
		$this->assertTableValid();
		
		$queryStrings = array();
		$queries = array($this);
		
		if(count($this->union))
		{
			if($this->_type != 'SELECT')
				throw new \Exception('UNION is only supported for SELECT queries');
			
			foreach($this->union as $unionQuery)
			{
				$queries[] = $unionQuery;
			}
		}
		
		foreach($queries as $query)
		{
			$qstr = $query->_type;
			
			switch($query->_type)
			{
				case 'SELECT':
					if(empty($query->_fields))
						throw new \Exception('You must specify fields to select');
					
					$arr = $query->_fields->toArray();
					
					if(!empty($arr))
						$str = implode(', ', $arr);
					else
						$str = '*';
				
					$qstr .= " $str FROM";
					break;
				
				case 'INSERT':
					$qstr .= " INTO";
					break;
					
				case 'DELETE':
					$qstr .= " FROM";
					break;
			}
			
			$qstr .= " " . $query->_table;
			
			if(!empty($query->_join))
			{
				$qstr .= ' ';
				
				foreach($query->_join as $join)
					$qstr .= 'JOIN ' . $join;
			}
			
			$where = $query->_where->toArray();
			if(!empty($where))
				$qstr .= " WHERE " . implode(' AND ', $where);

			$group = $query->_groupBy->toArray();
			if(!empty($group))
				$qstr .= " GROUP BY " . implode(', ', $group);
			
			$having = $query->_having->toArray();
			if(!empty($having))
				$qstr .= " HAVING " . implode(' AND ', $having);
			
			$params = $query->_params->toArray();
			
			if(count($params))
				$qstr = $wpdb->prepare($qstr, $params);
			
			$queryStrings[] = $qstr;
		}
		
		if(count($queryStrings) == 1)
			$qstr = $queryStrings[0];
		else
		{
			$qstr = implode(' UNION ALL ', $queryStrings);
		}

		$orderBy = $query->_orderBy->toArray();
		if(!empty($orderBy))
			$qstr .= " ORDER BY " . implode(', ', $orderBy); 
		
		if(!empty($this->_limit))
			$qstr .= " LIMIT {$this->_limit}";
		
		return $qstr;
	}
}
