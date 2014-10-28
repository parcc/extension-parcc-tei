define([
    'IMSGlobal/jquery_2_1_1',
    'OAT/raphael',
    'OAT/scale.raphael'
],function($,Raphael){
    'use strict';
    Raphael.fn.pieChart = function (cx, cy, r, values, config) {
        var paper = this,
            rad = Math.PI / 180,
            chart = this.set();
        chart.selected = 0 ;

        function sector(cx, cy, r, startAngle, endAngle, params) {
            var x1 = cx + r * Math.cos(-startAngle * rad),
                x2 = cx + r * Math.cos(-endAngle * rad),
                y1 = cy + r * Math.sin(-startAngle * rad),
                y2 = cy + r * Math.sin(-endAngle * rad);
            return paper.path(['M', cx, cy, 'L', x1, y1, 'A', r, r, 0, +(endAngle - startAngle > 180), 0, x2, y2, 'z']).attr(params);
        }

        var angle = 0,
            total = 0,
            start = 0,
            process = function (j) {
                var value = values[j],
                    angleplus = 360 * value / total,
                    bcolor = config.partitionColor,
                    p = sector(cx, cy, r, angle, angle + angleplus, {fill: bcolor, stroke: config.outlineColor, 'stroke-width': config.outlineThickness});
                angle += angleplus;
                chart.push(p);
                start += 0.1;
                p.click(function(){
                    if(String(this.attrs.fill) === String(config.partitionColor)){
                        chart.selected+=1;
                        this.attr({fill: config.selectedPartitionsColor});
                        $(document.body).trigger('select_slice');
                    }else{
                        chart.selected-=1;
                        this.attr({fill: config.partitionColor});
                        $(document.body).trigger('unselect_slice');
                    }
                });
            };
        for (var i = 0, ii = values.length; i < ii; i++) {
            total += values[i];
        }
        for (i = 0; i < ii; i++) {
            process(i);
        }
        return chart;
    };
    return Raphael;
});
