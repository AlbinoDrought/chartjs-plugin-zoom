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