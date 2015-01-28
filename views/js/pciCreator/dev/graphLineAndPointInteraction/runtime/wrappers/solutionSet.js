define([
    'IMSGlobal/jquery_2_1_1',
    'OAT/lodash'
], function($, _){

    'use strict';
    
    var _debug = false;
    
    var _defaults = {
        color : '#326399',
    };

    var _style = {
        opacityDefault : _debug ? .1 : 0,
        opacityHover : .3,
        opacitySelected : .6
    };

    function getHorizontalEquation(y){
        y = -y;
        var equation = [0, y];
        equation.type = 'linear';
        return {
            equation : equation,
            uid : 'horizontal_' + y
        };
    }

    function getVerticalEquation(x){
        var equation = [x];
        equation.type = 'vertical';
        return {
            equation : equation,
            uid : 'vertical_' + x
        };
    }

    function _round(num){
        return Math.round(num * 100) / 100;
    }

    function intersect(grid, line1, line2){

        var bounds = grid.getGridBounds(),
            x,
            y,
            eq1 = line1.equation,
            eq2 = line2.equation;

        //parallel lines :
        if(eq1.type === eq2.type && (eq1.type === 'vertical' || eq1[0] === eq2[0])){
            return;
        }

        if(eq1.type === eq2.type){
            //linear equation
            x = (eq1[1] - eq2[1]) / (eq2[0] - eq1[0]);
            y = eq1[0] * x + eq1[1];
        }else{
            //one linear, one vertical
            var vertical, linear;
            if(eq1.type === 'vertical'){
                vertical = eq1;
                linear = eq2;
            }else{
                vertical = eq2;
                linear = eq1;
            }
            x = vertical[0];
            y = linear[0] * vertical[0] + linear[1];
        }

        var intersection = {
            uid : _.uniqueId('intersection_'),
            x : _round(x),
            y : _round(y),
            lines : [line1, line2],
            initCircling : function initCircling(){

                var nextDirection, siblings, next;

                //take the equation that has the highest angle
                if(line1.type === 'vertical'){
                    nextDirection = line2;
                }else if(line2.type === 'vertical'){
                    nextDirection = line1;
                }else if(line1.equation[0] > line2.equation[0]){
                    nextDirection = line1;
                }else if(line2.equation[0] > line1.equation[0]){
                    nextDirection = line2;
                }else{
                    throw 'unexpected situation';
                }

                if(y > -bounds.y.end || y === -bounds.y.end && nextDirection.equation[0] > 0){
                    //allow init for points that are inside the grid
                    siblings = nextDirection.getSiblings(intersection);
                    next = siblings.next;
                }

                return {
                    point : next,
                    direction : nextDirection,
                    ascendingX : true
                };
            },
            next : function next(previousDirection, ascendingX){

                ascendingX = !!ascendingX;

                var nextDirection,
                    next;

                if(previousDirection){
                    //try changing direction
                    if(line1.uid === previousDirection.uid){
                        nextDirection = line2;
                    }else{
                        nextDirection = line1;
                    }
                }

                var siblings = nextDirection.getSiblings(intersection);
                if(nextDirection.type === 'linear'){
                    if(previousDirection.type === 'linear' && nextDirection.equation[0] > previousDirection.equation[0]){
                        ascendingX = !ascendingX;
                    }
                    next = ascendingX ? siblings.next : siblings.previous;
                }else if(nextDirection.type === 'vertical'){
                    ascendingX = !ascendingX;
                    next = ascendingX ? siblings.next : siblings.previous;
                }

                return {
                    point : next,
                    direction : nextDirection,
                    ascendingX : ascendingX
                };
            }
        };

        return intersection;

    }

    function withinGrid(grid, intersection){
        var bounds = grid.getGridBounds();
        if(bounds.x.start <= intersection.x && intersection.x <= bounds.x.end
            && -bounds.y.end <= intersection.y && intersection.y <= -bounds.y.start){
            return true;
        }
        return false;
    }

    function getClosedPath(intersection){

        //determine next point
        var path = [];
        var current = intersection.initCircling();

        var i = 0;

        if(current.point){
            path.push([intersection.x, intersection.y]);
            while(current.point.x !== intersection.x || current.point.y !== intersection.y){

                //append path
                path.push([current.point.x, current.point.y]);

                //increment
                var next = current.point.next(current.direction, current.ascendingX);
                var current = next;
                i++;

                //security:
                if(i > 20){
                    break;
                }
            }
        }

        return path;
    }

    function createIntersectingLine(drawnLine){

        var intersections = [];
        var sorted = false;

        var intersectingLine = {
            equation : drawnLine.equation,
            type : drawnLine.equation.type,
            uid : drawnLine.uid
        };

        intersectingLine.addIntersection = function addIntersection(intersection){
            intersections.push(intersection);
            sorted = false;
        };

        intersectingLine.getSiblings = function getSiblings(intersection){

            var previous, next, index;

            if(!sorted){
                //sort by ascending "x"
                if(drawnLine.equation.type === 'vertical'){
                    intersections = _.sortBy(intersections, 'y');
                }else{
                    //linear
                    intersections = _.sortBy(intersections, 'x');
                }
            }

            //find the index of the intersection point in the line
            index = _.findIndex(intersections, function(i){
                return i.uid === intersection.uid;
            });

            //find the previous
            if(index === 0){
                next = intersections[1];
            }else if(index === intersections.length - 1){
                previous = intersections[intersections.length - 2];
            }else if(index > 0){
                previous = intersections[index - 1];
                next = intersections[index + 1];
            }

            return {
                previous : previous,
                next : next
            };
        }

        return intersectingLine;
    }

    function zipPath(pathArray){
        var pathStr = '';
        _.forIn(pathArray, function(coords, i){
            if(i == 0){
                pathStr += 'M'
            }else{
                pathStr += 'L'
            }
            pathStr += coords[0] + ',' + coords[1];
        });
        pathStr += 'z';
        return pathStr;
    }

    function convertPath(grid, pathArray){

        var positionArray = []
        _.each(pathArray, function(coord){
            var pos = grid.getPostionFromCartesian(coord[0], coord[1]);
            positionArray.push([pos.left, pos.top]);
        });
        return positionArray;
    }

    function drawSolutionSet(grid, lines, config){

        var paper = grid.getCanvas(),
            intersectingLines = [],
            intersections = [],
            areas = [],
            bounds = grid.getGridBounds();

        //get drawn lines and their intersectingLines
        _.each(lines, function(line){
            var drawnLine = line.getLine();
            if(drawnLine){
                intersectingLines.push(createIntersectingLine(drawnLine));
            }
        });

        //include graph borders intersectingLines
        intersectingLines.push(createIntersectingLine(getHorizontalEquation(bounds.y.start)));
        intersectingLines.push(createIntersectingLine(getHorizontalEquation(bounds.y.end)));
        intersectingLines.push(createIntersectingLine(getVerticalEquation(bounds.x.start)));
        intersectingLines.push(createIntersectingLine(getVerticalEquation(bounds.x.end)));

        //get all intersection points (on graph)
        while(intersectingLines.length){
            var line1 = intersectingLines.pop();
            _.each(intersectingLines, function(line2){
                var intersection = intersect(grid, line1, line2);
                if(intersection && withinGrid(grid, intersection)){

                    //add the intersection to the associated lines:
                    line1.addIntersection(intersection);
                    line2.addIntersection(intersection);

                    //append interactions stack
                    intersections.push(intersection);
                }
            });
        }

        //calculate all shape coord
        _.each(intersections, function(intersection){
            var closedPath = getClosedPath(intersection);
            if(closedPath.length){

                //format and transform path
                closedPath = convertPath(grid, closedPath);
                closedPath = zipPath(closedPath);

                //draw shape from path
                var area = paper.path(closedPath).attr({
                    fill : config.color,
                    opacity : _style.opacityDefault
                });
                area.selected = false;
                
                if(_debug){
                    area.attr({stroke : '#222'});
                }
                
                //add event listener
                $(area[0]).on('mouseenter', function(){
                    area.attr({
                        opacity : _style.opacityHover
                    });
                }).on('mouseleave', function(){
                    area.attr({
                        opacity : area.selected ? _style.opacitySelected : _style.opacityDefault
                    });
                }).on('click', function(){
                    //toggle selection:
                    if(area.selected){
                        area.selected = false;
                        area.attr({
                            opacity : _style.opacityDefault
                        });
                    }else{
                        area.selected = true;
                        area.attr({
                            opacity : _style.opacitySelected
                        });
                    }
                });


                //push to stack
                areas.push(area);
            }
        });

        return areas;
    }

    function initialize(grid, config){

        var areas = [],
            active = false,
            uid = config.uid,
            paper = grid.getCanvas(),
            $paperCanvas = $(paper.canvas),
            set = paper.set(),
            line;

        function setConfig(cfg){
            config = _.defaults(cfg, _defaults);
        }

        function createSolutionSet(elements){
            areas = drawSolutionSet(grid, _.where(elements, {type : 'line'}), config);
            _.each(areas, function(area){
                set.push(area);
            });
        }
        
        function clearSolutionSet(){
            set.remove().clear();
        }
        
        setConfig(config);
        
        $paperCanvas.on('drawn.lines removed.lines', clearSolutionSet);
        
        var linesWrapper = {
            type : 'line',
            getId : function(){
                return uid;
            },
            getLine : function(){
                return line;
            },
            isActive : function(){
                return active;
            },
            activate : function(elements){
                if(!set.length){
                    createSolutionSet(elements);
                }
                grid.toFront(set);
                active = true;
            },
            disactivate : function(){
                grid.toBack(set);
                active = false;
            },
            destroy : function(){

            },
            highlightOn : function(){

            },
            highlightOff : function(){

            },
            getState : function(){

                return {
                    config : _.cloneDeep(config)
                };
            },
            setState : function(state){

                if(state.config){
                    setConfig(state.config);
                }
            }
        };

        return linesWrapper;
    }

    return {
        initialize : initialize
    };

});