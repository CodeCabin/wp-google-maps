/**
 * @namespace WPGMZA
 * @module SidebarGroupings
 * @requires WPGMZA.EventDispatcher
 */

jQuery(function($) {
	WPGMZA.SidebarGroupings = function(){
		var self = this;
		this.element = document.body;
		this.actionBar = {
			element : $(this.element).find('.action-bar'),
			dynamicAction : null,
			dynamicLabel : ""
		};

		

		$(this.element).on("click", ".grouping .item", function(event){
			self.openTab(event);

			if($(this).hasClass('caret-right')){
				/* Intelli-Panels - Only applies when moving forward (caret-right) */
				self.intelliFeaturePanel();
			}
		});

		$('.quick-actions .actions').on('click', '.icon', function(event){
			var feature = $(this).data('type');
			if(feature){
				self.openTabByFeatureType(feature);

				$('.quick-actions #qa-add-datasets').prop('checked', false);
			}
		});

		$('.wpgmza-feature-accordion[data-wpgmza-feature-type]').on('sidebar-delegate-edit', function(event){
			if(event.feature){
				self.openTabByFeatureType(event.feature);
			}
		});

		$('.wpgmza-feature-accordion[data-wpgmza-feature-type]').on('sidebar-delegate-saved', function(event){
			if(event.feature){
				self.closeCurrent();
			}
		});

		$('.wpgmza-feature-accordion[data-wpgmza-feature-type]').on('sidebar-delegate-busy', function(event){
			self.resetScroll();
		});

		$('.wpgmza-feature-accordion[data-wpgmza-feature-type]').on('sidebar-delegate-created', function(event){
			/* Nothing to do yet */
		});

		$(this.element).find('.fieldset-toggle').on('click', function(event){
			$(this).toggleClass('toggled');
		});

		/** Should move this to it's own module... hard to justify right now */
		$(this.element).on('click', '.wpgmza-toolbar .wpgmza-toolbar-list > *', function(event){
			$(this).parent().parent().find('label').click();
		});

		$('.wpgmza-feature-accordion[data-wpgmza-feature-type]').on('sidebar-delegate-feature-caption-loaded', function(event){
			if(self.actionBar.dynamicAction){
				self.actionBar.dynamicLabel = self.actionBar.dynamicAction.text(); 
				self.actionBar.element.find('.dynamic-action').removeClass('wpgmza-hidden').text(self.actionBar.dynamicLabel);
			}
		});

		this.actionBar.element.find('.dynamic-action').on('click', function(event){
			if(self.actionBar.dynamicAction){
				self.actionBar.dynamicAction.click();
			}
		});

		this.initContextMenu();
		this.initUpsellBlocks();
	}

	WPGMZA.extend(WPGMZA.SidebarGroupings, WPGMZA.EventDispatcher);

	WPGMZA.SidebarGroupings.createInstance = function(){
		return new WPGMZA.SidebarGroupings();
	}

	WPGMZA.SidebarGroupings.prototype.openTab = function(event){
		var tab = event.currentTarget;
		var groupId = $(tab).data('group');

		this.openTabByGroupId(groupId);

		if(WPGMZA.mapEditPage && WPGMZA.mapEditPage.map){
			/* Trigger resize events as panels may extend/retract from screen space */
			WPGMZA.mapEditPage.map.onElementResized();

			/* Temporary placement: Hide any tips, because we can assume user interaction has taken place */
			$('.wpgmza-quick-tip-container').hide();
		}
	}

	WPGMZA.SidebarGroupings.prototype.openTabByFeatureType = function(feature){
		if($(this.element).find('.grouping[data-feature="' + feature + '"]').length > 0){
			var groupId = $(this.element).find('.grouping[data-feature="' + feature + '"]').data('group');
			this.openTabByGroupId(groupId);
		}
	}

	WPGMZA.SidebarGroupings.prototype.openTabByGroupId = function(groupId){
		if(groupId && this.hasGroup(groupId)){
			this.closeAll();

			var element = $(this.element).find('.grouping[data-group="' + groupId + '"]');
			
			element.addClass('open');

			if(element.data('feature-discard')){
				$(element).trigger('feature-block-closed');
			}

			
			if($('.wpgmza-map-settings-form').find(element).length > 0){
				$('.wpgmza-map-settings-form').removeClass('wpgmza-hidden');
			} else {
				$('.wpgmza-map-settings-form').addClass('wpgmza-hidden');
			}

			if(element.hasClass('auto-expand')){
				$('.sidebar').addClass('expanded');
			} else {
				$('.sidebar').removeClass('expanded');
			}

			if(element.data('feature')){
				$(element).trigger('feature-block-opened');
			}

			/* Dispatch an event to let other tools know panels are being opened. Features use a different event (feature-block-opened) */
			$(element).trigger('grouping-opened', [groupId]);

			this.updateActionBar(element);
		}
	}

	WPGMZA.SidebarGroupings.prototype.hasGroup = function(groupId){
		return $(this.element).find('.grouping[data-group="' + groupId + '"]').length > 0;
	}

	WPGMZA.SidebarGroupings.prototype.closeAll = function(){
		var self = this;
		$(this.element).find('.grouping.open').each(function(){
			/* Dispatch and event to let other tools know things are being closed */
			const group = $(this).data('group');
			if(group){
				$(self.element).trigger('grouping-closed', [group]);
			}
		});

		$(this.element).find('.grouping').removeClass('open');
	}

	WPGMZA.SidebarGroupings.prototype.closeCurrent = function(){
		if($(this.element).find('.grouping.open').length > 0){
			$(this.element).find('.grouping.open').find('.heading.has-back .item').click();
		}
	}

	WPGMZA.SidebarGroupings.prototype.getActiveGroup = function(){
		if($(this.element).find('.grouping.open').length > 0){
			return $(this.element).find('.grouping.open').data('group');
		}
		return false;
	}

	WPGMZA.SidebarGroupings.prototype.isOpen = function(groupId){
		let activeGroup = this.getActiveGroup();
		return activeGroup === groupId ? true : false;
	}

	WPGMZA.SidebarGroupings.prototype.updateActionBar = function(element){
		/* 
		 * This should be a part of a new module specific to the action bar, but this is hard to justify right now...
		 * Let's leave it all here for now, cut down on noise and excessive modules later 
		*/ 
		this.actionBar.dynamicAction = null;
		if(element && element.data('feature') && element.find('.wpgmza-save-feature').length > 0){
			this.actionBar.dynamicAction = element.find('.wpgmza-save-feature').first();
			this.actionBar.dynamicLabel = this.actionBar.dynamicAction.text().trim();
		} 

		if(this.actionBar.dynamicAction){
			// Hide original button
			this.actionBar.dynamicAction.addClass('wpgmza-hidden');
		}

		if(this.actionBar.dynamicAction && this.actionBar.dynamicLabel){
			this.actionBar.element.find('.dynamic-action').removeClass('wpgmza-hidden').text(this.actionBar.dynamicLabel);
			this.actionBar.element.find('.static-action').addClass('wpgmza-hidden');
		} else {
			this.actionBar.element.find('.static-action').removeClass('wpgmza-hidden');
			this.actionBar.element.find('.dynamic-action').addClass('wpgmza-hidden').text("");
		}
	}

	WPGMZA.SidebarGroupings.prototype.resetScroll = function(){
		if($(this.element).find('.grouping.open').length > 0){
			$(this.element).find('.grouping.open .settings').scrollTop(0);
		}
	}

	WPGMZA.SidebarGroupings.prototype.intelliFeaturePanel = function(){
		/* 
		 * Check if the curretly open panel is subject to intelli panel logic 
		 * 
		 * This is when a feature list is loaded, but the list is empty, in these cases, we can skip right on to the creator/editor in most cases
		 */
		if(WPGMZA.mapEditPage && WPGMZA.mapEditPage.map && WPGMZA.mapEditPage.map.markersPlaced){
			const element = $(this.element).find('.grouping.open');
			const map =  WPGMZA.mapEditPage.map;
			if(element.find('*[data-wpgmza-table]').length > 0){
				const feature = element.find('*[data-wpgmza-table]').data('wpgmza-feature-type');
				if(feature){
					/* We have a map edit page, the markers at very least have been placed, and we found a matching data-type list (DataTable) */
					const featurePlural = WPGMZA.pluralize(feature);
					if(map[featurePlural] && map[featurePlural].length === 0){
						element.find('.navigation .item:first-child').click();
					}
				}
			}
		}
	}

	WPGMZA.SidebarGroupings.prototype.initUpsellBlocks = function(){
		const upsellWrappers = $(this.element).find('.upsell-block.auto-rotate');
		if(upsellWrappers && upsellWrappers.length > 0){
			/* We have some upsell rotations to handle */
			for(let currentWrapper of upsellWrappers){
				currentWrapper = $(currentWrapper);
				if(currentWrapper.find('.upsell-block-card').length > 1){
					currentWrapper.addClass('rotate');
					
					currentWrapper.on('wpgmza-upsell-rotate-card', function(){
						const cardLength = $(this).find('.upsell-block-card').length; 
						$(this).find('.upsell-block-card').hide();
						

						let nextCard = parseInt(Math.random() * cardLength);
						if(nextCard < 0){
							nextCard = 0;
						} else if(nextCard >= cardLength){
							nextCard = cardLength - 1;
						}

						let nextCardElem = $(this).find('.upsell-block-card:nth-child(' + (nextCard + 1) + ')');
						if(nextCardElem.length > 0 && !nextCardElem.hasClass('active')){
							$(this).find('.upsell-block-card').removeClass('active');
							nextCardElem.addClass('active');
							nextCardElem.fadeIn(200);
						} else {
							/* Just reshow the card for another 10 seconds */
							nextCardElem.show();
						}

						setTimeout(() => {
							$(this).trigger('wpgmza-upsell-rotate-card');
						}, 10000);
					});
					currentWrapper.trigger('wpgmza-upsell-rotate-card');
				} else {
					currentWrapper.addClass('static');
				}
			}
		}
	}

	WPGMZA.SidebarGroupings.prototype.initContextMenu = function(){
		if(WPGMZA.InternalEngine.isLegacy()){
			/* Not available for legacy engine */
			return;
		}

		if(WPGMZA.settings && WPGMZA.settings.mapEditorContextMenu && WPGMZA.settings.mapEditorContextMenu === 'disabled'){
			/* Disabled by site owner */
			return;
		}

		this.contextMenu = {
			element :  $(this.element).find('.wpgmza-context-menu')
		};

		this.contextMenu.element.find('.wpgmza-context-menu-item').on('click', (event) => {
			const target = event.target || event.currentTarget || false;
			if(target){
				const item = $(target);
				const itemGroup = item.data('group');
				this.openTabByGroupId(itemGroup);

				try{
					if(WPGMZA.mapEditPage && itemGroup === 'map-markers-editor'){
						if(this.contextMenu.cachedEvent){
							/* This uses an older drawing system, so we need to funnel the original event back over to the map editor */
							WPGMZA.mapEditPage.onRightClick(this.contextMenu.cachedEvent);
						}
					}
				} catch (ex){
					/* Something went wrong, leave it alone */
				}
			}
			this.closeContextMenu();
		});

		$(this.element).on('click', () => {
			this.closeContextMenu();
		});
	}

	WPGMZA.SidebarGroupings.prototype.isContextMenuReady = function(){
		return this.contextMenu && this.contextMenu.element ? true : false;
	}

	WPGMZA.SidebarGroupings.prototype.canOpenContextMenu = function(){
		const initialized = this.isContextMenuReady();
		if(initialized){
			const activeGroup = this.getActiveGroup();
			if(activeGroup.indexOf('-editor') !== -1){
				/* This is an editor tab */
				return false;
			}

			if($(`.grouping[data-group="${activeGroup}"]`).find('.feature-list').length){
				/* This is a dataset listing tab */
				return false;
			}

			return true;
		}
		return false;
	}

	WPGMZA.SidebarGroupings.prototype.isContextMenuOpen = function(){
		if(this.isContextMenuReady() && !this.contextMenu.element.hasClass('wpgmza-hidden')){
			return true;
		}
		return false;
	}

	WPGMZA.SidebarGroupings.prototype.openContextMenu = function(event){
		if(this.canOpenContextMenu()){
			if(event && event instanceof WPGMZA.Event){
				if(event.latLng && event.target && event.target instanceof WPGMZA.Map){
					const map = event.target;
					
					const position = {
						container : map.element.getBoundingClientRect(),
						coordinates : map.latLngToPixels(event.latLng)
					};

					position.context = {
						left : position.container.x + position.coordinates.x,
						top : position.container.y + position.coordinates.y
					};
					
					/* Check for off-screen placements */
					if(position.context.left > ($(window).width() - 150)){
						position.context.left -= 150;
					}

					if(position.context.top > ($(window).height() - 180)){
						position.context.top -= 180;
					}

					this.contextMenu.element.css('top', `${position.context.top}px`);
					this.contextMenu.element.css('left', `${position.context.left}px`);

					this.contextMenu.coordinates = event.latLng;
					this.contextMenu.cachedEvent = event;

					this.contextMenu.element.removeClass('wpgmza-hidden');
					
					return true;
				}
			}
		}
		return false;
	}

	WPGMZA.SidebarGroupings.prototype.closeContextMenu = function(){
		if(this.isContextMenuReady()){
			this.contextMenu.element.addClass('wpgmza-hidden');
		}
	}
});