/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *  
 * Copyright (c) 2014-2017 Parcc, Inc.
 */


define(['OAT/lodash'], function(_){

    function createZoomable(axis){

        var clickables = [];//reset the snapping step array
        
        var paper = axis.getCanvas(),
            config = axis.getConfig(),
            clickableSet = paper.set(),
            subDivisionSize = config.unitSize / config.unitSubDivision,
            subDivisionIncrement = 1 / config.unitSubDivision,
            left = config.left,
            top = config.top - config.divisionWidth;
        
        function addRectangle(position, coord){

            var rect = paper.rect(position, top, subDivisionSize, config.divisionWidth * 2);

            //set rect style 
            rect.attr({
                stroke : '#1a6596', //lighter : #1a6596, #266d9c
                fill : '#e6eef4'
            });
            
            //init as hidden
            rect.hide();
            
            //add to set
            clickableSet.push(rect);
            
            //identify each rectangle by its position
            clickables.push({
                position : position,
                rect : rect,
                coord : coord,
                active : false
            });
        }

        for(var i = config.min; i < config.max; i++){

            //build rectangle :
            addRectangle(left, i);

            if(i < config.max){
                //draw sub divs if applicable
                var left_ = left, i_ = i;
                for(var j = 2; j <= config.unitSubDivision; j++){
                    left_ += subDivisionSize;
                    i_ += subDivisionIncrement;
                    //build rectangle :
                    addRectangle(left_, i_);
                }

            }

            left += config.unitSize;
        }

        clickableSet.insertBefore(axis.getSet());
        return clickables;
    }

    function drawPath(paper, points){

        var pathStr = '';
        _.each(points, function(point){
            if(pathStr){
                pathStr += 'L';
            }else{
                pathStr += 'M';
            }
            pathStr += point.toString();
        });

        //close the path
        pathStr += 'Z';

        return paper.path(pathStr).attr({
            stroke : '#1a6596', //lighter : #1a6596, #266d9c
            fill : '#e6eef4'
        });
    }

    function drawZoomEffect(paper, from, to){

        var source = from.getBBox();
        var target = to.getBBox();

        var points = [
            [source.x, source.y + source.height],
            [source.x + source.width, source.y + source.height],
            [target.x + target.width, target.y],
            [target.x, target.y]
        ];

        var zoomEffect = drawPath(paper, points);
        if(zoomEffect){
            if(to.zoomEffect){
                //remove old zoom effect
                to.zoomEffect.remove();
            }
            to.zoomEffect = zoomEffect;
            zoomEffect.insertBefore(to);
        }

        return zoomEffect;
    }

    return {
        createZoomable : createZoomable,
        drawZoomEffect : drawZoomEffect
    };

});
