/**
 * Created by Sean on 2/2/2017.
 */
function zoomNumericalScale(scale, zoom, center, zoomOptions) {
    var range = scale.max - scale.min;
    var newDiff = range * (zoom - 1);

    var cursorPixel, minLimit, maxLimit;
    if(scale.isHorizontal()) {
        cursorPixel = center.x;
        minLimit = zoomOptions.limits.x.min;
        maxLimit = zoomOptions.limits.x.max;
    } else {
        cursorPixel = center.y;
        minLimit = zoomOptions.limits.y.min;
        maxLimit = zoomOptions.limits.y.max;
    }

    var min_percent = (scale.getValueForPixel(cursorPixel) - scale.min) / range;
    var max_percent = 1 - min_percent;

    var minDelta = newDiff * min_percent,
        newMin = scale.min + minDelta;

    var maxDelta = newDiff * max_percent,
        newMax = scale.max - maxDelta;

    newMin = newMin < minLimit ? minLimit : newMin;
    newMax = newMax > maxLimit ? maxLimit : newMax;

    scale.options.ticks.min = newMin;
    scale.options.ticks.max = newMax;
}

module.exports = zoomNumericalScale;

// data to display =