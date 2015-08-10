define([
    'IMSGlobal/jquery_2_1_1',
    'qtiCustomInteractionContext',
    'OAT/lodash',
    'OAT/util/event',
    'OAT/scale.raphael',
    'PARCC/pointFactory',
    'PARCC/axisFactory',
    'graphZoomNumberLineInteraction/runtime/libs/axisZoom'
], function($, qtiCustomInteractionContext, _, event, scaleRaphael, pointFactory, axisFactory, axisZoom){
    
    /**
     * Create the raphael canvas
     * 
     * @param {JQuery} $container
     * @param {Object} config
     * @returns {Object}
     */
    function createCanvas($container, config){

        var padding = 2;
        var width = 2 * padding + config.unitSize * (2 + config.max - config.min);
        var paper = scaleRaphael($('.shape-container', $container)[0], width, 260);

        return paper;
    }
    
    /**
     * Build the axis config
     * 
     * @param {Object} rawConfig
     * @returns {Object}
     */
    function buildAxisConfig(rawConfig){

        var _default = {
            top : 60,
            left : 50,
            unitSize : 50,
            min : 0,
            max : 10,
            unitSubDivision : 2,
            arrows : true,
            point : {
                color : '#266d9c'
            }
        };
        return _.merge(_default, {
            min : (rawConfig.min === undefined) ? undefined : parseInt(rawConfig.min),
            max : (rawConfig.max === undefined) ? undefined : parseInt(rawConfig.max),
            unitSubDivision : (rawConfig.unitSubDivision === undefined) ? undefined : parseInt(rawConfig.unitSubDivision),
            point : {
                color : rawConfig.graphColor
            }
        });
    }

    /**
     * Format a float into a string maximum of 3 digits
     * 
     * @param {Number} num
     * @returns {String}
     */
    function _format(num){
        
        var str = num + '';
        if(str.length > 5){
            if(str.match(/99999\d$/)){
                str = Math.round(num* 10000) / 10000;
            }else{
                //cut : 
                str = Math.floor(num * 1000) / 1000;
                str = str.toString();
                if(str.match(/^\d+\.\d{3,}$/)){
                    //ellipsis
                    str += '...';
                }
            }
        }
        return str;
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

            var _this = this,
                paper,
                axis,
                zoomAxis,
                zoomEffect,
                selectedRect,
                selectedCoord,
                axisPoint,
                zoomPoint;
            
            /**
             * Found the selected rectangle representing the area of the axis to be zommed
             * 
             * @param {Array} rects
             * @param {Number} position
             * @returns {Object} the rectangle object
             */
            function findRect(rects, position){

                var ret;
                var positions = _.pluck(rects, 'position');
                var stepWidth = positions[1] - positions[0];

                _.each(rects, function(rect){
                    var pos = parseInt(rect.position);
                    if(pos < position && position < pos + stepWidth){
                        ret = rect;
                        return false;
                    }
                });
                return ret;
            }
            
            /**
             * Draw the point on the "normal" axis
             * 
             * @param {Number} coord
             * @returns {Object} the point object
             */
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
                pointConfig = _.defaults(pointConfig, _this.axisConfig.point);

                axisPoint = pointFactory(paper, axis, pointConfig);
                axisPoint.setCartesianCoord(coord, top, pointConfig);
                axisPoint.render();

                //add the point to the axis set
                axisPoint.children.attr({cursor : 'default'});
                axis.getSet().push(axisPoint.children);

                return axisPoint;
            }
            
            /**
             * Draw the point on the zoom axis
             * 
             * @param {Number} left - the position.left of the point relative to the the zomm axis
             * @returns {Object} the point object
             */
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
                pointConfig = _.defaults(pointConfig, _this.axisConfig.point);

                zoomPoint = pointFactory(paper, zoomAxis, pointConfig);
                zoomPoint.render();
                zoomPoint.drag();

                //add the point to the axis set
                zoomAxis.getSet().push(zoomPoint.children);

                return zoomPoint;
            }
            
            /**
             * Get the cartesian coordinate of the point selected in the zommed axis
             * 
             * @returns {Number}
             */
            function getZoomPointCoordinate(){
                return selectedRect.coord + zoomPoint.getCartesianCoord().x / _this.axisConfig.unitSubDivision;
            }
            
            /**
             * Return the postion.left of the selected point relative to the zoomed axis
             * 
             * @returns {Number}
             */
            function getSelectedPointPositionLeft(){
                if(selectedCoord){
                    var zoomAxisConfig = zoomAxis.getConfig();
                    var offset = zoomAxisConfig.unitSize * _this.axisConfig.unitSubDivision / (10 * _this.axisConfig.unitSubDivision);//needed an offset to compensate for js calculation imprecision
                    var left = (selectedCoord - selectedRect.coord) * zoomAxisConfig.unitSize * _this.axisConfig.unitSubDivision + offset;
                    left = parseInt(_format(left));
                    if(zoomAxisConfig.left <= left + offset && left - offset <= zoomAxisConfig.left + zoomAxisConfig.unitSize){
                        return left;
                    }
                }
            }
            
            /**
             * Update and store the currently selected coord in a private variable
             */
            function updateAxisPoint(){
                //updated the selected coord
                selectedCoord = getZoomPointCoordinate();
                //draw to axis point
                drawAxisPoint(selectedCoord);
            }
            
            /**
             * Init the axis
             * 
             * @param {JQuery} $container
             * @param {Object} axisConfig
             */
            function initAxis($container, axisConfig){

                //create paper
                var subDivisionIncrement = 1 / axisConfig.unitSubDivision;
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
                        zoomAxis.addCssClass(selectedRect.rect, 'scene scene-selected-rectangle');

                        selectedRect.rect.show();

                        //update the zoom axis label
                        zoomAxis.setConfig('labels', [_format(selectedRect.coord), _format(selectedRect.coord + subDivisionIncrement)]);
                        zoomAxis.render();

                        //draw container box here, before setting the point
                        var containerBox = zoomAxis.buildContainerBox({shadow : true});
                        zoomAxis.addCssClass(containerBox, 'scene scene-zoom-popup');

                        //set the previously selected point
                        var left = getSelectedPointPositionLeft();
                        if(left !== undefined){
                            drawZoomAxisPoint(left);
                        }
                        zoomAxis.clickable().click(function(e){
                            drawZoomAxisPoint(e.layerX);
                            updateAxisPoint();
                        });

                        //add zoom effect
                        zoomEffect = axisZoom.drawZoomEffect(paper, selectedRect.rect, containerBox);
                        zoomAxis.addCssClass(zoomEffect, 'scene scene-zoom-effect');
                    }

                });

            }
            
            /**
             * Reset drawn elements
             */
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
            
            /**
             * Set new config to the axis
             * 
             * @param {Object} axisConfig
             */
            function setAxis(axisConfig){
                _this.axisConfig = buildAxisConfig(_.merge(_this.config, _this.axisConfig, axisConfig));
                initAxis($container, _this.axisConfig);
                reset();
            }
            
            //expose the reset() method
            this.reset = function(){
                reset();
            };
            
            //expose the getRawResponse() method
            this.getRawResponse = function(){
                return selectedCoord;
            };
            
            //init rendering
            this.axisConfig = buildAxisConfig(this.config);
            initAxis($container, this.axisConfig);
            
            //init event
            this.on('axischange', setAxis);
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

            var value = this.getRawResponse();
            if(value){
                return {base : {float : value}};
            }else{
                return {base : null};
            }
            
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
