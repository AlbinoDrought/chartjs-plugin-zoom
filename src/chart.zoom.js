/*jslint browser:true, devel:true, white:true, vars:true */
/*global require*/

// Get the chart variable
var Chart = require('chart.js');
var helpers = Chart.helpers;

// Take the zoom namespace of Chart
var zoomNS = Chart.Zoom = Chart.Zoom || {};

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
zoomNS.zoomFunctions = scaleFunctions.zoomFunctions;
zoomNS.panFunctions = scaleFunctions.panFunctions;
zoomNS.handlers = require('./handlers');
zoomNS.addons = require('./addons');

// Chartjs Zoom Plugin
var zoomPlugin = {
	afterInit: function(chartInstance) {
		// store original scale options for resetZoom()
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
		for(var addonKey in zoomNS.addons) {
			chartInstance[addonKey] = strapFunc(zoomNS.addons[addonKey], chartInstance);
		}

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
