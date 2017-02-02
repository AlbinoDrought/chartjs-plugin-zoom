/**
 * Created by Sean on 2/2/2017.
 */
function zoomIndexScale(scale, zoom, center, zoomOptions) {
    var labels = scale.chart.data.labels;
    var minIndex = scale.minIndex;
    var lastLabelIndex = labels.length - 1;
    var maxIndex = scale.maxIndex;
    var sensitivity = zoomOptions.sensitivity;
    var chartCenter =  scale.isHorizontal() ? scale.left + (scale.width/2) : scale.top + (scale.height/2);
    var centerPointer = scale.isHorizontal() ? center.x : center.y;

    zoomNS.zoomCumulativeDelta = zoom > 1 ? zoomNS.zoomCumulativeDelta + 1 : zoomNS.zoomCumulativeDelta - 1;

    if (Math.abs(zoomNS.zoomCumulativeDelta) > sensitivity){
        if(zoomNS.zoomCumulativeDelta < 0){
            if(centerPointer <= chartCenter){
                if (minIndex <= 0){
                    maxIndex = Math.min(lastLabelIndex, maxIndex + 1);
                } else{
                    minIndex = Math.max(0, minIndex - 1);
                }
            } else if(centerPointer > chartCenter){
                if (maxIndex >= lastLabelIndex){
                    minIndex = Math.max(0, minIndex - 1);
                } else{
                    maxIndex = Math.min(lastLabelIndex, maxIndex + 1);
                }
            }
            zoomNS.zoomCumulativeDelta = 0;
        }
        else if(zoomNS.zoomCumulativeDelta > 0){
            if(centerPointer <= chartCenter){
                minIndex = minIndex < maxIndex ? minIndex = Math.min(maxIndex, minIndex + 1) : minIndex;
            } else if(centerPointer > chartCenter){
                maxIndex = maxIndex > minIndex ? maxIndex = Math.max(minIndex, maxIndex - 1) : maxIndex;
            }
            zoomNS.zoomCumulativeDelta = 0;
        }
        scale.options.ticks.min = labels[minIndex];
        scale.options.ticks.max = labels[maxIndex];
    }
}

module.exports = zoomIndexScale;