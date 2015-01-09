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
            graphs : rawConfig.graphs === undefined ? {} : rawConfig.graphs
        };
    }
    /**
     * Create the minimum canvas and desplay it
     * @param  {Object} $container jQuery node
     * @param  {Object} config     configuration ( cleaned )
     * @return {Object}            Paper ( RaphaelJS )
     */
    function createCanvas($container, config){

        var padding = 2;
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
            'stroke-width' : config.thickness || 3,
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
                $container = $(dom),
                self = this;

            /**
             * Initialize a new graphic element called grid with all needed
             * @param  {Object} $container jQuery node
             * @param  {Object} gridConfig Config (cleaned)
             */
            function initGrid($container, gridConfig){
                // @todo : Clear Everything

                var paper = createCanvas($container, gridConfig);
                var grid = gridFactory(paper, gridConfig);
                grid.clickable();


                grid.children.click(function(event){

                    // Get the coordinate for a click
                    var bnds = event.target.getBoundingClientRect(),
                        wfactor = paper.w / paper.width,
                        fx = Math.round((event.clientX - bnds.left) / bnds.width * grid.getWidth() * wfactor),
                        fy = Math.round((event.clientY - bnds.top) / bnds.height * grid.getHeight() * wfactor);


                    $(paper.canvas).trigger('click_grid', {x : fx, y : fy});

                    return;
                    var element = getWrapper(gridConfig.type);
                    element.initialize(paper, grid, {color : '#0f904a'});

                    self.on('configchange', function(){
                        element.destroy();
                    });

                    // @todo : Get the current set
                    // var activeSet = _.find(sets,{active : true});

                });

                return grid;
            }

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
                        $buttonContainer.data('uid', elementConfig.uid);
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
                                        lineColor : elementConfig.lineColor
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
                        }
                    });
                });

                var $btnContainers = $controlArea.children('.button-container');
                $btnContainers.children('.btn').on('click', function(){

                    var $btn = $(this),
                        $btnContainer = $btn.parent();

                    //toggle active class appearance
                    $btnContainers.removeClass('activated');
                    $btnContainer.addClass('activated');

                    //activate graphs (points, line etc)
                    if(graph){
                        graph.disactivate();
                    }
                    graph = $btnContainer.data('element');
                    graph.activate();
                    
                }).on('mouseenter', function(){
                    
                    var element = $(this).parent().data('element');
                    if(element){
                        element.highlightOn();
                    }
                    
                }).on('mouseleave', function(){
                    
                    var element = $(this).parent().data('element');
                    if(element && !element.isActive()){
                        element.highlightOff();
                    }
                });

            }

            grid = initGrid($container, this.config);
            initInteraction(grid, $container, this.config);

            this.on('configchange', function(options){
                self.config = buildGridConfig(options);
                grid = initGrid($container, self.config);
                initInteraction(grid, $container, self.config);
            });

            this.on('gridchange', function(config){
                self.config = config;
                initGrid($container, buildGridConfig(config));
            });


            //strange ...
            $('.pointAndLineFunctionInteraction').on('click', 'button', function(event){
                $container.trigger('elementchange', $(this).data('config'));
            });

            // var plotFactory = new PlotFactory(grid);
            //
            // //////////////////////////////////////
            // // How many lines set did we have ? //
            // //////////////////////////////////////
            // var sets = [];
            // $('[data-set-color]').each(function(){
            //     sets.push({
            //         color : $(this).data('set-color'),
            //         points : [],
            //         active : false
            //     });
            // }).click(function() {
            //     // Get the currently active set and inactivate it
            //     var previouslyActiveSet = _.find(sets,{active : true});
            //     previouslyActiveSet.active = false;
            //     // Iterate on every other items and remove the flow on points
            //     _.forEach(previouslyActiveSet.points,function(value){
            //         value.hideGlow();
            //     });
            //     // Activate the right set
            //     var newActiveSet = _.find(sets,{color : $(this).data('set-color')});
            //     newActiveSet.active = true;
            //     _.forEach(newActiveSet.points, function(value){
            //         value.showGlow();
            //     });
            // });
            // sets[0].active = true;
            // ///////////////////////////
            // // Catch the Click Event //
            // ///////////////////////////



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
