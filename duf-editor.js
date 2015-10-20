/***********************************************************************
Copyright 2015 David Luksch

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
***********************************************************************/

////////////
// PLUGIN //
////////////
$.fn.dufEditor = function(dufEditorOptions) {
	/////////////////
	// "CONSTANTS" //
	/////////////////
	var MIN_EDITOR_WIDTH = 600;
	var STROKE_COLOR = "#000";
	var STROKE_WIDTH = 5;
	
	///////////
	// TEXTS //
	///////////
	
	//////////////
	// "GLOBAL" //
	//////////////
	var dufEditorParent = null;
	var draggedData = null; /* Chrome doesn't set dataTransfer correctly */

	///////////////
	// FUNCTIONS //
	///////////////
	var draw = function(element, paper) {
		if (element == "text field") { // TEMP
			paper.rect(0, 0, 100, 20, 0).attr({fill: "none", stroke: STROKE_COLOR, "stroke-width": STROKE_WIDTH});
		} else if (element == "select") { // TEMP
			paper.rect(0, 0, 100, 20, 0).attr({fill: "none", stroke: STROKE_COLOR, "stroke-width": STROKE_WIDTH});
			paper.rect(80, 0, 20, 20, 0).attr({fill: "none", stroke: STROKE_COLOR, "stroke-width": STROKE_WIDTH});
		} else {
			// TODO
		}
	}
	
	var getInitialHtml = function() {
		var initialHtml = 
			'<div id="dufEditorWrapper">'+
				'<span id="dufEditorPaletteWrapper">'+
					'<div id="duffEditorPalletteHeader">Palette</div>'+
					'<div id="dufEditorPalette"></div>'+
				'</span>'+
				'<span id="dufEditorEditorWrapper">'+
					'<div id="dufEditorToolbar">Toolbar</div>'+
					'<div id="dufEditorView"></div>'+
				'</span>'+
				'<span id="dufEditorPropertiesWrapper">'+
					'<div id="duffEditorPropertiesHeader">Properties</div>'+
					'<div id="dufEditorProperties"></div>'+
				'</span>'+
			'</div>'
		;
		return initialHtml
	}

	var resizeEditor = function() {
		var viewportWidth = $(window).width();
		var dufEditorParentWidth = dufEditorParent.width();
		if (viewportWidth >= dufEditorParentWidth) {
			$("#dufEditorWrapper").width("100%");
		} else {
			if (viewportWidth < MIN_EDITOR_WIDTH) {
				$("#dufEditorWrapper").width(MIN_EDITOR_WIDTH);
			} else {
				$("#dufEditorWrapper").width(viewportWidth);
			}
		}
	}

	var throttle = function(originalEvent, throttledEvent) {
		var running = false;
		var throttlingFunction = function() {
			if (running) {
				return;
			}
			running = true;
			requestAnimationFrame(function() {
				window.dispatchEvent(new CustomEvent(throttledEvent));
				running = false;
			});
		};
		window.addEventListener(originalEvent, throttlingFunction);
	};
	
	//////////
	// FLOW //
	//////////
	if (dufEditorOptions == undefined) {
		dufEditorParent = this.parent();
		this.css("display", "none");
		this.before(getInitialHtml());
		resizeEditor();
		throttle("resize", "throttledResize");
		window.addEventListener("throttledResize", resizeEditor);
		
		/**********************/
		/* Playing with stuff */
		/**********************/
		$("#dufEditorPalette").append('<div id="rafpokus" draggable="true"></div><br />');
		$("#dufEditorPalette").append('<div id="rafpokus2" draggable="true"></div>');
		$("#rafpokus").on("dragstart", function(event) { //NOTE do only copy effect
			draggedData = "text field";
		});
		$("#rafpokus2").on("dragstart", function(event) {
			draggedData = "select";
		});
		var paper = Raphael("rafpokus", 100, 20);
		var paper2 = Raphael("rafpokus2", 100,20);
		draw("text field", paper);
		draw("select", paper2);
		var tempfun = function(event) {
			event.preventDefault();
		};
		var tempfun3 = function() {
			event.preventDefault();
			$("#dufEditorView").append('<div id="rafpokus3"></div>');
			var tempfun4 = function(event) {
				$("#dufEditorProperties").html("here will be <br/>some properties");
				// NOTE highlight selected item
			}
			$("#rafpokus3").on("click", tempfun4);
			var paper = Raphael("rafpokus3", 100, 20);
			if (draggedData == "text field") {
				draw("text field", paper);
			} else if (draggedData == "select") {
				draw("select", paper);
			} // NOTE auto select after drop (?)
		};
		$("#dufEditorView").on("dragover",tempfun);
		$("#dufEditorView").on("drop",tempfun3);
	}
};