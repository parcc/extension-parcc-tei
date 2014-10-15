define([
    'lodash',
    'taoQtiItem/qtiCreator/editor/customInteractionRegistry',
    'graphFunctionInteraction/creator/widget/Widget',
    'tpl!graphFunctionInteraction/creator/tpl/markup'
], function(_, ciRegistry, Widget, markupTpl){

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
                level : 5,
                'label-min' : 'min',
                'label-max' : 'max'
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
                someData : pci.data('someData'),
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