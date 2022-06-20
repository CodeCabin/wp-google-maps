class WritersBlock {
	static LOG_LEVEL_INFO = 1;
	static LOG_LEVEL_WARNING = 2;
	static LOG_LEVEL_ERROR = 3;

	static DIRECTION_START = 0;
	static DIRECTION_END = 1;

	static WRITE_MODE_REPLACE = 0;
	static WRITE_MODE_APPEND = 1;
	static WRITE_MODE_PREPEND = 2;

	static PREDICTION_MODE_OFF = 0;
	static PREDICTION_MODE_WORD = 1;
	static PREDICTION_MODE_SENTENCE = 2;

	static PREDICTION_POLICY_PARTIAL = 1;

	/* 
	 * Document.execCommand is being deprecated 
	 *
	 * For now, we will continue to use it, but later we will implement an iternal hand-rolled version of it, 
	 * this constant will control that 'switch' but turning this off will block all functionality as it is not developed
	*/
	static USE_DEPRECATED_COMMANDS = true; 

	/**
	 * Constructor
	 * 
	 * @param Element|string element The element to be bound, can be an element or a string selector
	 * @param object options The options object, which must match the existing structures from the base config
	*/
	constructor(element, options){
		this.init();

		this.parseOptions(options);
		this.parseElement(element);
		this.build();

		this.triggerHook("onReady");
	}

	/**
	 * Initialize state tracking, elements and configurations base objects
	 * 
	 * @return void
	*/
	init(){
		this.ready = false;
		this.selection = false;
		this.range = false;

		this.activeModal = false;

		this.cache = {};
		this.customToolActions = {};
		this.shortcuts = {};
		this.commandModals = {};

		this.isMac = new RegExp(/(Mac|iPhone|iPod|iPad)/i).test(navigator.platform);

		this.elements = {
			root : false,
			wrap : false,
			editor : false,
			toolbar : false,
			popup : false
		};

		this.config = {
			enableLogs : false,
			enableResize : true,
			enableToolbar : true,
			enablePopup : true,
			enabledTools : false,
			customTools : false,
			popupTools : ['bold', 'italic', 'underline'],
			placeholder : "",
			content : "",
			predictionMode : WritersBlock.PREDICTION_MODE_OFF,
			predictionPolicy : WritersBlock.PREDICTION_POLICY_PARTIAL,
			predictions : false,
			events : {}
		};
	}

	/**
	 * Parse the base element this editor is linked to 
	 * 
	 * We will also parse the content if available 
	 * 
	 * @param Element|string element The element to bind to
	 * 
	 * @return void
	*/
	parseElement(element){
		if(element instanceof Element){
			this.elements.root = element;
		} else if(typeof element === 'string'){
			const queriedElement = document.querySelector(element);
			if(queriedElement){
				this.elements.root = queriedElement;
			}
		} else {
			this.log("Element not found", WritersBlock.LOG_LEVEL_ERROR);
		}

		if(this.elements.root){
			this.ready = true;

			switch(this.elements.root.tagName){
				case "TEXTAREA":
					this.config.content = this.elements.root.value;
					break;
				default:
					this.config.content = this.elements.root.innerHTML;
					break;
			}
		}
	}

	/**
	 * Parse the options and push them into the config object
	 * 
	 * @param object options The options object
	 * 
	 * @return void
	*/
	parseOptions(options){
		if(typeof options === 'object'){
			for(let i in options){
				if(typeof this.config[i] !== 'undefined'){
					this.config[i] = options[i];
				}
			}
		}
	}

	/**
	 * Build the main wrapper with all accompanying elements within the wrapper
	 * 
	 * @return void
	*/
	build(){
		if(this.ready){
			this.elements.wrap = this.createElement('div', ['writersblock-wrapper']);

			this.buildToolbar();
			this.buildEditor();
			this.buildPopup();

			this.elements.root.before(this.elements.wrap);

			this.triggerHook("onBuild");
		} else {
			this.log("Editor could not be initialized", WritersBlock.LOG_LEVEL_ERROR);
		}
	}

	/**
	 * Build the toolbar
	 * 
	 * This feeds off of the tools group method, but that can be adjusted on the fly
	 * 
	 * @return void
	*/
	buildToolbar(){
		if(!this.config.enableToolbar){
			return;
		}

		this.elements.toolbar = this.createElement('div', ['writersblock-toolbar']);

		const groups = this.getTools();
		for(let i in groups){
			const group = groups[i];

			if(group.tools){
				const groupWrap = this.createElement('div', ['tool-group']);
				if(group.tag){
					groupWrap.setAttribute('data-group-tag', group.tag);
				}

				for(let t in group.tools){
					if(this.isToolEnabled(t)){
						const tool = group.tools[t];
						const toolButton = this.createToolButton(t, tool);

						groupWrap.appendChild(toolButton);
					}
				}

				if(groupWrap.innerHTML.length > 0){
					this.elements.toolbar.appendChild(groupWrap);
				}
			}
		}

		this.elements.wrap.appendChild(this.elements.toolbar);

		this.triggerHook("onBuildToolbar");
	}

	/**
	 * Build the main editor content editable, this is the backbone of the system 
	 * As a result, you cannot disable this 
	 * 
	 * @return void
	*/
	buildEditor(){
		this.elements.editor = this.createElement('div', ['writersblock-editor'], {contenteditable : true});

		if(this.config.enableResize){
			this.elements.editor.classList.add('resize');
		}

		if(this.elements.root.hasAttribute('placeholder') || this.config.placeholder){
			this.elements.editor.setAttribute('placeholder', this.elements.root.getAttribute('placeholder') || this.config.placeholder);
		} 


		this.elements.editor.addEventListener('input', (event) => {
			this.onEditorChange();
			this.onUpdateSelection();
		});

		this.elements.editor.addEventListener('keyup', (event) => {
			this.onUpdateSelection();
			this.onPredictInput();
		});

		this.elements.editor.addEventListener('keydown', (event) => {
			this.onKeyboardShortcut(event);
			this.onPredictApply(event);
		});

		this.elements.editor.addEventListener('mouseup', (event) => {
			this.onUpdateSelection();
		});

		this.elements.editor.addEventListener('mousedown', (event) => {
			this.hidePopupTools();
		});

		this.elements.editor.addEventListener('blur', (event) => {
			if(event.relatedTarget){
				if(event.relatedTarget instanceof Element){
					if(this.elements.wrap.contains(event.relatedTarget)){
						/* Blur triggered by an element in our wrapper */
						return;
					}
				}
			}
			this.hidePopupTools();
		});

		this.elements.editor.innerHTML = this.config.content;
		
		this.elements.root.classList.add('writersblock-hidden');

		this.elements.wrap.appendChild(this.elements.editor);

		this.triggerHook("onBuildEditor");
	}

	/**
	 * Build the popup toolbar which is automatically shown when a selection is made
	 * 
	 * @return void
	*/
	buildPopup(){
		if(!this.config.enablePopup){
			return;
		}

		this.elements.popup = this.createElement('div', ['writersblock-popup-tools']);

		const popupTools = this.getPopupTools();

		for(let i in popupTools){
			if(this.isToolEnabled(i)){
				const tool = popupTools[i];
				const toolButton = this.createToolButton(i, tool);

				this.elements.popup.appendChild(toolButton);
			}
		}

		this.elements.wrap.appendChild(this.elements.popup);

		this.triggerHook("onBuildPopup");
	}

	/**
	 * Build a modal, which must be dismissed in order for another to be shown
	 * 
	 * This is bound to the instance, and on complete will feature callbacks which hold the result of the modal
	 * 
	 * Modals can contain fields, or simple confirm options by default. This is not promise based, although it could be, it makes more sense here to simply make it callback based
	 * Later, this will allow for really simple prototype extensions
 	 * 
	 * @param object config The configuration for the modal
	 * @param complete function the callback to be fired then the user submits/closes the modal
	 * 
	 * @return void
	*/
	buildModal(config, complete){
		if(!(config instanceof Object)){
			/* Missing config, we won't do anything */
			this.log("Modal config missing, modal will not be created", WritersBlock.LOG_LEVEL_WARNING);
			return;
		}

		this.closeModal();

		const modal = this.createElement('div', ['writersblock-modal']);
		const inner = this.createElement('div', ['writersblock-modal-inner']);

		const header = this.createElement('div', ['writersblock-modal-header']);
		header.innerText = config.title ? config.title : "";

		inner.appendChild(header);

		const body = this.createElement('div', ['writersblock-modal-body']);
		if(config.description){
			const description = this.createElement('div', ['writersblock-modal-description']);
			description.innerText = config.description;

			body.appendChild(description); 
		}

		if(config.fields){ 
			if(config.fields instanceof Array){
				for(let field of config.fields){
					const element = this.createElement('div', ['writersblock-modal-field']);

					if(field.label){
						const label = this.createElement('label');
						label.innerText = field.label;

						element.appendChild(label);
					}

					if(field.type && field.type === 'select'){
						const select = this.createElement('select', ['writersblock-modal-field-input'], {
							value : field.value || '',
							name : field.name
						});

						if(field.options && field.options instanceof Object){
							for(let optionValue in field.options){
								const option = this.createElement('option');
								option.setAttribute('value', optionValue);
								option.innerText = field.options[optionValue];

								select.appendChild(option);
							}
						}

						element.appendChild(select);
					} else {
						const input = this.createElement('input', ['writersblock-modal-field-input'], {
							type : field.type || 'text',
							placeholder : field.placeholder || '',
							value : field.value || '',
							name : field.name || '' 
						});

						element.appendChild(input);
					}

					body.appendChild(element);
				}
			} else {
				this.log("Modal fields must be defined as an array", WritersBlock.LOG_LEVEL_WARNING);
			}
		}

		inner.appendChild(body);

		const footer = this.createElement('div', ['writersblock-modal-footer']);

		const confirmButton = this.createElement('button', ['writersblock-modal-button']);
		confirmButton.innerText = config.confirm || 'Confirm';

		confirmButton.addEventListener('click', (events) => {
			if(this.activeModal){
				const data = {};
				const fields = this.activeModal.querySelectorAll('.writersblock-modal-field-input');
				for(let f of fields){
					const fieldName = f.getAttribute('name');
					const fieldValue = f.value || false;
					data[fieldName] = fieldValue;
				}

				if(typeof complete === 'function'){
					complete(data);
				}
			}
			this.closeModal();
		});

		const cancelButton = this.createElement('button', ['writersblock-modal-button']);
		cancelButton.innerText = config.cancel || 'Cancel';

		cancelButton.addEventListener('click', (events) => {
			if(typeof complete === 'function'){
				complete(false);
			}

			this.closeModal();
		});

		footer.appendChild(cancelButton);
		footer.appendChild(confirmButton);

		inner.appendChild(footer);

		modal.appendChild(inner);

		this.elements.wrap.appendChild(modal);
		this.activeModal = modal;

		this.triggerHook("onBuildModal", {modal : modal});
	}

	/**
	 * On tool button click delegate
	 * 
	 * Distributed to one of two handlers:
	 * - Internal execute command method (Unbuilt)
	 * - Document execute command method
	 * 
	 * @param Element|object context The button that was clicked, used to parse commands. If object, then parse command from object
	 * 
	 * @return void
	*/
	onToolAction(context){
		let command = false;
		let value = null;

		if(context instanceof Element){
			command = context.getAttribute('data-command');
			value = context.getAttribute('data-value');

			const modal = context.getAttribute('data-auto-modal');
			if(modal){
				/* This tool requires a modal interaction, fire that off and call self at the end */
				if(this.commandModals && this.commandModals[modal]){
					this.buildModal(this.commandModals[modal], (result) => {
						this.restoreSelection();
						if(result.value){
							/* Auto modal, require a value, for things like link creation etc */
							/* We should make this a bit more modular, for now this will be okay */
							this.onToolAction({command: command, value: result.value});
						}
					});
				}
				return;	
			}

		} else if(context instanceof Object){
			command = context.command ? context.command : false;
			value = context.value ? context.value : null;
		} else {
			/* Not a supported context, let's bail */
			return;
		}

		if(command){
			if(this.customToolActions){
				if(command === 'delegate_action_callback'){
					/* Custom event, which is not managed internally */
					if(value && this.customToolActions[value]){
						if(typeof this.customToolActions[value] === 'function'){
							this.customToolActions[value](this);
							return;
						}
					}
				}
			}

			if(!WritersBlock.USE_DEPRECATED_COMMANDS){
				/*
				 * Use the internal execute command. 
				 *
				 * As of 2021-08-11 this is just a method stub and won't work until a much later date
				*/
				this.executeCommand();
			} else {
				/*
				 * Use the experimental system instead, which leverages a function which may be deprecated in the future
				 *
				 * document.execCommand
 				 *
				 * We will move away from this at a later data, other tools still use it or now
				*/
				document.execCommand(command, false, value ? value : null);
			}
		}

		this.triggerHook("onToolAction", {context : context});
	}

	/**
	 * On editor change event delegate
	 * 
	 * Distributes local events to the DOM, which resyncs the input field
	 * 
	 * @return void
	*/
	onEditorChange(){
		const content = this.getContent();
		switch(this.elements.root.tagName){
			case 'TEXTAREA':
				this.elements.root.value = content;
				this.elements.root.dispatchEvent(new Event('change', {bubbles : true}));
				break;
			default :
				if(this.elements.root.isContentEditable){
					this.elements.root.innerHTML = content;
					this.elements.root.dispatchEvent(new Event('input', {bubbles : true}));
				}
				break;

		}

		this.triggerHook("onEditorChange");
	}

	/**
	 * Internally tracks selection, this ensures the element being selected is the editor
	 * 
	 * It also allows the user to interact with other elements, and write dynamically to the editor later
	 * 
	 * @return void
	*/
	onUpdateSelection(){
		const selection = window.getSelection();
		if(selection.anchorNode){
			if(selection.anchorNode === this.elements.editor || this.elements.editor.contains(selection.anchorNode)){
				this.selection = selection;
				this.range = this.selection.getRangeAt(0);

				this.updatePopupTools();
			}
		}

		this.updateToolbar();

		this.triggerHook("onUpdateSelection", {selection : selection});
	}

	/**
	 * Checks for custom keyboard shortcuts
	 * 
	 * @param KeyboardEvent event The keyboard event as passed from the listener
	 * 
	 * @return void
	*/
	onKeyboardShortcut(event){
		let slug = "";
		
		const commandKey = (this.isMac ? event.metaKey : event.ctrlKey); 
		if(commandKey){
			slug += "Cmd";
		}

		if(event.shiftKey){
			slug += "Shift";
		}

		if(event.key){
			slug += event.key.toUpperCase();
		}

		if(this.shortcuts[slug]){
			this.onToolAction(this.shortcuts[slug]);
			this.triggerHook("onKeyboardShortcut", {slug : slug});
		}

	}

	/**
	 * Uses a prediction on tab
	 * 
	 * @param KeyboardEvent event The keyboard event as passed from the listener, this is for tab-completion
	 * 
	 * @return void
	*/
	onPredictApply(event){
		if(event.key && event.key === 'Tab'){
			const predictionRange = this.getLastRange();
			let predictionContainer = false;
			if(predictionRange.endContainer){
				if(predictionRange.endContainer && predictionRange.endContainer instanceof Element){
					predictionContainer = predictionRange.endContainer;
				} else if (predictionRange.endContainer.parentElement && predictionRange.endContainer.parentElement instanceof Element){
					predictionContainer = predictionRange.endContainer.parentElement;
				}

				if(predictionContainer){
					const value = predictionContainer.getAttribute('data-prediction');

					if(value && value.length > 0){
						this.write(value);

						event.preventDefault();
						event.stopPropagation();
					}

				}
			}
			
			this.triggerHook("onPredictApply");
		}
	}

	/**
	 * Processes basic prediction logic
	 *
	 * @return void
	*/
	onPredictInput(){
		/* Clear existing predictions */
		const activePredictions = this.elements.editor.querySelectorAll('*[data-prediction]');
		if(activePredictions){
			for(let element of activePredictions){
				element.removeAttribute('data-prediction');
			}
		}

		if(this.config.predictionMode && this.config.predictions){
			if(this.config.predictionMode !== WritersBlock.PREDICTION_MODE_OFF){
				let prediction = false;
				let sample = false;
				
				let selection = this.getSelection();
				const restoreRange = this.getLastRange();

				if(selection && selection.toString().length === 0){
					/* User is not actually making a selection, safe to enter predict mode */
					let modified = false;
					if(typeof this.config.predictionMode !== 'function'){
						switch(this.config.predictionMode){
							case WritersBlock.PREDICTION_MODE_WORD:
								selection.modify('extend', 'backward', 'word');							
								modified = true;
								break;
							case WritersBlock.PREDICTION_MODE_SENTENCE:
								selection.modify('extend', 'backward', 'sentence');							
								modified = true;
								break;
						}
					} else {
						/* 
						 * Custom prediction mode 
						 *
						 * Must return a bool when the selection has been mutated 
						*/
						modified = this.config.predictionMode(selection);
					}

					if(modified){
						sample = window.getSelection().toString();
						sample = sample.trim();

						this.setSelection(restoreRange);
						if(sample && (typeof sample === 'string' && sample.length > 1)){
							if(this.config.predictions instanceof Array){
								/* Standard prediction logic */
								for(let phrase of this.config.predictions){
									if(!prediction){
										if (this.config.predictionPolicy === WritersBlock.PREDICTION_POLICY_PARTIAL){
											/* Look for partial matches */
											if(phrase.indexOf(sample.trim()) !== -1){
												prediction = phrase;
											}
										} else {
											if(typeof this.config.predictionPolicy === 'function'){
												/**
												 * Custom match testing
												 * 
												 * Pass the sample and the phrase to be tested
												 * 
												 * Return true to set the phrase as the prediction
												*/
												const matched = this.config.predictionPolicy(sample, phrase);
												if(matched){
													prediction = phrase;
												}
											}
										}
									}
								}
								
							} else if (typeof this.config.predictions === 'function'){
								/* 
								 * Custom prediction
								 * 
								 * Complete handover, return a string with a match, or return false for no match
								*/
								prediction = this.config.predictions(sample);
							} else {
								this.log("Predictions must be an Array, or a function which retuns a prediction", WritersBlock.LOG_LEVEL_ERROR);
							}

							if(prediction && (typeof prediction === 'string' && prediction.length > 0)){
								let relativeElement = false;
								if(restoreRange.endContainer){
									if(restoreRange.endContainer && restoreRange.endContainer instanceof Element){
										relativeElement = restoreRange.endContainer;
									} else if (restoreRange.endContainer.parentElement && restoreRange.endContainer.parentElement instanceof Element){
										relativeElement = restoreRange.endContainer.parentElement;
									}
								}

								prediction = prediction.replace(sample, '');
								if(relativeElement && prediction.length > 0){
									relativeElement.setAttribute('data-prediction', prediction);
								}
							} 
						}
					}
				}
			}
		}
	}

	/**
	 * Auto closes active modal
	 * 
	 * @return void 
	*/
	closeModal(){
		if(this.activeModal && this.activeModal instanceof Element){
			/* Destroy the active modal */
			this.activeModal.remove();
			this.activeModal = false;

			this.triggerHook("onCloseModal");
		}
	}

	/**
	 * Set the content within the editor
	 * 
	 * @param string html The HTML to be pushed into the editor
	 * 
	 * @return void
	*/
	setContent(html){
		this.elements.editor.innerHTML = html;
		this.onEditorChange();

		this.triggerHook("onSetContent");
	}

	/** 
	 * Get the contet from the editor directly
	 * 
	 * @returnn string
	*/
	getContent(){
		return this.ready ? this.elements.editor.innerHTML : "";
	}

	/**
	 * Get the current selection from the editor 
	 * 
	 * @return Selection
	*/
	getSelection(){
		if(this.selection){
			if(this.selection.anchorNode !== this.elements.editor && (!this.elements.editor.contains(this.selection.anchorNode))){
				this.restoreSelection();
			}
		}
		return this.selection;
	}

	/**
	 * Get last range 
	 * 
	 * @return Range
	*/
	getLastRange(){
		return this.range;
	}

	/** 
	 * Restores a selection from the last interaction 
	 * 
	 * @return 
	*/
	restoreSelection(){
		const range = this.getLastRange();

		/* Focusing here can cause a few strange scroll movements, it seems to be un-needed */
		/* this.elements.editor.focus(); */
		
		this.setSelection(range);

		this.triggerHook("onRestoreSelection");
	}

	/**
	 * Set selection for a specific range
	 * 
	 * This is useful for systems which make use of async calls (ajax, for example), they can store the last range from the selection and then insert things later when appropriate
	 * 
	 * @param Range range The range to be applied
	 * 
	 * @return void
	*/
	setSelection(range){
		if(range instanceof Range){
			const selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(range);
			this.onUpdateSelection();

			this.triggerHook("onSetSelection");
		}
	}

	/**
	 * Collapse a selection within the editor
	 * 
	 * @param int direction The direction to collapse the ranged selection to
	 * 
	 * @return void
	*/
	collapseSelection(direction){
		const selection = this.getSelection();

		if(typeof direction === 'undefined'){
			direction = WritersBlock.DIRECTION_END;
		}
		
		switch(direction){
			case WritersBlock.DIRECTION_START:
				selection.collapseToStart();
				break;
			case WritersBlock.DIRECTION_END:
				selection.collapseToEnd();
				break;
			default: 
				this.log("Unsupported direction provided (collapseSelection)", WritersBlock.LOG_LEVEL_WARNING);
				break;
		}

		this.onUpdateSelection();

		this.triggerHook("onCollapseSelection");
	}

	/**
	 * Modify the selection within the editor, using native selection API
	 * 
	 * @param type string The type of modification (extend || move)
	 * @param direction string The direction of the change (forward || backward) (Optional: left || right - Should only be used when you don't want rtl support)
	 * @param granularity string The granularity of the change (word || sentence || line || paragraph || lineboundary || sentenceboundary || paragraphboundary || documentboundary)
	 *
	 * @return void
	*/
	modifySelection(type, direction, granularity){
		const selection = this.getSelection();
		if(selection){
			selection.modify(type, direction, granularity);
			this.triggerHook("onModifySelection", {type : type, direction : direction, granularity : granularity});
		}
	}

	/** 
	 * Select all text within the editor
	 * 
	 * @return void
	*/
	selectAll(){
		const selection = this.getSelection();
		if(selection){
			this.onToolAction({command : 'selectAll'});
		} else {
			window.getSelection().selectAllChildren(this.elements.editor);
		}
		this.onUpdateSelection();

		this.triggerHook("onSelectAll");
	}

	/**
	 * Find the next instance of a speciic query within the editor
	 * 
	 * This occurs from the current cursor position
	 *
	 * Returns true if a match was found, and sets the current selection accordingly.
	 *  
	 * @param string search The phrase to look for
	 * @param bool caseSensitive Does the case matter
	 * @param bool backwards Move backwards
	 * 
	 * @return bool
	*/
	find(search, caseSensitive, backwards){
		caseSensitive = caseSensitive ? caseSensitive : false;
		backwards = backwards ? backwards : false;

		let selection = this.getSelection();
		const restoreRange = this.getLastRange();

		if(!selection){
			this.selectAll();
			this.collapseSelection(WritersBlock.DIRECTION_START);
		}

		if(window.find(search, caseSensitive, backwards)){
			this.onUpdateSelection();

			const activeSelection = window.getSelection();
			if(activeSelection){
				if(activeSelection.anchorNode !== this.elements.editor && (!this.elements.editor.contains(activeSelection.anchorNode))){
					this.restoreSelection();
					return false;
				}
			}

			return true;
		} 
		this.setSelection(restoreRange);
		return false;
	}

	/**
	 * Replace word/phrase within the editor
	 * 
	 * @param string search The phrase to loo for
	 * @param string replace The phrase to replace
	 * 
	 * @return bool
	*/
	replace(search, replace){
		if(this.find(search)){
			this.write(replace);
			return true;
		}
		return false;
	}

	/**
	 * Bulk find/replace
	 * 
	 * @param string search The phrase to loo for
	 * @param string replace The phrase to replace
	 * 
	 * @return void
	*/
	replaceAll(search, replace){
		this.selectAll();
		this.collapseSelection(WritersBlock.DIRECTION_START);

		let replaced = this.replace(search, replace);
		while(replaced){
			replaced = this.replace(search, replace);
		}
	}

	/**
	 * Find text selections using regex patterns
	 * 
	 * Word example: customEditor.findByPattern('(programming)') - Returns all 'selections' for 'programming
	 * Command example: customEditor.findByPattern(/(\/\w+ \[(.*)\])/) - Returns commands like /expand [some params]
	 * 
	 * Returns an array of ranges, you should use as many of these with 'setSelection' to perform rewrites, or other things
	 * 
	 * @note: Caution, this will alter the DOM elements, on the fly, in order to create dynamic selections
	 * 		 - Most DOM changes will be harmless to the overall look of the document, but, it should still be used with caution.
	 * 
	 * @param string pattern The pattern which will be used in a RegExp expression
	 * 
	 * @return array
	*/
	findByPattern(pattern){
		const ranges = [];
		if(this.elements.editor){
			const expression = new RegExp(pattern);
			const elements = this.elements.editor.children;

			let mutation = false;
			for(let element of elements){
				const html = element.innerHTML;
				const marked = html.replace(expression, '<span class="writersblock-pattern">$1</span>');
				
				if(html.length !== marked.length){
					element.innerHTML = marked;
					mutation = true;
				}				
			}

			if(mutation){
				const matches = this.findElements('.writersblock-pattern');
				if(matches && matches.length > 0){
					for(let match of matches){
						const activeSelection = window.getSelection();
						activeSelection.removeAllRanges();

						match.removeAttribute('class');
						
						activeSelection.selectAllChildren(match);

						ranges.push(activeSelection.getRangeAt(0));
					}
				}

				this.restoreSelection();

			}
		}

		return ranges;
	}

	/**
	 * Find elements within the editor
	 * 
	 * @param string query The query to be run on the editor
	 * 
	 * @return array 
	*/
	findElements(query){
		if(this.elements.editor){
			return this.elements.editor.querySelectorAll(query);
		}
		return false;
	}

	/**
	 * Write content to the editor, at the cursor position
	 * 
	 * @param string text The string to be added to the editor 
	 * @param int mode The writing mode, either replace selected text, or callapse forward/backwards before writing
	 * @param bool isHtml Is this content HTML, if so, call the relevat command instead
	 *
	 * @return void
	*/
	write(text, mode, isHtml){
		const selection = this.getSelection();
		if(!selection){
			/* No active selection, prepare the system to append at the end */
			this.selectAll();
			this.collapseSelection(WritersBlock.DIRECTION_END);
		}

		mode = mode ? mode : WritersBlock.WRITE_MODE_REPLACE;
		isHtml = isHtml ? isHtml : false;

		switch(mode){
			case WritersBlock.WRITE_MODE_APPEND:
				this.collapseSelection(WritersBlock.DIRECTION_END);
				break;
			case WritersBlock.WRITE_MODE_PREPEND:
				this.collapseSelection(WritersBlock.DIRECTION_START);
				break;
		}

		if(!isHtml){
			this.onToolAction({command : 'insertText', value : text});
		} else {
			this.onToolAction({command : 'insertHTML', value : text});
		}

		this.triggerHook("onWrite", {text : text, mode : mode, isHtml : isHtml});
	}

	/**
	 * Write content to the editor, at the cursor position
	 * 
	 * @param string html The string to be added to the editor 
	 * @param int mode The writing mode, either replace selected text, or callapse forward/backwards before writing
	 *
	 * @return void
	*/
	writeHtml(html, mode){
		this.write(html, mode, true);
	}

	/** 
	 * Updates the popup tools, based on the active selection range
	 * 
	 * If the range extends past a single character, it will be shown, otherwise, it will be hidden
	 * 
	 * Also updates the placement of the element, based on an anchor node within the range
	 * 
	 * @return voic
	*/
	updatePopupTools(){
		if(this.elements.popup){
			if(this.range && this.range.endOffset !== this.range.startOffset){
				if(!this.range.toString() || this.range.toString().length <= 0){
					this.elements.popup.classList.remove('active');
					return;
				}

				this.elements.popup.classList.add('active');

				const popupBound = this.elements.popup.getBoundingClientRect();
				const startBound = this.range.getBoundingClientRect();

				/* 
				 * Not crazy about the hard-coded 'height' and offset values here
				 *
				 * We use an animation for the popup, so this is a short term approach to get things working as you would expect
				*/
				this.elements.popup.style.top = ((startBound.top - 35) - 10) + "px";
				this.elements.popup.style.left = startBound.left + "px";
			} else {
				this.elements.popup.classList.remove('active');
			}
		}

		this.triggerHook("onUpdatePopupTools", {visible : this.elements.popup.classList.contains('active')});

	}

	/**
	 * Hide the popup, this is a forced hide on popup tools
	 * 
	 * This is useful when needing to auto-hide the popup for specific actions
	 * 
	 * @return void
	*/
	hidePopupTools(){
		if(this.elements.popup){
			this.elements.popup.classList.remove('active');
			this.triggerHook("onHidePopupTools");
		}
	}

	/**
	 * Updates the toolbar, and as a result, all popup tools
	 * 
	 * This is useful for tracking formatting in place, however, could be used for other tools as well. 
	 * 
	 * It should not be excessive, once it becomes excessive, it will be separated into multiple sub-methods
	 * 
	 * @return void
	*/
	updateToolbar(){
		const groups = this.getTools();
		let range = this.getLastRange();

		const toolButtons = this.elements.wrap.querySelectorAll('a.tool');
		for(let button of toolButtons){
			button.classList.remove('active');
		}

		if(range){
			range = range.cloneRange();
			let anchor = range.startContainer || range.endContainer;

			if(anchor && anchor.parentElement){
				if(this.elements.editor.contains(anchor.parentElement)){
					while(anchor && anchor !== this.elements.editor){
						/* Walk the dom up to the editor */
						if(anchor.tagName){
							const tag = anchor.tagName.toLowerCase();
							let match = false;
							
							for(let i in groups){
								if(match){ break; }

								const group = groups[i];
								if(group.tools){
									for(let t in group.tools){
										if(match){ break; }

										const tool = group.tools[t];
										if(tool.action === 'formatBlock' && t === tag){
											const activeToolButtons = this.elements.wrap.querySelectorAll('a.tool[data-command="formatBlock"][data-value="' + t + '"');
											for(let button of activeToolButtons){
												button.classList.add('active');
											}
										} else if (tool.formattingTags && tool.formattingTags instanceof Array){
											if(tool.formattingTags.indexOf(tag) !== -1){
												const activeToolButtons = this.elements.wrap.querySelectorAll('a.tool[data-command="' + t + '"]');
												for(let button of activeToolButtons){
													button.classList.add('active');
												}
											}
										}
									}
								}
							}
						}

						anchor = anchor.parentElement || false;

					} 
				}
			}
		}

		this.triggerHook("onUpdateToolbar");
	}

	/**
	 * Get the deault tools, grouped into sections for the toolbar
	 * 
	 * Then go ahead and add any custom tools, as registered in the options object
	 * 
	 * @return object
	*/
	getTools(){
		if(this.cache.tools){
			/* Local cache available, leverage it now */
			return this.cache.tools;
		}

		const commandKey = this.isMac ? '⌘' : 'CTRL'; 

		const groups = [
			{
				tag : 'state-control',
				tools : {
					'undo' : {
						icon : 'fas fa-undo',
						title : 'Undo',
						shortcut : commandKey + ' + Z'
					},
					'redo' : {
						icon : 'fas fa-redo',
						title : 'Redo',
						shortcut : commandKey + ' + Y'
					}
				}
			},
			{
				tag : 'formatting',
				tools : {
					'p' : {
						icon : 'fas fa-paragraph',
						title : 'Paragraph',
						action : 'formatBlock'
					},
					'blockquote' : {
						icon : 'fas fa-quote-left',
						title : 'Quote',
						action : 'formatBlock'
					},
					'h1' : {
						text : 'H1',
						title : 'Heading 1',
						action : 'formatBlock'
					},
					'h2' : {
						text : 'H2',
						title : 'Heading 2',
						action : 'formatBlock'
					}
				}
			},
			{
				tag : 'styling',
				tools : {
					'bold' : {
						icon : 'fas fa-bold',
						title : 'Strong',
						shortcut : commandKey + ' + B',
						formattingTags : ['b', 'strong']
					},
					'italic' : {
						icon : 'fas fa-italic',
						title : 'Emphasis',
						shortcut : commandKey + ' + I',
						formattingTags : ['i', 'em']
					},
					'underline' : {
						icon : 'fas fa-underline',
						title : 'Underline',
						shortcut : commandKey + ' + U',
						formattingTags : ['u']
					},
					'strikeThrough' : {
						icon : 'fas fa-strikethrough',
						title : 'Deleted',
						formattingTags : ['strike']
					}
				}
			},
			{
				tag : 'alignment',
				tools : {
					'justifyLeft' : {
						icon : 'fas fa-align-left',
						title : 'Align Left'
					},
					'justifyCenter' : {
						icon : 'fas fa-align-center',
						title : 'Align Center'
					},
					'justifyRight' : {
						icon : 'fas fa-align-right',
						title : 'Align Right'
					},
					'justifyFull' : {
						icon : 'fas fa-align-justify',
						title : 'Justify'
					},
				}
			},
			{
				tag : 'indentation',
				tools : {
					'outdent' : {
						icon : 'fas fa-outdent',
						title : 'Outdent'
					},
					'indent' : {
						icon : 'fas fa-indent',
						title : 'Indent'
					},
				}
			},
			{
				tag : 'links',
				tools : {
					'createlink' : {
						icon : 'fas fa-link',
						title : 'Create Link',
						modal : {
							title : 'Create Link',
							confirm : 'Create',
							fields : [
								{
									label : 'Url',
									name : 'value',
									type : 'url'
								}
							]
						}
					},
					'unlink' : {
						icon : 'fas fa-unlink',
						title : 'Unlink'
					}
				}
			},
			{
				tag : 'media',
				tools : {
					'insertImage' : {
						icon : 'far fa-image',
						title : "Image",
						modal : {
							title : 'Insert Image',
							confirm : 'Insert',
							fields : [
								{
									label : 'Url',
									name : 'value',
									type : 'url'
								}
							]
						}
					}
				}
			},
			{
				tag : 'lists',
				tools : {
					'insertUnorderedList' : {
						icon : 'fas fa-list-ul',
						title : 'Unordered List'
					},
					'insertOrderedList' : {
						icon : 'fas fa-list-ol',
						title : 'Ordered List'
					},
				}
			},
			{
				tag : 'shared-blocks',
				tools : {
					'insertHorizontalRule' : {
						icon : 'fas fa-minus',
						title : 'Separator'
					},
					'removeFormat' : {
						icon : 'fas fa-remove-format',
						title : "Remove Format"
					}
				}
			}
		];

		if(this.config.customTools){
			if(this.config.customTools instanceof Array){
				for(let i in this.config.customTools){
					const customGroup = this.config.customTools[i];
					if(customGroup.tag && customGroup.tools){
						if(customGroup.tools instanceof Object){
							const existingIndex = this.getToolGroupIndex(groups, customGroup.tag);
							if(existingIndex !== -1){
								/* Existing grouping */
								for(let t in customGroup.tools){
									const tool = customGroup.tools[t];

									if(!(groups[existingIndex].tools instanceof Object)){
										groups[existingIndex].tools = {};
									}

									groups[existingIndex].tools[t] = tool;
								}
							} else {
								/* New grouping */
								groups.push(customGroup);
							}
						} else {
							this.log("Custom tools could not be registered. Tools must be an object containing all tools within the group", WritersBlock.LOG_LEVEL_ERROR);
						}
					} else {
						this.log("Custom tools could not be registered. Group must have a 'tag' (new or existing) and 'tools' defiition", WritersBlock.LOG_LEVEL_ERROR);
					}
				}
			} else {
				this.log("Custom tools could not be registered, please check coniguration structure. You must group your tools in the same way as the default tools", WritersBlock.LOG_LEVEL_ERROR);
			}
		}

		if(!this.cache.tools){
			/* Store to a local cache, so that future calls can use that instead of rebuilding */
			this.cache.tools = groups;
		}

		return groups;
	}

	/**
	 * Get tools that should be shown in the popup tools 
	 * 
	 * Feeds directly off the main tools
	 * 
	 * @return object
	*/
	getPopupTools(){
		const popupTools = {};
		const groups = this.getTools();
		for(let i in groups){
			const group = groups[i];
			if(group.tools){
				for(let t in group.tools){
					if(this.config.popupTools instanceof Array){
						if(this.config.popupTools.indexOf(t) !== -1){
							const tool = group.tools[t];
							popupTools[t] = tool;
						}
					}
				}
			}
		}

		return popupTools;
	}

	/**
	 * Checks to see if a specific tool has been disabled in the config
	 * 
	 * @param string slug The slug name of the tool
	 * 
	 * @return bool
	*/
	isToolEnabled(slug){
		if(this.config.enabledTools instanceof Array){
			if(this.config.enabledTools.indexOf(slug) === -1){
				/* This tool has been disabled by the config */
				return false;
			}
		}
		return true;
	}

	/**
	 * Gets the tool group index if it exists
	 * 
	 * In other words, this acts like 'indexOf', but on a tools object 
	 * 
	 * @param array groupss The tool groups array
	 * @param string tag The tag you are looking for 
	 * 
	 * @return int
	*/
	getToolGroupIndex(groups, tag){
		let index = -1;
		if(groups instanceof Array){
			for(let i in groups){
				if(groups[i].tag && groups[i].tag === tag){
					return i;
				}
			}
		}

		return index;
	} 

	/**
	 * Register a custom shortcut, usually for custom controls, but could be used for standard controls if needed
	 * 
	 * @param object shortcut The shortcut definition ({shiftKey : true:false, actionKey : char})
	 * @param string command The command to be fired
	 * @param string value The value to be sent as part of the command (delegate if custom)
	 * 
	 * @return void
	*/
	registerCustomShortcut(shortcut, command, value){
		if(shortcut.actionKey){
			let slug = "";

			if(shortcut.commandKey){
				slug += "Cmd";
			}

			if(shortcut.shiftKey){
				slug += "Shift";
			}

			slug += shortcut.actionKey.toUpperCase();

			if(!this.shortcuts[slug]){
				this.shortcuts[slug] = {
					command : command,
					value : value
				};

				this.triggerHook("onRegisterShortcut", {slug : slug});
			}
		} else {
			this.log("Custom shortcut not registered, missing action key.", WritersBlock.LOG_LEVEL_WARNING);
		}
	} 

	/**
	 * Register a modal configuration, so that can be easily accessed by tool slug
	 * 
	 * @param string command The command the modal is bound to
	 * @param object config The modal configuration
	 * 
	 * @return void
	*/
	registerCommandModal(command, config){
		if(command && config && config instanceof Object){
			this.commandModals[command] = config;
		} else {
			this.log("Command modal does not meet requirements to be automatically dispatched", WritersBlock.LOG_LEVEL_WARNING);
		}
	} 

	/**
	 * Create an element and return
	 * 
	 * @param string tag The element tag type
	 * @param array classlist The classes to be added
	 * @param object attributes The attributes to apply to the element
	 * 
	 * @return Element
	*/
	createElement(tag, classlist, attributes){
		const element = document.createElement(tag);
		
		if(classlist && typeof classlist === 'object'){
			for(let i in classlist){
				element.classList.add(classlist[i]);
			}
		}

		if(attributes && typeof attributes === 'object'){
			for(let i in attributes){
				element.setAttribute(i, attributes[i]);
			}
		}

		this.triggerHook("onCreateElement", {element : element});

		return element;
	}

	/**
	 * Create a tool button
	 * 
	 * @param string slug The tool slug
	 * @param object tool The definition
	 * 
	 * @return Element
	*/
	createToolButton(slug, tool){
		const toolButton = this.createElement('a', ['tool']);

		toolButton.setAttribute('href', "#");
		toolButton.setAttribute('data-command', slug);

		if(tool.title){
			let title = tool.title;
			if(tool.shortcut){
				title += " (" + this.prettyPrintShortcut(tool.shortcut) + ")";
			}

			toolButton.setAttribute('title', title);
		}

		if(tool.action){
			if(typeof tool.action === 'function'){
				const callbackSlug = (slug.replace(/[^a-zA-Z ]/g, ""));
				
				if(!this.customToolActions[callbackSlug]){
					this.customToolActions[callbackSlug] = tool.action;
				}

				toolButton.setAttribute('data-command', 'delegate_action_callback');
				toolButton.setAttribute('data-value', callbackSlug);

				if(tool.shortcut instanceof Object){
					/* Custom shortcure */
					this.registerCustomShortcut(tool.shortcut, 'delegate_action_callback', callbackSlug);					
				}
			} else {
				toolButton.setAttribute('data-command', tool.action);
				toolButton.setAttribute('data-value', slug);
			}
		}

		if(tool.icon){
			const icon = this.createElement('i');
			icon.setAttribute('class', tool.icon);

			toolButton.appendChild(icon);
		} else if(tool.text){
			const text = this.createElement('span');
			text.innerText = tool.text;

			toolButton.appendChild(text);
		}

		if(tool.modal){
			this.registerCommandModal(slug, tool.modal);
			toolButton.setAttribute('data-auto-modal', slug);
		} 

		toolButton.addEventListener('click', (event) => {
			event.preventDefault();
			this.onToolAction(event.currentTarget);
		});

		this.triggerHook("onCreateToolButton", {element : toolButton});

		return toolButton;
	}

	/**
	 * Create a pretty print for a shortcut registered in the tools
	 * 
	 * @param object|string shortcut The shortcut as defined for the tool, objects are compiled, strings are returned
	 * 
	 * @return string
	*/
	prettyPrintShortcut(shortcut){
		let pretty = "";
		if(shortcut instanceof Object){
			if(shortcut.commandKey){
				pretty += this.isMac ? '⌘' : 'CTRL';
			}

			if(shortcut.shiftKey){
				pretty += " + Shift"; 
			}

			if(shortcut.actionKey){
				pretty += " + " + shortcut.actionKey.toUpperCase();
			}
		} else {
			/**
			 * Most likely a string, most likely a native shortcut like bold, undo, etc return it as is */
			pretty = shortcut;
		}
		return pretty;
	}

	/**
	 * Stubbed placeholder for internal command, coming soon
	 * 
	 * @param string command The command
	 * @param mixed value The value
	 * 
	 * @return void
	*/
	executeCommand(command, value){
		this.log("Internal execute command has not been developed, if document.execCommand has not been fully deprecated, please enable the 'USE_DEPRECATED_COMMANDS' constant", WritersBlock.LOG_LEVEL_WARNING);
	}

	/**
	 * Checks the config.events object for a specific event slug, and passes any relevant arguments to this as a 'callback'
	 * 
	 * At the same time, triggers a custom event with the same data in place, allowing developers to bind to either option, based on the base method name 
	 * 
	 * @param string slug The event/callback name
	 * @param object params The data to send with the event/callback 
	 *
	 * @return false
	*/
	triggerHook(slug, params){
		const eventName = 'writersblock.' + slug;
		const eventData = {
			instance : this, 
			data : params ? params : false
		};

		if(this.config.events && this.config.events instanceof Object){
			if(this.config.events[slug] && typeof this.config.events[slug] === "function"){
				this.config.events[slug](eventData);
			}
		}

		try{
			const event = new CustomEvent(eventName, { detail: eventData });
			document.body.dispatchEvent(event);
		} catch (ex){
			this.log(ex, WritersBlock.LOG_LEVEL_WARNING);
		}
	}

	/**
	 * Wrapper for console logging at various levels
	 * 
	 * @param string message The message to be logged
	 * @param int level The error level, use a predeifined constant
	 * 
	 * @return void
	*/
	log(message, level){
		if(!this.config.enableLogs){
			return;
		}

		if(!level){
			level = WritersBlock.LOG_LEVEL_INFO;
		}

		message = "WritersBlockJS: " + message;
		switch(level){
			case WritersBlock.LOG_LEVEL_INFO:
				window.console.log(message);
				break;
			case WritersBlock.LOG_LEVEL_WARNING:
				window.console.warn(message);
				break;
			case WritersBlock.LOG_LEVEL_ERROR:
				window.console.error(message);
				break;
		}
	}
}