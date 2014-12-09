define([
    'lodash',
    'taoQtiItem/qtiCreator/editor/customInteractionRegistry',
    'graphLineAndPointInteraction/creator/widget/Widget',
    'tpl!graphLineAndPointInteraction/creator/tpl/markup'
], function(_, ciRegistry, Widget, markupTpl){
    'use strict';
    var _typeIdentifier = 'graphLineAndPointInteraction';

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
                graphs : {
                    points : {label : 'Point', count : 0, elements : []},
                    lines : {label : 'Line', count : 0, elements : []},
                    segments : {label : 'Segment', count : 0, elements:[]},
                    solutionSet : {label : 'Solution Set', count : 0, elements:[]},
                    setPoints : {label : 'Set of Points', count : 0, elements: []}
                },
                xMin : -10,
                xMax : 10,
                yMin : -10,
                yMax : 10
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

            var hook = ciRegistry.get(_typeIdentifier),
                manifest = hook.manifest;

            defaultData = _.defaults(defaultData , {
                typeIdentifier : _typeIdentifier,
                label : manifest.label,
                description : manifest.description
            });

            return defaultData;
        }
    };

    //since we assume we are in a tao context, there is no use to expose the a global object for lib registration
    //all libs should be declared here
    return likertScaleInteractionCreator;
});
