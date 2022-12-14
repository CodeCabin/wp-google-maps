<?php
/**
 * This file contains several classes used by DOMDocument to parse CSS selectors and return their XPath equivalents.
 * These modules are mostly for internal use, however are documented here for convenience.
 */

namespace WPGMZA\Selector;

if(!defined('ABSPATH'))
	return;

/**
 * Useful when debugging CSS selector to XPath query conversion
 * @param string $str The string to output
 */
function trace($str)
{
	echo esc_html($str) . "\r\n";
}

/**
 * An exception thrown when parsing a CSS selector fails (ie failed to interpret the selector, before conversion starts)
 */
class ParseException extends \Exception
{
	/**
	 * @var The CSS selector that caused this exception
	 */
	public $css;
	
	/**
	 * Constructor.
	 * @param string $message The error message
	 * @param int $code Unused, the error code
	 * @param \Exception $previous The previous exception, used for exception chaining
	 */
	public function __construct($message, $code = 0, \Exception $previous = null) {
        \Exception::__construct($message, $code, $previous);
    }
}

/**
 * An exception thrown when conversion from a CSS selector to an XPath query failed (ie the selector was successfully parsed, but conversion to it's XPath equivalent failed).
 */
class ConvertException extends \Exception
{
	/**
	 * Constructor.
	 * @param string $message The error message
	 * @param int $code Unused, the error code
	 * @param \Exception $previous The previous exception, used for exception chaining
	 */
	public function __construct($message, $code = 0, Exception $previous = null) {
        \Exception::__construct($message, $code, $previous);
    }
}

/**
 * This class represents a CSS selector token
 * @method __toString The "friendly" type of this token, tabs and then the raw string.
 */
class Token
{
	const OPEN_BRACKET							= '[';
	const CLOSE_BRACKET							= ']';
	const OPEN_PARENTHES						= '(';
	const CLOSE_PARENTHES						= ')';
	const CLASS_SHORTHAND						= '.';
	const ID_SHORTHAND							= '#';
	const SINGLE_QUOTE							= "'";
	const ANY_ELEMENT							= '*';
	const DOUBLE_QUOTE							= '"';
	const PSEUDO								= ':';
	const UNION_OPERATOR						= ',';
	const DESCENDANT_COMBINATOR					= ' ';
	const CHILD_COMBINATOR						= '>';
	const ADJACENT_SIBLING_COMBINATOR			= '+';
	const GENERAL_SIBLING_COMBINATOR			= '~';
	const ATTRIBUTE_EQUAL_TO					= '=';
	const ATTRIBUTE_WHITESPACE_LIST_CONTAINS	= '~=';
	const ATTRIBUTE_BEGINS_WITH					= '^=';
	const ATTRIBUTE_ENDS_WITH					= '$=';
	const ATTRIBUTE_CONTAINS_SUBSTRING			= '*=';
	const ATTRIBUTE_HYPHEN_LIST_BEGINS_WITH		= '|=';
	
	const IDENTIFIER							= -1;
	const STRING								= -2;
	const EXPRESSION							= -3;
	
	public $type = null;
	public $string;
	
	/**
	 * Constructor.
	 * @param string $type Any of the constants defined in this class.
	 * @param string $string Either a string matching the values of the constants defined in this class, or where $type is IDENTIFIER, STRING or EXPRESSION, the string representing that element of the selector
	 */
	public function __construct($type, $string)
	{
		if(empty($string) && $string !== '0' || $string === '')
			throw new \Exception('Token string cannot be empty');
		
		$this->type = $type;
		$this->string = $string;
		
		//trace("Created token '$string' with type " . $this->getFriendlyType() . "\r\n");
	}
	
	/**
	 * Retuns true if this token is a CSS combinator (eg > + ~)
	 * @return bool
	 */
	public function isCombinator()
	{
		switch($this->type)
		{
			case Token::DESCENDANT_COMBINATOR:
			case Token::CHILD_COMBINATOR:
			case Token::ADJACENT_SIBLING_COMBINATOR:
			case Token::GENERAL_SIBLING_COMBINATOR:
				return true;
		}
		return false;
	}
	
	/**
	 * Returns true if this token is a CSS attribute operator (eg ^= *= |=)
	 * @return bool
	 */
	public function isAttributeOperator()
	{
		switch($this->type)
		{
			case Token::ATTRIBUTE_EQUAL_TO:
			case Token::ATTRIBUTE_WHITESPACE_LIST_CONTAINS:
			case Token::ATTRIBUTE_BEGINS_WITH:
			case Token::ATTRIBUTE_ENDS_WITH:
			case Token::ATTRIBUTE_CONTAINS_SUBSTRING:
			case Token::ATTRIBUTE_HYPHEN_LIST_BEGINS_WITH:
				return true;
				break;
		}
		return false;
	}
	
	/**
	 * Returns the "friendly" type name, eg "IDENTIFIER" for -1, "DOUBLE_QUOTE" for ".
	 * @return string The constant name based on type value.
	 */
	public function getFriendlyType()
	{
		$ref = new \ReflectionClass(__CLASS__);
		$constants = $ref->getConstants();
		
		foreach($constants as $type => $string)
		{
			if($string == $this->type)
			{
				return $type;
			}
		}
			
		return "NULL";
	}
	
	public function __toString()
	{
		$friendly = $this->getFriendlyType();
		$spaces = 36 - strlen($friendly);
		return $friendly . str_repeat(" ", $spaces) . $this->string;
	}
}

/**
 * This class provides stream functions to navigate an array of tokens
 */
class TokenStream
{
	protected $tokens;
	protected $cursor;
	
	/**
	 * Constructor
	 * @param Token[] An array of tokens
	 */
	public function __construct($arr)
	{
		$this->tokens = $arr;
		$this->cursor = 0;
	}
	
	/**
	 * Peeks at the next token in the stream, without advancing the cursor
	 * @param string|null $expectedType The token type to expect.
	 * @param int $calledByRead Used for internal debug logging.
	 * @throws ParseException If $expectedType is non-null, and the peeked token is null or not the expected type.
	 * @return Token|null The peeked token, or null at the end of the stream.
	 */
	public function peek($expectedType=null, $calledByRead=0)
	{
		//$backtrace = debug_backtrace();
		$token = (isset($this->tokens[$this->cursor]) ? $this->tokens[$this->cursor] : null);
		
		if($expectedType !== null)
		{
			if($token == null)
				throw new ParseException('Unexpected end');
			if($token->type != $expectedType)
				throw new ParseException('Unexpected ' . $token->getFriendlyType() . ' "' . $token->string . '", expecting "' . $expectedType . '"');
		}
		
		$action = ($calledByRead ? 'Read' : 'Peeked at');
		//trace($backtrace[1+$calledByRead]["class"] . '::' . $backtrace[1+$calledByRead]["function"] . "() [" . $backtrace[0+$calledByRead]["line"] . "]\t:- $action token $token");
		return $token;
	}
	
	/**
	 * Reads the next token in the stream. This performs the same actions as peek, but will advance the cursor before returning the token. The cursor may not advance past the token count.
	 * @param string|null $expectedType The token type to expect.
	 * @throws ParseException If $expectedType is non-null, and the peeked token is null or not the expected type.
	 * @return Token|null The peeked token, or null at the end of the stream.
	 */
	public function read($expectedType=null)
	{
		$token = $this->peek($expectedType, 1);
		
		if(++$this->cursor >= count($this->tokens))
			$this->cursor = count($this->tokens);
		
		return $token;
	}
	
	/**
	 * Returns true if the cursor has reached the end of the token stream
	 * @return bool
	 */
	public function eof()
	{
		return ($this->cursor >= count($this->tokens));
	}
}

/**
 * This class is used to convert CSS strings into an array of CSS tokens
 */
class Tokenizer
{
	protected $tokens;
	protected $prevToken;
	
	/**
	 * Pushes a new token to the token array
	 * @param string $type The token type, @see Token
	 * @param string $char The character(s) to initialize the new token with
	 */
	protected function pushToken($type, $char)
	{
		return array_push($this->tokens, new Token($type, $char));
	}
	
	/**
	 * Either pushes the specified character to the current token if the current token is a string, or initializes and pushes a new token to the token array.
	 * @param string $char The character(s) to push
	 */
	protected function pushCharToString($char)
	{
		//trace("Pushing '$char'\r\n");
		
		if(($curr = $this->getCurrToken()) && $curr->type == Token::STRING)
			$curr->string .= $char;
		else
			$this->pushToken(Token::STRING, $char);
	}

	/**
	 * Either pushes the specified character to the current token if the current token is an identifier, or initializes and pushes a new token to the token array.
	 * @param string $char The character(s) to push
	 */
	protected function pushCharToIdentifier($char)
	{
		//trace("Pushing '$char'\r\n");
		
		if(($curr = $this->getCurrToken()) && $curr->type == Token::IDENTIFIER)
			$curr->string .= $char;
		else
			$this->pushToken(Token::IDENTIFIER, $char);
	}
	
	/**
	 * Either pushes the specified character to the current token if the current token is an expression, or initializes and pushes a new token to the token array.
	 * @param string $char The character(s) to push
	 */
	protected function pushCharToExpression($char)
	{
		//trace("Pushing '$char'\r\n");
		
		if(($curr = $this->getCurrToken()) && $curr->type == Token::EXPRESSION)
			$curr->string .= $char;
		else
			$this->pushToken(Token::EXPRESSION, $char);
	}
	
	/**
	 * Pops a token from the end of the token array
	 * @return Token the popped token
	 */
	protected function popToken()
	{
		$result = array_pop($this->tokens);
		//trace("Popped token " . $result . "\r\n");
		return $result;
	}
	
	/**
	 * Gets the current token (the last token in the token array)
	 * @return Token|null The current token, or null if no tokens are in the array
	 */
	protected function getCurrToken()
	{
		if(empty($this->tokens))
			return null;
		return $this->tokens[ count($this->tokens) - 1 ];
	}
	
	/**
	 * Attempts to tokenize the specified string
	 * @param string $str The input string
	 * @throws ParseException When parsing the string fails due to invalid CSS
	 * @return Token[] An array of tokens parsed from the string
	 */
	public function tokenize($str)
	{
		// Tokenize
		$str = preg_replace('/\s+/', ' ', trim($str));
		$length = strlen($str);
		
		$cursor = 0;
		$flags = (object)array(
			'brackets'	 		=> 0,
			'parentheses'		=> array(),
			'string'			=> false,
			'escaped'			=> false
		);

		$this->tokens = array();
		
		for($cursor = 0; $cursor < $length; $cursor++)
		{
			$curr = $this->getCurrToken();
			$char = substr($str, $cursor, 1);
			$next_two_chars = substr($str, $cursor, 2);
			
			//trace(preg_replace('/\r?\n/', '  ', $str) . "\r\n" . str_repeat(' ', $cursor) . "^ $cursor");
			//trace("Current token: " . $curr);
			
			if(!$flags->escaped)
			{
				switch($next_two_chars)
				{
					case Token::ATTRIBUTE_WHITESPACE_LIST_CONTAINS:
					case Token::ATTRIBUTE_BEGINS_WITH:
					case Token::ATTRIBUTE_ENDS_WITH:
					case Token::ATTRIBUTE_CONTAINS_SUBSTRING:
					case Token::ATTRIBUTE_HYPHEN_LIST_BEGINS_WITH:
						$this->pushToken($next_two_chars, $next_two_chars);
						$cursor++;
						continue 2;
				}
			}
			
			if($char == "\\")
			{
				if($flags->escaped)
					$this->pushCharToString($char);
			
				$flags->escaped = !$flags->escaped;
				//trace($flags->escaped ? "Escaped" : "Unescaped");
			}
			else if($flags->string)
			{
				//trace("Reading {$flags->string} quoted string");
				switch($char)
				{
					case Token::SINGLE_QUOTE:
					case Token::DOUBLE_QUOTE:
						if($flags->escaped)
						{
							$this->pushCharToString($char);
							break;
						}
					
						$double = ($char == '"');
						
						if(($double && $flags->string == 'double') || (!$double && $flags->string == 'single'))
						{
							$flags->string = false;
							$this->pushToken(
								$double ? Token::DOUBLE_QUOTE : Token::SINGLE_QUOTE,
								$char
							);
							//trace("Exited {$flags->string} quoted string");
						}
						else
							$this->pushCharToString($char);
						break;
						
					default:
						$this->pushCharToString($char);
						break;
				}
				
				if($flags->escaped)
				{
					$flags->escaped = false;
					//trace("Unescaped at end of reading string");
				}
			}
			else if($flags->escaped)
			{
				$this->pushCharToIdentifier($char);
				$flags->escaped = false;
				//trace("Unescaped in else-if clause");
			}
			else
			{
				switch($char)
				{
					case Token::SINGLE_QUOTE:
					case Token::DOUBLE_QUOTE:
						if($flags->escaped)
						{
							$this->pushCharToIdentifier($char);
							break;
						}
					
						$double = ($char == '"');
					
						$flags->string = ($double ? 'double' : 'single');
						$this->pushToken(
							$double ? Token::DOUBLE_QUOTE : Token::SINGLE_QUOTE,
							$char
						);
						
						//trace("Entered {$flags->string} quoted string");
						break;
					
					case Token::OPEN_BRACKET:
						$var = ($char == Token::OPEN_BRACKET ? 'brackets' : 'parentheses');
					
						$flags->brackets++;
					
						if($flags->brackets > 1)
							throw new ParseException('Unexpected ' . $char);
						
						$this->pushToken($char, $char);
						//trace("Entered brackets");
						
						break;
					
					case Token::CLOSE_BRACKET:
						$flags->brackets--;
					
						if($flags->brackets < 0)
							throw new ParseException('Unexpected ' . $char);
						
						$this->pushToken($char, $char);
						//trace("Exited brackets");
					
						break;
					
					case Token::OPEN_PARENTHES:
						array_push($flags->parentheses, $curr->string);
						$this->pushToken($char, $char);
						//trace("Entered brackets");
						break;

					case Token::CLOSE_PARENTHES:
						array_pop($flags->parentheses);
						$this->pushToken($char, $char);
						//trace("Exited brackets");
						break;
						
					case Token::UNION_OPERATOR:						
					case Token::CLASS_SHORTHAND:
					case Token::ID_SHORTHAND:
					case Token::ANY_ELEMENT:
					case Token::PSEUDO:
					case Token::UNION_OPERATOR:
					case Token::ATTRIBUTE_EQUAL_TO:
						if($flags->escaped)
							break;
						
						$this->pushToken($char, $char);
						
						break;
						
					case Token::ADJACENT_SIBLING_COMBINATOR:
						if(count($flags->parentheses) > 0)
						{
							$this->pushCharToExpression($char);
							break;
						}
					case Token::CHILD_COMBINATOR:
					case Token::GENERAL_SIBLING_COMBINATOR:
						$curr = $this->getCurrToken();
						if($curr && $curr->type == Token::DESCENDANT_COMBINATOR)
							$this->popToken();
						
						$this->pushToken($char, $char);
						
						break;
						
					case " ":
					case "\r":
					case "\n":
					case "\t":
						$curr = $this->getCurrToken();
						
						if($flags->brackets > 0 || count($flags->parentheses) > 0)
						{
							break;
						}
						if($curr)
						{
							if($curr->type == Token::UNION_OPERATOR)
								break;
							if($curr->isCombinator())
								break;
						}
						else
							break;
						
						$this->pushToken(Token::DESCENDANT_COMBINATOR, $char);
						
						break;
						
					default:
						if(count($flags->parentheses) > 0 && !preg_match('/not/i', $flags->parentheses[count($flags->parentheses) - 1]))
							$this->pushCharToExpression($char);
						else
							$this->pushCharToIdentifier($char);
						break;
				}
			}
			
			//trace("");
		}
		
		return $this->tokens;
	}
}

/**
 * This class represents a CSS pseudo selector, for example, :nth-child, :empty, :not
 */
class PseudoSelector
{
	public $name;
	public $expression;
	public $selector;
	
	/**
	 * Parses this selector from the given stream, on the supplied selector
	 * @param TokenStream $stream The token stream to read from
	 * @param Selector $selector The CSS selector this pseudo-selector is part of
	 * @throws ParseException Pseudo selector not supported server side
	 * @throws ParseException Pseudo selector not yet implemented
	 * @throws ParseException Unknown pseudo selector
	 * @throws ParseException :not pseudo selector cannot be nested (as per the CSS specs)
	 * @throws ParseException Invalid CSS in the selector
	 * @return void
	 */
	public function parse($stream, $selector)
	{
		$first = $stream->read(Token::PSEUDO);
		$token = $stream->read(Token::IDENTIFIER);
		
		$this->name = strtolower($token->string);
		switch($this->name)
		{
			case 'nth-child':
			case 'nth-last-child':
			case 'nth-of-type':
			case 'nth-last-of-type':
			case 'not':
				break;
			
			case 'first-child':
			case 'last-child':
			case 'first-of-type':
			case 'last-of-type':
			case 'only-child':
			case 'only-of-type':
			case 'empty':
			case 'enabled':
			case 'disabled':
			case 'checked':
				return;
				break;
			
			case 'link':
			case 'visited':
			case 'active':
			case 'hover':
			case 'focus':
			case 'target':
				throw new ParseException('Pseudo selector not supported server side');
				break;
			
			case 'root':
				// See https://en.wikibooks.org/wiki/XPath/CSS_Equivalents for root. Will need to pop descendant:: off stack
			
			case 'lang':
				throw new ParseException('Pseudo selector not yet implemented');
				break;
				
			default:
				throw new ParseException('Unknown pseudo selector');
				break;
		}
		
		$stream->read(Token::OPEN_PARENTHES);
		if($this->name == 'not')
		{
			if($selector->parent)
			{
				foreach($selector->parent->selector->pseudos as $parent_pseudo)
				{
					if($parent_pseudo->name == 'not')
						throw new ParseException(':not pseudo selector cannot be nested');
				}
			}
			
			$this->selector = new Selector($stream);
			$this->selector->parent = $this;
			$this->selector->parse($stream, $this);
		}
		else
			$this->expression = $stream->read(Token::EXPRESSION);
		$stream->read(Token::CLOSE_PARENTHES);
	}
}

/**
 * A CSS attribute selector, such as [data-example], [data-example="value"] or [data-example$="ends-with"]
 */
class AttributeSelector
{
	public $name;
	public $operator;
	public $value;
	
	/**
	 * Parses the attribute selector from the supplied stream. Please note these classes expect attribute selectors to be enclosed in quotes.
	 * @param TokenStream $stream The token stream to read from
	 * @throws ParseException Unexpected end in attribute
	 * @throws ParseException Expected either close bracket or attribute operator
	 * @throws ParseException Unexpected end in attribute
	 * @throws ParseException Expected quote to open string after attribute operator
	 * @throws ParseException Unexpected end in attribute
	 * @throws ParseException Expected quote to terminate string after attribute operator
	 * @throws ParseException Invalid CSS eg unexpected tokens
	 */
	public function parse($stream)
	{
		// Expect [ first
		$stream->read(Token::OPEN_BRACKET);
		
		// Read name
		$token = $stream->read(Token::IDENTIFIER);
		$this->name = $token->string;
		
		// Read operator
		$token = $stream->read();
		if(!$token)
			throw new ParseException('Unexpected end in attribute');
		if($token->type == Token::CLOSE_BRACKET)
			return;	// has attribute
		if(!$token->isAttributeOperator())
			throw new ParseException('Expected either close bracket or attribute operator');
		$this->operator = $token->string;
		
		// Read string value
		$token = $stream->read();
		if(!$token)
			throw new ParseException('Unexpected end in attribute');
		if($token->type != Token::SINGLE_QUOTE && $token->type != Token::DOUBLE_QUOTE)
			throw new ParseException('Expected quote to open string after attribute operator');
		$openQuoteType = $token->type;

		$after = $stream->peek();
		if($after->type == $openQuoteType)
		{
			// Empty string
			$this->value = '';
		}
		else
		{
			// Read value
			$token = $stream->read(Token::STRING);
			$this->value = $token->string;
		}
		
		$token = $stream->read();
		if(!$token)
			throw new ParseException('Unexpected end in attribute');
		if($token->type != Token::SINGLE_QUOTE && $token->type != Token::DOUBLE_QUOTE)
			throw new ParseException('Expected quote to terminate string after attribute operator');
		
		// Expect ]
		$stream->read(Token::CLOSE_BRACKET);
	}
}

/**
 * Represents a single selector, either standalone or as part of a compound selector
 */
class Selector
{
	public $element = '*';
	public $id;
	public $classes;
	public $attributes;
	public $pseudos;
	
	public $parent;
	
	/**
	 * Parses this selector from the given stream.
	 * @param TokenStream $stream The token stream to read from.
	 * @param PseudoSelector $not The :not pseudo selector that contains this selector.
	 * @throws ParseException Unexpected end in attribute
	 * @throws ParseException Expected either close bracket or attribute operator
	 * @throws ParseException Unexpected end in attribute
	 * @throws ParseException Expected quote to open string after attribute operator
	 * @throws ParseException Unexpected end in attribute
	 * @throws ParseException Expected quote to terminate string after attribute operator
	 * @throws ParseException Invalid CSS eg unexpected tokens
	 */
	public function parse($stream, $not=null)
	{
		$first = $stream->peek();
		
		switch($first->type)
		{
			case Token::ANY_ELEMENT:
			case Token::IDENTIFIER:
				$this->element = $stream->read()->string;
				break;
				
			case Token::OPEN_BRACKET:
			case Token::PSEUDO:
			case Token::ID_SHORTHAND:
			case Token::CLASS_SHORTHAND:
				break;
				
			default:
				throw new ParseException("Unexpected token '{$token->string}'");
				break;
		}
		
		while($token = $stream->peek())
		{
			if($token->isCombinator() || $token->type == Token::UNION_OPERATOR)
				return;
			
			switch($token->type)
			{
				case Token::ID_SHORTHAND:
					if($this->id != null)
						throw new ParseExcepton('Selector can only have one ID');
					$stream->read(Token::ID_SHORTHAND);
					$this->id = $stream->read(Token::IDENTIFIER)->string;
					//trace("Read ID as {$this->id}");
					continue 2;
					break;
					
				case Token::CLASS_SHORTHAND:
					if(!$this->classes)
						$this->classes = array();
					$stream->read(Token::CLASS_SHORTHAND);
					array_push($this->classes, $stream->read(Token::IDENTIFIER)->string);
					continue 2;
					break;
				
				case Token::OPEN_BRACKET:
					if(!$this->attributes)
						$this->attributes = array();
				
					$attributeSelector = new AttributeSelector();
					array_push($this->attributes, $attributeSelector);
					$attributeSelector->parse($stream);
					continue 2;
					break;
				
				case Token::PSEUDO:
					if(!$this->pseudos)
						$this->pseudos = array();
					
					$pseudoSelector = new PseudoSelector();
					array_push($this->pseudos, $pseudoSelector);
					$pseudoSelector->parse($stream, $this);
					continue 2;
					break;
					
				case Token::CLOSE_PARENTHES:
					if($not != null)
						return;
					
				default:
					throw new ParseException("Unexpected token '{$token->string}'");
					break;
			}
			
			$stream->read();
		}
		
		
	}
}

/**
 * Used to parse a selector or compound selectors
 */
class Parser
{
	protected $tokenizer;
	protected $elements;
	
	/**
	 * Constructor.
	 */
	public function __construct()
	{
		$this->tokenizer = new Tokenizer();
	}
	
	/**
	 * Parses the selector(s) supplied
	 * @param string $selector The string of selector(s) to parse
	 * @return Selector[] An array of selectors parsed from the string
	 */
	public function parse($selector)
	{
		$tokens = $this->tokenizer->tokenize($selector);
		$stream = new TokenStream($tokens);
		$this->elements = array();
		
		while(!$stream->eof())
		{
			$token = $stream->peek();
			if($token->isCombinator() || $token->type == Token::UNION_OPERATOR)
			{
				if(empty($this->elements))
					throw new ParseException('Expected selector before combinator or union operator');
				array_push($this->elements, $stream->read());
			}
	
			$selector = new Selector();
			$selector->parse($stream);
			array_push($this->elements, $selector);
			
			//trace(print_r($selector, true));
		}
		
		return $this->elements;
	}

	
}

/**
 * Used to convert CSS selectors to XPath queries
 */
class XPathConverter
{
	protected $parser;
	protected $xpath;
	
	/**
	 * Constructor.
	 */
	public function __construct()
	{
		$this->parser = new Parser();
	}
	
	/**
	 * Converts a CSS attribute selector to its XPath equivalent and pushes the XPath query string to memory
	 * @param AttributeSelector $attr The CSS attribute selector
	 * @throws ConvertException Unrecognised attribute operator
	 * @return void
	 */
	protected function convertAttribute($attr)
	{
		$name = $attr->name;
		$value = @addslashes($attr->value);
		
		switch($attr->operator)
		{
			case null:
				$inner = "@{$name}";
				break;
				
			case Token::ATTRIBUTE_EQUAL_TO:
				$inner = "@$name=\"$value\"";
				break;
			
			case Token::ATTRIBUTE_WHITESPACE_LIST_CONTAINS:
				$inner = "conatins(concat(\" \", normalize-space(@$name), \" \"), \" $value \")";
				break;
			
			case Token::ATTRIBUTE_BEGINS_WITH:
				$inner = "starts-with(@$name, \"$value\")";
				break;
			
			case Token::ATTRIBUTE_ENDS_WITH:
				$inner = "substring(@$name, string-length(@$name) - string-length(\"$value\") + 1) = \"$value\"";
				break;
			
			case Token::ATTRIBUTE_CONTAINS_SUBSTRING:
				$inner = "contains(@$name, \"$value\")";
				break;
			
			case Token::ATTRIBUTE_HYPHEN_LIST_BEGINS_WITH:
				$inner = "@$name=\"@$value\" | starts-with(@$name, \"@$value-\")";
				break;
				
			default:
				throw new ConvertException("Don't know how to convert operator {$attr->operator}");
				break;
		}
		array_push($this->xpath, "[$inner]");
	}
	
	/**
	 * Converts a CSS pseudo selector to its XPath equivalent and pushes the XPath query string to memory
	 * @param AttributeSelector $pseudo The CSS pseudo selector
	 * @throws ConvertException Don't know how to convert selector (may not be implemented)
	 * @return void
	 */
	protected function convertPseudo($pseudo)
	{
		$name = $pseudo->name;
		
		// TODO: The "of type" selectors should change the parent selector element to *, and should use that type in their xpath
		// TODO: Test with a live domdocument in here (or smartdocument even)
		
		switch($name)
		{
			case 'nth-child':
			case 'nth-last-child':
			case 'nth-of-type':
			case 'nth-last-of-type':
				// TODO: Support formulas / expressions
				throw new ConvertException('Not yet implemented');
				break;
			
			case 'first-child':
			case 'first-of-type':
				$inner = '1';
				break;
			
			case 'last-child':
			case 'last-of-type':
				$inner = 'last()';
				break;
			
			case 'only-child':
			case 'only-of-type':
				$inner = 'count(*)=1';	// TODO: might need to swap * with node name
				break;
			
			case 'empty':
				$inner = 'count(./*)=0 and string-length(text())=0';
				break;
				
			case 'enabled':
				$inner = "not(@disabled)";
				break;
			
			case 'disabled':
			case 'checked':
				$inner = "@$name";
				break;
				
			case 'not':
				throw new ConvertException('Not yet implemented');
				break;
			
			default:
				throw new ConvertException("Don't know how to convert pseudo selector {$pseudo->name}");
				break;
		}
		
		array_push($this->xpath, "[$inner]");
	}
	
	/**
	 * Converts a CSS selector to its XPath equivalent and pushes the XPath query string to memory
	 * @param Selector $selector The CSS selector to convert.
	 * @return void
	 */
	protected function convertSelector($selector)
	{
		//trace("Converting selector " . print_r($selector, true));
		
		$prev = null;
		if(!empty($this->xpath))
			$prev = &$this->xpath[ count($this->xpath) - 1 ];
		
		if($prev == 'following-sibling::*[1]')
			$prev = preg_replace('/\*/', $selector->element, $prev);
		else
			array_push($this->xpath, $selector->element);
		
		if($selector->id != null)
			array_push($this->xpath, '[@id="' . $selector->id . '"]');
		
		if($selector->classes)
			foreach($selector->classes as $class)
			{
				array_push($this->xpath,
					'[contains(concat(" ", normalize-space(@class), " "), " ' . $class . ' ")]'
				);
			}
			
		if($selector->attributes)
			foreach($selector->attributes as $attr)
				$this->convertAttribute($attr);
				
		if($selector->pseudos)
			foreach($selector->pseudos as $pseudo)
				$this->convertPseudo($pseudo);
	}
	
	/**
	 * Converts an element (eg a single, non-compound CSS selector) to it's XPath equivalent
	 * @param Selector $element The selector to convert
	 * @throws ConvertException Unexpected element
	 */
	protected function convertElement($element)
	{
		//trace("Converting element " . print_r($element, true));
		
		$prev = null;
		if(!empty($this->xpath))
			$prev = $this->xpath[ count($this->xpath) - 1 ];
		
		if($element instanceof Token)
		{
			if($prev != "\r\n|\r\n" && $element->type != Token::UNION_OPERATOR)
				array_push($this->xpath, '/');
			
			switch($element->type)
			{
				case Token::UNION_OPERATOR:
					array_push($this->xpath, "\r\n|\r\n");
					
				case Token::DESCENDANT_COMBINATOR:
					array_push($this->xpath, 'descendant::');
					return;
					
				case Token::CHILD_COMBINATOR:
					array_push($this->xpath, 'child::');
					return;
					
				case Token::GENERAL_SIBLING_COMBINATOR:
					array_push($this->xpath, 'following-sibling::');
					return;
					
				case Token::ADJACENT_SIBLING_COMBINATOR:
					array_push($this->xpath, 'following-sibling::*[1]');
					return;
					
				default:
					throw new ConvertException('Unexpected token');
					break;
			}
		}
		else if($element instanceof Selector)
			$this->convertSelector($element);
		else
			throw new ConvertException('Unexpected element');
	}
	
	/**
	 * Converts the given CSS selector string into it's XPath equivalent
	 * @param string $str The input CSS selector to convert
	 * @return string The XPath equivalent of the supplied selector
	 */
	public function convert($str)
	{
		//trace("=== Parsing $str ===\r\n");
		
		$this->xpath = array('descendant::');
		$elements = $this->parser->parse($str);
		
		//trace("=== Converting $str ===\r\n");
		foreach($elements as $el)
			$this->convertElement($el);
		
		return implode('', $this->xpath);
	}
}

?>
