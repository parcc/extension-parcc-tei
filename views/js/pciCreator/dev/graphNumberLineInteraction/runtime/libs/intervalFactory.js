define(['OAT/lodash'], function(_){

    var _defaults = {
        color : '#00f',
        thickness : 5,
        offset : 7, //offset in pixel:
    };

    function IntervalFactory(axis, config){

        var config = _.defaults(config || {}, _defaults);
        var paper = axis.getCanvas();
        var set = paper.set();

        function _applyStyle(path){
            path.attr({
                stroke : config.color,
                'stroke-width' : config.thickness
            });
        }

        var plots = {
            'closed-closed' : function(min, max){

                var minPosition = axis.coordinateToPosition(min);
                var maxPosition = axis.coordinateToPosition(max);
                var pathStr = 'M' + (minPosition.left + config.offset) + ',' + minPosition.top;
                pathStr += 'L' + (maxPosition.left - config.offset) + ',' + maxPosition.top;

                var path = paper.path(pathStr);
                _applyStyle(path)
                set.push(path);

                return path;
            },
            'closed-open' : function(min, max){

            },
            'arrow-open' : function(max){

            },
            'closed-arrow' : function(min){

            }
        };

        this.plot = function(intervalType, min, max){
            return plots[intervalType](min, max);
        };
    }

    return IntervalFactory;
});