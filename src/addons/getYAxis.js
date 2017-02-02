/**
 * Created by Sean on 2/2/2017.
 */
/***
 * Returns the first found vertical axis
 *
 * @param chartInstance
 * @returns {*}
 */
function getYAxis(chartInstance) {
    var scales = chartInstance.scales;

    for (var scaleId in scales) {
        var scale = scales[scaleId];

        if (!scale.isHorizontal()) {
            return scale;
        }
    }
}

module.exports = getYAxis;