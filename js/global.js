jQuery(function($) {
	'use strict';
	
	/* BEGIN: Utility Functions */
	/**
	* @function getInternetExplorerVersion
	* @description Returns the version of Internet Explorer or a -1 (indicating the use of another browser).
	* @see: https://msdn.microsoft.com/en-us/library/ms537509(v=vs.85).aspx
	* @returns {Number} -1 if not any IE version, any other number otherwise
	*/
	function getInternetExplorerVersion() {

		var rv = -1;
		var	ua;
		var	re;
		var	verStringArr;

		// works up to IE 10 but IE 11 spoofs this value. seperate check for IE Edge
		if (navigator.appName === 'Microsoft Internet Explorer') {

			ua = navigator.userAgent;
			re = /MSIE ([0-9]{1,}[\.0-9]{0,})/;
			if (re.exec(ua) !== null) rv = parseFloat(RegExp.$1);

		} else if (navigator.appName === 'Netscape' && navigator.userAgent.indexOf('Trident') > -1) {

			rv = 11;

		} else if (navigator.appName === 'Netscape' && navigator.userAgent.indexOf('Edge') > -1) {

			ua = navigator.userAgent;
			re = /Edge\/([0-9]{1,}[\.0-9]{0,})/;
			verStringArr = re.exec(ua);
			if (verStringArr.length !== 0) rv = Math.floor(parseFloat(verStringArr[0].split('/')[1]));

		}

		return rv;

	}
	/* END: Utility Functions */
	
	
	// DOM Elements
	var $window = $(window);
	var	$body = $('body');
	var	$siteContainer = $('.graphiccell-wrapper');
	var $sections = $('section');
	// debug
	var	debug = false; //window.location.search.indexOf('debug=true') !== -1,
	var enableParticles = true;
	// Platform check vars
	var	mobileSize;
	var	isMobile;
	var	isIpad;
	var	isDesktop;
	var	ieVersion;
	var deeplink;
	var deeplinkData;
	
	// BEGIN: Deeplink handling
	deeplink = {
		get: function() {
			var hashRaw = window.location.hash;
			var hashData = hashRaw.split('/');
			
			hashData.splice(0, 1);
			
			return hashData;
		},
		set: function(value) {
			var hashString = '';
			var hashValue;
			var h = 0;

			if (typeof value === 'string' || typeof value === 'number')
				window.location.replace('#/' + value);
			else if(typeof value === 'object' && value instanceof Array) {
				
				for(h = 0; h < value.length; h++) {
					hashValue = value[h];

					if (typeof hashValue === 'string' || typeof hashValue === 'number')
						hashString += (hashString.length === 0 ? '' : '\/') + hashValue;			
				}
				
				window.location.replace('#/' + hashString);
			
			}
		}
	};
	// END: Deeplink Handling
	
	// BEGIN: Platform Checking
	platformChecking: {

		mobileSize = 640;
		// Initial mobile checks (additional checks will be needed for 'desktop mobile' sizes)
		isMobile = typeof site !== 'undefined' ? site.client.isMobile : (/iphone|ipod|android|blackberry|mini|windows\sce|palm/i).test(navigator.userAgent.toLowerCase());
		isDesktop = !isMobile;
		isIpad = navigator.userAgent.toLowerCase().match(/ipad/i) !== null;
		ieVersion = getInternetExplorerVersion();

		// set classes for desktop/mobile/ipad/ie
		if (isIpad) $body.addClass('ipad');
		else $body.addClass(isMobile ? 'mobile' : 'desktop');

		if (ieVersion !== -1) {
			$body.addClass('ie');
			$body.addClass('ie' + ieVersion);
		}

		if(isDesktop) {
			isMobile = $window.width() <= 640;
			if (isMobile)
				$body.addClass('mobile');
		}

	}
	// END: Platform checking
	
	/*/////////////////////////////////////////
	// BEGIN: General
	/////////////////////////////////////////*/
	(function() {
		var $sections = $('section');
		var scrollPrev = 0;
		
		// BEGIN: Init
		init: {
			deeplinkData = deeplink.get();
			
			if($('#particles-js-global').length !== 0 && enableParticles)
				particlesJS.load('particles-js-global', 'particles2.json');
		}
		// END: Init
		
		// BEGIN: Animation
		animation: {
		
			// Line animation (looping)
			// Group lines in pairs
			(function() {
				
				var $lines = $('.global-background .line');
				var pathLeftRaw = 'm' + (-$lines.width()) + ',' + ($window.height()-$lines.height()) + 'L' + (2000*Math.cos(315*Math.PI/180)-$lines.width())+ ',' + (2000*Math.sin(315*Math.PI/180)+$window.height()-$lines.height());
				var pathRightRaw = 'm' + (-$lines.width()) + ',' + ($window.height()-$lines.height()) + 'L' + (2000*Math.cos(225*Math.PI/180)-$lines.width())+ ',' + (2000*Math.sin(225*Math.PI/180)+$window.height()-$lines.height());
				var timeline;
				var reverse = false;
				var steps = 10;
				
				$lines.each(function() {
					var $this = $(this);
					var index = $this.index();
					// Paths for lines to move
					var pathLeft;
					var pathRight;
					var path; 
						
					if(index % 2 !== 0) {
						pathLeft = MorphSVGPlugin.pathDataToBezier(pathLeftRaw, {offsetX: $window.width()/steps*(index-1)+10});
						pathRight = MorphSVGPlugin.pathDataToBezier(pathRightRaw, {offsetX: $window.width()/steps*(index-1)+10});
					} else {
						timeline = new TimelineMax({repeat: -1});
						pathLeft = MorphSVGPlugin.pathDataToBezier(pathLeftRaw, {offsetX: $window.width()/steps*index});
						pathRight = MorphSVGPlugin.pathDataToBezier(pathRightRaw, {offsetX: $window.width()/steps*index});
						
						// Randomize line group direction
						if(Math.random() > 0.5)
							reverse = !reverse;
					}
					
					path = $this.hasClass('left') ? pathRight : pathLeft;
					
					if(reverse)
						path.reverse();
					
					TweenMax.set($this, {x: path[0].x, y: path[0].y});
					
					timeline
						.fromTo($this, 1, {opacity: 0}, {opacity: 1}, '0')
						.to($this, 30-5*Math.random(), {bezier: {values: path}, ease: Power0.easeNone}, '0.5', '1')
						.fromTo($this, 0.5, {opacity: 1}, {opacity: 0}, '-=0.5');
					
				});
			
			})();
		}
		// END: Animation
		
		// BEGIN: Events
		events: {
			
			// Logo mouse hover
			$('.logo-container .logo')
				.on('mouseenter', function() {
					TweenMax.to($(this).find('circle'), 0.2, {scale: 1.2, transformOrigin: '50% 50%'});
				})
				.on('mouseleave', function() {
					TweenMax.to($(this).find('circle'), 0.2, {scale: 1, transformOrigin: '50% 50%'});
				});
			
			// IOS Fix for a tags with before/after content 
			$('.primary li, .page-footer .profile-header a').on('touchstart touchend', function(e) {
				var $this = $(this);
				var link = $this.find('a').addBack('a').attr('href');
			 
				e.preventDefault();

				window.location = link;
			
			});
			
			// Selected Work trigger for IE
			$('.primary li.first').on('click', function(e) {
				
				if(ieVersion === -1 && !$body.hasClass('landing'))
					return;
					
				if($('.selected-work').length === 0)
					return;
					
				e.preventDefault();
				
				TweenMax.to($window, 0.5, {scrollTo: {y: $('.selected-work').offset().top, autoKill: false}});
				
			});
			
			// Detect if desktop has gained or lost mobile mode, one at a time.
			$window.on('resize', function() {

				if(isDesktop) {
					isMobile = $window.width() <= 640;
					if (isMobile && !$body.hasClass('mobile')) {
						$body.addClass('mobile');
						$window.trigger('gainedMobile');
					} else if(!isMobile && $body.hasClass('mobile')) {
						$body.removeClass('mobile');
						$window.trigger('lostMobile');
					}
				}
				
				$window.trigger('scroll');
			});
			
			// Scroll handling
			$window.on('init scroll touchmove touchend touchstart', function() {
				var scrollTop = $window.scrollTop();
				var dir = scrollPrev - scrollTop;
				
				dir = dir > 0 ? -1 : (dir === 0 ? 0 : 1);
								
				// Triggers post-landing class, this only applies on the transition from landing to the rest of the site
				(function() {
				
					if($('#landing').length === 0)
						return;
				
					var $topMenuAFirst = $('#header-container .primary .table .first a'); // Used as a baseline as to when to apply 'post-landing' class to body
					var landingBottom = $('#landing').height();
				
					
					if($topMenuAFirst.offset().top + $topMenuAFirst.height() >= landingBottom) {
						if(!$body.hasClass('post-landing'))
							$window.trigger('landingPassed');
						
						$body.addClass('post-landing');
					
					} else { 
				
						if($body.hasClass('post-landing'))
							$window.trigger('landingReturned');
					
						$body.removeClass('post-landing');
					}
				})();
				
				// Handle setting deeplink here
				(function() {
					var $currentSection;
					
					// Get the bottom most section in view 
					((dir === 1 || dir === 0)? $($sections.get().reverse()) : $sections).each(function() {
						var $this = $(this);
						// Start from the bottom
						if(dir === 1 || dir === 0) {
							if($this.offset().top <= scrollTop+$window.height()/2) { //Math.max($this.offset().top, scrollTop) < Math.min($this.offset().top + $this.height(), scrollTop+$window.height())) {
								$currentSection = $this;
								return false;
								
							}
								
						// Start from top
						} else {
							if($this.offset().top >= scrollTop) {
								$currentSection = $this;
								return false;
							} 
						}
					});

					if(typeof $currentSection !== 'undefined' && (typeof deeplinkData === 'undefined' || deeplinkData.length === 0)) {
						$currentSection.addClass('active').siblings('section').removeClass('active');
						$currentSection.trigger('gainedActive');
					}
					
				})();	
				
				scrollPrev = scrollTop;
				
			});
			
			// postInit event needed so sections are already initialized before deeplinking fires
			$window.on('postInit', function() {
				var $deeplinkSection;
				var deeplinkDataCopy = deeplinkData.slice();
				
				// No deeplinking on about us page
				if($('body').hasClass('about'))
					return;
				
				if(typeof deeplinkData !== 'undefined' && deeplinkData.length !== 0) {
					$deeplinkSection = $sections.eq(deeplinkDataCopy[0]);
					
					if($deeplinkSection.length === 0) {
						deeplinkData = undefined;
						return;
					}
					
					$window.scrollTop($deeplinkSection.offset().top);
					
					deeplinkData = undefined; // Clear deeplink data when done
					$deeplinkSection.addClass('active').siblings('section').removeClass('active');
					$deeplinkSection.trigger('deeplink', deeplinkDataCopy);
					//$window.trigger('scroll');
				}
			});
			
		}
		// END: Events
		
	})();
	/*/////////////////////////////////////////
	// END: General
	/////////////////////////////////////////*/
	
	/*/////////////////////////////////////////
	// BEGIN: Homepage
	/////////////////////////////////////////*/
	(function() {	
		/*/////////////////////////////////////////
		// BEGIN: Landing
		/////////////////////////////////////////*/
		(function() {
			var $self = $('#landing');
			var $content; 
			var $landingButton;
			var introTimeline = new TimelineMax({paused: true});
			var introTimeout; // Timeout used to auto scroll to the next section
			// Intro scroll button animations
			var tweenCircle;
			var tweenArrow;
			// Background animation
			var BGdriftTimeline = new TimelineMax({
				paused: true,
				repeat: -1,
				yoyo: true
			});
			var HDdriftTimeline = new TimelineMax({
				paused: true,
				repeat: -1,
				yoyo: true
			});
		
			// Element must exist for the rest of the function to work
			if($self.length === 0) 
				return;
				
			// BEGIN: Init
			init: {
				$content = $self.find('.table'); 
				$landingButton = $self.find('.landing-scroll');
			
				if(enableParticles)
					particlesJS.load('particles-js-landing', 'particles.json');
			}
			// END: init
				
			// BEGIN: Animation
			animation: {
				
				introTimeline
					.from($content, 1.5, {delay: 0.5, top: '80%', width: '20%', ease: Power4.easeOut, clearProps: 'all'})
					//.from($content, 1, {scale: 0.5}, '0')
					.staggerFrom($content.find('.introduction.table .introduction-header, .introduction.table p'), 0.2, {opacity: 0}, 0.2, '-=0.2');
			
				introTimeline.play();
				
				
				// Looping bg red circle animation
				(function() {
					
					var $backgroundCircle = $self.find('.bg-circle');
				
					CustomWiggle.create('bgCircleTween', {
						wiggles: 20, 
						type: 'uniform', 
						amplitudeEase: Power4.easeOut});
								
					BGdriftTimeline
						.to($backgroundCircle, 60, {x: '+=100%', ease: 'bgCircleTween'})
						.to($backgroundCircle, 50, {y: '+=20%', ease: 'bgCircleTween'}, '0');
				
					BGdriftTimeline.timeScale(0.05);
								
					if(!isMobile)
						BGdriftTimeline.play(BGdriftTimeline.totalTime() * Math.random());
						
				})();
			
				// BEGIN: Landing BG animation
				(function() {
				
					var $headerCircle = $content.find('.landing-header-circle');
					
					CustomWiggle.create('headerCircleTween', {
						wiggles: 20, 
						type: 'uniform', 
						amplitudeEase: Power4.easeOut});
					
					HDdriftTimeline
						.to($headerCircle, 60, {top: '1%', ease: 'bgCircleTween'})
						.to($headerCircle, 50, {left: '1%', ease: 'bgCircleTween'}, '0');
						
					HDdriftTimeline.play(HDdriftTimeline.totalTime() * Math.random());
					//var range = 5;
					//var values = [{x:0, y:0}, {x: -1 * range, y:-1 * range}, {x: -2 * range, y:-2 * range}, {x: -3 * range, y:-1 * range}, {x: -4 * range, y:0}, {x: -3 * range, y: 1 * range}, {x: -2 * range, y: 2 * range}, {x: -1 * range, y: 1 * range}, {x: 0, y:0}];
					//TweenMax.to($content.find('.landing-header-circle'), 15, {bezier: {type: 'soft', curviness: 2, values: values}, repeat: -1, ease: Power0.easeNone});
				
				})();
				// END: Landing BG animation
			
				tweenCircle = TweenMax.to($landingButton.find('.circle'), 0.5, {y: '-=10', repeat: -1, yoyo: true});
				tweenArrow = TweenMax.to($landingButton.find('.arrow'), 0.5, {y: '-=10', repeat: -1, yoyo: true});
			
				// Auto scroll to next section after 10 seconds
				introTimeout = window.setTimeout(function() {
				
					$landingButton.trigger('click');
					
				}, 8000);
			}
			// END: Animation
		
			// BEGIN: Events
			events: {
				// Clear the autoscroll timeout on scroll
				$window
					.on('scroll touchmove touchstart touchend', function(e) {
			
						var scrollTop = $window.scrollTop();
						var landingBottom = $self.height();
			
						// Clear animation start timer if the user scrolls normally 
						window.clearTimeout(introTimeout);
										
						if(scrollTop >= landingBottom) {
							if(!$body.hasClass('post-landing'))
								$window.trigger('landingPassed');
					
							$body.addClass('post-landing');
				
						} else { 
			
							if($body.hasClass('post-landing'))
								$window.trigger('landingReturned');
				
							$body.removeClass('post-landing');
						}
					})
					// Resume background animation when mobile mode is disabled
					.on('lostMobile', function() {
						BGdriftTimeline.play();
					})
					// Stop background animation when mobile mode is enabled
					.on('gainedMobile', function() {
						BGdriftTimeline.stop();
					});
				
				$landingButton.on('click', function(e) {
					e.preventDefault();
				
					TweenMax.to($window, 0.5, {scrollTo: {y: $('.selected-work').offset().top, autoKill: false}});
				
				})
				// Mouseover effects
				.on('mouseenter', function() {
					TweenMax.to($landingButton.find('.circle, .arrow'), 0.2, {scale: 1.3});
				}).on('mouseleave', function() {
					TweenMax.to($landingButton.find('.circle, .arrow'), 0.2, {scale: 1});
				});
			
				$self.on('gainedActive', function() {
					deeplink.set($sections.index($self));
				});
			}
			// END: Events
		})();
		/*/////////////////////////////////////////
		// END: Landing
		/////////////////////////////////////////*/
	
		/*/////////////////////////////////////////
		// BEGIN: Selected Work
		/////////////////////////////////////////*/
		(function() {
			var $self = $('.selected-work');
			var $secondaryNav = $self.find('.secondary ul li');
			var $selectedWorkOverviews = $self.find('.selected-work-overview');
			var introPlayed = false;
			var $blendCircle = $self.find('.blend-circle');
				
			if($self.length === 0)
				return;
		
			// BEGIN: Init
			init: {
			
				(function() {
					var $activeWork = $selectedWorkOverviews.first();
					// Get new active section content
					var $header = $activeWork.find('.content-header');
					var $textContent = $activeWork.find('.content-description');
					var $viewProject = $activeWork.find('.view-project');
			
					// Get new active content circle images
					var $animatedCircle = $activeWork.find('.animated-circle-container');
				
					// Prep for intro
					TweenMax.set([$header, $textContent, $viewProject, $animatedCircle.find('.circle')], {opacity: 0});
				})();
			
			}
			// END: Init
		
			// BEGIN: Animation
			animation: {
			
				if(!isMobile)
					TweenMax.set($blendCircle, {display: 'none'});
			} 
			// END: Animation
		
			// BEGIN: Events
			events: {
				
				// Reset for Safari
				$window.on('pageshow popstate', function() {
					var $transitionScreen = $siteContainer.find('.project-transition-overlay-helper');
					TweenMax.set($transitionScreen, {display: 'none', clearProps: 'right'});
				});
				
				// Switches between sections
				$secondaryNav
					// Intro Animation Trigger
					.on('introShow', function(e, override) {	
						var $this = $(this);
						var index = $this.index();

						e.preventDefault();

						if($this.hasClass('active') && !(typeof override !== 'undefined' && override === true))
							return;

						$this.addClass('active').siblings().removeClass('active');
				
						$selectedWorkOverviews.eq(index).trigger('introShow');
				
						deeplink.set([$sections.index($self), $selectedWorkOverviews.eq(index).attr('id')]);
			
					})
					// Progression trigger
					.on('click', function(e) {
						var $this = $(this);
						var index = $this.index();
				
						e.preventDefault();
				
						if($this.hasClass('active') && !(typeof override !== 'undefined' && override === true))
							return;

						$this.addClass('active').siblings().removeClass('active');
						$this.trigger('mouseleave');
						
						$selectedWorkOverviews.eq(index).trigger('show');
						
						deeplink.set([$sections.index($self), $selectedWorkOverviews.eq(index).attr('id')]);
					})
					.on('mouseenter', function() {
						var $this = $(this);
						var $projectTitle = $this.find('.project-title');
						var $hoverCircle = $this.find('.hover');
						var contentToAnimate = [];
				
						if($this.hasClass('active') || isMobile)
							return;
						
						contentToAnimate.push($projectTitle);
						
						if(!$this.hasClass('active'))
							contentToAnimate.push($hoverCircle);
						
						TweenMax.to(contentToAnimate, 0.1, {opacity: 1, display: 'table-cell'});
					}).on('mouseleave', function() {
						var $this = $(this);
						var $projectTitle = $this.find('.project-title');
						var $hoverCircle = $this.find('.hover');
						
						TweenMax.to([$projectTitle, $hoverCircle], 0.1, {opacity: 0, display: 'none', clearProps: 'all'});
					});
				
				// Transition animation before switching to product page
				$self.find('.view-project').on('click', function(e) {
					var $transitionScreen = $siteContainer.find('.project-transition-overlay-helper');
					var $link = $(this).find('a');
				
					var timeline = new TimelineMax({
						paused: true,
						onComplete: function() {
							window.location = $link.attr('href');
						}
					});
				
					// Mobile does not need transition animation
					if(isMobile)
						return;
				
					e.preventDefault();
				
					timeline
						.to($window, 1, {scrollTo: {y: $self.offset().top}})
						.to([$sections.not($self), $siteContainer.find('.global-background')], 1, {opacity: 0}, '0')
						.from($transitionScreen, 0.75, {right: '-100%'}, '0')
						.to($transitionScreen, 0.75, {display: 'table', opacity: 1}, '0');
					
					timeline.play();
				});
			
				// This should happen only once
				// Section work intro animation
				$selectedWorkOverviews.one('introShow', function() {
					var $this = $(this);

					// Get new active section content
					var $header = $this.find('.content-header');
					var $textContent = $this.find('.content-description');
					var $viewProject = $this.find('.view-project');
					var $content = $header.add($textContent).add($viewProject);
				
					// Get new active content circle images
					var $animatedCircle = $this.find('.animated-circle-container');
					var $smallCircle = $this.find('.small-circle');
					var $largeCircle = $this.find('.large-circle');
				
					// The active sibling to animate away
					var $activeSibling = $this.siblings('.active');
					var $activeSiblingAnimatedircle = $activeSibling.find('.animated-circle-container');
					var $activeSiblingHeader = $activeSibling.find('.content-header');
					var $activeSiblingTextContent = $activeSibling.find('.content-description');
					var $activeSiblingViewProject = $activeSibling.find('.view-project');
					var $activeSiblingContent = $activeSiblingHeader.add($activeSiblingTextContent).add($activeSiblingViewProject);
			
					// Animation
					var timeline = new TimelineMax({
						paused: true,
						onComplete: function() {
						
							if(isMobile)
								return;
							
							TweenMax.set([$smallCircle, $largeCircle], {transformOrigin: '50% 50%'});
						
							TweenMax.to($blendCircle, 5, {left: '74%', repeat: -1, yoyo: true, ease: Power2.easeInOut});
							TweenMax.to($blendCircle, 3, {top: '29%', repeat: -1, yoyo: true, ease: Power2.easeInOut});

						
							TweenMax.to($smallCircle, 20, {bezier: {type: 'soft', curviness: 2, values: [{x:0, y:0}, {x: -5, y:-5}, {x: -10, y:-10}, {x: -15, y:-5}, {x: -20, y:0}, {x: -15, y: 5}, {x: -10, y: 10}, {x: -5, y: 5}, {x: 0, y:0}]}, repeat: -1, ease: Power0.easeNone});
							TweenMax.to($largeCircle, 25, {bezier: {type: 'soft', curviness: 2, values: [{x:0, y:0}, {x: 5, y:-5}, {x: 10, y:-10}, {x: 15, y:-5}, {x: 20, y:0}, {x: 15, y: 5}, {x: 10, y: 10}, {x: 5, y: 5}, {x: 0, y:0}]}, repeat: -1, ease: Power0.easeNone});

						}
					});
				
					TweenMax.killTweensOf([$content, $animatedCircle.find('.circle'), $activeSiblingContent, $activeSiblingAnimatedircle.find('.circle')]);
				
					// FromTo animation ensures everything starts from expected values
				
					if(!isMobile) {
						 timeline
							.set($blendCircle, {display: 'block', clearProps: 'display'})
							.from($blendCircle, 1, {top: '100%', width: '0%'});
					}
				 
					if(!$activeSibling.is($this)){
						timeline
							.staggerFromTo($activeSiblingContent, 0.1, {opacity: 1, y: 0}, {opacity: 0, y: '-=10%'}, 0.1)
							.fromTo($activeSiblingAnimatedircle.find('.circle'), 0.5, {opacity: 1}, {opacity: 0}, '0')
							.add(function(){
								$activeSibling.removeClass('active');
								$this.addClass('active');
							}, '0.5');
					} else {
						timeline.add(function() {
							$this.addClass('active');
						});
					}
				
					timeline
						.staggerFromTo($content, 1, {opacity: 0, y: '+=10%'}, {opacity: 1, y: 0}, 0.2, '0')
						.fromTo($largeCircle, 0.5, {opacity: 0, y: '+=10%', transformOrigin: '50% 100%'}, {opacity: 1, y: '0%', ease: Power2.easeOut}, '1')
						.fromTo($largeCircle, 0.8, {scale: 0.9}, {scale: 1, ease: Power4.easeOut}, '1')
						.fromTo($smallCircle, 0.5, {opacity: 0, y: '+=10%', transformOrigin: '50% 100%'}, {opacity: 1, y: '0%', ease: Power2.easeOut}, '0.8')
						.fromTo($smallCircle, 0.5, {scale: 0.8}, {scale: 1, ease: Power4.easeOut}, '0.8');
					
					timeline.play();
				})
				// Section progression animation handling
				.on('show', function() {
				
					// Next Section
					var $next = $(this);
					var $nextHeader = $next.find('.content-header');
					var $nextTextContent = $next.find('.content-description');
					var $nextViewButton = $next.find('.view-project');
					var nextContent = [$nextHeader, $nextTextContent, $nextViewButton];
					var $nextAnimatedCircleContainer = $next.find('.animated-circle-container a');
				
				
					// Active Section
					var $prev = $next.siblings('.active');
					var $prevHeader = $prev.find('.content-header');
					var $prevTextContent = $prev.find('.content-description');
					var $prevViewButton = $prev.find('.view-project');
					var prevContent = [$prevHeader, $prevTextContent, $prevViewButton];
					var $prevAnimatedCircleContainer = $prev.find('.animated-circle-container a');
				
					// Animation 
					var timeline = new TimelineMax({
						paused: true,
						onComplete: function() {
						
							if(isMobile)
								return;
					
							TweenMax.killTweensOf($nextAnimatedCircleContainer.children());
							TweenMax.set($nextAnimatedCircleContainer.children(), {transformOrigin: '50% 50%'});

							TweenMax.to($blendCircle, 5, {left: '74%', repeat: -1, yoyo: true, ease: Power2.easeInOut});
							TweenMax.to($blendCircle, 3, {top: '29%', repeat: -1, yoyo: true, ease: Power2.easeInOut});
						
							TweenMax.to($nextAnimatedCircleContainer.find('.small-circle'), 20, {bezier: {type: 'soft', curviness: 2, values: [{x:0, y:0}, {x: -5, y:-5}, {x: -10, y:-10}, {x: -15, y:-5}, {x: -20, y:0}, {x: -15, y: 5}, {x: -10, y: 10}, {x: -5, y: 5}, {x: 0, y:0}]}, repeat: -1, ease: Power0.easeNone});
							TweenMax.to($nextAnimatedCircleContainer.find('.large-circle'), 25, {bezier: {type: 'soft', curviness: 2, values: [{x:0, y:0}, {x: 5, y:-5}, {x: 10, y:-10}, {x: 15, y:-5}, {x: 20, y:0}, {x: 15, y: 5}, {x: 10, y: 10}, {x: 5, y: 5}, {x: 0, y:0}]}, repeat: -1, ease: Power0.easeNone});
						
						}
					});
				
					TweenMax.killTweensOf([$selectedWorkOverviews.find('.content-header, .content-description, .view-project, .animated-circle-container .circle'), $blendCircle]);
					
					timeline
						.staggerTo(prevContent, 0.5, {x: '-=100%', opacity: 0, ease: Power4.easeIn}, 0.05)
						.staggerTo($prevAnimatedCircleContainer.children(), 0.5, {x: '-=100%', opacity: 0, ease: Power4.easeIn}, 0.05, '0')
						.add(function() {
							$prev.removeClass('active');
							$next.addClass('active');
							TweenMax.set(prevContent, {clearProps: 'x, opacity'});
							TweenMax.set($prevAnimatedCircleContainer.children(), {clearProps: 'x, opacity'});						
						
						})
						.staggerFromTo(nextContent, 0.5, {x: '+=200%', opacity: 0}, {x: '0%', opacity: 1, ease: Power4.easeOut}, 0.05)
						.staggerFromTo($nextAnimatedCircleContainer.children(), 0.5, {x: '+=400%', opacity: 0}, {x: '0%', opacity: 1, ease: Power4.easeOut}, 0.05, '0.5');						
					
					if(!isMobile) {
						timeline
							.to($blendCircle, 0.5, {left: '20%', width: '0%', ease: Power4.easeIn, immediateRender: false}, '0')
							.fromTo($blendCircle, 0.5, {left: '100%', width: '0%'}, {left: '76%', width: '39.5%', ease: Power4.easeOut, immediateRender: false}, '0.5');
					}
				
					timeline.play();
				});
		
			
				$self.on('gainedActive', function() {
					var deeplinkDataCurrent = deeplink.get();
				
					// Condition here to preserve subsection on this section
					if(deeplinkDataCurrent.length > 0 && parseInt(deeplinkDataCurrent[0]) !== $sections.index($self))
						deeplink.set([$sections.index($self), $selectedWorkOverviews.filter('.active').attr('id')]);

					if(!introPlayed && (typeof deeplinkData === 'undefined' || deeplinkData.length === 0)) {
						$secondaryNav.first().trigger('introShow', [true]);
						introPlayed = true;
					}
				});
				
				// Deeplink handling for work overviews, handles section and selected work display on deeplink
				$self.on('deeplink', function(e, section, subsection) {				
					var $targetSection = $('#' + subsection);
					// Get new active section content
					var $header;
					var $textContent;
					var $viewProject;
					// Get new active content circle images
					var $animatedCircle;
			
					if(typeof subsection !== 'undefined' && $targetSection.length !== 0) {
						//$targetSection = $selectedWorkOverviews.eq('#' subsection);
						$targetSection.removeClass('active').siblings().removeClass('active');
						// Prep target subsection for introPlayed
						$header = $targetSection.find('.content-header');
						$textContent = $targetSection.find('.content-description');
						$viewProject = $targetSection.find('.view-project');
		
						// Get new active content circle images
						$animatedCircle = $targetSection.find('.animated-circle-container');
					
						// Prep for intro
						TweenMax.set([$header, $textContent, $viewProject, $animatedCircle.find('.circle')], {opacity: 0});
					
						$secondaryNav.eq($selectedWorkOverviews.index($targetSection)).addClass('active').trigger('introShow', [true]);
						introPlayed = true;
					} else
						$self.trigger('gainedActive');
				
				});
			}
			// END: Events
		
		})();
		/*/////////////////////////////////////////
		// END: Selected Work
		/////////////////////////////////////////*/
	})();
	/*/////////////////////////////////////////
	// END: Homepage
	/////////////////////////////////////////*/
	
	/*/////////////////////////////////////////
	// BEGIN: Page Footer
	/////////////////////////////////////////*/
	(function() {
		var $self = $('.page-footer');
		var $circles = $self.find('.bg-circle');
		
		if($self.length === 0)
			return;
		
		// BEGIN: Animations
		animations: {
			$circles.each(function() {
				var $this = $(this);
				var range = 10;
				var values = [{x:0, y:0}, {x: -1 * range, y:-1 * range}, {x: -2 * range, y:-2 * range}, {x: -3 * range, y:-1 * range}, {x: -4 * range, y:0}, {x: -3 * range, y: 1 * range}, {x: -2 * range, y: 2 * range}, {x: -1 * range, y: 1 * range}, {x: 0, y:0}];
							
				if($this.index() % 2 === 0)
					values.reverse();
				
				TweenMax.to($this, 20, {bezier: {type: 'soft', curviness: 2, values: values}, repeat: -1, ease: Power0.easeNone});
			});

		}
		// END: Animations
		
		// BEGIN: Events
		events: {
		
			$self.on('gainedActive', function() {
				deeplink.set($sections.index($self));
			});
			
		}
		// END: Events
	})();
	/*/////////////////////////////////////////
	// END: Page Footer
	/////////////////////////////////////////*/
	
	/*/////////////////////////////////////////
	// BEGIN: Profile Page
	/////////////////////////////////////////*/
	(function() {
		var $self = $('.about-us');
		var $aboutUsContent = $self.find('.about-us-content');
		
		if($self.length === 0)
			return;
		
		// BEGIN: Init
		init: {
			if(enableParticles)
				particlesJS.load('particles-js-profile', 'particles2.json');
		}
		// END: Init
		
		// BEGIN: Animation
		animation: {
			TweenMax.set($aboutUsContent, {visibility: 'hidden'});
			
			// Background circle animation (see footer background animation)
			(function() {
				var $circles = $self.find('.bg-circle');
			
				$circles.each(function() {
					var $this = $(this);
					var range = 10;
					var values = [{x:0, y:0}, {x: -1 * range, y:-1 * range}, {x: -2 * range, y:-2 * range}, {x: -3 * range, y:-1 * range}, {x: -4 * range, y:0}, {x: -3 * range, y: 1 * range}, {x: -2 * range, y: 2 * range}, {x: -1 * range, y: 1 * range}, {x: 0, y:0}];
							
					if($this.index() % 2 === 0)
						values.reverse();
				
					TweenMax.to($this, 20, {bezier: {type: 'soft', curviness: 2, values: values}, repeat: -1, ease: Power0.easeNone});
				});
			})();
		}
		// END: Animation
		
		// BEGIN: Events
		events: {
		
			$window.on('postInit', function() {
				var $header = $self.find('.about-us-header');
				var $circles = $header.find('.circle');
				var $text = $header.find('.header-text .header-text-helper');
				var timeline = new TimelineMax({paused: true});
				
				timeline
					.staggerFrom($circles, 2, {opacity: 0, y: '+=20%'}, 0.2)
					.staggerFrom($text.children(), 0.5, {opacity: 0, y: '+=10%'}, 0.1, '1');
				
				timeline.play();
				
				
			});
			
			// Fades in sections ast they begin appearing visible on screen
			$window.on('scroll', function() {
				var scrollTop = $window.scrollTop();
							
				$aboutUsContent.not('.visible').each(function() {
					var $this = $(this);
					
					if($this.offset().top < scrollTop + $window.height()) {
						$this.addClass('visible');
						TweenMax.set($this, {visibility: 'visible'});
						TweenMax.from($this, 1, {opacity: 0, y: '+=10%'});
					}
				});
			});
																																																																																																																																																																																																																			
		}
		// END: Events
		
		
	})();
	/*/////////////////////////////////////////
	// BEGIN: Profile Page
	/////////////////////////////////////////*/
	
	/*/////////////////////////////////////////
	// BEGIN: Work Page
	/////////////////////////////////////////*/
	(function() {
		var $self = $('.work');
		var $secondaryNav = $self.find('.secondary ul li');
		var $project;
		var timeline = new TimelineMax({paused: true});
		
		if($self.length === 0)
			return;
			
		$project = $self.find('.project');
		
		// BEGIN: Animation
		animation: {
			timeline
				.staggerFrom($project.find('.project-details').children(), 1, {opacity: 0, y: '+= 10%'}, 0.2);
		}
		// END: Animation
		
		// BEGIN: Events
		events: {
			$window.on('postInit', function() {
				timeline.play();
			});
			
			$secondaryNav
				.on('mouseenter', function() {
					var $this = $(this);
					var $projectTitle = $this.find('.project-title');
					var $hoverCircle = $this.find('.hover');
					var contentToAnimate = [];
		
					if($this.hasClass('active') || isMobile)
						return;
				
					contentToAnimate.push($projectTitle);
				
					if(!$this.hasClass('active'))
						contentToAnimate.push($hoverCircle);
				
					TweenMax.to(contentToAnimate, 0.1, {opacity: 1, display: 'block'});
				}).on('mouseleave', function() {
					var $this = $(this);
					var $projectTitle = $this.find('.project-title');
					var $hoverCircle = $this.find('.hover');
				
					TweenMax.to([$projectTitle, $hoverCircle], 0.1, {opacity: 0, display: 'none', clearProps: 'all'});
				});
			
			$self.find('.close').on('click', function(e) {
				var $link = $(this).find('a');
				var $projectPage = $self.find('.project');
				var timeline = new TimelineMax({
					paused: true,
					onComplete: function() {
						window.location = $link.attr('href');
					}
				});
				
				// Mobile does not need the transition animation
				if(isMobile)
					return;
				
				e.preventDefault();
				
				timeline
					.to($window, 1, {scrollTo: {y: 0}})
					.to($projectPage, 1, {opacity: 0, left: '100%'}, '0');
					
				timeline.play();
			});						
		}
		// END: Events
		
	})();
	/*/////////////////////////////////////////
	// END: Work Page
	/////////////////////////////////////////*/
	
	$window.trigger('init');
	$window.trigger('postInit');
	
});