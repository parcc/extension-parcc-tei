define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/helper/popup',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'taoQtiItem/qtiCreator/editor/colorPicker/colorPicker',
    'graphLineAndPointInteraction/creator/libs/randomColor/randomColor',
    'tpl!graphLineAndPointInteraction/creator/tpl/propertiesForm',
    'tpl!graphLineAndPointInteraction/creator/tpl/pointForm',
    'tpl!graphLineAndPointInteraction/creator/tpl/pointSetForm',
    'tpl!graphLineAndPointInteraction/creator/tpl/lineForm',
    'tpl!graphLineAndPointInteraction/creator/tpl/segmentForm',
    'tpl!graphLineAndPointInteraction/creator/tpl/solutionSetForm',
    'lodash',
    'jquery'
], function(
    stateFactory,
    Question,
    formElement,
    popup,
    containerEditor,
    colorPicker,
    randomColor,
    formTpl,
    pointFormTpl,
    pointSetFormTpl,
    lineFormTpl,
    segmentFormTpl,
    solutionSetForm,
    _,
    $){

    'use strict';

    var StateQuestion = stateFactory.extend(Question, function(){

        var interaction = this.widget.element,
            $container = this.widget.$container;

        //init prompt editor
        containerEditor.create($container.find('.prompt'), {
            change : function(text){
                interaction.data('prompt', text);
                interaction.updateMarkup();
            },
            markup : interaction.markup,
            markupSelector : '.prompt',
            related : interaction
        });

    }, function(){

        containerEditor.destroy(this.widget.$container.find('.prompt'));
    });

    var _tpl = {
        points : pointFormTpl,
        setPoints : pointSetFormTpl,
        segments : segmentFormTpl,
        lines : lineFormTpl,
        solutionSet : solutionSetForm
    };

    var _typeHues = {
        points : 'blue',
        setPoints : 'green',
        lines : 'red',
        segments : 'yellow',
        solutionSet : 'blue'
    };

    var _typeLabels = {
        points : 'Point',
        setPoints : 'Point Set',
        lines : 'Line',
        segments : 'Segment',
        solutionSet : 'Solution Set'
    };

    function generateColorByGraphType(type){
        if(_typeHues[type]){
            var colors = randomColor({hue : _typeHues[type], luminosity : 'dark', count : 1});
            return colors.pop();
        }
    }

    function generateLabelByGraphType(type, rank){
        if(_typeLabels[type]){
            return _typeLabels[type] + ' ' + String.fromCharCode(65 + rank);
        }
    }

    var _defaultConfig = {
        points : {pointRadius : 10},
        setPoints : {maximumPoints : 5},
        lines : {lineStyle : '', lineStyleToggle : false, lineWeight : 3, pointRadius : 10},
        segments : {lineStyle : '', lineStyleToggle : false, lineWeight : 3, pointRadius : 10},
        solutionSet : {}
    };

    /**
     * Create a default config width a label and a color
     * @param  {String} graphType - the type of the graph
     * @param  {Number} nbElements - How many elements you want to generate
     * @param {Number} existingElements - How many elements already exists
     * @return {Array} Element Collection
     */
    function defaultConfig(graphType, nbElements, existingElements){

        var elements = [];
        for(var i = 0; i < nbElements; i++){

            var color = generateColorByGraphType(graphType);
            var label = generateLabelByGraphType(graphType, existingElements + i);
            var generatedConfig = {
                label : label,
                uid : _.uniqueId(graphType + '_')
            };

            switch(graphType){
                case 'points':
                case 'setPoints':
                    generatedConfig.pointColor = color;
                    break;
                case 'lines':
                case 'segments':
                    generatedConfig.pointColor = color;
                    generatedConfig.lineColor = color;
                    break;
                case 'solutionSet':
                    //force solution set label and color (only one allowed currently)
                    generatedConfig.label = _typeLabels.solutionSet;
                    generatedConfig.color = '#326399';
                    break;
                default:
                    throw 'unknown type of grapth';
            }

            var element = _.defaults(generatedConfig, _defaultConfig[graphType]);

            elements.push(element);
        }
        return elements;
    }

    /**
     * Update values for the graphs properties
     * @param  {Object} interaction
     * @param  {String} value       value of the changed element
     * @param  {String} name        name of the changed element
     */
    function updateGraphValue(interaction, value, name){

        var _graphs = interaction.prop('graphs');
        value = parseInt(value);
        _graphs[name].count = value;


        if(value > _graphs[name].elements.length){
            /**
             * If value are greater than what we have, add the diff w/ default values
             */
            _graphs[name].elements = _graphs[name].elements.concat(defaultConfig(name, value - _graphs[name].elements.length, _graphs[name].elements.length));
        }else if(value < _graphs[name].elements.length){
            /**
             * If value are smaller than what we have, just take the firsts n elements
             * where n is the value.
             */
            _graphs[name].elements = _.first(_graphs[name].elements, value);
        }
        interaction.prop('graphs', _graphs);
        interaction.triggerPci('configchange', [interaction.getProperties()]);
    }

    StateQuestion.prototype.initForm = function(){

        //code to init your interaction property form (on the right side bar)

        var widget = this.widget,
            interaction = widget.element,
            $form = widget.$form,
            allowSolutionSet = false,
            response = interaction.getResponseDeclaration(),
            graphs = _.clone(interaction.prop('graphs'));

        //for the itme being only allow one single solutionSet:
        if(graphs.solutionSet.elements.length){
            allowSolutionSet = true;
        }
        delete graphs.solutionSet;

        /**
         * Check if the "more" button should be displayed
         * 
         * @todo provides some caching system
         * @param {String} graphType
         */
        function checkMoreTriggerAvailability(graphType){
            var $availableGraphsContainer = $form.find('#creator-pointAndLineFunctionInteraction-available-graphs');
            var $graphType = $availableGraphsContainer.find('input[name=' + graphType + ']');
            var $more = $availableGraphsContainer.find('.more[data-type=' + graphType + ']');
            if(parseInt($graphType.val())){
                $more.show();
            }else{
                $more.hide();
            }
        }

        /**
         * Common graph number change callback function
         * 
         * @param {Object} interaction
         * @param {String} value - a number string
         * @param {String} graphType
         */
        function changeCallback(interaction, value, graphType){
            updateGraphValue(interaction, value, graphType);
            checkMoreTriggerAvailability(graphType);
        }

        //render the form using the form template
        $form.html(formTpl({
            serial : response.serial,
            identifier : interaction.attr('responseIdentifier'),
            xMin : interaction.prop('xMin'),
            xMax : interaction.prop('xMax'),
            yMin : interaction.prop('yMin'),
            yMax : interaction.prop('yMax'),
            graphs : graphs,
            allowSolutionSet : allowSolutionSet
        }));

        //init form javascript
        formElement.initWidget($form);

        //set change callbacks:
        var options = {
            allowNull : true,
            updateCardinality : false,
            attrMethodNames : {set : 'prop', remove : 'removeProp'},
            callback : function(){
                interaction.triggerPci('gridchange', [interaction.getProperties()]);
            }
        };
        var xAxisCallbacks = formElement.getMinMaxAttributeCallbacks(this.widget.$form, 'xMin', 'xMax', options);
        var yAxisCallbacks = formElement.getMinMaxAttributeCallbacks(this.widget.$form, 'yMin', 'yMax', options);
        var changeCallbacks = {
            identifier : function(i, value){
                response.id(value);
                interaction.attr('responseIdentifier', value);
            },
            lines : changeCallback,
            points : changeCallback,
            segments : changeCallback,
            setPoints : changeCallback,
            allowSolutionSet : function(interaction, value){

                if(value){
                    var $availableGraphsContainer = $form.find('#creator-pointAndLineFunctionInteraction-available-graphs');
                    var $graphType = $availableGraphsContainer.find('input[name=lines]');
                    if(!parseInt($graphType.val())){
                        //set value to one and trigger the ui/incrementer.js change event
                        $graphType.val(1).keyup();
                    }
                }

                updateGraphValue(interaction, value ? 1 : 0, 'solutionSet');
            }
        };
        changeCallbacks = _.assign(changeCallbacks, xAxisCallbacks, yAxisCallbacks);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, changeCallbacks);

        var _this = this;

        $form.find('.sidebar-popup-trigger').each(function(){

            var $trigger = $(this),
                $panel = $trigger.siblings('.sidebar-popup').find('.sidebar-popup-content'),
                type = $trigger.data('type');

            // basic popup functionality
            popup.init($trigger);

            // after popup opens
            $trigger.on('beforeopen.popup', function(e, params){
                _this.buildOptionsBoxContent(type, $panel);
            }).on('close.popup', function(){
                //clean the popup content
                _this.destroyOptionsBoxContent($panel);
            });
        });

        //init the "more" buttons visibility:
        _.each(_.keys(_defaultConfig), function(type){
            checkMoreTriggerAvailability(type);
        });
    };
    
    /**
     * Build the content of the graph otpion box
     * 
     * @param {String} type
     * @param {Object} $panel - the JQuery container
     * @returns {undefined}
     */
    StateQuestion.prototype.buildOptionsBoxContent = function(type, $panel){

        var interaction = this.widget.element,
            graphs = interaction.properties['graphs'];

        if(graphs[type]){
            _.each(graphs[type].elements, function(element){
                //pass element and interaction by reference
                var elementForm = buildElementForm(type, element, interaction);
                elementForm.init();
                $panel.append(elementForm.$dom).append('<hr/>');
            });
        }else{
            throw 'invalid type';
        }

    };
    
    /**
     * Destroy the content of the graph option box
     * 
     * @param {Object} $panel - the JQuery container
     * @returns {undefined}
     */
    StateQuestion.prototype.destroyOptionsBoxContent = function($panel){
        
        $panel.find('.color-trigger').each(function(){
            colorPicker.destroy($(this));
        });
        $panel.empty();
    };
    
    /**
     * Build the form of a graph element
     * 
     * @param {String} type - the type of graph the form of which to be built
     * @param {Object} element
     * @param {Object} interaction
     * @returns {Object}
     */
    function buildElementForm(type, element, interaction){

        var tpl = _tpl[type];
        var lineStyle = element.lineStyle;
        var lineStyles = {
            '' : {label : "plain", selected : false},
            '-' : {label : "dotted", selected : false}
        };

        if(lineStyles[lineStyle]){
            lineStyles[lineStyle].selected = true;
        }

        var data = {
            uid : element.uid,
            label : element.label,
            pointColor : element.pointColor,
            pointRadius : element.pointRadius,
            maximumPoints : element.maximumPoints,
            lineColor : element.lineColor,
            lineWeight : element.lineWeight,
            lineStyles : lineStyles,
            lineStyleToggle : element.lineStyleToggle
        };

        var $dom = $(tpl(data));
        
        var changeCallbacks = {
            label : propChangeCallback,
            pointColor : propChangeCallback,
            pointRadius : propChangeCallback,
            maximumPoints : propChangeCallback,
            lineColor : propChangeCallback,
            lineStyle : propChangeCallback,
            lineWeight : propChangeCallback,
            lineStyleToggle : propChangeCallback
        };
        
        /**
         * Define the callback function for all property elements
         * 
         * @param {Object} element
         * @param {Mixed} propValue
         * @param {String} propName
         * @returns {undefined}
         */
        function propChangeCallback(element, propValue, propName){
            element[propName] = propValue;
            interaction.triggerPci('configchange', [interaction.getProperties()]);
        }

        /**
         * Init the form elements
         * 
         * @returns {undefined}
         */
        function init(){

            formElement.initWidget($dom);
            $dom.find('.color-trigger').each(function(){
                var $trigger = $(this);
                colorPicker.create($trigger, {
                    title : function(){
                        var $title = $trigger.parents('.graph-form-container').find('input[name=label]');
                        return $title.val();
                    }
                });
            });

            formElement.setChangeCallbacks($dom, element, changeCallbacks);
        }

        return {
            $dom : $dom,
            init : init
        };

    }

    return StateQuestion;
});