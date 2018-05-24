/**
 * Basic Canvas Paint
 * Copyright (c) 2018 Alex Bobkov <lilalex85@gmail.com>
 * Licensed under MIT
 * @author Alexandr Bobkov
 * @version 0.2.0
 */

$(document).ready(function(){
	$('.bcPaint-palette').on('click', '.bcPaint-palette-color', function(){
		$.fn.bcPaint.setColor($(this).css('background-color'));
	});
});


(function( $ ) {
	/**
	* Private variables
	**/
	var isDragged		= false,
		startPoint		= { x:0, y:0 },
		templates 		= {
							container : $('<div class="bcPaint-container"></div>'),
							header : $('<div class="bcPaint-header"></div>'),
							palette : $('<div class="bcPaint-palette"></div>'),
							color : $('<div class="bcPaint-palette-color"></div>'),
							canvasContainer : $('<div class="bcPaint-canvas-container"></div>'),
							canvasPane : $('<canvas id="bcPaintCanvas"></canvas>')
						},
		paintContext;

	/**
	* Assembly and initialize plugin
	**/
	$.fn.bcPaint = function (options) {

		return this.each(function () {
			var elem 			= $(this),
				colorSet		= $.extend({}, $.fn.bcPaint.defaults, options),
				defaultColor	= (elem.val().length > 0) ? elem.val() : colorSet.defaultColor,
				container 		= templates.container.clone(),
				header 			= templates.header.clone(),
				palette 		= templates.palette.clone(),
				canvasContainer = templates.canvasContainer.clone(),
				canvasPane 		= templates.canvasPane.clone(),
				color;

			// assembly canvas pane
			elem.append(container);
			container.append(header);
			container.append(canvasContainer);
			header.append(palette);
			canvasContainer.append(canvasPane);

			// assembly color palette
			$.each(colorSet.colors, function (i) {
        		color = templates.color.clone();
				color.css('background-color', colorSet.colors[i]);
				palette.append(color);
    		});

			// set width and height
			var bcCanvas = elem.find('canvas');
			var bcCanvasContainer = elem.find('.bcPaint-canvas-container');
			bcCanvas.attr('width', bcCanvasContainer.width());
			bcCanvas.attr('height', bcCanvasContainer.height());

			// initialize canvas pane
			var paintCanvas = document.getElementById('bcPaintCanvas');
			paintContext = paintCanvas.getContext('2d');

			// set color
			$.fn.bcPaint.setColor(defaultColor);

			// bind mouse actions
			paintCanvas.onmousedown = $.fn.bcPaint.paintMouseDown;
			paintCanvas.onmouseup = $.fn.bcPaint.paintMouseUp;
			paintCanvas.onmousemove = $.fn.bcPaint.paintMouseMove;
		});
		
	}

	/**
	* Extend plugin
	**/
	$.extend(true, $.fn.bcPaint, {

		/**
		* On mouse down
		**/
		paintMouseDown : function(e){
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
		paintMouseUp : function() {
		    isDragged = false;
		},

		/**
		* On mouse move
		**/
		paintMouseMove : function(e){
			if(isDragged){
				paintContext.lineTo(e.offsetX, e.offsetY);
				paintContext.stroke();
			}
		},

		/**
		*
		**/
		setColor : function(color){
			paintContext.strokeStyle = $.fn.bcPaint.toHex(color);
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
        defaultColor : "000000",

        // default color set
        colors : [
					'000000', '993300', '333300', '000080', '333399', '333333',
					'800000', 'FF6600', '808000', '008000', '008080', '0000FF'
        ],

        // extend default set
        addColors : [],
    };

})(jQuery);
