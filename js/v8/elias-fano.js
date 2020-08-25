/**
 * @namespace WPGMZA
 * @module EliasFano
 * @requires WPGMZA
 * @gulp-requires core.js
 */
jQuery(function($) {
	
	WPGMZA.EliasFano = function()
	{
		if(!WPGMZA.EliasFano.isSupported)
			throw new Error("Elias Fano encoding is not supported on browsers without Uint8Array");
		
		if(!WPGMZA.EliasFano.decodingTablesInitialised)
			WPGMZA.EliasFano.createDecodingTable();
	}
	
	WPGMZA.EliasFano.isSupported = ("Uint8Array" in window);
	
	WPGMZA.EliasFano.decodingTableHighBits			= [];
	WPGMZA.EliasFano.decodingTableDocIDNumber		= null;
	WPGMZA.EliasFano.decodingTableHighBitsCarryover = null;
	
	WPGMZA.EliasFano.createDecodingTable = function()
	{
		WPGMZA.EliasFano.decodingTableDocIDNumber = new Uint8Array(256);
		WPGMZA.EliasFano.decodingTableHighBitsCarryover = new Uint8Array(256);
		
		var decodingTableHighBits = WPGMZA.EliasFano.decodingTableHighBits;
		var decodingTableDocIDNumber = WPGMZA.EliasFano.decodingTableDocIDNumber;
		var decodingTableHighBitsCarryover = WPGMZA.EliasFano.decodingTableHighBitsCarryover;
		
		for(var i = 0; i < 256; i++)
		{
			var zeroCount = 0;
			
			decodingTableHighBits[i] = [];
			
			for(var j = 7; j >= 0; j--)
			{
				if((i & (1 << j)) > 0)
				{
					decodingTableHighBits[i][decodingTableDocIDNumber[i]] = zeroCount;
					
					decodingTableDocIDNumber[i]++;
					zeroCount = 0;
				}
				else
					zeroCount = (zeroCount + 1) % 0xFF;
			}
			
			decodingTableHighBitsCarryover[i] = zeroCount;
		}
		
		WPGMZA.EliasFano.decodingTablesInitialised = true;
	}
	
	WPGMZA.EliasFano.prototype.encode = function(list)
	{
		var lastDocID		= 0,
			buffer1 		= 0,
			bufferLength1 	= 0,
			buffer2 		= 0,
			bufferLength2 	= 0;
		
		if(list.length == 0)
			return result;
		
		function toByte(n)
		{
			return n & 0xFF;
		}
		
		var compressedBufferPointer1 = 0;
		var compressedBufferPointer2 = 0;
		var largestBlockID = list[list.length - 1];
		var averageDelta = largestBlockID / list.length;
		var averageDeltaLog = Math.log2(averageDelta);
		var lowBitsLength = Math.floor(averageDeltaLog);
		var lowBitsMask = (1 << lowBitsLength) - 1;
		var prev = null;
		
		var maxCompressedSize = Math.floor(
			(
				2 + Math.ceil(
					Math.log2(averageDelta)
				)
			) * list.length / 8
		) + 6;
		
		var compressedBuffer = new Uint8Array(maxCompressedSize);
		
		if(lowBitsLength < 0)
			lowBitsLength = 0;
		
		compressedBufferPointer2 = Math.floor(lowBitsLength * list.length / 8 + 6);
		
		compressedBuffer[compressedBufferPointer1++] = toByte( list.length );
		compressedBuffer[compressedBufferPointer1++] = toByte( list.length >> 8 );
		compressedBuffer[compressedBufferPointer1++] = toByte( list.length >> 16 );
		compressedBuffer[compressedBufferPointer1++] = toByte( list.length >> 24 );
		
		compressedBuffer[compressedBufferPointer1++] = toByte( lowBitsLength );
		
		list.forEach(function(docID) {
			
			var docIDDelta = (docID - lastDocID - 1);
			
			if(!$.isNumeric(docID))
				throw new Error("Value is not numeric");
			
			// NB: Force docID to an integer in case it's a string
			docID = parseInt(docID);
			
			if(prev !== null && docID <= prev)
				throw new Error("Elias Fano encoding can only be used on a sorted, ascending list of unique integers.");
			
			prev = docID;
			
			buffer1 <<= lowBitsLength;
			buffer1 |= (docIDDelta & lowBitsMask);
			bufferLength1 += lowBitsLength;
			
			// Flush buffer 1
			while(bufferLength1 > 7)
			{
				bufferLength1 -= 8;
				compressedBuffer[compressedBufferPointer1++] = toByte( buffer1 >> bufferLength1 );
			}
			
			var unaryCodeLength = (docIDDelta >> lowBitsLength) + 1;
			
			buffer2 <<= unaryCodeLength;
			buffer2 |= 1;
			bufferLength2 += unaryCodeLength;
			
			// Flush buffer 2
			while(bufferLength2 > 7)
			{
				bufferLength2 -= 8;
				compressedBuffer[compressedBufferPointer2++] = toByte( buffer2 >> bufferLength2 );
			}
			
			lastDocID = docID;
		});
		
		if(bufferLength1 > 0)
			compressedBuffer[compressedBufferPointer1++] = toByte( buffer1 << (8 - bufferLength1) );
		
		if(bufferLength2 > 0)
			compressedBuffer[compressedBufferPointer2++] = toByte( buffer2 << (8 - bufferLength2) );
		
		var result = new Uint8Array(compressedBuffer);
		
		result.pointer = compressedBufferPointer2;
		
		return result;
	}
	
	WPGMZA.EliasFano.prototype.decode = function(compressedBuffer)
	{
		var resultPointer = 0;
		var list = [];
		
		//console.log("Decoding buffer from pointer " + compressedBuffer.pointer);
		//console.log(compressedBuffer);
		
		var decodingTableHighBits = WPGMZA.EliasFano.decodingTableHighBits;
		var decodingTableDocIDNumber = WPGMZA.EliasFano.decodingTableDocIDNumber;
		var decodingTableHighBitsCarryover = WPGMZA.EliasFano.decodingTableHighBitsCarryover;
		
		var lowBitsPointer = 0,
			lastDocID = 0,
			docID = 0,
			docIDNumber = 0;
		
		var listCount = compressedBuffer[lowBitsPointer++];
		
		//console.log("listCount is now " + listCount);
		
		listCount |= compressedBuffer[lowBitsPointer++] << 8;
		
		//console.log("listCount is now " + listCount);
		
		listCount |= compressedBuffer[lowBitsPointer++] << 16;
		
		//console.log("listCount is now " + listCount);
		
		listCount |= compressedBuffer[lowBitsPointer++] << 24;
		
		//console.log("Read list count " + listCount);
		
		var lowBitsLength = compressedBuffer[lowBitsPointer++];
		
		//console.log("lowBitsLength = " + lowBitsLength);
		
		var highBitsPointer,
			lowBitsCount = 0,
			lowBits = 0,
			cb = 1;
		
		for(
			highBitsPointer = Math.floor(lowBitsLength * listCount / 8 + 6);
			highBitsPointer < compressedBuffer.pointer;
			highBitsPointer++
			)
		{
			docID += decodingTableHighBitsCarryover[cb];
			cb = compressedBuffer[highBitsPointer];
			
			docIDNumber = decodingTableDocIDNumber[cb];
			
			for(var i = 0; i < docIDNumber; i++)
			{
				docID <<= lowBitsCount;
				docID |= lowBits & ((1 << lowBitsCount) - 1);
				
				while(lowBitsCount < lowBitsLength)
				{
					docID <<= 8;
					
					lowBits = compressedBuffer[lowBitsPointer++];
					docID |= lowBits;
					lowBitsCount += 8;
				}
				
				lowBitsCount -= lowBitsLength;
				docID >>= lowBitsCount;
				
				docID += (decodingTableHighBits[cb][i] << lowBitsLength) + lastDocID + 1;
				
				list[resultPointer++] = docID;
				
				lastDocID = docID;
				docID = 0;
			}
		}
		
		return list;
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJlbGlhcy1mYW5vLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIEVsaWFzRmFub1xyXG4gKiBAcmVxdWlyZXMgV1BHTVpBXHJcbiAqIEBndWxwLXJlcXVpcmVzIGNvcmUuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0V1BHTVpBLkVsaWFzRmFubyA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRpZighV1BHTVpBLkVsaWFzRmFuby5pc1N1cHBvcnRlZClcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRWxpYXMgRmFubyBlbmNvZGluZyBpcyBub3Qgc3VwcG9ydGVkIG9uIGJyb3dzZXJzIHdpdGhvdXQgVWludDhBcnJheVwiKTtcclxuXHRcdFxyXG5cdFx0aWYoIVdQR01aQS5FbGlhc0Zhbm8uZGVjb2RpbmdUYWJsZXNJbml0aWFsaXNlZClcclxuXHRcdFx0V1BHTVpBLkVsaWFzRmFuby5jcmVhdGVEZWNvZGluZ1RhYmxlKCk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5FbGlhc0Zhbm8uaXNTdXBwb3J0ZWQgPSAoXCJVaW50OEFycmF5XCIgaW4gd2luZG93KTtcclxuXHRcclxuXHRXUEdNWkEuRWxpYXNGYW5vLmRlY29kaW5nVGFibGVIaWdoQml0c1x0XHRcdD0gW107XHJcblx0V1BHTVpBLkVsaWFzRmFuby5kZWNvZGluZ1RhYmxlRG9jSUROdW1iZXJcdFx0PSBudWxsO1xyXG5cdFdQR01aQS5FbGlhc0Zhbm8uZGVjb2RpbmdUYWJsZUhpZ2hCaXRzQ2FycnlvdmVyID0gbnVsbDtcclxuXHRcclxuXHRXUEdNWkEuRWxpYXNGYW5vLmNyZWF0ZURlY29kaW5nVGFibGUgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0V1BHTVpBLkVsaWFzRmFuby5kZWNvZGluZ1RhYmxlRG9jSUROdW1iZXIgPSBuZXcgVWludDhBcnJheSgyNTYpO1xyXG5cdFx0V1BHTVpBLkVsaWFzRmFuby5kZWNvZGluZ1RhYmxlSGlnaEJpdHNDYXJyeW92ZXIgPSBuZXcgVWludDhBcnJheSgyNTYpO1xyXG5cdFx0XHJcblx0XHR2YXIgZGVjb2RpbmdUYWJsZUhpZ2hCaXRzID0gV1BHTVpBLkVsaWFzRmFuby5kZWNvZGluZ1RhYmxlSGlnaEJpdHM7XHJcblx0XHR2YXIgZGVjb2RpbmdUYWJsZURvY0lETnVtYmVyID0gV1BHTVpBLkVsaWFzRmFuby5kZWNvZGluZ1RhYmxlRG9jSUROdW1iZXI7XHJcblx0XHR2YXIgZGVjb2RpbmdUYWJsZUhpZ2hCaXRzQ2FycnlvdmVyID0gV1BHTVpBLkVsaWFzRmFuby5kZWNvZGluZ1RhYmxlSGlnaEJpdHNDYXJyeW92ZXI7XHJcblx0XHRcclxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCAyNTY7IGkrKylcclxuXHRcdHtcclxuXHRcdFx0dmFyIHplcm9Db3VudCA9IDA7XHJcblx0XHRcdFxyXG5cdFx0XHRkZWNvZGluZ1RhYmxlSGlnaEJpdHNbaV0gPSBbXTtcclxuXHRcdFx0XHJcblx0XHRcdGZvcih2YXIgaiA9IDc7IGogPj0gMDsgai0tKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0aWYoKGkgJiAoMSA8PCBqKSkgPiAwKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGRlY29kaW5nVGFibGVIaWdoQml0c1tpXVtkZWNvZGluZ1RhYmxlRG9jSUROdW1iZXJbaV1dID0gemVyb0NvdW50O1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRkZWNvZGluZ1RhYmxlRG9jSUROdW1iZXJbaV0rKztcclxuXHRcdFx0XHRcdHplcm9Db3VudCA9IDA7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdHplcm9Db3VudCA9ICh6ZXJvQ291bnQgKyAxKSAlIDB4RkY7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGRlY29kaW5nVGFibGVIaWdoQml0c0NhcnJ5b3ZlcltpXSA9IHplcm9Db3VudDtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0V1BHTVpBLkVsaWFzRmFuby5kZWNvZGluZ1RhYmxlc0luaXRpYWxpc2VkID0gdHJ1ZTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkVsaWFzRmFuby5wcm90b3R5cGUuZW5jb2RlID0gZnVuY3Rpb24obGlzdClcclxuXHR7XHJcblx0XHR2YXIgbGFzdERvY0lEXHRcdD0gMCxcclxuXHRcdFx0YnVmZmVyMSBcdFx0PSAwLFxyXG5cdFx0XHRidWZmZXJMZW5ndGgxIFx0PSAwLFxyXG5cdFx0XHRidWZmZXIyIFx0XHQ9IDAsXHJcblx0XHRcdGJ1ZmZlckxlbmd0aDIgXHQ9IDA7XHJcblx0XHRcclxuXHRcdGlmKGxpc3QubGVuZ3RoID09IDApXHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHRcclxuXHRcdGZ1bmN0aW9uIHRvQnl0ZShuKVxyXG5cdFx0e1xyXG5cdFx0XHRyZXR1cm4gbiAmIDB4RkY7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHZhciBjb21wcmVzc2VkQnVmZmVyUG9pbnRlcjEgPSAwO1xyXG5cdFx0dmFyIGNvbXByZXNzZWRCdWZmZXJQb2ludGVyMiA9IDA7XHJcblx0XHR2YXIgbGFyZ2VzdEJsb2NrSUQgPSBsaXN0W2xpc3QubGVuZ3RoIC0gMV07XHJcblx0XHR2YXIgYXZlcmFnZURlbHRhID0gbGFyZ2VzdEJsb2NrSUQgLyBsaXN0Lmxlbmd0aDtcclxuXHRcdHZhciBhdmVyYWdlRGVsdGFMb2cgPSBNYXRoLmxvZzIoYXZlcmFnZURlbHRhKTtcclxuXHRcdHZhciBsb3dCaXRzTGVuZ3RoID0gTWF0aC5mbG9vcihhdmVyYWdlRGVsdGFMb2cpO1xyXG5cdFx0dmFyIGxvd0JpdHNNYXNrID0gKDEgPDwgbG93Qml0c0xlbmd0aCkgLSAxO1xyXG5cdFx0dmFyIHByZXYgPSBudWxsO1xyXG5cdFx0XHJcblx0XHR2YXIgbWF4Q29tcHJlc3NlZFNpemUgPSBNYXRoLmZsb29yKFxyXG5cdFx0XHQoXHJcblx0XHRcdFx0MiArIE1hdGguY2VpbChcclxuXHRcdFx0XHRcdE1hdGgubG9nMihhdmVyYWdlRGVsdGEpXHJcblx0XHRcdFx0KVxyXG5cdFx0XHQpICogbGlzdC5sZW5ndGggLyA4XHJcblx0XHQpICsgNjtcclxuXHRcdFxyXG5cdFx0dmFyIGNvbXByZXNzZWRCdWZmZXIgPSBuZXcgVWludDhBcnJheShtYXhDb21wcmVzc2VkU2l6ZSk7XHJcblx0XHRcclxuXHRcdGlmKGxvd0JpdHNMZW5ndGggPCAwKVxyXG5cdFx0XHRsb3dCaXRzTGVuZ3RoID0gMDtcclxuXHRcdFxyXG5cdFx0Y29tcHJlc3NlZEJ1ZmZlclBvaW50ZXIyID0gTWF0aC5mbG9vcihsb3dCaXRzTGVuZ3RoICogbGlzdC5sZW5ndGggLyA4ICsgNik7XHJcblx0XHRcclxuXHRcdGNvbXByZXNzZWRCdWZmZXJbY29tcHJlc3NlZEJ1ZmZlclBvaW50ZXIxKytdID0gdG9CeXRlKCBsaXN0Lmxlbmd0aCApO1xyXG5cdFx0Y29tcHJlc3NlZEJ1ZmZlcltjb21wcmVzc2VkQnVmZmVyUG9pbnRlcjErK10gPSB0b0J5dGUoIGxpc3QubGVuZ3RoID4+IDggKTtcclxuXHRcdGNvbXByZXNzZWRCdWZmZXJbY29tcHJlc3NlZEJ1ZmZlclBvaW50ZXIxKytdID0gdG9CeXRlKCBsaXN0Lmxlbmd0aCA+PiAxNiApO1xyXG5cdFx0Y29tcHJlc3NlZEJ1ZmZlcltjb21wcmVzc2VkQnVmZmVyUG9pbnRlcjErK10gPSB0b0J5dGUoIGxpc3QubGVuZ3RoID4+IDI0ICk7XHJcblx0XHRcclxuXHRcdGNvbXByZXNzZWRCdWZmZXJbY29tcHJlc3NlZEJ1ZmZlclBvaW50ZXIxKytdID0gdG9CeXRlKCBsb3dCaXRzTGVuZ3RoICk7XHJcblx0XHRcclxuXHRcdGxpc3QuZm9yRWFjaChmdW5jdGlvbihkb2NJRCkge1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGRvY0lERGVsdGEgPSAoZG9jSUQgLSBsYXN0RG9jSUQgLSAxKTtcclxuXHRcdFx0XHJcblx0XHRcdGlmKCEkLmlzTnVtZXJpYyhkb2NJRCkpXHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVmFsdWUgaXMgbm90IG51bWVyaWNcIik7XHJcblx0XHRcdFxyXG5cdFx0XHQvLyBOQjogRm9yY2UgZG9jSUQgdG8gYW4gaW50ZWdlciBpbiBjYXNlIGl0J3MgYSBzdHJpbmdcclxuXHRcdFx0ZG9jSUQgPSBwYXJzZUludChkb2NJRCk7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihwcmV2ICE9PSBudWxsICYmIGRvY0lEIDw9IHByZXYpXHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRWxpYXMgRmFubyBlbmNvZGluZyBjYW4gb25seSBiZSB1c2VkIG9uIGEgc29ydGVkLCBhc2NlbmRpbmcgbGlzdCBvZiB1bmlxdWUgaW50ZWdlcnMuXCIpO1xyXG5cdFx0XHRcclxuXHRcdFx0cHJldiA9IGRvY0lEO1xyXG5cdFx0XHRcclxuXHRcdFx0YnVmZmVyMSA8PD0gbG93Qml0c0xlbmd0aDtcclxuXHRcdFx0YnVmZmVyMSB8PSAoZG9jSUREZWx0YSAmIGxvd0JpdHNNYXNrKTtcclxuXHRcdFx0YnVmZmVyTGVuZ3RoMSArPSBsb3dCaXRzTGVuZ3RoO1xyXG5cdFx0XHRcclxuXHRcdFx0Ly8gRmx1c2ggYnVmZmVyIDFcclxuXHRcdFx0d2hpbGUoYnVmZmVyTGVuZ3RoMSA+IDcpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRidWZmZXJMZW5ndGgxIC09IDg7XHJcblx0XHRcdFx0Y29tcHJlc3NlZEJ1ZmZlcltjb21wcmVzc2VkQnVmZmVyUG9pbnRlcjErK10gPSB0b0J5dGUoIGJ1ZmZlcjEgPj4gYnVmZmVyTGVuZ3RoMSApO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgdW5hcnlDb2RlTGVuZ3RoID0gKGRvY0lERGVsdGEgPj4gbG93Qml0c0xlbmd0aCkgKyAxO1xyXG5cdFx0XHRcclxuXHRcdFx0YnVmZmVyMiA8PD0gdW5hcnlDb2RlTGVuZ3RoO1xyXG5cdFx0XHRidWZmZXIyIHw9IDE7XHJcblx0XHRcdGJ1ZmZlckxlbmd0aDIgKz0gdW5hcnlDb2RlTGVuZ3RoO1xyXG5cdFx0XHRcclxuXHRcdFx0Ly8gRmx1c2ggYnVmZmVyIDJcclxuXHRcdFx0d2hpbGUoYnVmZmVyTGVuZ3RoMiA+IDcpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRidWZmZXJMZW5ndGgyIC09IDg7XHJcblx0XHRcdFx0Y29tcHJlc3NlZEJ1ZmZlcltjb21wcmVzc2VkQnVmZmVyUG9pbnRlcjIrK10gPSB0b0J5dGUoIGJ1ZmZlcjIgPj4gYnVmZmVyTGVuZ3RoMiApO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRsYXN0RG9jSUQgPSBkb2NJRDtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHRpZihidWZmZXJMZW5ndGgxID4gMClcclxuXHRcdFx0Y29tcHJlc3NlZEJ1ZmZlcltjb21wcmVzc2VkQnVmZmVyUG9pbnRlcjErK10gPSB0b0J5dGUoIGJ1ZmZlcjEgPDwgKDggLSBidWZmZXJMZW5ndGgxKSApO1xyXG5cdFx0XHJcblx0XHRpZihidWZmZXJMZW5ndGgyID4gMClcclxuXHRcdFx0Y29tcHJlc3NlZEJ1ZmZlcltjb21wcmVzc2VkQnVmZmVyUG9pbnRlcjIrK10gPSB0b0J5dGUoIGJ1ZmZlcjIgPDwgKDggLSBidWZmZXJMZW5ndGgyKSApO1xyXG5cdFx0XHJcblx0XHR2YXIgcmVzdWx0ID0gbmV3IFVpbnQ4QXJyYXkoY29tcHJlc3NlZEJ1ZmZlcik7XHJcblx0XHRcclxuXHRcdHJlc3VsdC5wb2ludGVyID0gY29tcHJlc3NlZEJ1ZmZlclBvaW50ZXIyO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuRWxpYXNGYW5vLnByb3RvdHlwZS5kZWNvZGUgPSBmdW5jdGlvbihjb21wcmVzc2VkQnVmZmVyKVxyXG5cdHtcclxuXHRcdHZhciByZXN1bHRQb2ludGVyID0gMDtcclxuXHRcdHZhciBsaXN0ID0gW107XHJcblx0XHRcclxuXHRcdC8vY29uc29sZS5sb2coXCJEZWNvZGluZyBidWZmZXIgZnJvbSBwb2ludGVyIFwiICsgY29tcHJlc3NlZEJ1ZmZlci5wb2ludGVyKTtcclxuXHRcdC8vY29uc29sZS5sb2coY29tcHJlc3NlZEJ1ZmZlcik7XHJcblx0XHRcclxuXHRcdHZhciBkZWNvZGluZ1RhYmxlSGlnaEJpdHMgPSBXUEdNWkEuRWxpYXNGYW5vLmRlY29kaW5nVGFibGVIaWdoQml0cztcclxuXHRcdHZhciBkZWNvZGluZ1RhYmxlRG9jSUROdW1iZXIgPSBXUEdNWkEuRWxpYXNGYW5vLmRlY29kaW5nVGFibGVEb2NJRE51bWJlcjtcclxuXHRcdHZhciBkZWNvZGluZ1RhYmxlSGlnaEJpdHNDYXJyeW92ZXIgPSBXUEdNWkEuRWxpYXNGYW5vLmRlY29kaW5nVGFibGVIaWdoQml0c0NhcnJ5b3ZlcjtcclxuXHRcdFxyXG5cdFx0dmFyIGxvd0JpdHNQb2ludGVyID0gMCxcclxuXHRcdFx0bGFzdERvY0lEID0gMCxcclxuXHRcdFx0ZG9jSUQgPSAwLFxyXG5cdFx0XHRkb2NJRE51bWJlciA9IDA7XHJcblx0XHRcclxuXHRcdHZhciBsaXN0Q291bnQgPSBjb21wcmVzc2VkQnVmZmVyW2xvd0JpdHNQb2ludGVyKytdO1xyXG5cdFx0XHJcblx0XHQvL2NvbnNvbGUubG9nKFwibGlzdENvdW50IGlzIG5vdyBcIiArIGxpc3RDb3VudCk7XHJcblx0XHRcclxuXHRcdGxpc3RDb3VudCB8PSBjb21wcmVzc2VkQnVmZmVyW2xvd0JpdHNQb2ludGVyKytdIDw8IDg7XHJcblx0XHRcclxuXHRcdC8vY29uc29sZS5sb2coXCJsaXN0Q291bnQgaXMgbm93IFwiICsgbGlzdENvdW50KTtcclxuXHRcdFxyXG5cdFx0bGlzdENvdW50IHw9IGNvbXByZXNzZWRCdWZmZXJbbG93Qml0c1BvaW50ZXIrK10gPDwgMTY7XHJcblx0XHRcclxuXHRcdC8vY29uc29sZS5sb2coXCJsaXN0Q291bnQgaXMgbm93IFwiICsgbGlzdENvdW50KTtcclxuXHRcdFxyXG5cdFx0bGlzdENvdW50IHw9IGNvbXByZXNzZWRCdWZmZXJbbG93Qml0c1BvaW50ZXIrK10gPDwgMjQ7XHJcblx0XHRcclxuXHRcdC8vY29uc29sZS5sb2coXCJSZWFkIGxpc3QgY291bnQgXCIgKyBsaXN0Q291bnQpO1xyXG5cdFx0XHJcblx0XHR2YXIgbG93Qml0c0xlbmd0aCA9IGNvbXByZXNzZWRCdWZmZXJbbG93Qml0c1BvaW50ZXIrK107XHJcblx0XHRcclxuXHRcdC8vY29uc29sZS5sb2coXCJsb3dCaXRzTGVuZ3RoID0gXCIgKyBsb3dCaXRzTGVuZ3RoKTtcclxuXHRcdFxyXG5cdFx0dmFyIGhpZ2hCaXRzUG9pbnRlcixcclxuXHRcdFx0bG93Qml0c0NvdW50ID0gMCxcclxuXHRcdFx0bG93Qml0cyA9IDAsXHJcblx0XHRcdGNiID0gMTtcclxuXHRcdFxyXG5cdFx0Zm9yKFxyXG5cdFx0XHRoaWdoQml0c1BvaW50ZXIgPSBNYXRoLmZsb29yKGxvd0JpdHNMZW5ndGggKiBsaXN0Q291bnQgLyA4ICsgNik7XHJcblx0XHRcdGhpZ2hCaXRzUG9pbnRlciA8IGNvbXByZXNzZWRCdWZmZXIucG9pbnRlcjtcclxuXHRcdFx0aGlnaEJpdHNQb2ludGVyKytcclxuXHRcdFx0KVxyXG5cdFx0e1xyXG5cdFx0XHRkb2NJRCArPSBkZWNvZGluZ1RhYmxlSGlnaEJpdHNDYXJyeW92ZXJbY2JdO1xyXG5cdFx0XHRjYiA9IGNvbXByZXNzZWRCdWZmZXJbaGlnaEJpdHNQb2ludGVyXTtcclxuXHRcdFx0XHJcblx0XHRcdGRvY0lETnVtYmVyID0gZGVjb2RpbmdUYWJsZURvY0lETnVtYmVyW2NiXTtcclxuXHRcdFx0XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBkb2NJRE51bWJlcjsgaSsrKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0ZG9jSUQgPDw9IGxvd0JpdHNDb3VudDtcclxuXHRcdFx0XHRkb2NJRCB8PSBsb3dCaXRzICYgKCgxIDw8IGxvd0JpdHNDb3VudCkgLSAxKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR3aGlsZShsb3dCaXRzQ291bnQgPCBsb3dCaXRzTGVuZ3RoKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGRvY0lEIDw8PSA4O1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRsb3dCaXRzID0gY29tcHJlc3NlZEJ1ZmZlcltsb3dCaXRzUG9pbnRlcisrXTtcclxuXHRcdFx0XHRcdGRvY0lEIHw9IGxvd0JpdHM7XHJcblx0XHRcdFx0XHRsb3dCaXRzQ291bnQgKz0gODtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0bG93Qml0c0NvdW50IC09IGxvd0JpdHNMZW5ndGg7XHJcblx0XHRcdFx0ZG9jSUQgPj49IGxvd0JpdHNDb3VudDtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRkb2NJRCArPSAoZGVjb2RpbmdUYWJsZUhpZ2hCaXRzW2NiXVtpXSA8PCBsb3dCaXRzTGVuZ3RoKSArIGxhc3REb2NJRCArIDE7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0bGlzdFtyZXN1bHRQb2ludGVyKytdID0gZG9jSUQ7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0bGFzdERvY0lEID0gZG9jSUQ7XHJcblx0XHRcdFx0ZG9jSUQgPSAwO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiBsaXN0O1xyXG5cdH1cclxuXHRcclxufSk7Il0sImZpbGUiOiJlbGlhcy1mYW5vLmpzIn0=
