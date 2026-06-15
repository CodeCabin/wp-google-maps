/**
 * @namespace WPGMZA
 * @module AtlasMajorAutoSave
 * @requires WPGMZA
 *
 * Auto-save for the map edit page under Atlas Major. Hijacks the
 * #wpgmaps_options form submit, saves via REST (POST
 * /wpgmza/v1/maps/{id}/settings), and additionally polls every 10s
 * for a dirty form. On AJAX failure the handler shows an error state,
 * counts down 3s, then falls back to a native form submit so the user
 * never loses work.
 *
 * Shared UX: a pill (.am-save-pill) in the top bar, right of the
 * shortcode pill, has states: idle (hidden), saving, saved, error.
 * "Saved" persists once set (Google Docs-style).
 */
jQuery(function($) {

	/**
	 * Resolve a localized string from WPGMZA.localized_strings, with an
	 * English fallback for the rare case where the server-side
	 * localization array is missing or hasn't been refreshed.
	 */
	function L(key, fallback){
		return (WPGMZA.localized_strings && WPGMZA.localized_strings[key]) || fallback;
	}

	if(WPGMZA.currentPage != "map-edit"){
		return;
	}

	if(!document.querySelector('.wpgmza-atlas-major')){
		return;
	}

	WPGMZA.AtlasMajorAutoSave = function(){
		var self = this;

		this.form           = $('#wpgmaps_options');
		if(!this.form.length){
			return;
		}

		this.pill           = $('.am-save-pill');
		this.pauseToggle    = $('.am-autosave-pause-toggle');
		this.saveButtons    = $('label[for="wpgmza_savemap"]');
		this.saveButtonOriginalText = this.saveButtons.first().text();
		this.pollIntervalMs = 10000;

		/* Paused state — when paused, autosave skips all automatic
		 * triggers (change events, interval ticks). Manual Save Map
		 * clicks still flush so the user can intentionally commit when
		 * they want to.
		 *
		 * DEFAULT IS PAUSED — autosave is opt-in. The user toggles it
		 * on via the top-bar pause button; the choice is persisted to
		 * localStorage so it sticks across reloads. The previous
		 * behaviour (autosave-on by default) was too aggressive: an
		 * autosave-on-init flush could write empty values for any form
		 * field that wasn't serialised, clobbering the saved record. */
		this.paused = true;
		try {
			if(window.localStorage && localStorage.getItem('wpgmza_autosave_enabled') === '1'){
				this.paused = false;
			}
		} catch(e){ }

		/* Instant visual flip on click. Bound outside the grace period
		 * so the user always gets feedback, even if they click Save
		 * before our submit hijack is wired up (in which case the form
		 * submits natively and the page reloads, restoring the button). */
		var self2 = this;
		this.saveButtons.on('click', function(e){
			if($(this).hasClass('is-disabled')){
				e.preventDefault();
				e.stopImmediatePropagation();
				return false;
			}
			self2.setSaveButtonState('saving');
		});
		this.fallbackDelayMs = 3000;
		this.changeDebounceMs = 1500; // coalesce rapid changes (toggle spam, slider drags)
		this.gracePeriodMs  = 3000;   // don't save in the first N ms after page load

		this.inFlight       = false;
		this.pendingFlush   = false;        // set true if a save is requested while one is in flight
		this.fallbackTimer  = null;
		this.changeTimer    = null;
		this.ready          = false;        // flips true after grace period; nothing is bound before this

		/* Grace period — on initial load a lot of other JS initialises,
		 * populates form fields, fires synthetic change events, and
		 * occasionally triggers form.submit() programmatically for
		 * internal wiring. We don't want our form-submit hijack, our
		 * change listener, or the interval to interfere with any of
		 * that bootstrap. Nothing binds or fires until the grace
		 * period elapses. */
		setTimeout(function(){
			self.lastHash = self.hashForm();
			self.ready = true;
			self.attachListeners();
		}, this.gracePeriodMs);

		/* Pause toggle in the top bar (right of the save pill). Wire it
		 * up immediately (no grace period needed — the toggle just flips
		 * a flag, it doesn't trigger saves). */
		this.attachPauseToggle();
		this.refreshPauseToggleUI();

		/* "Remember to save your map!" pill — show for 8 seconds on
		 * every pan / zoom (when autosave is off). Implemented from
		 * autosave's own listener with a sliding hide timer so we
		 * don't depend on jQuery .show()/.hide() inline-style state. */
		this.attachReminderPillTimer();
	};

	/**
	 * Watch the form's view-state inputs (map_start_lat / map_start_lng /
	 * map_start_zoom). Whenever any value differs from the last polled
	 * snapshot, flash the "Remember to save your map!" pill for 8
	 * seconds. Subsequent changes reset the timer.
	 *
	 * Polling is intentionally dumb: it doesn't depend on jQuery's
	 * .show()/.hide() state, the map's event dispatcher, or
	 * MutationObserver — all of which I tried and could not get to fire
	 * reliably on every pan after the first. The inputs are updated
	 * directly by the editor's onBoundsChanged via .val(), so they are
	 * the canonical "what is the map showing" signal. 4 polls/sec is
	 * trivial overhead.
	 *
	 * Skipped silently when autosave is enabled.
	 */
	WPGMZA.AtlasMajorAutoSave.prototype.attachReminderPillTimer = function(){
		var self = this;

		var pillEl = document.getElementById('wpgmaps_save_reminder');
		var latEl  = document.querySelector('input[name="map_start_lat"]');
		var lngEl  = document.querySelector('input[name="map_start_lng"]');
		var zoomEl = document.querySelector('input[name="map_start_zoom"]');
		if(!pillEl || !latEl || !lngEl || !zoomEl){
			/* DOM not ready yet — retry shortly. */
			setTimeout(function(){ self.attachReminderPillTimer(); }, 250);
			return;
		}

		var last = {
			lat:  latEl.value,
			lng:  lngEl.value,
			zoom: zoomEl.value
		};

		setInterval(function(){
			/* === 1. Detect lat/lng/zoom changes (pan/zoom via .val()) === */
			var cur = {
				lat:  latEl.value,
				lng:  lngEl.value,
				zoom: zoomEl.value
			};
			var panZoomChanged = (cur.lat !== last.lat || cur.lng !== last.lng || cur.zoom !== last.zoom);
			if(panZoomChanged) last = cur;

			/* === 2. Detect anything else via form hash ===
			 * The save-pill `unsaved` flip-trigger lives in BOTH the
			 * change/input listener AND here as a safety net — some
			 * settings UIs in the editor mutate inputs via .val()
			 * without dispatching a change event (custom toggles,
			 * pickers, sliders, etc.), so the listener alone misses
			 * them. Hashing four times per second is cheap and
			 * catches everything the listener doesn't. Only runs
			 * once `lastHash` has been initialised by the grace-
			 * period callback — before that, every tick would look
			 * "changed" and the pill would falsely flip to unsaved
			 * before the user has done anything. */
			var hashChanged = false;
			if(self.ready && typeof self.lastHash !== 'undefined'){
				var cur_hash = self.hashForm();
				if(cur_hash !== self.lastHash){
					hashChanged = true;
				}
			}

			var anyChange = panZoomChanged || hashChanged;
			if(!anyChange) return;

			/* Pan/zoom updates lat/lng/zoom via .val() which doesn't
			 * fire a `change` event — and some custom settings UIs
			 * do the same. Flip the save-pill to "unsaved" here so
			 * the green "Saved" can't stay stale across user
			 * changes. Runs in BOTH paused and active states; the
			 * existing 10s polling in attachListeners() handles the
			 * actual flush when autosave is on. */
			self.setPillState('unsaved');

			if(!self.paused) return; // autosave on — reminder pill is suppressed by CSS anyway

			if(!panZoomChanged) return; // only flash the "Remember!" pill on pan/zoom, not generic form edits

			/* Autosave off — show the "Remember to save your map!"
			 * pill for 8 seconds. Subsequent changes reset the timer.
			 *
			 * Force-clear any inline display on the inner card too —
			 * there are dormant fadeOut() calls in
			 * atlas-major-live-preview.js (initSaveReminder) that
			 * historically set display:none on `.am-save-reminder`,
			 * and similar leftovers could exist for other classes.
			 * Resetting both elements every flash makes this
			 * resilient regardless of what else touched them. */
			pillEl.style.display = 'block';
			var innerCard = pillEl.firstElementChild;
			if(innerCard) innerCard.style.display = '';

			clearTimeout(self._reminderPillTimer);
			self._reminderPillTimer = setTimeout(function(){
				pillEl.style.display = 'none';
			}, 8000);
		}, 250);
	};

	/**
	 * Bind the top-bar pause toggle button. Clicking flips paused
	 * state, persists to localStorage, and updates the button's visual
	 * state. The flag is also read at construction so a paused state
	 * survives page reloads.
	 */
	WPGMZA.AtlasMajorAutoSave.prototype.attachPauseToggle = function(){
		var self = this;
		if(!this.pauseToggle.length) return;
		this.pauseToggle.on('click', function(e){
			e.preventDefault();
			self.setPaused(!self.paused);
		});
	};

	/**
	 * Update the pause toggle button's visual state to reflect
	 * `this.paused`. Adds/removes a `is-paused` class plus an
	 * accessible label + tooltip. The button itself is styled in
	 * atlas-major.css.
	 */
	WPGMZA.AtlasMajorAutoSave.prototype.refreshPauseToggleUI = function(){
		if(!this.pauseToggle.length) return;
		this.pauseToggle.toggleClass('is-paused', !!this.paused);
		var label = this.paused
			? L('atlas_major_autosave_paused_label', 'Autosave off')
			: L('atlas_major_autosave_active_label', 'Autosave on');
		var title = this.paused
			? L('atlas_major_autosave_resume_tip', 'Click to enable autosave')
			: L('atlas_major_autosave_pause_tip', 'Click to disable autosave (manual Save Map still works)');
		this.pauseToggle.attr({ 'aria-label': label, 'title': title });
		this.pauseToggle.find('.am-autosave-pause-text').text(label);

		/* Mirror the autosave state onto <body> so CSS can scope the
		 * legacy "Remember to save your map!" pill to "autosave is OFF".
		 * When autosave is enabled, hide the pill immediately (any
		 * pending 8s timer is also canceled so it can't re-show). */
		$('body').toggleClass('wpgmza-autosave-on', !this.paused);
		if(!this.paused){
			clearTimeout(this._reminderPillTimer);
			$('#wpgmaps_save_reminder').hide();
		}
	};

	/**
	 * Public setter — flip the paused flag, persist it to localStorage,
	 * and refresh the UI. Safe to call before listeners are attached
	 * (grace period hasn't elapsed).
	 */
	WPGMZA.AtlasMajorAutoSave.prototype.setPaused = function(paused){
		this.paused = !!paused;
		try {
			/* `wpgmza_autosave_enabled` is the opt-in flag. Absence
			 * (the default) means autosave is paused; '1' means the
			 * user has explicitly enabled it. */
			if(this.paused) localStorage.removeItem('wpgmza_autosave_enabled');
			else            localStorage.setItem('wpgmza_autosave_enabled', '1');
		} catch(e){ }
		this.refreshPauseToggleUI();
	};

	/**
	 * Bind all the form / interval listeners. Only called AFTER the
	 * grace period so it can't interfere with any JS that runs
	 * during initial page bootstrap (marker list render, live
	 * preview init, etc.).
	 */
	WPGMZA.AtlasMajorAutoSave.prototype.attachListeners = function(){
		var self = this;

		/* "Unsaved changes" pill state — fires on every change/input
		 * regardless of paused state. Without this, the pill could
		 * stay green "Saved" indefinitely after the user toggled
		 * autosave off and made edits, falsely implying the map was
		 * up to date. The pill flips to amber "Unsaved changes" as
		 * soon as anything in the form changes; flush() resets it
		 * to "Saved" on success. Cheap — just attribute + text
		 * mutations on one element. */
		this.form.on('change input', function(){
			self.setPillState('unsaved');
		});

		/* Change events — coalesced with a debounce so a rapid burst
		 * of changes (toggle spam, slider drag, typing in text fields
		 * that fire change on blur) results in one save rather than
		 * many. The "did anything change" decision is made inside
		 * flush() via the hash comparison. */
		this.form.on('change', function(e){
			if(self.paused) return;
			clearTimeout(self.changeTimer);
			self.changeTimer = setTimeout(function(){
				self.changeTimer = null;
				if(self.paused) return;
				if(!self.inFlight){
					self.flush(/* triggeredByUser */ false);
				}
			}, self.changeDebounceMs);
		});

		/* Hijack form submit — catches both "Save Map" <label for=...>
		 * buttons (top bar + bottom action bar), any keyboard-Enter
		 * submit, and anything else that triggers the form.submit()
		 * event. One binding covers everything. */
		this.form.on('submit', function(e){
			e.preventDefault();
			self.flush(/* triggeredByUser */ true);
		});

		/* 10s tick — hash the form and compare to lastHash. If they
		 * differ, something changed and we flush. This is the safety
		 * net that catches changes the `change` event misses:
		 *   - programmatic .val() writes (map pan/zoom updating the
		 *     hidden lat/lng/zoom inputs, sliders setting values via
		 *     jQuery UI, etc. — these don't fire `change` by default)
		 *   - toggle switches whose click handlers suppress / delay
		 *     the change event
		 * Hashing is cheap (a few ms for a ~100-field form). */
		setInterval(function(){
			if(self.paused) return;
			if(self.inFlight) return;
			if(self.hashForm() !== self.lastHash){
				self.flush(/* triggeredByUser */ false);
			}
		}, this.pollIntervalMs);
	};

	/**
	 * Find the current map's ID from the most reliable source
	 * available at call time. Falls through: form's hidden input →
	 * WPGMZA.mapEditPage.map → `?map_id=` query param.
	 */
	WPGMZA.AtlasMajorAutoSave.prototype.resolveMapId = function(){
		var val = parseInt(this.form.find('input[name="map_id"]').val() || 0, 10);
		if(val) return val;

		if(WPGMZA.mapEditPage && WPGMZA.mapEditPage.map && WPGMZA.mapEditPage.map.id){
			return parseInt(WPGMZA.mapEditPage.map.id, 10);
		}

		var m = window.location.search.match(/[?&]map_id=(\d+)/);
		if(m) return parseInt(m[1], 10);

		return 0;
	};

	/**
	 * Build a compact hash of the form's serialised state. Good enough
	 * to detect whether the user has actually changed anything —
	 * we skip hitting the server if the 10s tick fires but nothing
	 * has actually changed since the last snapshot.
	 */
	WPGMZA.AtlasMajorAutoSave.prototype.hashForm = function(){
		var pairs = this.form.serializeArray();
		var str = JSON.stringify(pairs);
		var hash = 0;
		for(var i = 0; i < str.length; i++){
			hash = ((hash << 5) - hash) + str.charCodeAt(i);
			hash |= 0;
		}
		return hash + '_' + str.length;
	};

	/**
	 * Fire the save request. If a save is already in flight, queue a
	 * follow-up to run immediately after. Rapid user clicks on "Save
	 * Map" never double-submit.
	 */
	WPGMZA.AtlasMajorAutoSave.prototype.flush = function(triggeredByUser){
		var self = this;

		if(this.inFlight){
			this.pendingFlush = true;
			return;
		}

		/* Skip if nothing has changed, unless the user explicitly hit
		 * Save — then we always send so they get the UX reassurance
		 * of a "Saved" pill update. */
		var currentHash = this.hashForm();
		if(!triggeredByUser && currentHash === this.lastHash){
			return;
		}

		/* Resolve the map id lazily — the hidden `map_id` input is
		 * populated at runtime by other JS, so reading it in the
		 * constructor would often give an empty value. Resolve it
		 * per-save and fall back through: form input → WPGMZA
		 * mapEditPage.map → URL param → the map instance's id. */
		var mapId = this.resolveMapId();
		if(!mapId){
			/* Nothing we can do yet — the next tick will try again. */
			return;
		}

		this.inFlight = true;
		this.setPillState('saving');
		/* Flip the Save Map button to "Saving…" for ALL flushes — both
		 * user-triggered (clicking Save) and autosave (debounced after a
		 * settings change). Previously only user-triggered showed the
		 * button state change, which made autosaves invisible to the
		 * user except via the small "Saved" pill. Showing the button
		 * state for autosaves makes it obvious that work is being
		 * persisted. */
		this.setSaveButtonState('saving');

		/* Convert serialised form pairs into a plain object. Repeating
		 * keys (e.g. checkbox arrays) would collide — but map settings
		 * don't use those today, so a flat object is fine. */
		var pairs = this.form.serializeArray();
		var payload = {};
		for(var i = 0; i < pairs.length; i++){
			payload[pairs[i].name] = pairs[i].value;
		}

		WPGMZA.restAPI.call('/maps/' + mapId + '/settings/', {
			method: 'POST',
			data: payload,
			success: function(response){
				self.inFlight = false;
				self.lastHash = currentHash;

				/* Cancel any countdown/fallback from a previous failure. */
				if(self.fallbackTimer){
					clearTimeout(self.fallbackTimer);
					self.fallbackTimer = null;
				}

				self.setPillState('saved');
				self.setSaveButtonState('idle');

				/* Hide the legacy "Remember to save your map!" nag —
				 * the change has been persisted, the user no longer
				 * needs to remember. Cancel any pending 8s timer too. */
				clearTimeout(self._reminderPillTimer);
				$('#wpgmaps_save_reminder').hide();

				/* If another save was queued while this one was in
				 * flight, flush it now. */
				if(self.pendingFlush){
					self.pendingFlush = false;
					self.flush(/* triggeredByUser */ false);
				}

				/* One-shot reload signal: the live-preview modal sets
				 * this when the user confirms "Save & Reload" for a
				 * setting that needs the editor reconstructed (e.g.
				 * custom_tile_enabled — leaflet CRS is locked at map
				 * construction). Wait for any queued recursive flush
				 * to also complete (its success will land here too
				 * with inFlight=false) before reloading, so we don't
				 * abort a save mid-request. */
				if(self.reloadAfterSave && !self.inFlight){
					self.reloadAfterSave = false;
					window.location.reload();
				}
			},
			error: function(xhr, status, err){
				self.inFlight = false;
				/* lastHash is NOT updated on failure, so the next tick
				 * sees the same diff and retries automatically. */
				self.setPillState('error');
				/* Leave the save button in the 'saving' state — the
				 * fallback will trigger a native form submit shortly,
				 * which reloads the page (button restores naturally).
				 * If we restored it here it would briefly look idle
				 * during the 3s countdown which is misleading. */
				self.scheduleFallback();
			}
		});
	};

	/**
	 * Schedule a native form submit as a 3s countdown fallback. The
	 * native submit hits admin-post.php?action=wpgmza_save_map, which
	 * is the same server-side handler the form has always used — so
	 * data is never lost when AJAX is broken.
	 */
	WPGMZA.AtlasMajorAutoSave.prototype.scheduleFallback = function(){
		var self = this;
		if(this.fallbackTimer) return;

		var remaining = Math.floor(this.fallbackDelayMs / 1000);
		var template = L('atlas_major_save_failed_retrying', 'Save failed — retrying in %ds');
		this.updatePillText('error', template.replace('%d', remaining));

		this.fallbackTimer = setInterval(function(){
			remaining--;
			if(remaining <= 0){
				clearInterval(self.fallbackTimer);
				self.fallbackTimer = null;
				/* Trigger the native submit. `form.submit()` on the
				 * DOM element bypasses our jQuery `submit` handler so
				 * we don't re-enter the AJAX path. */
				self.form.get(0).submit();
				return;
			}
			self.updatePillText('error', template.replace('%d', remaining));
		}, 1000);
	};

	/**
	 * Visually toggle the "Save Map" button (a <label for="wpgmza_savemap">
	 * — there are two of them: top bar + bottom action bar) between
	 * idle and a disabled "Saving…" state. The label is the user-facing
	 * control; the underlying submit input stays hidden.
	 */
	WPGMZA.AtlasMajorAutoSave.prototype.setSaveButtonState = function(state){
		if(!this.saveButtons.length) return;
		if(state === 'saving'){
			/* Don't change the button text — replacing "Save Map" with
			 * "Saving…" makes the button wider, which on tight action-bar
			 * layouts (top-bar with Get Shortcode + Preview + Save Map)
			 * causes the Save button to wrap onto a new line. The
			 * .wpgmza-saving CSS class provides all the visual feedback
			 * (dark red background + pulsing glow + spinner badge) without
			 * changing the button's content or width. */
			this.saveButtons
				.addClass('wpgmza-saving is-disabled')
				.attr('aria-disabled', 'true')
				.css('pointer-events', 'none');
		} else {
			/* Idle — remove visual saving cues. No need to restore text
			 * since saving state never changed it (see comment above). */
			this.saveButtons
				.removeClass('wpgmza-saving is-disabled')
				.removeAttr('aria-disabled')
				.css('pointer-events', '');
		}
	};

	WPGMZA.AtlasMajorAutoSave.prototype.setPillState = function(state){
		if(!this.pill.length) return;

		/* Don't downgrade transient in-flight states. `saving` and
		 * `error` represent the current request lifecycle; allowing
		 * a `change` event mid-save to flip the pill back to
		 * `unsaved` would lie about what's actually in flight. The
		 * success / error callbacks in flush() always settle to
		 * `saved` or `error` after the request, so the pill returns
		 * to a correct state regardless. */
		if(state === 'unsaved'){
			var current = this.pill.attr('data-state');
			if(current === 'saving' || current === 'error') return;
		}

		this.pill.attr('data-state', state);

		var text = '';
		switch(state){
			case 'saving':   text = L('atlas_major_saving', 'Saving…'); break;
			case 'saved':    text = L('atlas_major_saved', 'Saved');    break;
			case 'unsaved':  text = L('atlas_major_unsaved', 'Unsaved changes'); break;
			case 'error':    text = L('atlas_major_save_failed', 'Save failed'); break;
			case 'idle':     text = '';         break;
		}
		this._writePillText(text);
	};

	WPGMZA.AtlasMajorAutoSave.prototype.updatePillText = function(state, text){
		if(!this.pill.length) return;
		this.pill.attr('data-state', state);
		this._writePillText(text);
	};

	/* Safety check: only write to the pill text node when the value
	 * actually differs from what's already there. setPillState() and
	 * updatePillText() get called many times in rapid succession during
	 * a window-resize drag — the map's onElementResized re-fires bounds
	 * updates that cascade through the 4Hz polling loop and the form
	 * change/input listener, each calling setPillState. Repeatedly
	 * writing the same string to a text node triggers layout work and
	 * was observed to visibly flicker the pill (and occasionally render
	 * the English fallback for one frame between German writes when the
	 * localized_strings lookup raced an in-flight resize tick). Caching
	 * the last-written value on the instance is cheaper than reading
	 * .text() on every call. */
	WPGMZA.AtlasMajorAutoSave.prototype._writePillText = function(text){
		if(this._lastPillText === text) return;
		this._lastPillText = text;
		this.pill.find('.am-save-pill-text').text(text);
	};

	/* Boot.
	 *
	 * Autosave is OFF BY DEFAULT — users opt in via the top-bar pause
	 * button. The localStorage flag `wpgmza_autosave_enabled` records
	 * the user's choice ('1' = enabled, absent/anything else = paused).
	 * Read on construction so the choice survives page reloads.
	 *
	 * To manually enable / disable from the console:
	 *     localStorage.setItem('wpgmza_autosave_enabled', '1')
	 *     localStorage.removeItem('wpgmza_autosave_enabled')
	 *
	 * A separate hard kill switch — window.WPGMZA_DISABLE_AUTOSAVE — is
	 * kept for hard-disabling autosave construction entirely (e.g. when
	 * developing in DevTools without wanting any save behaviour at all).
	 */
	$(document).ready(function(){
		if(window.WPGMZA_DISABLE_AUTOSAVE === true){
			return;
		}
		WPGMZA.atlasMajorAutoSave = new WPGMZA.AtlasMajorAutoSave();
	});

});
