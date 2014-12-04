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

        function buildPoint(position, fill, drag, dragStop){

            var top = axis.getOriginPosition().top;
            var pointConfig = {
                axis : 'x',
                glow : true,
                fill : !!fill,
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

        function buildFiniteInterval(min, max){

            var start = getPosition(min.coord, true);
            var end = getPosition(max.coord, true);
            var set = paper.set(),
                active = false,
                line;

            function _drawLine(){
                if(line){
                    line.remove();
                }
                line = drawLine(start, end);
                set.push(line);
            }

            var pointMin = buildPoint(min.coord, !min.open, function(dx){
                start.left += dx;
                _drawLine();
            }, function(x){
                start.left = x;
                _drawLine();
                pointMax.setOption('xMin', x + .5 * axis.getUnitSizes().x);
            });
            pointMin.setOption('xMin', getPosition(axis.getMin(), true).left);
            pointMin.setOption('xMax', getPosition(max.coord - .5, true).left);
            set.push(pointMin.children);

            var pointMax = buildPoint(max.coord, !max.open, function(dx){
                end.left += dx;
                _drawLine();
            }, function(x){
                end.left = x;
                _drawLine();
                pointMin.setOption('xMax', x - .5 * axis.getUnitSizes().x);
            });
            pointMax.setOption('xMin', getPosition(min.coord + .5, true).left);
            pointMax.setOption('xMax', getPosition(axis.getMax(), true).left);
            set.push(pointMax.children);

            _drawLine();
            enable();

            function enable(){
                if(!active){
                    //set active style
                    pointMin.showGlow();
                    pointMax.showGlow();

                    //bind draggable
                    pointMin.drag();
                    pointMax.drag();

                    //change status
                    active = true;
                }
            }

            function disable(){
                if(active){
                    //set unactive style
                    pointMin.hideGlow();
                    pointMax.hideGlow();

                    //bind draggable
                    pointMin.unDrag();
                    pointMax.unDrag();

                    //change status
                    active = false;
                }
            }

            function destroy(){
                set.remove().clear();
            }

            return {
                enable : enable,
                disable : disable,
                destroy : destroy
            };

        }

        function buildInfiniteInterval(end, orientation){

        }

        var plots = {
            'closed-closed' : function(min, max){
                return buildFiniteInterval({
                    coord : min,
                    open : false
                }, {
                    coord : max,
                    open : false
                });
            },
            'closed-open' : function(min, max){
                return buildFiniteInterval({
                    coord : min,
                    open : false
                }, {
                    coord : max,
                    open : true
                });
            },
            'arrow-open' : function(max){
                return buildInfiniteInterval({
                    coord : max,
                    open : true
                }, 'left');
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