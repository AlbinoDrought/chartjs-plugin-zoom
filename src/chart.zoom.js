/*jslint browser:true, devel:true, white:true, vars:true */
/*global require*/

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

function panScale(scale, delta, panOptions) {
	var fn = panFunctions[scale.options.type];
	if (fn) {
		fn(scale, delta, panOptions);
	}
}

function doPan(chartInstance, deltaX, deltaY) {
	var panOptions = chartInstance.options.pan;
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

function getYAxis(chartInstance) {
	var scales = chartInstance.scales;

	for (var scaleId in scales) {
		var scale = scales[scaleId];

		if (!scale.isHorizontal()) {
			return scale;
		}
	}
}

function resetZoom(chartInstance) {
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

/**
 * Returns an anonymous function bootstrapped with the given chartInstance
 * Removes the need to call a function and pass chartInstance every time
 *
 * @param func
 * @param chartInstance
 * @returns {Function}
 */
function strapFunc(func, chartInstance) {
	return function() {
		// arguments is only an array-like object, not an actual array
		var argArray = [].slice.apply(arguments);
		argArray.unshift(chartInstance);
		return func.apply(this, argArray);
	};
}

/**
 * Runs the given method on every handler if it exists. Passes chartInstance
 *
 * @param handlers
 * @param method
 * @param chartInstance
 */
function runHandlers(handlers, method, chartInstance) {
	for(var i = 0; i < handlers.length; i++) {
		var func = handlers[i][method];
		if(!func) continue;

		func(chartInstance);
	}
};

// Store these for later
var scaleFunctions = require('./scales');
helpers.extend(zoomNS.zoomFunctions, scaleFunctions.zoomFunctions);
helpers.extend(zoomNS.panFunctions, scaleFunctions.panFunctions);
zoomNS.handlers = require('./handlers');

// Chartjs Zoom Plugin
var zoomPlugin = {
	afterInit: function(chartInstance) {
		helpers.each(chartInstance.scales, function(scale) {
			scale.originalOptions = JSON.parse(JSON.stringify(scale.options));
		});
	},
	beforeInit: function(chartInstance) {
		chartInstance.zoom = {};

		// init default options
		var options = chartInstance.options;
		options.zoom = helpers.extend(options.zoom || {}, defaultOptions.zoom);
		options.pan = helpers.extend(options.pan || {}, defaultOptions.pan);

		// create chart functions
		chartInstance.doZoom = strapFunc(doZoom, chartInstance);
		chartInstance.doPan = strapFunc(doPan, chartInstance);
		chartInstance.getYAxis = strapFunc(getYAxis, chartInstance);
		chartInstance.resetZoom = strapFunc(resetZoom, chartInstance);

		chartInstance.zoom.handlers = [];
		for(var i = 0; i < zoomNS.handlers.length; i++) {
			var handler = zoomNS.handlers[i];
			if(handler.isEnabled(chartInstance)) {
				chartInstance.zoom.handlers.push(handler);

				// avoid looping over our handlers again, just beforeInit here
				handler.beforeInit(chartInstance);
			}
		}
	},

	beforeDatasetsDraw: function(chartInstance) {
		var ctx = chartInstance.chart.ctx;
		var chartArea = chartInstance.chartArea;
		ctx.save();
		ctx.beginPath();

		runHandlers(chartInstance.zoom.handlers, "beforeDatasetsDraw", chartInstance);

		ctx.rect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
		ctx.clip();
	},

	afterDatasetsDraw: function(chartInstance) {
		chartInstance.chart.ctx.restore();
	},

	destroy: function(chartInstance) {
		if (chartInstance.zoom) {
			runHandlers(chartInstance.zoom.handlers, "destroy", chartInstance);

			delete chartInstance.zoom;
		}
	}
};

module.exports = zoomPlugin;
Chart.pluginService.register(zoomPlugin);
