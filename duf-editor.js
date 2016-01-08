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
$.fn.dufEditor = function() {
	/////////////////
	// "CONSTANTS" //
	/////////////////
	var ELEMENT_FILL_COLOR = "black";
	var ELEMENT_FILL_COLOR_DISABLED = "grey";
	var ELEMENT_HEIGHT_BIG = 50;
	var ELEMENT_HEIGHT_SMALL = 25;
	var ELEMENT_STROKE_COLOR = "black";
	var ELEMENT_STROKE_COLOR_DISABLED = "grey";
	var ELEMENT_STROKE_WIDTH = 5;
	var ELEMENT_STROKE_WIDTH_SLIM = 2;
	var ELEMENT_STROKE_WIDTH_TEXT = 1;
	var ELEMENT_WIDTH = 100;
	
	//////////////
	// "GLOBAL" //
	//////////////
	var dufEditorParent = null;
	var idCounter = 0;
  
	///////////////
	// FUNCTIONS //
	///////////////
	var draw = function(element, svg) {
		var drawing = null;
		if (element == "text") {
			drawing = svg.append("rect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", ELEMENT_WIDTH)
				.attr("height", ELEMENT_HEIGHT_SMALL)
				.attr("stroke", ELEMENT_STROKE_COLOR)
				.attr("stroke-width", ELEMENT_STROKE_WIDTH)
				.attr("fill", "none");
		} else if (element == "number") {
			drawing = svg.append("rect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", ELEMENT_WIDTH)
				.attr("height", ELEMENT_HEIGHT_SMALL)
				.attr("stroke", ELEMENT_STROKE_COLOR)
				.attr("stroke-width", ELEMENT_STROKE_WIDTH)
				.attr("fill", "none");
			svg.append("path")
				.attr("stroke", ELEMENT_STROKE_COLOR)
				.attr("stroke-width", ELEMENT_STROKE_WIDTH_SLIM)
				.attr("fill", ELEMENT_FILL_COLOR)
				.attr("d", 
					"M "+(0.85*ELEMENT_WIDTH)+" "+(0.45*ELEMENT_HEIGHT_SMALL)+" "+
					"L "+(0.95*ELEMENT_WIDTH)+" "+(0.45*ELEMENT_HEIGHT_SMALL)+" "+
					"L "+(0.90*ELEMENT_WIDTH)+" "+(0.35*ELEMENT_HEIGHT_SMALL)+" "+
					"L "+(0.85*ELEMENT_WIDTH)+" "+(0.45*ELEMENT_HEIGHT_SMALL)+" "
				);
			svg.append("path")
				.attr("stroke", ELEMENT_STROKE_COLOR)
				.attr("stroke-width", ELEMENT_STROKE_WIDTH_SLIM)
				.attr("fill", ELEMENT_FILL_COLOR)
				.attr("d", 
					"M "+(0.85*ELEMENT_WIDTH)+" "+(0.55*ELEMENT_HEIGHT_SMALL)+" "+
					"L "+(0.95*ELEMENT_WIDTH)+" "+(0.55*ELEMENT_HEIGHT_SMALL)+" "+
					"L "+(0.90*ELEMENT_WIDTH)+" "+(0.65*ELEMENT_HEIGHT_SMALL)+" "+
					"L "+(0.85*ELEMENT_WIDTH)+" "+(0.55*ELEMENT_HEIGHT_SMALL)+" "
				);
		} else if (element == "label") {
			drawing = svg.append("text")
				.attr("stroke", ELEMENT_STROKE_COLOR)
				.attr("stroke-width", ELEMENT_STROKE_WIDTH_TEXT)
				.attr("fill", ELEMENT_FILL_COLOR)
				.attr("x", 0)
				.attr("y", 0.80*ELEMENT_HEIGHT_SMALL)
				.attr("font-size", 0.80*ELEMENT_HEIGHT_SMALL)
				.text("Label")
		} else if (element == "textarea") {
			svg.attr("viewBox", "0 0 "+ELEMENT_WIDTH+" "+ELEMENT_HEIGHT_BIG);
			drawing = svg.append("rect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", ELEMENT_WIDTH)
				.attr("height", ELEMENT_HEIGHT_BIG)
				.attr("stroke", ELEMENT_STROKE_COLOR)
				.attr("stroke-width", ELEMENT_STROKE_WIDTH)
				.attr("fill", "none");
		} else if (element == "placeholder") {
			drawing = svg.append("rect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", ELEMENT_WIDTH)
				.attr("height", ELEMENT_HEIGHT_SMALL)
				.attr("stroke", ELEMENT_STROKE_COLOR)
				.attr("stroke-width", ELEMENT_STROKE_WIDTH)
				.attr("fill", "none");
			svg.append("text")
				.attr("stroke", ELEMENT_STROKE_COLOR_DISABLED)
				.attr("stroke-width", ELEMENT_STROKE_WIDTH_TEXT)
				.attr("fill", ELEMENT_FILL_COLOR_DISABLED)
				.attr("x", ELEMENT_STROKE_WIDTH)
				.attr("y", 0.75*ELEMENT_HEIGHT_SMALL)
				.attr("font-size", 0.75*ELEMENT_HEIGHT_SMALL)
				.text("Placeholder");
		} else {
			drawing = svg.append("rect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", ELEMENT_WIDTH)
				.attr("height", ELEMENT_HEIGHT_SMALL)
				.attr("stroke", ELEMENT_STROKE_COLOR)
				.attr("stroke-width", ELEMENT_STROKE_WIDTH)
				.attr("fill", "none");
			svg.append("text")
				.attr("stroke", ELEMENT_STROKE_COLOR_DISABLED)
				.attr("stroke-width", ELEMENT_STROKE_WIDTH_TEXT)
				.attr("fill", ELEMENT_FILL_COLOR_DISABLED)
				.attr("x", ELEMENT_STROKE_WIDTH)
				.attr("y", 0.70*ELEMENT_HEIGHT_SMALL)
				.attr("font-size", 0.70*ELEMENT_HEIGHT_SMALL)
				.text(element);
		}
		//TODO other elements
		drawing.append("title")
			.text(element);
	};
	
	var drawInPalette = function(element, isLayout) {
		var target = isLayout ? "#layouts" : "#widgets";
		var svg = d3.select(target)
			.append("div")
			.attr("class", "draggable")
			.append("svg")
			.attr("viewBox", "0 0 "+ELEMENT_WIDTH+" "+ELEMENT_HEIGHT_SMALL)
			.attr("title", element)
		draw(element, svg);
	};
	
	var getInitialHtml = function() {
		var initialHtml = 
			'<div id="dufEditorWrapper">'+
				'<span id="dufEditorPaletteWrapper">'+
					'<div id="dufEditorPaletteHeader"><h2>Palette</h2></div>'+ //TODO nice header
					'<div id="dufEditorPalette">'+
						'<div id="trash">Here be trash</div>'+ //TODO trash icon
						'<div id="layouts"><h3>Layouts</h3></div>'+
						'<hr />'+
						'<div id="widgets"><h3>Widgets</h3><hr /></div>'+
					'</div>'+
				'</span>'+
				'<span id="dufEditorEditorWrapper">'+
					'<div id="dufEditorToolbar">[PH]Toolbar</div>'+ //TODO toolbar
					'<div id="dufEditorView">'+
						'<div id="defaultLayout" class="sortable">'+
						'</div>'+
					'</div>'+
				'</span>'+
				'<span id="dufEditorPropertiesWrapper">'+
					'<div id="dufEditorPropertiesHeader"><h2>Properties</h2></div>'+ //TODO nice header
					'<div id="dufEditorProperties"></div>'+
				'</span>'+
			'</div>';
		return initialHtml;
	};
  
	var loadPalette = function() {
		drawInPalette("text", false);
		drawInPalette("number", false);
		drawInPalette("textarea", false);
		drawInPalette("label", false);
		drawInPalette("placeholder", false);
		drawInPalette("fjfg", false);
		$(".draggable").draggable({
			connectToSortable : ".sortable",
			helper : "clone"
		});
		$(".sortable").sortable()
			.droppable({
				drop : function(event, ui) {
					var element = $(ui.draggable);
					// jQuery converts attr names to lower case (XHTML valid?)
					element.find("svg")[0].setAttribute("preserveAspectRatio", "none");
					element.resizable({
						containment : "parent",
						handles : "all",
						stop : function(event, ui) {
							var element = ui.element;
							$(element).trigger("click");
						}
					});
					var id;
					if (element.attr("id") != undefined) {
						id = element.attr("id");
					} else {
						id = idCounter++;
					}
					element.attr("id", id);
					idCounter++;
					element.click(function() {
						$(".activeItemOverlay").remove();
						$("#dufEditorProperties").html("");
						var id = $(this).attr("id");
						var width = $(this).width();
						var height = $(this).height();
						$(this).append('<div class="activeItemOverlay"></div>');
						$(this).attr("data-json-width", width);
						$(this).attr("data-json-height", height);
						$.each(this.attributes, function(i, attr) {
							var name = attr.name;
							var value = attr.value;
							if (!name.startsWith("data-json-")) {
								return;
							}
							$("#dufEditorProperties").append(
								'<div data-name="'+name+'">'+
									'<label for="'+name+'">'+name.substr(10)+'</label>'+
									'<input type="text" id="'+name+'" name="'+name+'" value="'+value+'" />'+
									'<button class="removeProperty" data-name="'+name+'" data-id="'+id+'">X</button>'+
								'</div>'
							);
						});
						$(".removeProperty").click(function(event) {
							var target = $(event.currentTarget);
							$("#"+target.attr("data-id")).removeAttr(target.attr("data-name"));
							$("#"+name).remove();
						});
						$("#dufEditorProperties").append(
							'<input type="text" placeholder="name" id="newPropertyName" />'+
							'<input type="text" placeholder="value" id="newPropertyValue" />'+
							'<button id="createProperty" data-id="'+id+'">Create property</button>'+
							'<button id="applyChanges" data-id="'+id+'">Apply changes</button>'
						);
						$("#createProperty").click(function(event) {
							var name = $("#newPropertyName").val();
							var value = $("#newPropertyValue").val();
							if (name == "" || value == "") {
								//TODO chybova hlaska (jQuery UI Dialog?)
								return;
							}
							$("#"+$(event.currentTarget).attr("data-id")).attr("data-json-"+name, value);
							$("#newPropertyName").before(
								'<div data-name="'+name+'">'+
									'<label for="'+name+'">'+name+'</label>'+
									'<input type="text" id="'+name+'" name="'+name+'" value="'+value+'" />'+
									'<button class="removeProperty" data-name="'+name+'" data-id="'+$(event.currentTarget).attr("data-id")+'">X</button>'+
								'</div>'
							);
							$("#newPropertyName").val("");
							$("#newPropertyValue").val("");
							$(".removeProperty").click(function(event) {
								var target = $(event.currentTarget);
								$("#"+target.attr("data-id")).removeAttr("data-json-"+target.attr("data-name"));
								$('div[data-name='+name+']').remove();
							});
						})
						//TODO apply changes tlačítko disabled unless provedena změna; smazání/přidání property -> auto save
						$("#applyChanges").click(function(event) {
							$.each($("div[data-name]"), function() {
								var name = $(this).attr("data-name");
								var value = $(this).find("input").val();
								if (name == "data-json-width") {
									$("#"+$(event.currentTarget).attr("data-id")).width(value);
								} else if (name == "data-json-height") {
									$("#"+$(event.currentTarget).attr("data-id")).height(value);
								}
								$("#"+$(event.currentTarget).attr("data-id")).attr(name, value);
							});
						});
					});
					$(this).append(element);
				}
			});
		$("#trash").droppable({
			drop : function(event, ui) {
				ui.draggable.remove();
			}
		})
	};
	
	//////////
	// FLOW //
	//////////
	dufEditorParent = this.parent();
	this.css("display", "none");
	this.before(getInitialHtml());
	loadPalette(); //TODO loadPalette
  
	/**********************/
	/* Playing with stuff */
	/**********************/
}