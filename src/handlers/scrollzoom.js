/**
 * Created by Sean on 2/2/2017.
 */
var Hammer = require('hammerjs'),
    autoLimit = require('./auto-limits');

module.exports = {
    isEnabled: function(chartInstance) {
        var options = chartInstance.options;

        return options.zoom.enabled && !options.zoom.drag;
    },

    beforeInit: function(chartInstance) {
        var node = chartInstance.zoom.node = chartInstance.chart.ctx.canvas,
            options = chartInstance.options,
            zoomOptions = options.zoom,
            limits = zoomOptions.limits;

        zoomOptions.limits = autoLimit(chartInstance, limits);

        chartInstance.zoom._wheelHandler = function(event) {
            var rect = event.target.getBoundingClientRect();
            var offsetX = event.clientX - rect.left;
            var offsetY = event.clientY - rect.top;

            var center = {
                x : offsetX,
                y : offsetY
            };

            if (event.deltaY < 0) {
                chartInstance.doZoom(1.1, center, zoomOptions);
            } else {
                chartInstance.doZoom(0.909, center, zoomOptions);
            }
            // Prevent the event from triggering the default behavior (eg. Content scrolling).
            event.preventDefault();
        };

        node.addEventListener('wheel', chartInstance.zoom._wheelHandler);

        var mc = chartInstance._mc || new Hammer.Manager(node);
        mc.add(new Hammer.Pinch());

        // Hammer reports the total scaling. We need the incremental amount
        var currentPinchScaling;
        var handlePinch = function handlePinch(e) {
            var diff = 1 / (currentPinchScaling) * e.scale;
            chartInstance.doZoom(diff, e.center, zoomOptions);

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

    },

    destroy: function(chartInstance) {
        var node = chartInstance.zoom.node;

        node.removeEventListener('mousedown', chartInstance.zoom._mouseDownHandler);
        node.removeEventListener('mousemove', chartInstance.zoom._mouseMoveHandler);
        node.removeEventListener('mouseup', chartInstance.zoom._mouseUpHandler);
        node.removeEventListener('wheel', chartInstance.zoom._wheelHandler);

        if(Hammer) {
            var mc = chartInstance._mc;
            mc.remove('pinchstart');
            mc.remove('pinch');
            mc.remove('pinchend');
        }
    },
};
