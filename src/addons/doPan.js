/**
 * Created by Sean on 2/2/2017.
 */
var Chart = require('chart.js');
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