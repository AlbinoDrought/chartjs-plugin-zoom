/**
 * Created by Sean on 2/2/2017.
 */
function panIndexScale(scale, delta, panOptions) {
    var labels = scale.chart.data.labels;
    var lastLabelIndex = labels.length - 1;
    var offsetAmt = Math.max((scale.ticks.length - ((scale.options.gridLines.offsetGridLines) ? 0 : 1)), 1);
    var panSpeed = panOptions.speed;
    var minIndex = scale.minIndex;
    var step = Math.round(scale.width / (offsetAmt * panSpeed));
    var maxIndex;

    zoomNS.panCumulativeDelta += delta;

    minIndex = zoomNS.panCumulativeDelta > step ? Math.max(0, minIndex -1) : zoomNS.panCumulativeDelta < -step ? Math.min(lastLabelIndex - offsetAmt + 1, minIndex + 1) : minIndex;
    zoomNS.panCumulativeDelta = minIndex !== scale.minIndex ? 0 : zoomNS.panCumulativeDelta;

    maxIndex = Math.min(lastLabelIndex, minIndex + offsetAmt - 1);

    scale.options.ticks.min = labels[minIndex];
    scale.options.ticks.max = labels[maxIndex];
}

module.exports = panIndexScale;