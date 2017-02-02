/*!
 * chartjs-plugin-zoom
 * http://chartjs.org/
 * Version: 0.4.4
 *
 * Copyright 2016 Evert Timberg
 * Released under the MIT license
 * https://github.com/chartjs/chartjs-plugin-zoom/blob/master/LICENSE.md
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Created by Sean on 2/2/2017.
 */
function directionEnabled(mode, dir) {
    if (mode === undefined) {
        return true;
    } else if (typeof mode === 'string') {
        return mode.indexOf(dir) !== -1;
    }

    return false;
}

module.exports = directionEnabled;
},{}],2:[function(require,module,exports){
(function (global){
/**
 * Created by Sean on 2/2/2017.
 */
var Chart = (typeof window !== "undefined" ? window['Chart'] : typeof global !== "undefined" ? global['Chart'] : null);
var helpers = Chart.helpers;
var zoomNS = Chart.Zoom;

var directionEnabled = require('./directionEnabled');

function panScale(scale, delta, panOptions) {
    var fn = zoomNS.panFunctions[scale.options.type];
    if (fn) {
        fn(scale, delta, panOptions);
    }
}

function doPan(chartInstance, deltaX, deltaY) {
    var panOptions = chartInstance.options.pan;
    var panMode = panOptions.mode;

    helpers.each(chartInstance.scales, function(scale, id) {
        if (scale.isHorizontal() && directionEnabled(panMode, 'x') && deltaX !== 0) {
            panScale(scale, deltaX, panOptions);
        } else if (!scale.isHorizontal() && directionEnabled(panMode, 'y') && deltaY !== 0) {
            panScale(scale, deltaY, panOptions);
        }
    });

    chartInstance.update(0);
}

module.exports = doPan;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./directionEnabled":1}],3:[function(require,module,exports){
(function (global){
/**
 * Created by Sean on 2/2/2017.
 */
var Chart = (typeof window !== "undefined" ? window['Chart'] : typeof global !== "undefined" ? global['Chart'] : null);
var helpers = Chart.helpers;
var zoomNS = Chart.Zoom;

var directionEnabled = require('./directionEnabled');

function zoomScale(scale, zoom, center, zoomOptions) {
    var fn = zoomNS.zoomFunctions[scale.options.type];
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
    var zoomMode = zoomOptions.mode;

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

module.exports = doZoom;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./directionEnabled":1}],4:[function(require,module,exports){
/**
 * Created by Sean on 2/2/2017.
 */
/***
 * Returns the first found vertical axis
 *
 * @param chartInstance
 * @returns {*}
 */
function getYAxis(chartInstance) {
    var scales = chartInstance.scales;

    for (var scaleId in scales) {
        var scale = scales[scaleId];

        if (!scale.isHorizontal()) {
            return scale;
        }
    }
}

module.exports = getYAxis;
},{}],5:[function(require,module,exports){
/**
 * Created by Sean on 2/2/2017.
 */
module.exports = {
    doZoom: require('./doZoom'),
    doPan: require('./doPan'),
    getYAxis: require('./getYAxis'),
    resetZoom: require('./resetZoom'),
};
},{"./doPan":2,"./doZoom":3,"./getYAxis":4,"./resetZoom":6}],6:[function(require,module,exports){
(function (global){
/**
 * Created by Sean on 2/2/2017.
 */
var Chart = (typeof window !== "undefined" ? window['Chart'] : typeof global !== "undefined" ? global['Chart'] : null);
var helpers = Chart.helpers;

function storeScaleOptions(chartInstance) {
    helpers.each(chartInstance.scales, function(scale) {
        scale.originalOptions = JSON.parse(JSON.stringify(scale.options));
    });
}

/***
 * Attempts to return scales on the given chartInstance to their stored (original) state
 *
 * @param chartInstance
 * @param actuallyStoreInstead
 */
function resetZoom(chartInstance, actuallyStoreInstead) {
    if(actuallyStoreInstead) return storeScaleOptions(chartInstance);

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

module.exports = resetZoom;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],7:[function(require,module,exports){
(function (global){
/*jslint browser:true, devel:true, white:true, vars:true */
/*global require*/

// Get the chart variable
var Chart = (typeof window !== "undefined" ? window['Chart'] : typeof global !== "undefined" ? global['Chart'] : null);
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
		options.zoom = helpers.extend(options.zoom || {}, defaultOptions.zoom);
		options.pan = helpers.extend(options.pan || {}, defaultOptions.pan);

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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./addons":5,"./handlers":9,"./scales":12}],8:[function(require,module,exports){
/**
 * Created by Sean on 2/2/2017.
 */
module.exports = {
    isEnabled: function(chartInstance) {
        var options = chartInstance.options;

        return options.zoom.enabled && options.zoom.drag;
    },

    beforeInit: function(chartInstance) {
        var node = chartInstance.zoom.node = chartInstance.chart.ctx.canvas;
        var options = chartInstance.options;

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
        };
        node.addEventListener('mousemove', chartInstance.zoom._mouseMoveHandler);

        chartInstance.zoom._mouseUpHandler = function(event){
            if (chartInstance.zoom._dragZoomStart) {
                var chartArea = chartInstance.chartArea;
                var yAxis = chartInstance.getYAxis();
                var beginPoint = chartInstance.zoom._dragZoomStart;
                var offsetX = beginPoint.target.getBoundingClientRect().left;
                var startX = Math.min(beginPoint.clientX, event.clientX) - offsetX;
                var endX = Math.max(beginPoint.clientX, event.clientX) - offsetX;
                var dragDistance = endX - startX;
                var chartDistance = chartArea.right - chartArea.left;
                var zoom = 1 + ((chartDistance - dragDistance) / chartDistance );

                chartInstance.zoom._dragZoomStart = null;
                chartInstance.zoom._dragZoomEnd = null;

                if (dragDistance > 0) {
                    chartInstance.doZoom(zoom, {
                        x: (dragDistance / 2) + startX,
                        y: (yAxis.bottom - yAxis.top) / 2,
                    });
                }
            }
        };
        node.addEventListener('mouseup', chartInstance.zoom._mouseUpHandler);
    },

    beforeDatasetsDraw: function(chartInstance) {
        if (!chartInstance.zoom._dragZoomEnd) return;

        var ctx = chartInstance.chart.ctx;

        var yAxis = chartInstance.getYAxis();
        var beginPoint = chartInstance.zoom._dragZoomStart;
        var endPoint = chartInstance.zoom._dragZoomEnd;
        var offsetX = beginPoint.target.getBoundingClientRect().left;
        var startX = Math.min(beginPoint.clientX, endPoint.clientX) - offsetX;
        var endX = Math.max(beginPoint.clientX, endPoint.clientX) - offsetX;
        var rectWidth = endX - startX;

        ctx.fillStyle = 'rgba(225,225,225,0.3)';
        ctx.lineWidth = 5;
        ctx.fillRect(startX, yAxis.top, rectWidth, yAxis.bottom - yAxis.top);
    },

    destroy: function(chartInstance) {
        var node = chartInstance.zoom.node;

        node.removeEventListener('wheel', chartInstance.zoom._wheelHandler);
    }
};
},{}],9:[function(require,module,exports){
/**
 * Created by Sean on 2/2/2017.
 */
module.exports = [
    require('./dragzoom'),
    require('./scrollzoom'),

    require('./pan'),
];
},{"./dragzoom":8,"./pan":10,"./scrollzoom":11}],10:[function(require,module,exports){
(function (global){
/**
 * Created by Sean on 2/2/2017.
 */
var Hammer = (typeof window !== "undefined" ? window['Hammer'] : typeof global !== "undefined" ? global['Hammer'] : null);

module.exports = {
    isEnabled: function(chartInstance) {
        var options = chartInstance.options;

        return options.pan.enabled && !(options.zoom.enabled && options.zoom.drag) && Hammer;
    },

    beforeInit: function(chartInstance) {
        var node = chartInstance.zoom.node = chartInstance.chart.ctx.canvas;
        var options = chartInstance.options;

        var mc = chartInstance._mc || new Hammer.Manager(node);
        mc.add(new Hammer.Pan({
            threshold: options.pan.threshold
        }));

        var currentDeltaX = null, currentDeltaY = null, panning = false;
        var handlePan = function handlePan(e) {
            if (currentDeltaX !== null && currentDeltaY !== null) {
                panning = true;
                var deltaX = e.deltaX - currentDeltaX;
                var deltaY = e.deltaY - currentDeltaY;
                currentDeltaX = e.deltaX;
                currentDeltaY = e.deltaY;
                chartInstance.doPan(deltaX, deltaY);
            }
        };

        mc.on('panstart', function(e) {
            currentDeltaX = 0;
            currentDeltaY = 0;
            handlePan(e);
        });
        mc.on('panmove', handlePan);
        mc.on('panend', function() {
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
    },

    destroy: function(chartInstance) {
        var node = chartInstance.zoom.node;

        node.removeEventListener('click', chartInstance.zoom._ghostClickHandler);

        var mc = chartInstance._mc;
        mc.remove('panstart');
        mc.remove('pan');
        mc.remove('panend');
    },
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],11:[function(require,module,exports){
(function (global){
/**
 * Created by Sean on 2/2/2017.
 */
var Hammer = (typeof window !== "undefined" ? window['Hammer'] : typeof global !== "undefined" ? global['Hammer'] : null);

module.exports = {
    isEnabled: function(chartInstance) {
        var options = chartInstance.options;

        return options.zoom.enabled && !options.zoom.drag;
    },

    beforeInit: function(chartInstance) {
        var node = chartInstance.zoom.node = chartInstance.chart.ctx.canvas;

        chartInstance.zoom._wheelHandler = function(event) {
            var rect = event.target.getBoundingClientRect();
            var offsetX = event.clientX - rect.left;
            var offsetY = event.clientY - rect.top;

            var center = {
                x : offsetX,
                y : offsetY
            };

            if (event.deltaY < 0) {
                chartInstance.doZoom(1.1, center);
            } else {
                chartInstance.doZoom(0.909, center);
            }
            // Prevent the event from triggering the default behavior (eg. Content scrolling).
            event.preventDefault();
        };

        node.addEventListener('wheel', chartInstance.zoom._wheelHandler);

        if(Hammer) {
            var mc = chartInstance._mc || new Hammer.Manager(node);
            mc.add(new Hammer.Pinch());

            // Hammer reports the total scaling. We need the incremental amount
            var currentPinchScaling;
            var handlePinch = function handlePinch(e) {
                var diff = 1 / (currentPinchScaling) * e.scale;
                chartInstance.doZoom(diff, e.center);

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

            chartInstance._mc = mc;
        }
    },

    destroy: function(chartInstance) {
        var node = chartInstance.zoom.node;

        node.removeEventListener('mousedown', chartInstance.zoom._mouseDownHandler);
        node.removeEventListener('mousemove', chartInstance.zoom._mouseMoveHandler);
        node.removeEventListener('mouseup', chartInstance.zoom._mouseUpHandler);

        if(Hammer) {
            var mc = chartInstance._mc;
            mc.remove('pinchstart');
            mc.remove('pinch');
            mc.remove('pinchend');
        }
    },
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],12:[function(require,module,exports){
/**
 * Created by Sean on 2/2/2017.
 */
module.exports = {
    zoomFunctions: {
        // does not currently work
        // category: require('./index/zoom'),

        time: require('./time/zoom'),

        linear: require('./numerical/zoom'),
        logarithmic: require('./numerical/zoom'),
    },
    panFunctions: {
        // does not currently work
        // category: require('./index/pan'),

        time: require('./time/pan'),

        linear: require('./numerical/pan'),
        logarithmic: require('./numerical/pan'),
    },
};
},{"./numerical/pan":13,"./numerical/zoom":14,"./time/pan":15,"./time/zoom":16}],13:[function(require,module,exports){
/**
 * Created by Sean on 2/2/2017.
 */
function panNumericalScale(scale, delta) {
    var tickOpts = scale.options.ticks;
    var start = scale.start,
        end = scale.end;

    if (tickOpts.reverse) {
        tickOpts.max = scale.getValueForPixel(scale.getPixelForValue(start) - delta);
        tickOpts.min = scale.getValueForPixel(scale.getPixelForValue(end) - delta);
    } else {
        tickOpts.min = scale.getValueForPixel(scale.getPixelForValue(start) - delta);
        tickOpts.max = scale.getValueForPixel(scale.getPixelForValue(end) - delta);
    }
}

module.exports = panNumericalScale;
},{}],14:[function(require,module,exports){
/**
 * Created by Sean on 2/2/2017.
 */
function zoomNumericalScale(scale, zoom, center) {
    var range = scale.max - scale.min;
    var newDiff = range * (zoom - 1);

    var cursorPixel = scale.isHorizontal() ? center.x : center.y;
    var min_percent = (scale.getValueForPixel(cursorPixel) - scale.min) / range;
    var max_percent = 1 - min_percent;

    var minDelta = newDiff * min_percent;
    var maxDelta = newDiff * max_percent;

    scale.options.ticks.min = scale.min + minDelta;
    scale.options.ticks.max = scale.max - maxDelta;
}

module.exports = zoomNumericalScale;
},{}],15:[function(require,module,exports){
/**
 * Created by Sean on 2/2/2017.
 */
function panTimeScale(scale, delta) {
    var options = scale.options;
    options.time.min = scale.getValueForPixel(scale.getPixelForValue(scale.firstTick) - delta);
    options.time.max = scale.getValueForPixel(scale.getPixelForValue(scale.lastTick) - delta);
}

module.exports = panTimeScale;
},{}],16:[function(require,module,exports){
/**
 * Created by Sean on 2/2/2017.
 */
function zoomTimeScale(scale, zoom, center) {
    var options = scale.options;

    var range;
    var min_percent;
    if (scale.isHorizontal()) {
        range = scale.right - scale.left;
        min_percent = (center.x - scale.left) / range;
    } else {
        range = scale.bottom - scale.top;
        min_percent = (center.y - scale.top) / range;
    }

    var max_percent = 1 - min_percent;
    var newDiff = range * (zoom - 1);

    var minDelta = newDiff * min_percent;
    var maxDelta = newDiff * max_percent;

    options.time.min = scale.getValueForPixel(scale.getPixelForValue(scale.firstTick) + minDelta);
    options.time.max = scale.getValueForPixel(scale.getPixelForValue(scale.lastTick) - maxDelta);
}

module.exports = zoomTimeScale;
},{}]},{},[7]);
