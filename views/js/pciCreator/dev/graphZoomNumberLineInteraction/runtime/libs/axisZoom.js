define([], function(){


    function createZoomable(axis){

        var clickables = {};//reset the snapping step array

        var paper = axis.getCanvas(),
            config = axis.getConfig(),
            clickableSet = paper.set(),
            subDivisionSize = config.unitSize / config.unitSubDivision,
            left = config.left,
            top = config.top - config.divisionWidth;

        function rectHide(rect){
        }

        function addRectangle(position){

            var rect = paper.rect(position, top, subDivisionSize, config.divisionWidth * 2);

            //set rect style 
            rect.attr({
                stroke : '#1a6596', //lighter : #1a6596, #266d9c
                fill : '#e6eef4'
            });

            //add to set
            clickableSet.push(rect);

            //identify each rectangle by its position
            clickables[position] = {
                rect : rect,
                active : false
            };
        }

        for(var i = config.min; i < config.max; i++){

            //build rectangle :
            addRectangle(left);

            if(i < config.max){
                //draw sub divs if applicable
                var left_ = left;
                for(var j = 2; j <= config.unitSubDivision; j++){
                    left_ += subDivisionSize;

                    //build rectangle :
                    addRectangle(left_);
                }

            }

            left += config.unitSize;
        }

        clickableSet.insertBefore(axis.getSet());

        return clickables;
    }

    return {
        createZoomable : createZoomable
    };
    
});