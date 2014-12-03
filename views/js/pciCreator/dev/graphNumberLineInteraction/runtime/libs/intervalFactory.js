define(['OAT/lodash', 'PARCC/pointFactory',], function(_, pointFactory){

    var _defaults = {
        color : '#00f',
        thickness : 5,
        offset : 7 //offset in pixel:
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

        function drawLine(from, to){

            var minPosition = axis.coordinateToPosition(from);
            var maxPosition = axis.coordinateToPosition(to);
            var pathStr = 'M' + (minPosition.left + config.offset) + ',' + minPosition.top;
            pathStr += 'L' + (maxPosition.left - config.offset) + ',' + maxPosition.top;

            var path = paper.path(pathStr);
            _applyStyle(path);
            set.push(path);

            return path;

        }

        function drawArrow(orientation){

            var arrow = axis.buildArrow(orientation);
            set.push(arrow);
            _applyStyle(arrow);

            return arrow;
        }

        function drawPoint(position){

            var top = axis.getOriginPosition().top;
            var pointConfig = {
                axis : 'x',
                glow : true,
                fill : false,
                color : '#266d9c',
                glowOpacity : .1,
                on : {
                    dragStart : dragStart,
                    dragStop : dragStop
                }
            };
            pointConfig = _.defaults(pointConfig, {});

            var point = pointFactory(paper, axis, pointConfig);
            point.setCartesianCoord(position, top, pointConfig);

            point.render();
            point.drag();
            
            //register and return the set:
            set.push(point.children);
            return point.children;
        }
        
        function dragStart(){
            //need to redraw itself plus bound line + arrow
        }
        
        function dragStop(){
            
        }

        var plots = {
            'closed-closed' : function(min, max){
                var pointMin = drawPoint(min);
                var pointMax = drawPoint(max);
                var line = drawLine(min, max);
                return paper.set().push(pointMin, line, pointMax);
            },
            'closed-open' : function(min, max){

            },
            'arrow-open' : function(max){

            },
            'closed-arrow' : function(min){
                var point = drawPoint(min);
                var line = drawLine(min, axis.getMax() + .5);//extent toward the arrow to compensate for the offset
                var arrow = drawArrow('right');
                return paper.set().push(point, line, arrow);
            }
        };

        this.plot = function(intervalType, min, max){
            return plots[intervalType](min, max);
        };

        this.clear = function(){
            if(set.length > 0){
                set.remove().clear();
            }
        };
    }

    return IntervalFactory;
});