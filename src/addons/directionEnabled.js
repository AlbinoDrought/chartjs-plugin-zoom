/**
 * Created by Sean on 2/2/2017.
 */
function directionEnabled(mode, dir) {
    if (mode === undefined) {
        return true;
    } else if (typeof mode === 'string') {
        return mode.indexOf(dir) !== -1;
    }

    return false;
}

module.exports = directionEnabled;