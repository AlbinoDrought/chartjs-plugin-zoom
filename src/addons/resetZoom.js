/**
 * Created by Sean on 2/2/2017.
 */
var Chart = require('chart.js');
var helpers = Chart.helpers;

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

module.exports = resetZoom;