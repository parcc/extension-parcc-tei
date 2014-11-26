define([
    'OAT/raphael',
    'OAT/lodash'
], function(Raphael, _){

    'use strict';

    function getTotalSelected(selectedPartitions){
        return _.compact(_.values(selectedPartitions)).length;
    }
    
    /**
     * 
     * @param {Array} selectedPartitions - e.g. [true, false, false, true, false, false]
     * @param {Object} config
     * @param {Object} $container - jQuery object
     * @returns {undefined}
     */
    Raphael.fn.pieChart = function(selectedPartitions, config, $container){

        var paper = this,
            chart = this.set(),
            padding = config.padding || 2,
            r = parseInt(config.radius),
            // read some stuff from config & reformat datas
            cx = r + padding,
            cy = r + padding,
            // Math Constant
            rad = Math.PI / 180,
            getStyle = function(selected){
                return {
                    fill : selected ? config.selectedPartitionsColor : config.partitionColor,
                    cursor : 'pointer',
                    stroke : config.outlineColor,
                    'stroke-width' : config.outlineThickness
                };
            },
            setHoverStyle = function(raphaelObject){
                raphaelObject.hover(function(){
                    this.animate({
                        'fill-opacity' : 0.7
                    });
                }, function(){
                    this.stop().attr({
                        'fill-opacity' : 1
                    });
                });
            };
        
        //work on a clone of the array to prevent external modification
        selectedPartitions = _.clone(selectedPartitions);

        /**
         * Create a new sector to draw
         * @param  {int}          cx            initial position x
         * @param  {int}          cy            initial position y
         * @param  {int}          r             radius
         * @param  {int}          startAngle    initial angle to start drawing
         * @param  {int}          endAngle      ending angle to stop drawing
         * @param  {object|array} params        params passed to Raphael .attr()
         * @return {object}                     Raphael path
         */
        function sector(cx, cy, r, startAngle, endAngle, params){
            var x1 = cx + r * Math.cos(-startAngle * rad),
                x2 = cx + r * Math.cos(-endAngle * rad),
                y1 = cy + r * Math.sin(-startAngle * rad),
                y2 = cy + r * Math.sin(-endAngle * rad);
            return paper.path(['M', cx, cy, 'L', x1, y1, 'A', r, r, 0, +(endAngle - startAngle > 180), 0, x2, y2, 'z']).attr(params);
        }

        var angle = 0,
            angleplus = 360 / selectedPartitions.length;
            
        /**
         * Iterational function that draw every slice
         * @param  {int} j slice number
         */
        function drawSlice(j){

            var p, selected = selectedPartitions[j];

            //modify the internal state
            selectedPartitions[j] = selected;

            // Slice , also called sector.
            p = sector(cx, cy, r, angle, angle + angleplus, getStyle(selected));
            
            //increase the andle
            angle += angleplus;

            //add hover style
            setHoverStyle(p);

            // Register this slice into the canvas
            chart.push(p);

            // Register events on the slice / sector
            p.click(getClickCallback(j));
        }

        function drawCircle(){

            var c = paper.circle(cx, cy, r).attr(getStyle(false));

            //add hover style
            setHoverStyle(c);

            // Register this slice into the canvas
            chart.push(c);

            // Register events on the slice / sector
            c.click(getClickCallback(0));
        }

        function getClickCallback(j){
            return function(){
                if(String(this.attrs.fill) === config.partitionColor){
                    //it is selected:
                    
                    // Change the color of the background
                    this.attr(getStyle(true));
                    // update the internal state 
                    selectedPartitions[j] = true;
                    $container.trigger('select_slice.pieChart', [selectedPartitions, getTotalSelected(selectedPartitions)]);
                }else{
                    
                    // Change the background color to the default unselected value
                    this.attr(getStyle(false));
                    // update the internal state 
                    selectedPartitions[j] = false;
                    $container.trigger('unselect_slice.pieChart', [selectedPartitions, getTotalSelected(selectedPartitions)]);
                }
            }
        }

        if(selectedPartitions.length > 1){
            for(var i = 0; i < selectedPartitions.length; i++){
                drawSlice(i);
            }
        }else{
            drawCircle();
        }

        $container.trigger('drawn.pieChart');
    };
});
