define([
    'IMSGlobal/jquery_2_1_1',
    'OAT/raphael'
],function($,Raphael){
    'use strict';
    Raphael.fn.pieChart = function (cx, cy, values, config) {
        var paper = this,
            chart = this.set();
        // Math Constant
        const rad = Math.PI / 180;
        // Initialised the selected slice internal counter
        chart.selected = 0 ;
        // read some stuff from config & reformat datas
        cx = parseInt(config.radius);
        cy = parseInt(config.radius);
        config.selectedPratitions = JSON.parse(config.selectedPratitions);

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
            return paper.path(['M', cx, cy, 'L', x1, y1, 'A', parseInt(config.radius), parseInt(config.radius), 0, +(endAngle - startAngle > 180), 0, x2, y2, 'z']).attr(params);
        }

        var angle = 0,
            total = 0,
            start = 0,
            /**
             * Iterational function that draw every slice
             * @param  {int} j slice number
             */
            process = function (j) {
                var value = values[j],
                    angleplus = 360 * value / total,
                    // Slice Background Color
                    bcolor = (config.selectedPratitions.length >= j && config.selectedPratitions[j]) ? config.selectedPartitionsColor : config.partitionColor,
                    // Slice , also called sector.
                    p = sector(cx, cy, parseInt(config.radius), angle, angle + angleplus, {fill: bcolor, stroke: config.outlineColor, 'stroke-width': config.outlineThickness});
                angle += angleplus;
                // Register this slice into the canvas
                chart.push(p);
                // I don't f*cking now what it is. It's taken from the original RapahelJS Exemple
                start += 0.1;
                // Register events on the slice / sector
                p.click(function(){
                    if(String(this.attrs.fill) === String(config.partitionColor)){
                        // if the color was previously the default color ,
                        // this slice / sector is unselected
                        chart.selected += 1;
                        // Change the color of the background
                        this.attr({fill: config.selectedPartitionsColor});
                        $(config.dom).trigger('select_slice.pieChart');
                    }else{
                        // else, this slice / sector is already selected
                        chart.selected -= 1;
                        // Change the background color to the default unselected value
                        this.attr({fill: config.partitionColor});
                        $(config.dom).trigger('unselect_slice.pieChart');
                    }
                });
            };
        for (var i = 0, ii = values.length; i < ii; i++) {
            total += values[i];
        }
        for (i = 0; i < ii; i++) {
            process(i);
        }
        $(config.dom).trigger('drawn.pieChart');
    };
});
