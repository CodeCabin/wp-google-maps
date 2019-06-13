<?php

namespace WPGMZA;

class EliasFano
{
	private static $decodingTablesInitialised = false;
	private static $decodingTableHighBits;
	private static $decodingTableDocIDNumber;
	private static $decodingTableHighBitsCarryover;
	
	public function __construct()
	{
		if(!EliasFano::$decodingTablesInitialised)
			EliasFano::createDecodingTable();
	}
	
	public static function isLittleEndian()
	{
		$testint = 0x00FF;
		$p = pack('S', $testint);
		return $testint === current(unpack('v', $p));
	}
	
	public static function createDecodingTable()
	{
		EliasFano::$decodingTableDocIDNumber = array_fill(0, 256, 0);
		EliasFano::$decodingTableHighBitsCarryover = array_fill(0, 256, 0);
		
		for($i = 0; $i < 256; $i++)
		{
			$zeroCount = 0;
			
			EliasFano::$decodingTableHighBits[$i] = array();
			
			for($j = 7; $j >= 0; $j--)
			{
				if(($i & (1 << $j)) > 0)
				{
					EliasFano::$decodingTableHighBits[$i][EliasFano::$decodingTableDocIDNumber[$i]] = $zeroCount;
					
					EliasFano::$decodingTableDocIDNumber[$i]++;
					$zeroCount = 0;
				}
				else
					$zeroCount = ($zeroCount + 1) % 0xFF;
				
				EliasFano::$decodingTableHighBitsCarryover[$i] = $zeroCount;
			}
		}
		
		EliasFano::$decodingTablesInitialised = true;
	}
	
	public function decode($compressedBuffer, $compressedBufferPointer)
	{
		$resultPointer = 0;
		$list = array();
		
		$decodingTableHighBits = EliasFano::$decodingTableHighBits;
		$decodingTableDocIDNumber = EliasFano::$decodingTableDocIDNumber;
		$decodingTableHighBitsCarryover = EliasFano::$decodingTableHighBitsCarryover;
		
		$lowBitsPointer = 0;
		$lastDocID = 0;
		$docID = 0;
		$docIDNumber = 0;
		
		$listCount = $compressedBuffer[$lowBitsPointer++];
		$listCount |= $compressedBuffer[$lowBitsPointer++] << 8;
		$listCount |= $compressedBuffer[$lowBitsPointer++] << 16;
		$listCount |= $compressedBuffer[$lowBitsPointer++] << 24;
		
		$lowBitsLength = $compressedBuffer[$lowBitsPointer++];
		
		$highBitsPointer = 0;
		$lowBitsCount = 0;
		$lowBits = 0;
		$cb = 1;
		
		for(
			$highBitsPointer = floor($lowBitsLength * $listCount / 8 + 6);
			$highBitsPointer < $compressedBufferPointer;
			$highBitsPointer++
			)
		{
			$docID += $decodingTableHighBitsCarryover[$cb];
			$cb = $compressedBuffer[$highBitsPointer];
			
			$docIDNumber = $decodingTableDocIDNumber[$cb];
			
			for($i = 0; $i < $docIDNumber; $i++)
			{
				$docID <<= $lowBitsCount;
				$docID |= $lowBits & ((1 << $lowBitsCount) - 1);
				
				while($lowBitsCount < $lowBitsLength)
				{
					$docID <<= 8;
					
					$lowBits = $compressedBuffer[$lowBitsPointer++];
					$docID |= $lowBits;
					$lowBitsCount += 8;
				}
				
				$lowBitsCount -= $lowBitsLength;
				$docID >>= $lowBitsCount;
				
				$docID += ($decodingTableHighBits[$cb][$i] << $lowBitsLength) + $lastDocID + 1;
				
				$list[$resultPointer++] = $docID;
				
				$lastDocID = $docID;
				$docID = 0;
			}
		}
		
		return $list;
	}
}

