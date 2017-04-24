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
    'lodash',
    'taoQtiItem/qtiCreator/editor/customInteractionRegistry',
    'graphFunctionInteraction/creator/widget/Widget',
    'tpl!graphFunctionInteraction/creator/tpl/markup',
    'tpl!graphFunctionInteraction/creator/tpl/responseCondition',
    'parccTei/pciCreator/helper/responseCondition'
], function(_, ciRegistry, Widget, markupTpl, rcTpl, responseCondition){

    var _typeIdentifier = 'graphFunctionInteraction';

    var likertScaleInteractionCreator = {
        /**
         * (required) Get the typeIdentifier of the custom interaction
         * 
         * @returns {String}
         */
        getTypeIdentifier : function(){
            return _typeIdentifier;
        },
        /**
         * (required) Get the widget prototype
         * Used in the renderer
         * 
         * @returns {Object} Widget
         */
        getWidget : function(){
            return Widget;
        },
        /**
         * (optional) Get the default properties values of the pci.
         * Used on new pci instance creation
         * 
         * @returns {Object}
         */
        getDefaultProperties : function(pci){
            return {
                graphs : 'linear,absolute,quadratic,exponential,logarithmic,cosine,tangent',

                "graphTitle": null,
                "graphTitleRequired": false,
                "plotColor": "#0000FF",
                "plotThickness": 6,
                "pointColor": "#0000FF",
                "pointGlow": true,
                "pointRadius": 8,
                "weight": 1,
                "width": 450,
                "height": 450,

                "xAllowOuter": true,
                "xBorderWeight": 3,
                "xStep": 1,
                "xLabel": null,
                "xTitle": null,
                "xStart": -10,
                "xEnd": 10,
                "xSubStep": 2,
                "xWeight": 3,

                "yAllowOuter": true,
                "yBorderWeight": 3,
                "yStep": 1,
                "yLabel": null,
                "yTitle": null,
                "yStart": -10,
                "yEnd": 10,
                "ySubStep": 2,
                "yWeight": 3
            };
        },
        /**
         * (optional) Callback to execute on the 
         * Used on new pci instance creation
         * 
         * @returns {Object}
         */
        afterCreate : function(pci){

            //turn into custom rp and substitute the resp cond
            responseCondition.replace(pci, rcTpl({
                responseIdentifier : pci.attr('responseIdentifier'),
                score : 1
            }));

            //set default (and fixed) correct "numberPointsRequired" value
            pci.getResponseDeclaration().correctResponse = {numberPointsRequired : {
                fieldIdentifier : 'numberPointsRequired',
                baseType : 'integer',
                value : 2//it is presently always 2
            }};
        },
        /**
         * (required) Gives the qti pci xml template 
         * 
         * @returns {function} handlebar template
         */
        getMarkupTemplate : function(){
            return markupTpl;
        },
        /**
         * (optional) Allows passing additional data to xml template
         * 
         * @returns {function} handlebar template
         */
        getMarkupData : function(pci, defaultData){

            return _.defaults(defaultData, {
                prompt : pci.data('prompt')
            });
        }
    };

    //since we assume we are in a tao context, there is no use to expose the a global object for lib registration
    //all libs should be declared here
    return likertScaleInteractionCreator;
});
