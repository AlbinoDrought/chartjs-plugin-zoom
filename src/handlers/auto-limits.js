/**
 * Created by Sean on 4/4/2017.
 */
var Chart = require('chart.js');
var helpers = Chart.helpers;

function getMinMax(chartInstance, x) {

    // from Chart.js core.scales.js
    var getRightValue = function(rawValue) {
        // Null and undefined values first
        if (rawValue === null || typeof(rawValue) === 'undefined') {
            return NaN;
        }
        // isNaN(object) returns true, so make sure NaN is checking for a number; Discard Infinite values
        if (typeof(rawValue) === 'number' && !isFinite(rawValue)) {
            return NaN;
        }
        // If it is in fact an object, dive in one more level
        if (typeof(rawValue) === 'object') {
            if ((rawValue instanceof Date) || (rawValue.isValid)) {
                return rawValue;
            }
            return getRightValue(x ? rawValue.x : rawValue.y);
        }

        // Value is good, return it
        return rawValue;
    };

    var min = null, max = null;

    helpers.each(chartInstance.config.data.datasets, function(dataset, datasetIndex) {
        if (chartInstance.isDatasetVisible(datasetIndex)) {
            helpers.each(dataset.data, function(rawValue, index) {
                var value = +getRightValue(rawValue);
                if (isNaN(value)) {
                    return;
                }

                if (min === null) {
                    min = value;
                } else if (value < min) {
                    min = value;
                }

                if (max === null) {
                    max = value;
                } else if (value > max) {
                    max = value;
                }
            });
        }
    });

    return {
        "min": Math.floor(min),
        "max": Math.ceil(max),
    };
};

function setAxisTickLimits(chartInstance, x, minMax) {
    var scaleConfig = chartInstance.config.options.scales,
        directionalScaleConfig = x ? scaleConfig.xAxes : scaleConfig.yAxes;

    var min = minMax.min, max = minMax.max;

    helpers.each(directionalScaleConfig, function(scaleConfig, index) {
        var ticks = scaleConfig.ticks;

        ticks.min = min;
        ticks.max = max;
    });
};

function handleAutoLimits(chartInstance, limits) {
    if(limits.x) {
        var xMinAuto = limits.x.min === "auto",
            xMaxAuto = limits.x.max === "auto";

        if (xMinAuto || xMaxAuto) {
            var xMinMax = getMinMax(chartInstance, true);

            if (xMinAuto) limits.x.min = xMinMax["min"];
            if (xMaxAuto) limits.x.max = xMinMax["max"];

            setAxisTickLimits(chartInstance, true, limits.x);
        }
    }

    if(limits.y) {
        var yMinAuto = limits.y.min === "auto",
            yMaxAuto = limits.y.max === "auto";

        if (yMinAuto || yMaxAuto) {
            var yMinMax = getMinMax(chartInstance, false);

            if (yMinAuto) limits.y.min = yMinMax["min"];
            if (yMaxAuto) limits.y.max = yMinMax["max"];

            setAxisTickLimits(chartInstance, false, limits.y);
        }
    }

    return limits;
};

module.exports = handleAutoLimits;