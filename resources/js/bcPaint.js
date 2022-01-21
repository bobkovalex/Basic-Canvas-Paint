/**
 * Basic Canvas Paint
 * Copyright (c) 2018-2021 Alexandre Bobkov
 * Licensed under MIT
 * @author Alexandre Bobkov
 * @contributor Jeppe Bundsgaard
 * @version 0.8
 */

$(document).ready(function(){
	$('body').on('click', '.bcPaint-palette-color', function(){
		$.fn.bcPaint.setColor($(this).data('color'));
	});
	$('body').on('click', '.bcPaint-palette-stroke', function(){
		$.fn.bcPaint.setStroke($(this).data('stroke'));
	});
	$('body').on('click', '#bcPaint-eraser', function(){
		$.fn.bcPaint.setEraser()
	});
	

	$('body').on('click', '#bcPaint-reset', function(){
		$.fn.bcPaint.clearCanvas();
	});

	$('body').on('click', '#bcPaint-export', function(){
		$.fn.bcPaint.export();
	});
});


(function( $ ) {
	/**
	* Private variables
	**/
	var isDragged		= false,
		isEraser		= false,
		startPoint		= { x:0, y:0 },
		templates 		= {
							container 		: $('<div class="row" id="bcPaint-container"></div>'),
							palette 		: $('<div class="col-sm-3 cols-md-3 bg-light rounded pt-4 text-center" id="bcPaint-palette"></div>'),
							color 			: $('<div class="bcPaint-palette-color"></div>'),
							stroke			: $('<div class="bcPaint-palette-stroke"></div>'),
							canvasContainer : $('<div class="col-sm-9 col-md-9" id="bcPaint-canvas-container"></div>'),
							canvasPane 		: $('<canvas id="bcPaintCanvas" class="border border-dark rounded"></canvas>'),
							bottom 			: $('<div class="col-sm-12 col-md-12 text-center mt-3" id="bcPaint-bottom"></div>'),
							buttonReset 	: $('<button type="button" class="btn btn-secondary btn-sm mr-1" id="bcPaint-reset"><i class="fas fa-eraser"></i> Clear</button>'),
							buttonSave		: $('<button type="button" class="btn btn-primary btn-sm ml-1" id="bcPaint-export"><i class="fas fa-download"></i> Export</button>'),
							eraser			: $('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#CCC" class="bi bi-eraser" id="bcPaint-eraser" viewBox="0 0 16 16"><path d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828l6.879-6.879zm2.121.707a1 1 0 0 0-1.414 0L4.16 7.547l5.293 5.293 4.633-4.633a1 1 0 0 0 0-1.414l-3.879-3.879zM8.746 13.547 3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293l.16-.16z"/></svg>')
						},
		paintCanvas,
		paintContext;

	/**
	* Assembly and initialize plugin
	**/
	$.fn.bcPaint = function (options) {

		return this.each(function () {
			var rootElement 	= $(this),
				colorSet		= $.extend({}, $.fn.bcPaint.defaults, options),
				strokeSet		= $.extend({}, $.fn.bcPaint.defaults, options),
				defaultColor	= (rootElement.val().length > 0) ? rootElement.val() : colorSet.defaultColor,
				defaultStroke	= strokeSet.defaultStroke,
				container 		= templates.container.clone(),
				// header 			= templates.header.clone(),
				palette 		= templates.palette.clone(),
				canvasContainer = templates.canvasContainer.clone(),
				canvasPane 		= templates.canvasPane.clone(),
				bottom 			= templates.bottom.clone(),
				buttonReset 	= templates.buttonReset.clone(),
				buttonSave 		= templates.buttonSave.clone(),
				color,
				stroke,
				eraser			= templates.eraser.clone();

			// assembly pane
			rootElement.append(container);
			// container.append(header);
			container.append(palette);
			container.append(canvasContainer);
			container.append(bottom);
			// header.append(palette);
			canvasContainer.append(canvasPane);
// 			bottom.append(buttonReset);
// 			bottom.append(buttonSave);

			// assembly color palette
			$.each(colorSet.colors, function (i) {
        		color = templates.color.clone();
				color.css('background-color', $.fn.bcPaint.toHex(colorSet.colors[i]));
				color.attr('data-color',colorSet.colors[i])
				palette.append(color);
    		});
			$.each(strokeSet.strokes, function (i) {
        		stroke = templates.stroke.clone();
				stroke.css('height', strokeSet.strokes[i]+"px"); //.find('.bcPaint-palette-stroke')
				stroke.css('width', strokeSet.strokes[i]+"px");
				stroke.attr('data-stroke',strokeSet.strokes[i])
				palette.append(stroke);
    		});
			eraser.css("float","right");
			palette.append(eraser)
			

			// set canvas pane width and height
			var bcCanvas = rootElement.find('canvas');
			var bcCanvasContainer = rootElement.find('#bcPaint-canvas-container');
			bcCanvas.attr('width', bcCanvasContainer.width());
			bcCanvas.attr('height', bcCanvasContainer.height());

			// get canvas pane context
			paintCanvas = document.getElementById('bcPaintCanvas');
			paintContext = paintCanvas.getContext('2d');

			// set color
			$.fn.bcPaint.setColor(defaultColor);
			// set color
			$.fn.bcPaint.setStroke(defaultStroke);

			// bind mouse actions
			paintCanvas.onmousedown = $.fn.bcPaint.onMouseDown;
			paintCanvas.onmouseup = $.fn.bcPaint.onMouseUp;
			paintCanvas.onmousemove = $.fn.bcPaint.onMouseMove;

			// bind touch actions
			paintCanvas.addEventListener('touchstart', function(e){
				$.fn.bcPaint.dispatchMouseEvent(e, 'mousedown');
			});
			paintCanvas.addEventListener('touchend', function(e){
  				$.fn.bcPaint.dispatchMouseEvent(e, 'mouseup');
			});
			paintCanvas.addEventListener('touchmove', function(e){
				$.fn.bcPaint.dispatchMouseEvent(e, 'mousemove');
			});

			// Prevent scrolling on touch event
			document.body.addEventListener("touchstart", function (e) {
			  if (e.target == 'paintCanvas') {
			    e.preventDefault();
			  }
			}, false);
			document.body.addEventListener("touchend", function (e) {
			  if (e.target == 'paintCanvas') {
			    e.preventDefault();
			  }
			}, false);
			document.body.addEventListener("touchmove", function (e) {
			  if (e.target == 'paintCanvas') {
			    e.preventDefault();
			  }
			}, false);
		});
	}

	/**
	* Extend plugin
	**/
	$.extend(true, $.fn.bcPaint, {
		/**
		* Dispatch mouse event
		*/
		dispatchMouseEvent : function(e, mouseAction){
			var touch = e.touches[0];
			if(touch == undefined){
				touch = { clientX : 0, clientY : 0 };
			}
			var mouseEvent = new MouseEvent(mouseAction, {
				clientX: touch.clientX,
				clientY: touch.clientY
			});
			paintCanvas.dispatchEvent(mouseEvent);
		},

		/**
		* Remove pane
		*/
		clearCanvas : function(){
			paintCanvas.width = paintCanvas.width;
		},

		/**
		* On mouse down
		**/
		onMouseDown : function(e){
			isDragged = true;
			// get mouse x and y coordinates
			startPoint.x = e.offsetX;
			startPoint.y = e.offsetY;
			// begin context path
			paintContext.beginPath();
			paintContext.moveTo(startPoint.x, startPoint.y);
		},

		/**
		* On mouse up
		**/
		onMouseUp : function() {
		    isDragged = false;
		},

		/**
		* On mouse move
		**/
		onMouseMove : function(e){
			if(isDragged){
				if(isEraser) {
					paintContext.clearRect(e.offsetX, e.offsetY,paintContext.lineWidth*2,paintContext.lineWidth*2);
				}
				else {
					paintContext.lineTo(e.offsetX, e.offsetY);
					paintContext.stroke();
				}
			}
		},

		/**
		* Set selected color, disable eraser
		**/
		setColor : function(color){
			$('.bcPaint-palette-color.selectedColor').removeClass('selectedColor');
			$('.bcPaint-palette-color[data-color="'+color+'"]').addClass('selectedColor');
			paintContext.strokeStyle = $.fn.bcPaint.toHex(color);
			isEraser=false
		},
		/**
		* Set selected stroke
		**/
		setStroke : function(stroke){
			$('.bcPaint-palette-stroke.selectedStroke').removeClass('selectedStroke');
			$('.bcPaint-palette-stroke[data-stroke="'+stroke+'"]').addClass('selectedStroke');

			paintContext.lineWidth = stroke;
		},
		/**
		* enable eraser
		**/
		setEraser : function(){
			isEraser=!isEraser
		},

		/**
		*
		*/
		export : function(){
			var imgData = paintCanvas.toDataURL('image/png');
			var windowOpen = window.open('about:blank', 'Image');
			windowOpen.document.write('<img src="' + imgData + '" alt="Exported Image"/>');
		},

		/**
		* Convert color to HEX value
		**/
		toHex : function(color) {
		    // check if color is standard hex value
		    if (color.match(/[0-9A-F]{6}|[0-9A-F]{3}$/i)) {
		        return (color.charAt(0) === "#") ? color : ("#" + color);
		    // check if color is RGB value -> convert to hex
		    } else if (color.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/)) {
		        var c = ([parseInt(RegExp.$1, 10), parseInt(RegExp.$2, 10), parseInt(RegExp.$3, 10)]),
		            pad = function (str) {
		                if (str.length < 2) {
		                    for (var i = 0, len = 2 - str.length; i < len; i++) {
		                        str = '0' + str;
		                    }
		                }
		                return str;
		            };
		        if (c.length === 3) {
		            var r = pad(c[0].toString(16)),
		                g = pad(c[1].toString(16)),
		                b = pad(c[2].toString(16));
		            return '#' + r + g + b;
		        }
		    // else do nothing
		    } else {
		        return false;
		    }
		}

	});

	/**
	* Default color set
	**/
	$.fn.bcPaint.defaults = {
        // default color
        defaultColor : '000000',

        // default color set
        colors : [
					'000000', '444444', '999999', 'DDDDDD', '#e83e8c', '#dc3545',
					'#fd7e14', '#ffc107', '#28a745', '#20c997', '#6f42c1', '#007bff','#FFFFFF'
        ],

        // extend default set
        addColors : [],
		strokes : [ 1, 2, 4, 8, 16, 24],
        defaultStroke : 2,
    };

})(jQuery);
