/*jslint browser:true, devel:true, white:true, vars:true */
/*global require*/

// hammer JS for touch support
var Hammer = require('hammerjs');

// Get the chart variable
var Chart = require('chart.js');
var helpers = Chart.helpers;

// Take the zoom namespace of Chart
var zoomNS = Chart.Zoom = Chart.Zoom || {};

// Where we store functions to handle different scale types
var zoomFunctions = zoomNS.zoomFunctions = zoomNS.zoomFunctions || {};
var panFunctions = zoomNS.panFunctions = zoomNS.panFunctions || {};

// Default options if none are provided
var defaultOptions = zoomNS.defaults = {
	pan: {
		enabled: true,
		mode: 'xy',
		speed: 20,
		threshold: 10,
	},
	zoom: {
		enabled: true,
		mode: 'xy',
		sensitivity: 3,
	}
};

function directionEnabled(mode, dir) {
	if (mode === undefined) {
		return true;
	} else if (typeof mode === 'string') {
		return mode.indexOf(dir) !== -1;
	}

	return false;
}

function zoomScale(scale, zoom, center, zoomOptions) {
	var fn = zoomFunctions[scale.options.type];
	if (fn) {
		fn(scale, zoom, center, zoomOptions);
	}
}

function doZoom(chartInstance, zoom, center) {
	var ca = chartInstance.chartArea;
	if (!center) {
		center = {
			x: (ca.left + ca.right) / 2,
			y: (ca.top + ca.bottom) / 2,
		};
	}

	var zoomOptions = chartInstance.options.zoom;

	if (zoomOptions && helpers.getValueOrDefault(zoomOptions.enabled, defaultOptions.zoom.enabled)) {
		// Do the zoom here
		var zoomMode = helpers.getValueOrDefault(chartInstance.options.zoom.mode, defaultOptions.zoom.mode);
		zoomOptions.sensitivity = helpers.getValueOrDefault(chartInstance.options.zoom.sensitivity, defaultOptions.zoom.sensitivity);

		helpers.each(chartInstance.scales, function(scale, id) {
			if (scale.isHorizontal() && directionEnabled(zoomMode, 'x')) {
				zoomScale(scale, zoom, center, zoomOptions);
			} else if (!scale.isHorizontal() && directionEnabled(zoomMode, 'y')) {
				// Do Y zoom
				zoomScale(scale, zoom, center, zoomOptions);
			}
		});

		chartInstance.update(0);
	}
}

function panScale(scale, delta, panOptions) {
	var fn = panFunctions[scale.options.type];
	if (fn) {
		fn(scale, delta, panOptions);
	}
}

function doPan(chartInstance, deltaX, deltaY) {
	var panOptions = chartInstance.options.pan;
	if (panOptions && helpers.getValueOrDefault(panOptions.enabled, defaultOptions.pan.enabled)) {
		var panMode = helpers.getValueOrDefault(chartInstance.options.pan.mode, defaultOptions.pan.mode);
		panOptions.speed = helpers.getValueOrDefault(chartInstance.options.pan.speed, defaultOptions.pan.speed);

		helpers.each(chartInstance.scales, function(scale, id) {
			if (scale.isHorizontal() && directionEnabled(panMode, 'x') && deltaX !== 0) {
				panScale(scale, deltaX, panOptions);
			} else if (!scale.isHorizontal() && directionEnabled(panMode, 'y') && deltaY !== 0) {
				panScale(scale, deltaY, panOptions);
			}
		});

		chartInstance.update(0);
	}
}

function positionInChartArea(chartInstance, position) {
	return 	(position.x >= chartInstance.chartArea.left && position.x <= chartInstance.chartArea.right) &&
		(position.y >= chartInstance.chartArea.top && position.y <= chartInstance.chartArea.bottom);
}

function getYAxis(chartInstance) {
	var scales = chartInstance.scales;

	for (var scaleId in scales) {
		var scale = scales[scaleId];

		if (!scale.isHorizontal()) {
			return scale;
		}
	}
}

// Store these for later
var scaleFunctions = require('./scales');
helpers.extend(zoomNS.zoomFunctions, scaleFunctions.zoomFunctions);
helpers.extend(zoomNS.panFunctions, scaleFunctions.panFunctions);

// Chartjs Zoom Plugin
var zoomPlugin = {
	afterInit: function(chartInstance) {
		helpers.each(chartInstance.scales, function(scale) {
			scale.originalOptions = JSON.parse(JSON.stringify(scale.options));
		});

		chartInstance.resetZoom = function() {
			helpers.each(chartInstance.scales, function(scale, id) {
				var timeOptions = scale.options.time;
				var tickOptions = scale.options.ticks;

				if (timeOptions) {
					delete timeOptions.min;
					delete timeOptions.max;
				}

				if (tickOptions) {
					delete tickOptions.min;
					delete tickOptions.max;
				}

				scale.options = helpers.configMerge(scale.options, scale.originalOptions);
			});

			helpers.each(chartInstance.data.datasets, function(dataset, id) {
				dataset._meta = null;
			});

			chartInstance.update();
		};

	},
	beforeInit: function(chartInstance) {
		chartInstance.zoom = {};

		var node = chartInstance.zoom.node = chartInstance.chart.ctx.canvas;

		var options = chartInstance.options;
		var panThreshold = helpers.getValueOrDefault(options.pan ? options.pan.threshold : undefined, zoomNS.defaults.pan.threshold);

		if (options.zoom && options.zoom.drag) {
			// Only want to zoom horizontal axis
			options.zoom.mode = 'x';

			chartInstance.zoom._mouseDownHandler = function(event) {
				chartInstance.zoom._dragZoomStart = event;
			};
			node.addEventListener('mousedown', chartInstance.zoom._mouseDownHandler);

			chartInstance.zoom._mouseMoveHandler = function(event){
				if (chartInstance.zoom._dragZoomStart) {
					chartInstance.zoom._dragZoomEnd = event;
					chartInstance.update(0);
				}

				chartInstance.update(0);
			};
			node.addEventListener('mousemove', chartInstance.zoom._mouseMoveHandler);

			chartInstance.zoom._mouseUpHandler = function(event){
				if (chartInstance.zoom._dragZoomStart) {
					var chartArea = chartInstance.chartArea;
					var yAxis = getYAxis(chartInstance);
					var beginPoint = chartInstance.zoom._dragZoomStart;
					var offsetX = beginPoint.target.getBoundingClientRect().left;
					var startX = Math.min(beginPoint.clientX, event.clientX) - offsetX;
					var endX = Math.max(beginPoint.clientX, event.clientX) - offsetX;
					var dragDistance = endX - startX;
					var chartDistance = chartArea.right - chartArea.left;
					var zoom = 1 + ((chartDistance - dragDistance) / chartDistance );

					if (dragDistance > 0) {
						doZoom(chartInstance, zoom, {
							x: (dragDistance / 2) + startX,
							y: (yAxis.bottom - yAxis.top) / 2,
						});
					}

					chartInstance.zoom._dragZoomStart = null;
					chartInstance.zoom._dragZoomEnd = null;
				}
			};
			node.addEventListener('mouseup', chartInstance.zoom._mouseUpHandler);
		} else {
			chartInstance.zoom._wheelHandler = function(event) {
				var rect = event.target.getBoundingClientRect();
				var offsetX = event.clientX - rect.left;
				var offsetY = event.clientY - rect.top;

				var center = {
					x : offsetX,
					y : offsetY
				};

				if (event.deltaY < 0) {
					doZoom(chartInstance, 1.1, center);
				} else {
					doZoom(chartInstance, 0.909, center);
				}
				// Prevent the event from triggering the default behavior (eg. Content scrolling).
				event.preventDefault();
			};

			node.addEventListener('wheel', chartInstance.zoom._wheelHandler);
		}

		if (Hammer) {
			var mc = new Hammer.Manager(node);
			mc.add(new Hammer.Pinch());
			mc.add(new Hammer.Pan({
				threshold: panThreshold
			}));

			// Hammer reports the total scaling. We need the incremental amount
			var currentPinchScaling;
			var handlePinch = function handlePinch(e) {
				var diff = 1 / (currentPinchScaling) * e.scale;
				doZoom(chartInstance, diff, e.center);

				// Keep track of overall scale
				currentPinchScaling = e.scale;
			};

			mc.on('pinchstart', function(e) {
				currentPinchScaling = 1; // reset tracker
			});
			mc.on('pinch', handlePinch);
			mc.on('pinchend', function(e) {
				handlePinch(e);
				currentPinchScaling = null; // reset
			});

			var currentDeltaX = null, currentDeltaY = null, panning = false;
			var handlePan = function handlePan(e) {
				if (currentDeltaX !== null && currentDeltaY !== null) {
					panning = true;
					var deltaX = e.deltaX - currentDeltaX;
					var deltaY = e.deltaY - currentDeltaY;
					currentDeltaX = e.deltaX;
					currentDeltaY = e.deltaY;
					doPan(chartInstance, deltaX, deltaY);
				}
			};

			mc.on('panstart', function(e) {
				currentDeltaX = 0;
				currentDeltaY = 0;
				handlePan(e);
			});
			mc.on('panmove', handlePan);
			mc.on('panend', function(e) {
				currentDeltaX = null;
				currentDeltaY = null;
				setTimeout(function() { panning = false; }, 500);
			});

			chartInstance.zoom._ghostClickHandler = function(e) {
				if (panning) {
					e.stopImmediatePropagation();
					e.preventDefault();
				}
			};
			node.addEventListener('click', chartInstance.zoom._ghostClickHandler);

			chartInstance._mc = mc;
		}
	},

	beforeDatasetsDraw: function(chartInstance) {
		var ctx = chartInstance.chart.ctx;
		var chartArea = chartInstance.chartArea;
		ctx.save();
		ctx.beginPath();

		if (chartInstance.zoom._dragZoomEnd) {
			var yAxis = getYAxis(chartInstance);
			var beginPoint = chartInstance.zoom._dragZoomStart;
			var endPoint = chartInstance.zoom._dragZoomEnd;
			var offsetX = beginPoint.target.getBoundingClientRect().left;
			var startX = Math.min(beginPoint.clientX, endPoint.clientX) - offsetX;
			var endX = Math.max(beginPoint.clientX, endPoint.clientX) - offsetX;
			var rectWidth = endX - startX;


			ctx.fillStyle = 'rgba(225,225,225,0.3)';
			ctx.lineWidth = 5;
			ctx.fillRect(startX, yAxis.top, rectWidth, yAxis.bottom - yAxis.top);
		}

		ctx.rect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
		ctx.clip();
	},

	afterDatasetsDraw: function(chartInstance) {
		chartInstance.chart.ctx.restore();
	},

	destroy: function(chartInstance) {
		if (chartInstance.zoom) {
			var options = chartInstance.options;
			var node = chartInstance.zoom.node;

			if (options.zoom && options.zoom.drag) {
				node.removeEventListener('mousedown', chartInstance.zoom._mouseDownHandler);
				node.removeEventListener('mousemove', chartInstance.zoom._mouseMoveHandler);
				node.removeEventListener('mouseup', chartInstance.zoom._mouseUpHandler);
			} else {
				node.removeEventListener('wheel', chartInstance.zoom._wheelHandler);
			}

			if (Hammer) {
				node.removeEventListener('click', chartInstance.zoom._ghostClickHandler);
			}

			delete chartInstance.zoom;

			var mc = chartInstance._mc;
			if (mc) {
				mc.remove('pinchstart');
				mc.remove('pinch');
				mc.remove('pinchend');
				mc.remove('panstart');
				mc.remove('pan');
				mc.remove('panend');
			}
		}
	}
};

module.exports = zoomPlugin;
Chart.pluginService.register(zoomPlugin);
