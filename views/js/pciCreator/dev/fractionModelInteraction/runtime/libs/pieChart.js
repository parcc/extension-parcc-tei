define([
    'IMSGlobal/jquery_2_1_1',
    'OAT/raphael',
    'lodash'
],function($,Raphael,_){
    'use strict';
    Raphael.fn.pieChart = function (cx, cy, values, config, dom) {
        var paper = this,
            chart = this.set(),
        // Math Constant
            rad = Math.PI / 180;
        // read some stuff from config & reformat datas
        cx = config.radius;
        cy = config.radius;
        
        if (typeof config.selectedPartitions === 'string') {
            if (config.selectedPartitions.trim() === ''){
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
        function sector(cx, cy, r, startAngle, endAngle, params) {
            var x1 = cx + r * Math.cos(-startAngle * rad),
                x2 = cx + r * Math.cos(-endAngle * rad),
                y1 = cy + r * Math.sin(-startAngle * rad),
                y2 = cy + r * Math.sin(-endAngle * rad);
            return paper.path(['M', cx, cy, 'L', x1, y1, 'A', config.radius, config.radius, 0, +(endAngle - startAngle > 180), 0, x2, y2, 'z']).attr(params);
        }

        var $container = $(dom),
            angle = 0,
            total = 0,
            start = 0,
            selectedPartitions = {},
            /**
             * Iterational function that draw every slice
             * @param  {int} j slice number
             */
            process = function (j) {
                var value = values[j],
                    angleplus = 360 * value / total,
                    bcolor, p;
                    // Slice Background Color
                    //
                    // Test if there's enought stuff registerred regarding on wich slice we are,
                    // and test if we got something for the current slice. Get the selected color if,
                    // else get the regular color
                    if(config.selectedPartitions.length >= j && config.selectedPartitions[j]){
                        bcolor = config.selectedPartitionsColor;
                        selectedPartitions[j] = true;
                    }else{
                        bcolor = config.partitionColor;
                        selectedPartitions[j] = false;
                    }
                    // Slice , also called sector.
                    p = sector(cx, cy, config.radius, angle, angle + angleplus, {fill: bcolor, stroke: config.outlineColor, 'stroke-width': config.outlineThickness});
                angle += angleplus;
                // Register this slice into the canvas
                chart.push(p);
                // I don't f*cking now what it is. It's taken from the original RapahelJS Exemple
                start += 0.1;
                // Register events on the slice / sector
                p.click(function(){
                    if(String(this.attrs.fill) === config.partitionColor){
                        // if the color was previously the default color ,
                        // this slice / sector is unselected
                        chart.selected += 1;
                        // Change the color of the background
                        this.attr({fill: config.selectedPartitionsColor});
                        // update the configuration 
                        selectedPartitions[j] = true;
                        $container.trigger('select_slice.pieChart', selectedPartitions);
                    }else{
                        // else, this slice / sector is already selected
                        chart.selected -= 1;
                        // Change the background color to the default unselected value
                        this.attr({fill: config.partitionColor});
                        // update the configuration 
                        selectedPartitions[j] = false;
                        $container.trigger('unselect_slice.pieChart', selectedPartitions);
                    }
                });
            };
        for (var i = 0, ii = values.length; i < ii; i++) {
            total += values[i];
        }
        for (i = 0; i < ii; i++) {
            process(i);
        }
        $container.trigger('drawn.pieChart');
    };
});
