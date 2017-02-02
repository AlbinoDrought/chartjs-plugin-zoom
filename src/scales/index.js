/**
 * Created by Sean on 2/2/2017.
 */
module.exports = {
    zoomFunctions: {
        // does not currently work
        // category: require('./index/zoom'),

        time: require('./time/zoom'),

        linear: require('./numerical/zoom'),
        logarithmic: require('./numerical/zoom'),
    },
    panFunctions: {
        // does not currently work
        // category: require('./index/pan'),

        time: require('./time/pan'),

        linear: require('./numerical/pan'),
        logarithmic: require('./numerical/pan'),
    },
};