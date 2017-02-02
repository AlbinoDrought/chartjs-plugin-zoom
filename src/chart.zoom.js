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
		drag: false,
		mode: 'xy',
		sensitivity: 3,
		keepMetadataOnReset: false,
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
var handlers = zoomNS.handlers = require('./handlers');
var addons = zoomNS.addons = require('./addons');

// Chartjs Zoom Plugin
var zoomPlugin = {
	afterInit: function(chartInstance) {
		// store original scale options for resetZoom()
		chartInstance.resetZoom(true);
	},
	beforeInit: function(chartInstance) {
		chartInstance.zoom = {};

		// init default options so we don't have to check if keys exist all the time
		var options = chartInstance.options;
		options.zoom = helpers.extend({}, defaultOptions.zoom, options.zoom || {});
		options.pan = helpers.extend({}, defaultOptions.pan, options.pan || {});

		// create chart functions
		for(var addonKey in addons) {
			if(!addons.hasOwnProperty(addonKey)) continue;

			chartInstance[addonKey] = strapFunc(zoomNS.addons[addonKey], chartInstance);
		}

		// add enabled handlers
		chartInstance.zoom.handlers = [];
		for(var i = 0; i < handlers.length; i++) {
			var handler = handlers[i];
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

		// hide all plotted data outside of the chart area
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
