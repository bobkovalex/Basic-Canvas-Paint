/**
 * Basic Canvas Paint
 * Copyright (c) 2018 Alex Bobkov <lilalex85@gmail.com>
 * Licensed under MIT
 * @author Alexandr Bobkov
 * @version 0.1.0
 */

$(document).ready(function(){

});


(function( $ ) {
	/**
	* Private variables
	**/
	var isDragged		= false,
		defaultColor 	= "#000000",
		startPoint		= { x:0, y:0 },
		templates 		= {
							pane : $('<canvas id="bcPaintCanvas" width="800" height="600"></canvas>')
						},
		paintContext;

	/**
	* Assembly and initialize plugin
	**/
	$.fn.bcPaint = function (options) {
		return this.each(function () {
			var elem = $(this),
				pane = templates.pane.clone();

			// add canvas pane
			elem.append(pane);
			// initialize canvas pane
			var paintCanvas = document.getElementById("bcPaintCanvas");
			paintContext = paintCanvas.getContext("2d");
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
			paintContext.strokeStyle = defaultColor;
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
		}

	});

})(jQuery);
