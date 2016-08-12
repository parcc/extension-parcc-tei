define(['OAT/lodash'], function(_){

    'use strict';

    var _defaults = {
        top : 40,
        left : 40,
        min : -5,
        max : 5,
        labels : false,
        thickness : 2,
        color : '#000',
        divisionWidth : 16,
        subDivisionWidth : 8,
        unitSubDivision : 2,
        unitSize : 50,
        fontSize : 18,
        arrows : false,
        opacity : 1
    };

    function getArrowsPath(orientation, config){

        var arrowConfig = {
            length : config.unitSize * 0.7,
            tip : config.unitSize * 0.3,
            orientation : orientation
        };

        var axisSizePx = (config.max - config.min) * config.unitSize;
        var tipPosition, path = '';

        if(arrowConfig.orientation === 'right'){

            tipPosition = (config.left + axisSizePx + arrowConfig.length);
            path += 'M' + (config.left + axisSizePx) + ',' + config.top;
            path += 'L' + tipPosition + ',' + config.top;

            path += 'M' + (tipPosition - arrowConfig.tip) + ',' + (config.top + config.divisionWidth);
            path += 'L' + tipPosition + ',' + config.top;

            path += 'M' + (tipPosition - arrowConfig.tip) + ',' + (config.top - config.divisionWidth);
            path += 'L' + tipPosition + ',' + config.top;

        }else if(arrowConfig.orientation === 'left'){

            tipPosition = config.left - arrowConfig.length;

            path += 'M' + (config.left) + ',' + config.top;
            path += 'L' + tipPosition + ',' + config.top;

            path += 'M' + (tipPosition + arrowConfig.tip) + ',' + (config.top + config.divisionWidth);
            path += 'L' + tipPosition + ',' + config.top;

            path += 'M' + (tipPosition + arrowConfig.tip) + ',' + (config.top - config.divisionWidth);
            path += 'L' + tipPosition + ',' + config.top;

        }else{
            throw 'unknown orientation type to the arrow';
        }

        return path;
    }

    /**
     * Apply relevant stroke attribute from config on a Raphaeljs path
     * 
     * @param {Object} path - Raphaeljs Path
     * @param {Object} config
     * @returns {undefined}
     */
    function _applyStyle(path, config){
        path.attr({
            stroke : config.color ? config.color : _defaults.color,
            'stroke-width' : config.thickness ? config.thickness : _defaults.thickness,
            opacity : config.opacity ? config.opacity : _defaults.opacity
        });
    }

    /**
     * Add a css class to the node of a Raphaël object
     * IE currently doesn't support the usage of element.classList in SVG
     *
     * @param raphaelObj
     * @param {string} newClass
     */
    function addCssClass(raphaelObj, newClass) {
        var pattern = new RegExp('\\b' + newClass + '\\b');
        var oldClass = raphaelObj.node.getAttribute('class') || '';
        raphaelObj.node.setAttribute('class', pattern.test(oldClass) ? oldClass : oldClass + ' ' + newClass);
    }

    function getLabel(i, config){
        if(config && _.isArray(config.labels) && config.labels[i] !== undefined && config.labels[i] !== false){
            return config.labels[i];
        }
        return i;
    }

    function axisFactory(paper, config){

        config = _.defaults(config || {}, _defaults);

        var set = paper.set(),
            arrowRight,
            arrowLeft,
            steps = [];//record the snapping steps

        var obj = {
            getMin : function(){
                return config.min;
            },
            getMax : function(){
                return config.max;
            },
            getCanvas : function(){
                return paper;
            },
            getOriginPosition : function(){
                return {
                    left : config.left - config.unitSize * config.min,
                    top : config.top
                };
            },
            snap : function(x0){
                var step = config.unitSize / config.unitSubDivision;
                var x = paper.raphael.snapTo(steps, x0, step / 2);
                var y = config.top;
                return [x, y];
            },
            render : function(){

                this.clear();

                var path = 'M' + config.left + ',' + config.top;
                var axisSizePx = (config.max - config.min) * config.unitSize;
                var subDivisionSize = config.unitSize / config.unitSubDivision;

                //draw main axis:
                path += 'L' + (config.left + axisSizePx) + ',' + config.top;

                var position = config.left;
                steps.push(position);
                for(var i = config.min; i <= config.max; i++){
                    //draw large graduation
                    path += 'M' + position + ',' + (config.top - config.divisionWidth);
                    path += 'L' + position + ',' + (config.top + config.divisionWidth);

                    var label = paper.text(position, config.top - config.divisionWidth - config.fontSize / 2 - 5, getLabel(i, config));
                    label.attr({
                        'font-size' : config.fontSize
                    });
                    addCssClass(label, 'scene scene-text');
                    set.push(label);

                    if(i < config.max){
                        //draw sub divs if applicable
                        var subPosition = position + subDivisionSize;
                        steps.push(subPosition);

                        for(var j = config.unitSubDivision; j > 1; j--){
                            path += 'M' + subPosition + ',' + (config.top - config.subDivisionWidth);
                            path += 'L' + subPosition + ',' + (config.top + config.subDivisionWidth);
                            subPosition += subDivisionSize;

                            if(j !== config.unitSubDivision){
                                steps.push(subPosition);
                            }
                        }
                    }

                    //update path position
                    position += config.unitSize;
                    steps.push(position);
                }

                if(config.arrows){
                    arrowRight = this.buildArrow('right');
                    arrowLeft = this.buildArrow('left');
                }

                var pathObj = paper.path(path);
                addCssClass(pathObj, 'scene scene-grid');
                _applyStyle(pathObj, config);
                set.push(pathObj);
            },
            getSet : function(){
                return set;
            },
            isRendered : function(){
                return set.length;
            },
            /**
             * Remove the axis from the paper
             * @returns {undefined}
             */
            clear : function(){
                if(set.length > 0){

                    //reset the snapping step array
                    steps = [];

                    //delete elements
                    set.remove().clear();
                }
            },
            /**
             * Create a transparent rectangle object in front of every element
             * inside the set to gain clickability
             */
            clickable : function(){
                /** @type {Object} Rectangle Object to cover the all grid area */
                var borderBox = set.getBBox();
                var clickableArea = paper.rect(borderBox.x, borderBox.y, borderBox.width, borderBox.height);
                clickableArea.attr({
                    fill : 'rgba(0,0,0,0)',
                    stroke : 0
                });
                set.push(clickableArea);
                return clickableArea;
            },
            /**
             * Get width of the _borderBox
             * @return {Number} width of the set of all elements
             */
            getWidth : function(){
                return set.getBBox().width;
            },
            /**
             * Get height of the _borderBox
             * @return {Number} height of the set of all elements
             */
            getHeight : function(){
                return set.getBBox().height;
            },
            /**
             * Get the units size for x,y axis
             * @return {Object}
             */
            getUnits : function(){
                return {
                    x : config.unitSize,
                    y : 0
                };
            },
            coordinateToPosition : function(x){
                return {
                    left : this.getOriginPosition().left + this.getUnits().x * x,
                    top : this.getOriginPosition().top
                };
            },
            buildArrow : function(orientation){
                var pathStr = getArrowsPath(orientation, config);
                var arrow = paper.path(pathStr);
                addCssClass(arrow, 'scene scene-grid');
                _applyStyle(arrow, config);
                set.push(arrow);
                return arrow;
            },
            getConfig : function(){
                return _.clone(config);
            },
            setConfig : function(key, value){
                config[key] = value;
            },
            buildContainerBox : function(options){
                
                var _defaults = {
                    padding : 20,
                    absolute : true,
                    shadow : false
                };
                
                options = _.defaults(options || {}, _defaults);
                
                var padding = options.padding,
                    bb = set.getBBox(),
                    box;

                if(options.absolute){
                    box = paper.rect(bb.x - padding, bb.y - padding, bb.width + 2 * padding, bb.height + 2 * padding);
                }else{
                    var axisSizePx = (config.max - config.min) * config.unitSize;
                    box = paper.rect(config.left - padding, config.top - padding, axisSizePx + 2 * padding, config.divisionWidth + 2 * padding);
                }
                box.attr({
                    fill : '#fff'
                });
                set.push(box);
                box.insertBefore(set);
                
                if(options && options.shadow){
                    set.push(box.glow({
                        width : 5,
                        fill : true,
                        offsetx : 3,
                        offsety : 3,
                        color : '#999'
                    }));
                }

                return box;
            },
            addCssClass: addCssClass
        };

        obj.render();
        
        return obj;
    }

    return axisFactory;
});