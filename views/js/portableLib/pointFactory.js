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


define(['taoQtiItem/portableLib/jquery_2_1_1', 'taoQtiItem/portableLib/lodash'], function($, _){
    'use strict';

    var _defaults = {
        x : 0,
        y : 0,
        color : '#f00',
        radius : 10,
        glow : true,
        glowRadius : 0,
        glowOpacity : .3,
        fill : true,
        removable : true,
        cartesian : false
    };

    /**
     * Point Factory
     * @param  {Object} paper                               Raphael paper / canvas object
     * @param  {Object} grid                                Grid
     * @param  {Object} options                             Point options
     * @param  {String} [options.color="#fff"]              color of the point
     * @param  {Number} [options.radius=20]                 radius in px for your point
     * @param  {Number} options.x                           position on the x axis
     * @param  {Number} options.y                           position on the y axis
     * @param  {Number} [options.glowRadius=30]             size of the radius around the point
     * @param  {Number} [options.glow=true]                 remove glow if not needed
     * @param  {Number} [options.fill=true]                 fill the point with given color, the border is colored otherwise
     * @param  {Number} [options.removable=true]            define if the point should be remove on simple click
     * @param  {Number} [options.cartesian=false]           define the inital position as cartesian coordinate
     * @param  {String} [options.label=""]                  a label to display with the point
     * @param  {String} [options.labelColor="#000"]         color of label
     * @param  {Number} [options.labelSize=10]              font size of label
     * @param  {Number} [options.labelWeight=0]             font weight of label
     * @return {Object}                                     point Object
     */
    function pointFactory(paper, grid, options){

        options = _.defaults(options || {}, _defaults);

        /** @type {String} color */
        var _color = options.color,
            /** @type {Number} radius of the point representation */
            _r = parseInt(options.radius),
            /** @type {Number} x coordinate (in px) */
            _x = 0,
            /** @type {Number} y coordinate (in px) */
            _y = 1,
            /** @type {String} label to display */
            _label = "",
            /** @type {Number} radius for the glowing effect */
            _rGlow = parseInt(options.glowRadius) || _r * 3,
            /** @type {Object} events callback */
            _events = options.on || {},
            /** @type {boolean} is drag functionality enabled? */
            _dragEnabled = false;

        var obj = {
            /** @type {Object} Paper.set of elements */
            children : paper.set(),
            /** @type {string} Unique ID */
            uid : _.uniqueId(),
            /** @type {boolean} is drag in progress */
            moved: false,
            /** @type {Object} Store the original bounding box */
            oBB: null,
            /** @type {Object} The current bounding box */
            bb: null,

            /**
             * Set _color value
             * @param {String} color
             */
            setColor : function(color){
                _color = String(color);
            },
            /**
             * Set _x value
             * @param {Number} val in px
             */
            setX : function(val){
                _x = parseInt(val);
            },
            /**
             * Get _x value
             * @return {Number} x position
             */
            getX : function(){
                return _x;
            },
            /**
             * Get label
             * @return {String}
             */
            getLabel : function(){
                return _label;
            },
            /**
             * Get _y value
             * @return {Number} y position
             */
            getY : function(){
                return _y;
            },
            /**
             * Set _y value
             * @param {Number} val in px
             */
            setY : function(val){
                _y = parseInt(val);
            },
            /**
             * Set label
             * @param {String} val
             */
            setLabel : function(val){
                _label = val;
            },
            /**
             * Set coordinate in the cartesian coordinate system
             *
             * @param {Number} x
             * @param {Number} y
             * @returns {undefined}
             */
            setCartesianCoord : function(x, y){
                _x = grid.getOriginPosition().left + grid.getUnits().x * x;
                _y = grid.getOriginPosition().top - grid.getUnits().y * y;
            },
            getCartesianCoord : function(){
                var cartesianX = (_x - grid.getOriginPosition().left)/grid.getUnits().x,
                    cartesianY = - (_y - grid.getOriginPosition().top)/grid.getUnits().y;
                return {
                    x: Number(cartesianX.toFixed(2)), // fix for IEEE 754 rounding issues where:
                    y: Number(cartesianY.toFixed(2))  // 60*2,7=162 != 162/2,7=59,999999
                };
            },
            /**
             * Set new coordinates for the point
             * @param {Number} x
             * @param {Number} y
             */
            setCoord : function(x, y){
                var coord = grid.snap(parseInt(x), parseInt(y));
                _x = coord[0];
                _y = coord[1];
            },
            /**
             * Set _r value
             * @param {Number} val in px
             */
            setR : function(val){
                _r = parseInt(val);
            },
            /**
             * Set _rGlow value
             * @param {Number} val in px
             */
            setRGlow : function(val){
                _rGlow = parseInt(val);
            },
            /**
             * Draw the point with his glow around it if applicable
             */
            render : function() {
                //clear all first:
                this.remove();

                /** @type {Object} Raphaël element object with type “circle” */
                var circle = paper.circle(_x, _y, _r);

                if(options.fill) {
                    circle.attr({
                        fill : _color,
                        stroke : '#000',
                        cursor : 'move'
                    });
                } else {
                    circle.attr({
                        stroke : _color,
                        'stroke-width' : 3,
                        cursor : 'move'
                    });
                }
                circle.node.setAttribute('data-type', 'handle');
                circle.node.setAttribute('uid', this.uid);
                this.children.push(circle);

                if(options.glow){
                    this.showGlow();
                }

                if (_label) {
                    var text = paper.text(_x, _y, _label);
                    text.attr({
                        fill : options.labelColor || '#000',
                        stroke : options.labelColor || '#000',
                        'stroke-width' : options.labelWeight || 0,
                        'font-size': options.labelSize || 10
                    });
                    this.children.push(text);
                }
            },
            /**
             * Remove the point from the canvas
             */
            remove : function(){
                if(this.children.length > 0){
                    this.children.remove().clear();
                }
            },
            removeOnClic : function() {
                var self = this;

                this.children.click(function() {
                    if (options.removable && _dragEnabled === false) {
                        self.deletePoint.call(self);
                    }
                });
            },
            deletePoint: function() {
                this.remove();
                $(paper.canvas).trigger('removed.point', this);
            },

            /**
             * On drag end handler
             * @param {number} x x position of the mouse
             * @param {number} y y position of the mouse
             * @param {Object} event DOM event object
             * deleteing and creating a point in order to workaround a re-positioning issue.
             */
            onDragStart: function(x, y, event) {
                this.isDragging = false;

                $(paper.canvas).on('mouseleave.drag', this.cancelDrag.bind(this));

                //trigger event
                if(typeof _events.dragStart === 'function'){
                    _events.dragStart.call(this);
                }

                this.oBB = this.children.getBBox();
            },

            /**
             * On drag end handler
             * @param {number} dx shift by x from the start point
             * @param {number} dy shift by y from the start point
             * @param {number} x x position of the mouse
             * @param {number} y y position of the mouse
             * @param {Object} event DOM event object
             * deleteing and creating a point in order to workaround a re-positioning issue.
             */
            onDragging: function(dx, dy, x, y, event) {
                this.isDragging = true;
                this.bb = this.children.getBBox();
                var newX = (this.oBB.x - this.bb.x + dx),
                    newY = (this.oBB.y - this.bb.y + dy);

                // Handle x or y axis restrictions
                if(options.axis === 'x') {
                    newY = this.getY() - (this.bb.y + (this.bb.width / 2));
                } else if(options.axis === 'y') {
                    newX = this.getX() - (this.bb.x + (this.bb.width / 2));
                }

                // Handle min/max of x/y axis
                var absoluteX = (this.bb.x + this.bb.width / 2);
                var absoluteY = (this.bb.y + this.bb.height / 2);

                if(options.xMin && absoluteX + newX < options.xMin) {
                    newX = options.xMin - absoluteX;
                } else if(options.xMax && absoluteX + newX > options.xMax) {
                    newX = options.xMax - absoluteX;
                }
                if(options.yMin && absoluteY + newY < options.yMin) {
                    newY = options.yMin - absoluteY;
                } else if(options.yMax && absoluteY + newY > options.yMax) {
                    newY = options.yMax - absoluteY;
                }

                //trigger event
                if(typeof _events.drag === 'function') {
                    _events.drag.call(this, newX, newY);
                }

                this.children.translate(newX, newY);
            },

            /**
             * On drag end handler
             * @param {Object} event DOM event object
             * deleteing and creating a point in order to workaround a re-positioning issue.
             */
            onDragEnd: function(event) {
                if(this.isDragging) {
                    this.updatePosition();

                } else if(options.removable) {
                    this.deletePoint();
                }

                //trigger event
                if(typeof _events.dragStop === 'function') {
                    _events.dragStop.call(this, this.getX(), this.getY());
                }

                this.isDragging = false;
                $(paper.canvas).off('mouseleave.drag');
            },

            /**
             * Update point position,
             * deleteing and creating a point in order to workaround a re-positioning issue.
             */
            updatePosition: function(newX, newY) {
                var newX = (this.bb.x + (this.bb.width / 2)),
                    newY = (this.bb.y + (this.bb.height / 2));

                this.setCoord(newX,newY);
                this.render();

                if(this.children.length === 2){
                    $(paper.canvas).trigger('moved.point');
                }

                this.drag();
            },

            /**
             * Activate the dran'n'drop capability provide by RaphaelJS
             */
            drag: function() {
                _dragEnabled = true;
                this.children.drag(this.onDragging.bind(this), this.onDragStart.bind(this), this.onDragEnd.bind(this));
            },

            /**
             * De-Activate the drag'n'drop capavility provided by RapahelJS
             */
            unDrag: function() {
                $(paper.canvas).off('.drag');
                this.children.undrag();
                _dragEnabled = false;
            },

            /**
             * Cancel drag'n'drop with dropping point on last valid point
             */
            cancelDrag: function() {
                this.unDrag();
                this.updatePosition();
                this.drag();
            },

            /**
             * Add glowing on point
             */
            showGlow : function(){
                /** @type {Object} Raphael color object */
                var rgb = paper.raphael.color(_color);
                /** @type {Object} Paper.circle of elements that represents glow */
                var glow = paper.circle(_x, _y, _rGlow).attr({
                    fill : 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', ' + options.glowOpacity + ' )',
                    stroke : 'none',
                    cursor : 'move'
                });
                if(this.children.length > 1){
                    this.children.pop().remove();
                }
                // glow.drag(this.onDragging.bind(this), this.onDragStart.bind(this), this.onDragEnd.bind(this));

                this.children.push(glow);
                this.children.attr('cursor', 'move');
            },
            /**
             * Remove Glowing on points
             */
            hideGlow : function(){
                if(this.children.length > 1){
                    this.children.pop().remove();
                }
                this.children.attr('cursor', 'default');
                // this.unDrag();
            },
            setOption : function(key, value){
                options[key] = value;
            }
        };

        if(options.cartesian){
            obj.setCartesianCoord(options.x, options.y);
        }else{
            obj.setCoord(options.x, options.y);
        }
        obj.setLabel(options.label);

        return obj;
    }
    return pointFactory;
});
