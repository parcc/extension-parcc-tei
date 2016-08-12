define(['IMSGlobal/jquery_2_1_1', 'OAT/lodash', 'PARCC/pointFactory'], function($, _, pointFactory){

    var _defaults = {
        color : '#00f',
        thickness : 5,
        offset : 7 //offset in pixel:
    };

    function IntervalFactory(axis, config){

        var config = _.defaults(config || {}, _defaults);
        var paper = axis.getCanvas();
        var set = paper.set();
        var $canvas = $(paper.canvas);
        
        /**
         * Apply the configured style to the path
         * 
         * @param {object} path - raphael path object
         */
        function _applyStyle(path){
            path.attr({
                stroke : config.color,
                'stroke-width' : config.thickness
            });
        }
        
        /**
         * Get the position object {top, left} in pixels 
         * 
         * @param {integer} x
         * @param {boolean} cartesian
         * @returns {object}
         */
        function getPosition(x, cartesian){
            var position;
            if(cartesian){
                position =  axis.coordinateToPosition(x);
            }else{
                position =  {
                    top : axis.getOriginPosition().top,
                    left : x
                };
            }
            return position;
        }
        
        /**
         * Draw the line that goes through two points
         * 
         * @param {object} position1
         * @param {object} position2
         * @returns {object}
         */
        function drawLine(position1, position2){

            var startPosition, endPosition;

            if(position1.left < position2.left){
                startPosition = position1;
                endPosition = position2;
            }else{
                startPosition = position2;
                endPosition = position1;
            }

            var pathStr = 'M' + (startPosition.left + config.offset) + ',' + startPosition.top;
            pathStr += 'L' + (endPosition.left - config.offset) + ',' + endPosition.top;

            var path = paper.path(pathStr);
            _applyStyle(path);
            set.push(path);

            return path;

        }
        
        /**
         * Draw the orientation
         * 
         * @param {string} orientation
         * @returns {unresolved}
         */
        function drawArrow(orientation){

            var arrow = axis.buildArrow(orientation);
            set.push(arrow);
            _applyStyle(arrow);

            return arrow;
        }
        
        /**
         * Build a point
         * 
         * @param {integer} position - in cartesian unit
         * @param {string} fill - color code
         * @param {function} [drag] - callback function on drag
         * @param {function} [dragStop] - callback function on drag stop
         * @returns {object} point object
         */
        function buildPoint(position, fill, drag, dragStop){

            var top = axis.getOriginPosition().top;
            var pointConfig = {
                axis : 'x',
                glow : true,
                fill : !!fill,
                color : config.color,
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
        
        /**
         * Build an interval limited by its min and max value
         * 
         * @param {string} min - lowerbound in cartesian unit
         * @param {string} max - upperbound in cartesian unit
         * @returns {object}
         */
        function buildFiniteInterval(min, max){

            var start = getPosition(min.coord, true);
            var end = getPosition(max.coord, true);
            var set = paper.set(),
                active = false,
                line;
            //the coord var stores the currently selected interval in the cartesian coord
            var coord = {
                start : min.coord,
                end : max.coord
            };
            var _interval =  {
                enable : enable,
                disable : disable,
                destroy : destroy,
                getCoordinates : getCoordinates
            };

            var pointMin = buildPoint(min.coord, !min.open, function(dx){
                start.left += dx;
                _drawLine();
            }, function(x){
                start.left = x;
                _drawLine();
                pointMax.setOption('xMin', x + .5 * axis.getUnits().x);
                
                //responseChange
                coord.start = this.getCartesianCoord().x;
                $canvas.trigger('change.interval', [_interval]);
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
                pointMin.setOption('xMax', x - .5 * axis.getUnits().x);
                
                //responseChange
                coord.end = this.getCartesianCoord().x;
                $canvas.trigger('change.interval', [_interval]);
            });
            pointMax.setOption('xMin', getPosition(min.coord + .5, true).left);
            pointMax.setOption('xMax', getPosition(axis.getMax(), true).left);
            set.push(pointMax.children);

            _drawLine();
            enable();
            
            /**
             * draw the line between the two tips of the segment 
             */
            function _drawLine(){
                if(line){
                    line.remove();
                }
                line = drawLine(start, end);
                set.push(line);
            }
            
            /**
             * activate the interval
             */
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
            
            /**
             * disable the interval
             */
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
            
            /**
             * destroy and remove the interval
             */
            function destroy(){
                set.remove().clear();
            }
            
            /**
             * Get start and end of the segment (in cartesian unit)
             * 
             * @returns {object}
             */
            function getCoordinates(){
                return _.clone(coord);
            }
            
            return _interval;
        }
        
        /**
         * Build an interval limited by its tip position and its arrow orientation
         * 
         * @param {integer} pt - the tip in cartesian unit
         * @param {string} orientation - the arrow orientation
         * @returns {object}
         */
        function buildInfiniteInterval(pt, orientation){

            var pos = getPosition(pt.coord, true);
            var right = (orientation === 'right');
            var tip = getPosition(right ? axis.getMax() + .5 : axis.getMin() - .5, true);
            //the coord var stores the currently selected interval in the cartesian coord
            var coord = pt.coord;
            var _interval =  {
                enable : enable,
                disable : disable,
                destroy : destroy,
                getCoordinates : getCoordinates
            };
            var set = paper.set(),
                active = false,
                line;
            var arrow = drawArrow(right ? 'right' : 'left');
            var point = buildPoint(pt.coord, !pt.open, function(dx){
                pos.left += dx;
                _drawLine();
            }, function(x){
                pos.left = x;
                _drawLine();
                
                //response change
                coord = this.getCartesianCoord().x;
                $canvas.trigger('change.interval', [_interval]);
            });
            
            set.push(arrow);
            set.push(point.children);
            
            _drawLine();
            enable();
            
            /**
             * draw the line betwen the tip and arrow
             */
            function _drawLine(){
                if(line){
                    line.remove();
                }
                line = drawLine(pos, tip);
                set.push(line);
            }
            
            /**
             * activate the interval
             */
            function enable(){
                if(!active){
                    //set active style
                    point.showGlow();

                    //bind draggable
                    point.drag();

                    //change status
                    active = true;
                }
            }
            
            /**
             * disable the interval
             */
            function disable(){
                if(active){
                    //set unactive style
                    point.hideGlow();

                    //bind draggable
                    point.unDrag();

                    //change status
                    active = false;
                }
            }
            
            /**
             * destroy and remove the interval
             */
            function destroy(){
                set.remove().clear();
            }
            
            /**
             * Get start and end of the segment (in cartesian unit)
             * The arrow is represented by the "null" value
             * @returns {object}
             */
            function getCoordinates(){
                return {
                    start : right ? coord : null,
                    end : !right ? coord : null
                };
            }

            return _interval;
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
            'open-closed' : function(min, max){
                return buildFiniteInterval({
                    coord : min,
                    open : true
                }, {
                    coord : max,
                    open : false
                });
            },
            'open-open' : function(min, max){
                return buildFiniteInterval({
                    coord : min,
                    open : true
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
            'arrow-closed' : function(max){
                return buildInfiniteInterval({
                    coord : max,
                    open : false
                }, 'left');
            },
            'closed-arrow' : function(min){
                 return buildInfiniteInterval({
                    coord : min,
                    open : false
                }, 'right');
            },
            'open-arrow' : function(min){
                 return buildInfiniteInterval({
                    coord : min,
                    open : true
                }, 'right');
            }
        };
        
        /**
         * Create and draw an interval
         * 
         * @param {string} intervalType
         * @param {integer} min
         * @param {integer} max
         * @returns {object} the interval object
         */
        this.plot = function plot(intervalType, min, max){
            return plots[intervalType](min, max);
        };
        
        /**
         * remove ALL intervals create by the factory
         */
        this.clear = function clear(){
            if(set.length > 0){
                set.remove().clear();
            }
        };
    }

    return IntervalFactory;
});