/**
 * Created by Sean on 2/2/2017.
 */
var Chart = require('chart.js');
var helpers = Chart.helpers;
var clone = require('clone');

function storeScaleOptions(chartInstance) {
    helpers.each(chartInstance.scales, function(scale) {
        scale.originalOptions = clone(scale.options);
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

    if(!chartInstance.options.zoom.keepMetadataOnReset) {
        helpers.each(chartInstance.data.datasets, function (dataset, id) {
            dataset._meta = null;
        });
    }

    chartInstance.update();
};

module.exports = resetZoom;