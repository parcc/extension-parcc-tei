define([
    'IMSGlobal/jquery_2_1_1',
    'OAT/raphael',
    'OAT/lodash'
], function($, Raphael, _){
    'use strict';
    Raphael.fn.pieChart = function(values, config, dom){

        var paper = this,
            chart = this.set(),
            padding = config.padding || 2,
            r = config.radius,
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

        //@todo clean this
        if(typeof config.selectedPartitions === 'string'){
            if(config.selectedPartitions.trim() === ''){
                config.selectedPartitions = '[]';
            }
            config.selectedPartitions = JSON.parse(config.selectedPartitions);
        }
        // Initialised the selected slice internal counter
        chart.selected = _.compact(config.selectedPartitions).length;

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

        var $container = $(dom),
            angle = 0,
            total = 0,
            //internal state for every sector
            selectedPartitions = {},
            /**
             * Iterational function that draw every slice
             * @param  {int} j slice number
             */
            drawSlice = function(j){

                var value = values[j],
                    angleplus = 360 * value / total,
                    selected = (config.selectedPartitions.length >= j && config.selectedPartitions[j]),
                    p;

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
            },
            drawCircle = function(){

                var c = paper.circle(cx, cy, r).attr(getStyle(false));

                //add hover style
                setHoverStyle(c);

                // Register this slice into the canvas
                chart.push(c);

                // Register events on the slice / sector
                c.click(getClickCallback(0));
            },
            getClickCallback = function(j){
                return function(){
                    if(String(this.attrs.fill) === config.partitionColor){
                        // if the color was previously the default color ,
                        // this slice / sector is unselected
                        chart.selected += 1;
                        // Change the color of the background
                        this.attr(getStyle(true));
                        // update the internal state 
                        selectedPartitions[j] = true;
                        $container.trigger('select_slice.pieChart', selectedPartitions);
                    }else{
                        // else, this slice / sector is already selected
                        chart.selected -= 1;
                        // Change the background color to the default unselected value
                        this.attr(getStyle(false));
                        // update the internal state 
                        selectedPartitions[j] = false;
                        $container.trigger('unselect_slice.pieChart', selectedPartitions);
                    }
                }
            }

        for(var i = 0, ii = values.length; i < ii; i++){
            total += values[i];
        }

        if(ii > 1){
            for(i = 0; i < ii; i++){
                drawSlice(i);
            }
        }else{
            drawCircle();
        }

        $container.trigger('drawn.pieChart');
    };
});
