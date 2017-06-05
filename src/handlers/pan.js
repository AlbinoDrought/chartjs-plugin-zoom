/**
 * Created by Sean on 2/2/2017.
 */
var Hammer = require('hammerjs'),
    autoLimit = require('./auto-limits');

module.exports = {
    isEnabled: function(chartInstance) {
        var options = chartInstance.options;

        return options.pan.enabled && !(options.zoom.enabled && options.zoom.drag) && Hammer;
    },

    beforeInit: function(chartInstance) {
        var node = chartInstance.zoom.node = chartInstance.chart.ctx.canvas;
        var options = chartInstance.options,
            panOptions = options.pan,
            limits = panOptions.limits;

        panOptions.limits = autoLimit(chartInstance, limits);

        var mc = chartInstance._mc || new Hammer.Manager(node);
        mc.add(new Hammer.Pan({
            threshold: options.pan.threshold,
            direction: options.pan.mode === 'x' ? Hammer.DIRECTION_HORIZONTAL : options.pan.mode === 'y' ? Hammer.DIRECTION_VERTICAL : Hammer.DIRECTION_ALL
        }));

        var currentDeltaX = null, currentDeltaY = null, panning = false;
        var handlePan = function handlePan(e) {
            if (currentDeltaX !== null && currentDeltaY !== null) {
                panning = true;
                var deltaX = e.deltaX - currentDeltaX;
                var deltaY = e.deltaY - currentDeltaY;
                currentDeltaX = e.deltaX;
                currentDeltaY = e.deltaY;
                chartInstance.doPan(deltaX, deltaY, panOptions);
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
