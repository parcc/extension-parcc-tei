define([
    'IMSGlobal/jquery_2_1_1',
    'qtiCustomInteractionContext',
    'OAT/lodash',
    'OAT/util/event',
    'OAT/scale.raphael',
    'PARCC/pointFactory',
    'graphZoomNumberLineInteraction/runtime/libs/axisFactory',
    'graphZoomNumberLineInteraction/runtime/libs/axisZoom'
], function($, qtiCustomInteractionContext, _, event, scaleRaphael, pointFactory, axisFactory, axisZoom){

    function createCanvas($container, config){

        var padding = 2;
        var paper = scaleRaphael(
            $('.shape-container', $container)[0],
            610,
            260
            );

        //@todo make it responsive

        return paper;
    }

    function buildAxisConfig(rawConfig){

        var _color = rawConfig.graphColor || '#266d9c';

        return {
            min : 0,
            max : 10,
            top : 60,
            left : 50,
            unitSize : 50,
            unitSubDivision : 2,
            arrows : true,
            plot : {
                color : _color,
                thickness : rawConfig.graphWidth || 5
            },
            point : {
                color : _color,
                radius : 10
            }
        };
    }

    var graphZoomNumberLineInteraction = {
        id : -1,
        getTypeIdentifier : function(){
            return 'graphZoomNumberLineInteraction';
        },
        /**
         * Render the PCI : 
         * @param {String} id
         * @param {Node} dom
         * @param {Object} config - json
         */
        initialize : function(id, dom, config){

            //add method on(), off() and trigger() to the current object
            event.addEventMgr(this);

            this.id = id;
            this.dom = dom;
            this.config = config || {};

            var $container = $(dom);

            var paper,
                axis,
                zoomAxis,
                zoomEffect,
                selectedRect,
                selectedCoord,
                axisPoint,
                zoomPoint;

            function findRect(rects, position){

                var ret;
                var positions = _.keys(rects);
                var stepWidth = positions[1] - positions[0];

                _.forIn(rects, function(rect, pos){
                    pos = parseInt(pos);
                    if(pos < position && position < pos + stepWidth){
                        ret = rect;
                        return false;
                    }
                });

                return ret;
            }

            function drawAxisPoint(coord){

                if(axisPoint){
                    axisPoint.remove();
                }

                var top = axis.getOriginPosition().top;
                var pointConfig = {
                    radius : 6,
                    removable : false,
                    glow : false
                };
                pointConfig = _.defaults(pointConfig, {});

                axisPoint = pointFactory(paper, axis, pointConfig);
                axisPoint.setCartesianCoord(coord, top, pointConfig);
                axisPoint.render();

                //add the point to the axis set
                axisPoint.children.attr({cursor : 'default'});
                axis.getSet().push(axisPoint.children);

                return axisPoint;
            }

            function drawZoomAxisPoint(left){

                if(zoomPoint){
                    zoomPoint.remove();
                }

                //get the config of zoomAxis to find the xMin and xMax allowed to the point
                var zoomAxisConfig = zoomAxis.getConfig();

                var pointConfig = {
                    x : left,
                    axis : 'x',
                    xMin : zoomAxisConfig.left,
                    xMax : zoomAxisConfig.left + zoomAxisConfig.unitSize,
                    removable : false,
                    on : {
                        dragStop : updateAxisPoint
                    }
                };
                pointConfig = _.defaults(pointConfig, {});

                zoomPoint = pointFactory(paper, zoomAxis, pointConfig);
                zoomPoint.render();
                zoomPoint.drag();

                //add the point to the axis set
                zoomAxis.getSet().push(zoomPoint.children);

                return zoomPoint;
            }

            function getZoomPointCoordinate(){
                return selectedRect.coord + zoomPoint.getCartesianCoord().x / 2;
            }

            function getSelectedPointPositionLeft(){
                if(selectedCoord){
                    var zoomAxisConfig = zoomAxis.getConfig();
                    var left = 2 * (selectedCoord - selectedRect.coord + .05) * zoomAxisConfig.unitSize;
                    if(zoomAxisConfig.left <= left && left <= zoomAxisConfig.left + zoomAxisConfig.unitSize){
                        return left;
                    }
                }
            }

            function updateAxisPoint(){
                //updated the selected coord
                selectedCoord = getZoomPointCoordinate();
                //draw to axis point
                drawAxisPoint(selectedCoord);
            }

            function initAxis($container, axisConfig){

                //create paper
                paper = createCanvas($container, axisConfig);
                axis = new axisFactory(paper, axisConfig);

                //build zoom axis config from the parent one
                var axisSizePx = (axisConfig.max - axisConfig.min) * axisConfig.unitSize;
                var zoomAxisConfig = _.defaults({
                    min : 0,
                    max : 1,
                    top : axisConfig.top + 150,
                    unitSize : axisSizePx,
                    unitSubDivision : 10,
                    arrows : false,
                    labels : ['A', 'B']
                }, axisConfig);
                zoomAxis = new axisFactory(paper, zoomAxisConfig);
                zoomAxis.getSet().hide();

                //create the zoomable rectangles
                var rects = axisZoom.createZoomable(axis);

                //bind click event
                axis.clickable().click(function(event){

                    // Get the coordinate of the click
                    var fx = event.layerX;
                    var rect = findRect(rects, fx);

                    if(rect){

                        //clear previous drawn elements
                        if(selectedRect){
                            selectedRect.rect.hide();
                        }
                        if(zoomEffect){
                            zoomEffect.remove();
                        }

                        //updated selected rectangle and show it
                        selectedRect = rect;
                        selectedRect.rect.show();

                        //update the zoom axis label
                        zoomAxis.setConfig('labels', [selectedRect.coord, selectedRect.coord + .5]);
                        zoomAxis.render();

                        var left = getSelectedPointPositionLeft();
                        if(left !== undefined){
                            drawZoomAxisPoint(left);
                        }
                        zoomAxis.clickable().click(function(e){
                            drawZoomAxisPoint(e.layerX);
                            updateAxisPoint();
                        });

                        //add zoom effect
                        zoomEffect = axisZoom.drawZoomEffect(paper, selectedRect.rect, zoomAxis.buildContainerBox({shadow : true}));
                    }

                });

            }

            function reset(){
                //clear previous drawn elements
                if(selectedRect){
                    selectedRect.rect.hide();
                    selectedRect = undefined;
                }
                if(zoomEffect){
                    zoomEffect.remove();
                    zoomEffect = undefined;
                }
                if(zoomAxis){
                    zoomAxis.getSet().remove().clear();
                }
                if(axisPoint){
                    axisPoint.remove();
                    axisPoint = undefined;
                }
                selectedCoord = undefined;
            }

            //expose the reset() method
            this.reset = function(){
                reset();
            };

            /**
             * init rendering:
             */
            this.axisConfig = buildAxisConfig(this.config);
            initAxis($container, this.axisConfig);

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
            this.reset();
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

    qtiCustomInteractionContext.register(graphZoomNumberLineInteraction);
});