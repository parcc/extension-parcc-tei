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
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/Widget',
    'graphLineAndPointInteraction/creator/widget/states/states',
    'css!graphLineAndPointInteraction/creator/css/form'
], function(Widget, states){
    'use strict';

    var GraphLineAndPointInteracitonWidget = Widget.clone();

    GraphLineAndPointInteracitonWidget.initCreator = function(){
        // the "graphs" property is given as a serialized JSON, we convert it in an object so the widget can use it
        var interaction = this.element;
        var graphsProperty = interaction.prop('graphs');
        var parsedGraphs;

        try {
            parsedGraphs = JSON.parse(graphsProperty);
            interaction.prop('graphs', parsedGraphs);
        } catch(e) { /* parsing failed */ }


        this.registerStates(states);

        Widget.initCreator.call(this);

    };

    return GraphLineAndPointInteracitonWidget;
});
