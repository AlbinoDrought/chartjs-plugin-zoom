/**
 * Created by Sean on 2/2/2017.
 */
function panNumericalScale(scale, delta) {
    var tickOpts = scale.options.ticks;
    var start = scale.start,
        end = scale.end;

    if (tickOpts.reverse) {
        tickOpts.max = scale.getValueForPixel(scale.getPixelForValue(start) - delta);
        tickOpts.min = scale.getValueForPixel(scale.getPixelForValue(end) - delta);
    } else {
        tickOpts.min = scale.getValueForPixel(scale.getPixelForValue(start) - delta);
        tickOpts.max = scale.getValueForPixel(scale.getPixelForValue(end) - delta);
    }
}

module.exports = panNumericalScale;