/**
 * Created by Sean on 2/2/2017.
 */
var Chart = require('chart.js');
var helpers = Chart.helpers;
var zoomNS = Chart.Zoom;

// todo: move somewhere else (code dupe between doPan doZoom)
function directionEnabled(mode, dir) {
    if (mode === undefined) {
        return true;
    } else if (typeof mode === 'string') {
        return mode.indexOf(dir) !== -1;
    }

    return false;
}

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