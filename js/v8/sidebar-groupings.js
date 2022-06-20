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
});