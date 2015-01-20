define([
    'IMSGlobal/jquery_2_1_1',
    'qtiCustomInteractionContext',
    'OAT/util/event',
    'OAT/lodash',
    'OAT/scale.raphael',
    'OAT/raphael',
    'PARCC/gridFactory',
    'graphLineAndPointInteraction/runtime/wrappers/setOfPoints',
    'graphLineAndPointInteraction/runtime/wrappers/points',
    'graphLineAndPointInteraction/runtime/wrappers/lines',
    'graphLineAndPointInteraction/runtime/wrappers/segments'
], function(
    $,
    qtiCustomInteractionContext,
    event,
    _,
    scaleRaphael,
    Raphael,
    gridFactory,
    setPointsWrapper,
    pointsWrapper,
    linesWrapper,
    segmentsWrapper
    ){

    'use strict';

    /**
     * Sanitize configuration
     * @param  {Object} rawConfig Raw Config from Authoring
     * @return {Object}           Cleaned config ready to use
     */
    function buildGridConfig(rawConfig){
        return {
            x : {
                start : rawConfig.xMin === undefined ? -10 : parseInt(rawConfig.xMin),
                end : rawConfig.xMax === undefined ? 10 : parseInt(rawConfig.xMax),
                unit : 20
            },
            y : {
                //the y-axis is reversed
                start : rawConfig.yMax === undefined ? 10 : -1 * parseInt(rawConfig.yMax),
                end : rawConfig.yMin === undefined ? -10 : -1 * parseInt(rawConfig.yMin),
                unit : 20
            },
            graphs : rawConfig.graphs === undefined ? {} : rawConfig.graphs,
            padding : 20
        };
    }
    /**
     * Create the minimum canvas and desplay it
     * @param  {Object} $container jQuery node
     * @param  {Object} config     configuration ( cleaned )
     * @return {Object}            Paper ( RaphaelJS )
     */
    function createCanvas($container, config){

        var padding = 2 * config.padding;
        var paper = scaleRaphael(
            $('.shape-container', $container)[0],
            (config.x.end - config.x.start) * config.x.unit + padding,
            (config.y.end - config.y.start) * config.y.unit + padding
            );

        //@todo make it responsive

        return paper;
    }

    /**
     * Dirty functiion to return the right wrapper for a given config element
     * @param  {String} type     Name of the element you want
     * @return {Object}         Wrapper corresponding to this element
     */
    function getWrapper(type){
        switch(type){
            case 'setPoints' :
                return setPointsWrapper;
            case 'points' :
                return pointsWrapper;
            case 'lines' :
                return linesWrapper;
            case 'segments' :
                return segmentsWrapper;
            default :
                throw 'invalid wrapper type';
        }
    }

    function drawLineStyle(dom, config){
        var w = 57, h = 20;
        var lineStylePaper = new Raphael(dom, w, h);
        var line = lineStylePaper.path('M0 ' + h / 2 + 'L' + w + ' ' + h / 2);
        line.attr({
            stroke : config.lineColor || '#000',
            'stroke-width' : config.lineWeight || 3,
            'stroke-dasharray' : config.lineStyle || '',
            opacity : config.opacity || 1
        });
    }

    var graphLineAndPointInteraction = {
        id : -1,
        getTypeIdentifier : function(){
            return 'graphLineAndPointInteraction';
        },
        /**
         * Render the PCI :
         * @param {String} id
         * @param {Node} dom
         * @param {Object} config - json
         */
        initialize : function(id, dom, config){

            this.id = id;
            this.dom = dom;
            this.config = buildGridConfig(config || {});

            //add method on(), off() and trigger() to the current object
            event.addEventMgr(this);

            var grid,
                graph,
                elements,
                $container = $(dom),
                self = this;

            /**
             * Initialize a new graphic element called grid with all needed
             * 
             * @param  {Object} $container jQuery node
             * @param  {Object} gridConfig Config (cleaned)
             */
            function initGrid($container, gridConfig){

                // @todo : Clear Everything
                elements = {};
                var paper = createCanvas($container, gridConfig);
                var grid = gridFactory(paper, gridConfig);
                var $canvas = $(paper.canvas);
                grid.clickable();
                grid.children.click(function(event){

                    // Get the coordinate for a click
                    var bnds = event.target.getBoundingClientRect(),
                        wfactor = paper.w / paper.width,
                        fx = grid.getX() + Math.round((event.clientX - bnds.left) / bnds.width * grid.getWidth() * wfactor),
                        fy = grid.getY() + Math.round((event.clientY - bnds.top) / bnds.height * grid.getHeight() * wfactor);

                    //transfer the click event to the paper    
                    $canvas.trigger('click_grid', {x : fx, y : fy});
                });

                $canvas.on('drawn.lines', function(e, line){
                    drawSolutionSet();
                });

                return grid;
            }

            /**
             * Init the interaction
             * 
             * @param {Object} grid - the grid object build from GridFactory
             * @param {Object} $cont - the container
             * @param {Object} options
             * @returns {undefined}
             */
            function initInteraction(grid, $cont, options){

                var $templates = $cont.find('.templates');

                // Remove all existing button
                var $controlArea = $cont.find('.shape-controls');
                $controlArea.empty();

                // Loop over all elements we have
                _.each(options.graphs, function(graphType, typeName){

                    var $template = $templates.find('.template-' + typeName);

                    _.each(graphType.elements, function(elementConfig){

                        var $buttonContainer = $template.children().first().clone();
                        var $button = $buttonContainer.children('.btn');
                        var $arrow = $buttonContainer.children('.triangle');
                        var color = elementConfig.lineColor || elementConfig.pointColor;

                        // Change attributes
                        $buttonContainer.attr('data-uid', elementConfig.uid);
                        $buttonContainer.data('config', elementConfig);
                        $button.text(elementConfig.label);
                        $button.css({backgroundColor : color});
                        $arrow.css({borderColor : 'transparent transparent transparent ' + color});

                        //configure change line style buttons (for lines and segments wrapper)
                        if(elementConfig.lineStyleToggle && elementConfig.lineStyleToggle !== 'false'){

                            $buttonContainer
                                .find('.line-styles')
                                .show()
                                .find('input[name=line-style]')
                                .attr('name', 'line-style-' + elementConfig.uid)
                                .change(function(){

                                    elementConfig.lineStyle = $(this).val();
                                    $buttonContainer.data('element').setLineStyle(elementConfig.lineStyle);
                                    $button.click();

                                }).each(function(){

                                var $input = $(this),
                                    $lineStyle = $input.siblings('.line-style'),
                                    style = $input.val();

                                drawLineStyle($lineStyle[0], {
                                    lineStyle : style,
                                    lineColor : elementConfig.lineColor,
                                    lineWeight : elementConfig.lineWeight
                                });

                                if(elementConfig.lineStyle === style){
                                    $input.prop('checked', true);
                                }
                            });

                        }

                        //insert into dom
                        $controlArea.append($buttonContainer);

                        //init element
                        if(typeName !== 'solutionSet'){
                            var wrapper = getWrapper(typeName);
                            var element = wrapper.initialize(grid, elementConfig);
                            $buttonContainer.data('element', element);
                            element.$buttonContainer = $buttonContainer;
                            elements[elementConfig.uid] = element;
                        }
                    });
                });


                $controlArea.on('click', '.button-container', function(){

                    activate($(this).data('element'));

                }).on('mouseenter', '.button-container', function(){

                    var element = $(this).data('element');
                    if(element){
                        element.highlightOn();
                    }

                }).on('mouseleave', '.button-container', function(){

                    var element = $(this).data('element');
                    if(element && !element.isActive()){
                        element.highlightOff();
                    }
                });

            }

            /**
             * Activate a graph element
             * 
             * @param {Object} element
             */
            function activate(element){

                if(graph){
                    graph.disactivate();
                }

                //toggle active class appearance
                element.$buttonContainer.addClass('activated');
                element.$buttonContainer.siblings('.button-container').removeClass('activated');

                //activate the element itself to allow interaction
                element.activate();

                graph = element;
            }

            function getElement(uid){
                return elements[uid];
            }

            /**
             * Get the current state of initialized element
             * 
             * @returns {Object}
             */
            function getState(){

                var state = {
                    activeGraph : graph ? graph.getId() : '',
                    elements : {}
                };

                _.each(elements, function(element){
                    state.elements[element.getId()] = element.getState();
                });

                return state;
            }

            /**
             * restore state of already initialized elements:
             * 
             * @param {Object} state
             * @param {Boolean} ignoreConfig
             */
            function setState(state, ignoreConfig){

                //restore element states
                _.forIn(state.elements, function(state, uid){
                    var element = getElement(uid);
                    if(element){
                        if(ignoreConfig){
                            delete state.config;
                        }
                        element.setState(state);
                    }
                });

                //restore the currently selected element
                if(state.activeGraph){
                    var currentActive = getElement(state.activeGraph);
                    if(currentActive){
                        //restore the active element:
                        activate(currentActive);
                    }
                }
            }

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

            function intersect(line1, line2){

                var x, y, eq1 = line1.equation, eq2 = line2.equation;

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

                        var bounds = grid.getGridBounds();
                        if(y > -bounds.y.end){
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
                            if(nextDirection.equation[0] > previousDirection.equation[0]){
                                ascendingX = !ascendingX;
                            }
                            next = ascendingX ? siblings.next : siblings.previous;
                            console.log('debug', ascendingX, previousDirection, siblings);
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

            function withinGrid(intersection, grid){
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
                    pathStr += coords[0]+','+coords[1];
                });
                pathStr += 'z';
                return pathStr;
            }
            
            function convertPath(pathArray){
                
                //translate coord
                
                return pathArray;
            }
            
            function drawSolutionSet(){

                var intersectingLines = [],
                    intersections = [],
                    closedPaths = [];

                //get drawn lines and their intersectingLines
                _.each(_.where(elements, {type : 'line'}), function(line){
                    var drawnLine = line.getLine();
                    if(drawnLine){
                        intersectingLines.push(createIntersectingLine(drawnLine));
                    }
                });

                //include graph borders intersectingLines
                intersectingLines.push(createIntersectingLine(getHorizontalEquation(self.config.y.start)));
                intersectingLines.push(createIntersectingLine(getHorizontalEquation(self.config.y.end)));
                intersectingLines.push(createIntersectingLine(getVerticalEquation(self.config.x.start)));
                intersectingLines.push(createIntersectingLine(getVerticalEquation(self.config.x.end)));

                //get all intersection points (on graph)
                while(intersectingLines.length){
                    var line1 = intersectingLines.pop();
                    _.each(intersectingLines, function(line2){
                        var intersection = intersect(line1, line2);
                        if(intersection && withinGrid(intersection, grid)){

                            //add the intersection to the associated lines:
                            line1.addIntersection(intersection);
                            line2.addIntersection(intersection);

                            //append interactions stack
                            intersections.push(intersection);
                        }
                    });
                }
                console.log(intersections);

                //calculate all shape coord
                _.each(intersections, function(intersection){
                    var closedPath = getClosedPath(intersection);
                    if(closedPath.length){
                        closedPath = convertPath(closedPath);
                        closedPaths.push(zipPath(closedPath));
                        
                        return true;
                        grid.getCanvas().path(closedPath).attr({
                            stroke : '#333',
                            fill : '#ddd',
                            'fill-opacity' : .6
                        });
                    }
                });
                console.log(closedPaths);

                //draw shape coord
            }

            grid = initGrid($container, this.config);
            initInteraction(grid, $container, this.config);

            this.on('configchange', function(newConfig){

                var state = getState();
                self.config = newConfig ? buildGridConfig(newConfig) : self.config;
                grid = initGrid($container, self.config);
                initInteraction(grid, $container, self.config);
                setState(state, true);
            });

            this.on('gridchange', function(newConfig){

                self.config = newConfig ? buildGridConfig(newConfig) : self.config;
                grid = initGrid($container, self.config);
                initInteraction(grid, $container, self.config);
            });

            drawSolutionSet();
        },
        /**
         * Programmatically set the response following the json schema described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         *
         * @param {Object} interaction
         * @param {Object} response
         */
        setResponse : function(response){

        },
        /**
         * Get the response in the json format described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         *
         * @param {Object} interaction
         * @returns {Object}
         */
        getResponse : function(){

            var value = 0;

            return {base : {integer : value}};
        },
        /**
         * Remove the current response set in the interaction
         * The state may not be restored at this point.
         *
         * @param {Object} interaction
         */
        resetResponse : function(){

        },
        /**
         * Reverse operation performed by render()
         * After this function is executed, only the inital naked markup remains
         * Event listeners are removed and the state and the response are reset
         *
         * @param {Object} interaction
         */
        destroy : function(){

            var $container = $(this.dom);
            $container.off().empty();
        },
        /**
         * Restore the state of the interaction from the serializedState.
         *
         * @param {Object} interaction
         * @param {Object} serializedState - json format
         */
        setSerializedState : function(state){

        },
        /**
         * Get the current state of the interaction as a string.
         * It enables saving the state for later usage.
         *
         * @param {Object} interaction
         * @returns {Object} json format
         */
        getSerializedState : function(){

            return {};
        }
    };

    qtiCustomInteractionContext.register(graphLineAndPointInteraction);
});
