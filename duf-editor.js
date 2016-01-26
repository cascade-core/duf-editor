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
	var DATA_JSON_PREFIX = "data-json-";
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
	var ELEMENT_WIDTH_SMALL = 25;
	var historyLimit = 10;
	
	///////////
	// TEXTS //
	///////////
	var DUPLICATE_PROPERTY_NAME = "A property with the same name exists already.<br/>";
	var EMPTY_PROPERTY_NAME = "Property name can't be empty.<br/>";
	var EMPTY_PROPERTY_VALUE = "Property value can't be empty.<br/>";
	
	//////////////
	// "GLOBAL" //
	//////////////
	var currentlyViewedPropertyList = [];
	var dufEditorParent = null;
	var history = [];
	var historyCursor = 0;
	var idCounter = 0;
	var oldElementPositions = [];
  
	///////////////
	// FUNCTIONS //
	///////////////
	var createProperty = function(event) {
		var name = $("#newPropertyName").val();
		var value = $("#newPropertyValue").val();
		var errorMessage = "";
		if (name == "") {
			errorMessage += EMPTY_PROPERTY_NAME;
		}
		if (value == "") {
			errorMessage += EMPTY_PROPERTY_VALUE;
		}
		if (errorMessage != "") {
			showDialog(errorMessage);
			return;
		}
		name = "data-json-" + name;
		if (currentlyViewedPropertyList.indexOf(name) != -1) {
			errorMessage += DUPLICATE_PROPERTY_NAME;
		}
		if (errorMessage != "") {
			showDialog(errorMessage);
			return;
		} else {
			currentlyViewedPropertyList.push(name);
		}
		$("#"+$(event.currentTarget).attr("data-id")).attr(name, value);
		$("#newPropertyRow").before(
			'<tr data-name="'+name+'">'+
				'<td>'+
					'<label for="'+name+'">'+name.substr(10)+'</label>'+
				'</td>'+
				'<td>'+
					'<input type="text" id="'+name+'" name="'+name+'" value="'+value+'" data-id="'+$(event.currentTarget).attr("data-id")+'" />'+
				'</td>'+
				'<td>'+
					'<button class="removeProperty" data-name="'+name+'" data-id="'+$(event.currentTarget).attr("data-id")+'">X</button>'+
				'</td>'+
			'</tr>'
		);
		$("#newPropertyName").val("");
		$("#newPropertyValue").val("");
		$(".removeProperty[data-name="+name+"]").click(removeProperty);
		$("tr[data-name="+name+"] input").blur(propertyChanged);
		saveState();
	};
	
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
		} else if (element == "submit") {
			drawing = svg.append("rect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", ELEMENT_WIDTH)
				.attr("height", ELEMENT_HEIGHT_SMALL)
				.attr("stroke", ELEMENT_STROKE_COLOR)
				.attr("stroke-width", ELEMENT_STROKE_WIDTH)
				.attr("fill", "none");
			svg.append("text")
				.attr("stroke", ELEMENT_STROKE_COLOR)
				.attr("stroke-width", ELEMENT_STROKE_WIDTH_TEXT)
				.attr("fill", ELEMENT_FILL_COLOR)
				.attr("x", ELEMENT_STROKE_WIDTH)
				.attr("y", 0.75*ELEMENT_HEIGHT_SMALL)
				.attr("font-size", 0.75*ELEMENT_HEIGHT_SMALL)
				.text("Submit");
		} else if (element == "checkbox") {
			svg.attr("viewBox", "0 0 "+ELEMENT_WIDTH_SMALL+" "+ELEMENT_HEIGHT_SMALL);
			svg.attr("width", "20px");
			drawing = svg.append("rect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", ELEMENT_WIDTH_SMALL)
				.attr("height", ELEMENT_HEIGHT_SMALL)
				.attr("stroke", ELEMENT_STROKE_COLOR)
				.attr("stroke-width", ELEMENT_STROKE_WIDTH)
				.attr("fill", "none");
		} else if (element == "datetime" || element == "datetime-local") {
			drawing = svg.append("rect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", ELEMENT_WIDTH)
				.attr("height", ELEMENT_HEIGHT_SMALL)
				.attr("stroke", ELEMENT_STROKE_COLOR)
				.attr("stroke-width", ELEMENT_STROKE_WIDTH)
				.attr("fill", "none");
			svg.append("text")
				.attr("stroke", ELEMENT_STROKE_COLOR)
				.attr("stroke-width", ELEMENT_STROKE_WIDTH_TEXT)
				.attr("fill", ELEMENT_FILL_COLOR)
				.attr("x", ELEMENT_STROKE_WIDTH)
				.attr("y", 0.75*ELEMENT_HEIGHT_SMALL)
				.attr("font-size", 0.35*ELEMENT_HEIGHT_SMALL)
				.text("YYYY/MM/DD HH:MM");
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
		drawing.node().parentNode.parentNode.title = element;
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
	
	var dropElement = function(event, ui) {
		var element = $(ui.draggable);
			// jQuery converts attr names to lower case (XHTML valid)
			element.find("svg")[0].setAttribute("preserveAspectRatio", "none");
			element.resizable({
				containment : "parent",
				handles : "all",
				stop : resizingStopped
			});
			var id;
			if (element.attr("id") != undefined) {
				id = element.attr("id");
			} else {
				id = idCounter++;
			}
			element.attr("id", id);
			idCounter++;
			element.click(elementProperties);
		$(this).append(element);
	}
	
	var elementDropped = function() {
		var oldEditor = history[historyCursor].editor;
		if (history.length == 0 || positionsChanged()) {
			saveState();
		}
	};
	
	var elementProperties = function() {
		currentlyViewedPropertyList = [];
		$(".activeItemOverlay").remove();
		$("#dufEditorProperties").html("");
		var id = $(this).attr("id");
		var width = $(this).width();
		var height = $(this).height();
		$(this).append('<div class="activeItemOverlay"></div>');
		$(this).attr("data-json-width", width);
		$(this).attr("data-json-height", height);
		$("#dufEditorProperties").append("<table><tbody></tbody></table>");
		$.each(this.attributes, function(i, attr) {
			listElementProperties(attr, id);
		});
		$(".removeProperty").click(removeProperty);
		$("#dufEditorProperties tbody").append(
			'<tr id="newPropertyRow">'+
				'<td>'+
					'<input type="text" placeholder="name" id="newPropertyName"  />'+
				'</td>'+
				'<td>'+
					'<input type="text" placeholder="value" id="newPropertyValue" />'+
				'</td>'+
			'</tr>'+
			'<tr>'+
				'<td>'+
					'<button id="createProperty" data-id="'+id+'">Create property</button>'+
				'</td>'+
				'<td></td>'+
			'<tr>'
		);
		$("#createProperty").click(createProperty);
		$("#dufEditorProperties tr[data-name] input").blur(propertyChanged);
	};
	
	var getInitialHtml = function() {
		var initialHtml = 
			'<div id="dialog"></div>'+
			'<div id="dufEditorWrapper">'+
				'<span id="dufEditorPaletteWrapper">'+
					'<div id="dufEditorPaletteHeader"><h2>Palette</h2></div>'+
					'<div id="dufEditorPalette">'+
						'<div id="trash">Here be trash</div>'+
						'<div id="layouts"><h3>Layouts</h3></div>'+
						'<hr />'+
						'<div id="widgets"><h3>Widgets</h3><hr /></div>'+
					'</div>'+
				'</span>'+
				'<span id="dufEditorEditorWrapper">'+
					'<div id="dufEditorToolbar">'+
						'<button id="undo" disabled="disabled"><-</button>'+
						'<button id="redo" disabled="disabled">-></button>'+
					'</div>'+
					'<div id="dufEditorView">'+
						'<div id="noLayout" class="sortable">'+
						'</div>'+
					'</div>'+
				'</span>'+
				'<span id="dufEditorPropertiesWrapper">'+
					'<div id="dufEditorPropertiesHeader"><h2>Properties</h2></div>'+
					'<div id="dufEditorProperties"></div>'+
				'</span>'+
			'</div>';
		return initialHtml;
	};

	var handleEnter = function(event) {
		if (event.which == 13) { // both enter and num pad enter
			$("#dufEditorWrapper input:focus").trigger("blur");
		}
	};
	
	var listElementProperties = function(attr, id) {
		var name = attr.name;
		var value = attr.value;
		if (!name.startsWith("data-json-")) {
			return;
		}
		currentlyViewedPropertyList.push(name);
		$("#dufEditorProperties table").append(
			'<tr data-name="'+name+'">'+
				'<td>'+
					'<label for="'+name+'">'+name.substr(10)+'</label>'+
				'</td>'+
				'<td>'+
					'<input type="text" id="'+name+'" name="'+name+'" data-id="'+id+'" value="'+value+'" />'+
				'</td>'+
				'<td>'+
					((name == "data-json-width" || name == "data-json-height") ? '' : '<button class="removeProperty" data-name="'+name+'" data-id="'+id+'">X</button>')+
				'</td>'+
			'</tr>'
		);
		$
	};
	
	var loadPalette = function() {
		drawInPalette("text", false);
		drawInPalette("number", false);
		drawInPalette("textarea", false);
		drawInPalette("label", false);
		drawInPalette("placeholder", false);
		drawInPalette("fjfg", false);
		drawInPalette("submit", false);
		drawInPalette("checkbox", false);
		drawInPalette("datetime-local", false);
		drawInPalette("textarea", false);
		drawInPalette("textarea", false);
		drawInPalette("textarea", false);
		$(".draggable").draggable({
			connectToSortable : ".sortable",
			helper : "clone"
		});
		$(".sortable").sortable({
				stop : elementDropped
			})
			.droppable({
				drop : dropElement
			});
		$("#trash").droppable({
			drop : removeElement
		});
		saveState();
	};
	
	var positionsChanged = function() {
		var newElementPositions = $(".sortable").sortable("toArray");
		if (oldElementPositions.length != newElementPositions.length) { // element added
			oldElementPositions = newElementPositions.slice();
			return true;
		}
		for (var i = 0; i < oldElementPositions.length; i++) {
			if (oldElementPositions[i] != newElementPositions[i]) {
				return true;
			}
		}
		return false;
	};
	
	var propertyChanged = function(event) {
		var target = event.currentTarget;
		if ($(target).val() != $(target).attr("value")) { // compare the new and the old value
			// jQuery val() doesn't set value attribute
			document.getElementById($(target).attr("id")).setAttribute("value", $(target).val());
			saveState();
		}
	};
	
	var redo = function() {
		historyCursor++;
		var historyItem = history[historyCursor];
		$("#noLayout").html(historyItem.editor);
		$("#dufEditorProperties").html(historyItem.properties);
		currentlyViewedPropertyList = historyItem.propertiesList.splice();
		restoreEventListeners();
		$("#undo").removeAttr("disabled");
		if (historyCursor == history.length - 1) {
			$("#redo").attr("disabled", "disabled");
		}
	}
	
	var removeElement = function(event, ui) {
		ui.draggable.remove();
	};
	
	var removeProperty = function(event) {
		var target = $(event.currentTarget);
		currentlyViewedPropertyList = currentlyViewedPropertyList.filter(function (item) {
			return target.attr("data-name") != item;
		});
		$("#"+target.attr("data-id")).removeAttr(target.attr("data-name"));
		$("tr[data-name="+target.attr("data-name")+"]").remove();
		saveState();
	};
	
	var resizingStopped = function(event, ui) {
		var element = ui.element;
		$(element).trigger("click");
		saveState();
	};
	
	var restoreEventListeners = function() {
		$("#dufEditorView div.draggable").click(elementProperties);
		$("#createProperty").click(createProperty);
		$(".removeProperty").click(removeProperty);
		$("#dufEditorProperties tr[data-name] input").blur(propertyChanged);
	}
	
	var saveState = function() {
		$.each($("tr[data-name]"), function() {
			var name = $(this).attr("data-name");
			var value = $(this).find("input").val();
			if (name == "data-json-width") {
				$("#"+$(this).find("input").attr("data-id")).width(value);
			} else if (name == "data-json-height") {
				$("#"+$(this).find("input").attr("data-id")).height(value);
			}
			$("#"+$(this).find("input").attr("data-id")).attr(name, value);
		});
		if (historyCursor == history.length - 1 || history.length == 0) {
			var historyItem = {
				editor : $("#noLayout").html(),
				properties : $("#dufEditorProperties").html(), 
				propertiesList : currentlyViewedPropertyList.slice()
			}
			history.push(historyItem);
			if (history.length > historyLimit) {
				history.shift();
			} else {
				historyCursor = history.length - 1;
			}
		} else {
			originalLength = history.length;
			for (var i = historyCursor + 1; i < originalLength; i++) {
				history.pop();
			}
			var historyItem = {
				editor : $("#noLayout").html(),
				properties : $("#dufEditorProperties").html(),
				propertiesList : currentlyViewedPropertyList.slice()
			}
			history.push(historyItem);
			historyCursor = history.length - 1;
		}
		$("#redo").attr("disabled", "disabled");
		if (history.length == 1) {
			$("#undo").attr("disabled", "disabled");
		} else {
			$("#undo").removeAttr("disabled");
		}
		console.log(history);
	};
	
	var showDialog = function(errorMessage) {
		$("#dialog").html(errorMessage);
		$("#dialog").dialog("open");
	};
	
	var undo = function() {
		historyCursor--;
		var historyItem = history[historyCursor];
		$("#noLayout").html(historyItem.editor);
		$("#dufEditorProperties").html(historyItem.properties);
		currentlyViewedPropertyList = historyItem.propertiesList.slice();
		restoreEventListeners();
		$("#redo").removeAttr("disabled");
		if(historyCursor == 0) {
			$("#undo").attr("disabled", "disabled");
		}
	};
	
	//////////
	// FLOW //
	//////////
	dufEditorParent = this.parent();
	this.css("display", "none");
	this.before(getInitialHtml());
	$("#undo").click(undo);
	$("#redo").click(redo);
	$(document).keypress(handleEnter);
	loadPalette();
	$("#dialog").dialog({
		autoOpen : false,
		modal : true
	});
}