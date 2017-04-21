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
    'graphZoomNumberLineInteraction/creator/widget/Widget',
    'tpl!graphZoomNumberLineInteraction/creator/tpl/markup'
], function(_, Widget, markupTpl){

    var _typeIdentifier = 'graphZoomNumberLineInteraction';

    var interactionCreator = {
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
                color : '#266d9c',
                min : 0,
                max : 10,
                unitSubDivision : 2,
                increment : 1,
                snapTo : 1
            };
        },
        /**
         * (optional) Callback to execute on the
         * Used on new pci instance creation
         *
         * @returns {Object}
         */
        afterCreate : function(pci){
            //do some stuff
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

            return defaultData;
        }
    };

    //since we assume we are in a tao context, there is no use to expose the a global object for lib registration
    //all libs should be declared here
    return interactionCreator;
});
