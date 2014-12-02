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
        arrows : false
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

    function axisFactory(paper, config){

        config = _.defaults(config || {}, _defaults);

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
                
                steps = [];//reinit the step array
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
                pathObj.attr({
                    stroke : config.color,
                    'stroke-width' : config.thickness
                });

            }
        };

        obj.render();
        return obj;
    }

    return axisFactory;
});