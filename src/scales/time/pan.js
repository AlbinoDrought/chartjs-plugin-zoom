/**
 * Created by Sean on 2/2/2017.
 */
function panTimeScale(scale, delta) {
    var options = scale.options;
    options.time.min = scale.getValueForPixel(scale.getPixelForValue(scale.firstTick) - delta);
    options.time.max = scale.getValueForPixel(scale.getPixelForValue(scale.lastTick) - delta);
}

module.exports = panTimeScale;