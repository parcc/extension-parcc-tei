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


define([
    'IMSGlobal/jquery_2_1_1',
    'OAT/lodash',
    'PARCC/pointFactory'
], function(
    $,
    _,
    pointFactory
    ){

    'use strict';
    var _defaults = {
        pointColor : '#bb1a2a',
        pointRadius : 10,
        maximumPoints : 1
    };

    function initialize(grid, config){

        var points = [],
            active = false,
            max = config.max || 1,
            uid = config.uid,
            paper = grid.getCanvas(),
            $canvas = $(paper.canvas);

        function setConfig(cfg){
            config = _.defaults(cfg, _defaults);
        }

        function unbindEvents(){
            $canvas.off('.' + uid);
        }

        function bindEvents(){

            $canvas.on('click_grid.' + uid, function(event, coord){

                if(points.length < config.maximumPoints){

                    addPoint(coord.x, coord.y);

                }else{
                    // Get the last point placed
                    var oldPoint = points.pop();
                    // Change their coordinates for new ones
                    oldPoint.setCoord(coord.x, coord.y);
                    // Re-draw the point
                    oldPoint.render();
                    // re-enable the drag'n'drop
                    oldPoint.drag();
                    // Add it back to the list
                    points.push(oldPoint);
                    // trigger event
                    $canvas.trigger('moved.pointSet', [oldPoint]);
                }

            }).on('removed.point.' + uid, function(event, removedPoint){
                if(points){
                    // get the point to remove from the "registry"
                    var pointToDelete = _.findIndex(points, {uid : removedPoint.uid});
                    if(pointToDelete > -1){
                        points.splice(pointToDelete, 1);
                    }
                }
            });
        }

        function addPoint(x, y, cartesian){

            var gridBBox = grid.getBBox();

            var newPoint = pointFactory(paper, grid, {
                x : x,
                y : y,
                xMin : gridBBox.x,
                xMax : gridBBox.x2,
                yMin : gridBBox.y,
                yMax : gridBBox.y2,
                cartesian : !!cartesian,
                radius : config.pointRadius,
                color : config.pointColor
            });
            // Draw the point
            newPoint.render();
            // Enable drag'n'drop hability
            newPoint.drag();
            // Add it to the list of points
            points.push(newPoint);
            //trigger event
            $canvas.trigger('added.pointSet', [newPoint]);
            
            return newPoint;
        }

        setConfig(config);

        var pointsWrapper = {
            type : 'pointSet',
            getId : function(){
                return uid;
            },
            isActive : function(){
                return active;
            },
            activate : function(){
                _.forEach(points, function(point){
                    point.showGlow();
                    point.drag();
                });
                bindEvents();
                active = true;
            },
            disactivate : function(){
                _.forEach(points, function(point){
                    point.hideGlow();
                    point.unDrag();
                });
                unbindEvents();
                active = false;
            },
            destroy : function(){
                if(points !== undefined && points !== []){
                    _.forEach(points, function(point){
                        point.children.remove().clear();
                    });
                    points = [];
                }
            },
            highlightOn : function(){
                _.forEach(points, function(point){
                    point.showGlow();
                });
            },
            highlightOff : function(){
                _.forEach(points, function(point){
                    point.hideGlow();
                });
            },
            getState : function(){

                var pts = [];
                _.each(points, function(pt){
                    pts.push(pt.getCartesianCoord());
                });

                return {
                    points : pts,
                    config : _.cloneDeep(config)
                };
            },
            setState : function(state){

                if(state.config){
                    setConfig(state.config);
                }

                //clear points and plot
                _.each(points, function(point){
                    point.remove();
                });
                points = [];

                if(state.points){

                    var i = 0,
                        maxPoints = config.maximumPoints;

                    _.each(state.points, function(point){
                        if(i < maxPoints){
                            addPoint(point.x, point.y, true);
                            i++;
                        }else{
                            return false;
                        }
                    });
                }
                pointsWrapper.disactivate();
            }
        };

        return pointsWrapper;
    }

    return {
        initialize : initialize
    };

});
