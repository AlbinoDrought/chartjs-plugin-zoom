/**
 * Created by Sean on 2/2/2017.
 */
function panNumericalScale(scale, delta, panOptions) {
    var tickOpts = scale.options.ticks;
    var start = scale.start,
        end = scale.end;

    var minLimit, maxLimit;
    if(scale.isHorizontal()) {
        minLimit = panOptions.limits.x.min;
        maxLimit = panOptions.limits.x.max;
    } else {
        minLimit = panOptions.limits.y.min;
        maxLimit = panOptions.limits.y.max;
    }

    var newStart = scale.getValueForPixel(scale.getPixelForValue(start) - delta),
        newEnd = scale.getValueForPixel(scale.getPixelForValue(end) - delta);

    // don't attempt to pan outside of our boundaries if we're already there
    if(start === minLimit && newStart < start) return;
    if(end === maxLimit && newEnd > end) return;

    // if we do pan out of our boundaries, minimize the badness
    if(newStart <= minLimit) {
        newStart = minLimit;
        newEnd = (end - start) - newStart;
    } else if(newEnd >= maxLimit) {
        newEnd = maxLimit;
        newStart = newEnd - (end - start);
    }

    if (tickOpts.reverse) {
        tickOpts.max = newStart;
        tickOpts.min = newEnd;
    } else {
        tickOpts.min = newStart;
        tickOpts.max = newEnd;
    }
}

module.exports = panNumericalScale;