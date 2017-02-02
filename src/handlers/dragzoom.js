/**
 * Created by Sean on 2/2/2017.
 */
module.exports = {
    isEnabled: function(chartInstance) {
        var options = chartInstance.options;

        return options.zoom.enabled && options.zoom.drag;
    },

    beforeInit: function(chartInstance) {
        var node = chartInstance.zoom.node = chartInstance.chart.ctx.canvas;
        var options = chartInstance.options;

        // Only want to zoom horizontal axis
        options.zoom.mode = 'x';

        chartInstance.zoom._mouseDownHandler = function(event) {
            chartInstance.zoom._dragZoomStart = event;
        };
        node.addEventListener('mousedown', chartInstance.zoom._mouseDownHandler);

        chartInstance.zoom._mouseMoveHandler = function(event){
            if (chartInstance.zoom._dragZoomStart) {
                chartInstance.zoom._dragZoomEnd = event;
                chartInstance.update(0);
            }
        };
        node.addEventListener('mousemove', chartInstance.zoom._mouseMoveHandler);

        chartInstance.zoom._mouseUpHandler = function(event){
            if (chartInstance.zoom._dragZoomStart) {
                var chartArea = chartInstance.chartArea;
                var yAxis = chartInstance.getYAxis();
                var beginPoint = chartInstance.zoom._dragZoomStart;
                var offsetX = beginPoint.target.getBoundingClientRect().left;
                var startX = Math.min(beginPoint.clientX, event.clientX) - offsetX;
                var endX = Math.max(beginPoint.clientX, event.clientX) - offsetX;
                var dragDistance = endX - startX;
                var chartDistance = chartArea.right - chartArea.left;
                var zoom = 1 + ((chartDistance - dragDistance) / chartDistance );

                chartInstance.zoom._dragZoomStart = null;
                chartInstance.zoom._dragZoomEnd = null;

                if (dragDistance > 0) {
                    chartInstance.doZoom(zoom, {
                        x: (dragDistance / 2) + startX,
                        y: (yAxis.bottom - yAxis.top) / 2,
                    });
                }
            }
        };
        node.addEventListener('mouseup', chartInstance.zoom._mouseUpHandler);
    },

    beforeDatasetsDraw: function(chartInstance) {
        if (!chartInstance.zoom._dragZoomEnd) return;

        var ctx = chartInstance.chart.ctx;

        var yAxis = chartInstance.getYAxis();
        var beginPoint = chartInstance.zoom._dragZoomStart;
        var endPoint = chartInstance.zoom._dragZoomEnd;
        var offsetX = beginPoint.target.getBoundingClientRect().left;
        var startX = Math.min(beginPoint.clientX, endPoint.clientX) - offsetX;
        var endX = Math.max(beginPoint.clientX, endPoint.clientX) - offsetX;
        var rectWidth = endX - startX;

        ctx.fillStyle = 'rgba(225,225,225,0.3)';
        ctx.lineWidth = 5;
        ctx.fillRect(startX, yAxis.top, rectWidth, yAxis.bottom - yAxis.top);
    },

    destroy: function(chartInstance) {
        var node = chartInstance.zoom.node;

        node.removeEventListener('wheel', chartInstance.zoom._wheelHandler);
    }
};