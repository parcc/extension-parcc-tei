define(['OAT/lodash'], function(_){

    'use strict';

    var _defaults = {
        top : 40,
        left : 40,
        min : -5,
        max : 5,
        thickness : 2,
        color : '#000',
        divisionWidth : 16,
        subDivisionWidth : 8,
        unitSubDivision : 2,
        unitSize : 50,
        fontSize: 18,
        arrows : false,
        opacity : 1
    };

    function getArrowsPath(config){

        var arrowConfig = {
            length : config.unitSize * 0.7,
            tip : config.unitSize * 0.3
        };

        var axisSizePx = (config.max - config.min) * config.unitSize;
        var tipPosition = (config.left + axisSizePx + arrowConfig.length);
        var path = '';

        path += 'M' + (config.left + axisSizePx) + ',' + config.top;
        path += 'L' + tipPosition + ',' + config.top;

        path += 'M' + (tipPosition - arrowConfig.tip) + ',' + (config.top + config.divisionWidth);
        path += 'L' + tipPosition + ',' + config.top;

        path += 'M' + (tipPosition - arrowConfig.tip) + ',' + (config.top - config.divisionWidth);
        path += 'L' + tipPosition + ',' + config.top;

        tipPosition = config.left - arrowConfig.length;

        path += 'M' + (config.left) + ',' + config.top;
        path += 'L' + tipPosition + ',' + config.top;

        path += 'M' + (tipPosition + arrowConfig.tip) + ',' + (config.top + config.divisionWidth);
        path += 'L' + tipPosition + ',' + config.top;

        path += 'M' + (tipPosition + arrowConfig.tip) + ',' + (config.top - config.divisionWidth);
        path += 'L' + tipPosition + ',' + config.top;

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

    function axisFactory(paper, config){

        config = _.defaults(config || {}, _defaults);

        var set = paper.set();

        //record the snapping steps
        var steps = [];

        var obj = {
            getCanvas : function(){
                return paper;
            },
            getOriginPosition : function(){
                return {
                    left : config.left - config.unitSize * config.min,
                    top : config.top
                };
            },
            snap : function(x, y){
                var step = config.unitSize / config.unitSubDivision;
                x = paper.raphael.snapTo(steps, x, step / 2);
                y = config.top;
                return [x, y];
            },
            render : function(){

                steps = [];//reset the snapping step array

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

                    var label = paper.text(position, config.top - config.divisionWidth - config.fontSize/2 - 5, i);
                    label.attr({
                        'font-size' : config.fontSize
                    });
                    set.push(label);

                    if(i < config.max){
                        //draw sub divs if applicable
                        var subPosition = position + subDivisionSize;
                        for(var j = config.unitSubDivision; j > 1; j--){
                            path += 'M' + subPosition + ',' + (config.top - config.subDivisionWidth);
                            path += 'L' + subPosition + ',' + (config.top + config.subDivisionWidth);
                            subPosition += subDivisionSize;

                            steps.push(subPosition);
                        }
                    }

                    //update path position
                    position += config.unitSize;
                    steps.push(subPosition);
                }

                if(config.arrows){
                    path += getArrowsPath(config);
                }

                var pathObj = paper.path(path);
                _applyStyle(pathObj, config);
                set.push(pathObj);
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
            }
        };

        obj.render();
        return obj;
    }

    return axisFactory;
});