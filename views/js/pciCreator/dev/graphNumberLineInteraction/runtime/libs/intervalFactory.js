define(['OAT/lodash', 'PARCC/pointFactory'], function(_, pointFactory){

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

        function getPosition(x, cartesian){
            if(cartesian){
                return axis.coordinateToPosition(x);
            }else{
                return {
                    top : axis.getOriginPosition().top,
                    left : x
                };
            }
        }

        function drawLine(startPosition, endPosition){

            var pathStr = 'M' + (startPosition.left + config.offset) + ',' + startPosition.top;
            pathStr += 'L' + (endPosition.left - config.offset) + ',' + endPosition.top;

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

        function buildPoint(position, drag, dragStop){

            var top = axis.getOriginPosition().top;
            var pointConfig = {
                axis : 'x',
                glow : true,
                fill : false,
                color : '#266d9c',
                glowOpacity : .1,
                removable : false,
                on : {
                    drag : drag || _.noop,
                    dragStop : dragStop || _.noop
                }
            };
            pointConfig = _.defaults(pointConfig, {});

            var point = pointFactory(paper, axis, pointConfig);
            point.setCartesianCoord(position, top, pointConfig);
            point.render();

            //register and return the set:
            set.push(point.children);
            return point;
        }

        var plots = {
            'closed-closed' : function(min, max){

                var start = getPosition(min, true);
                var end = getPosition(max, true);
                var line;

                function _drawLine(){
                    if(line){
                        line.remove();
                    }
                    line = drawLine(start, end);
                }

                var pointMin = buildPoint(min, function(dx){
                    start.left += dx;
                    _drawLine();
                },function(x){
                    pointMax.setOption('xMin', x + .5 * axis.getUnitSizes().x);
                });
                pointMin.setOption('xMin', getPosition(axis.getMin(), true).left);
                pointMin.setOption('xMax', getPosition(max - .5, true).left);

                var pointMax = buildPoint(max, function(dx){
                    end.left += dx;
                    _drawLine();
                }, function(x){
                    pointMin.setOption('xMax', x - .5 * axis.getUnitSizes().x);
                });
                pointMax.setOption('xMin', getPosition(min + .5, true).left);
                pointMax.setOption('xMax', getPosition(axis.getMax(), true).left);
                
                _drawLine();
                activate();

                function activate(){

                    //set active style
                    pointMin.showGlow();
                    pointMax.showGlow();

                    //bind draggable
                    pointMin.drag();
                    pointMax.drag();
                }

                function deactivate(){

                    //set unactive style
                    pointMin.hideGlow();
                    pointMax.hideGlow();

                    //bind draggable
                    pointMin.undrag();
                    pointMax.undrag();
                }
            },
            'closed-open' : function(min, max){

            },
            'arrow-open' : function(max){

            },
            'closed-arrow' : function(min){
                var point = buildPoint(min);
                var line = drawLine(min, axis.getMax() + .5, true);//extent toward the arrow to compensate for the offset
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