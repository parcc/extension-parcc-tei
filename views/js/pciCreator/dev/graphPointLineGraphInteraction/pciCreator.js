define([
    'lodash',
    'taoQtiItem/qtiCreator/editor/customInteractionRegistry',
    'graphPointLineGraphInteraction/creator/widget/Widget',
    'tpl!graphPointLineGraphInteraction/creator/tpl/markup'
], function(_, ciRegistry, Widget, markupTpl){

    var _typeIdentifier = 'graphPointLineGraphInteraction';

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
/*
 "draggable": "true",
 "graphTitle": "Culture 2 Data",
 "graphTitleRequired": "true",
 "graphType": "line",
 "maxPoints": "6",
 "plotColor": "#0000FF",
 "plotSegment": "true",
 "plotThickness": "6",
 "pointColor": "#0000FF",
 "pointGlow": "true",
 "pointRadius": "8",
 "weight": "1",
 "xAllowOuter": "true",
 "xIncrement": "1",
 "xLabel": "Time (hr)",
 "xLines": "7",
 "xMax": "7",
 "xMin": "0",
 "xSubIncrement": "2",
 "xUnit": "42",
 "xWeight": "3",
 "yAllowOuter": "true",
 "yIncrement": "10",
 "yLabel": "Number of Cells (x1,000,000)",
 "yLines": "10",
 "yMax": "100",
 "yMin": "0",
 "ySubIncrement": "2",
 "yUnit": "34",
 "yWeight": "3"
 */
                graphs : 'linear,absolute,quadratic,exponential,logarithmic,cosine,tangent',
                xMin : -10,
                xMax : 10,
                yMin : -10,
                yMax : 10,
                graphColor : '#bb1a2a',
                graphWidth : 3
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
        }
    };

    //since we assume we are in a tao context, there is no use to expose the a global object for lib registration
    //all libs should be declared here
    return likertScaleInteractionCreator;
});
