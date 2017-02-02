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