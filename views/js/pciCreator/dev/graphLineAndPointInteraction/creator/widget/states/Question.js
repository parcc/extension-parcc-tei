define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'graphLineAndPointInteraction/creator/libs/randomColor/randomColor',
    'tpl!graphLineAndPointInteraction/creator/tpl/propertiesForm',
    'tpl!graphLineAndPointInteraction/creator/tpl/pointsForm',
    'tpl!graphLineAndPointInteraction/creator/tpl/linesForm',
    'lodash',
    'jquery'
], function(stateFactory, Question, formElement, containerEditor, randomColor, formTpl, pointsFormTpl, linesFormTpl, _, $){
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

        //code to execute when leaving this state

    });

    var _tpl = {
        points : pointsFormTpl,
        lines : linesFormTpl
    };

    function generateColorByGraphType(type){

        var _typeHues = {
            points : 'yellow',
            setPoints : 'green',
            lines : 'red',
            segments : 'orange',
            solutionSet : 'blue'
        };

        if(_typeHues[type]){
            var colors = randomColor({hue : _typeHues[type], luminosity : 'dark', count : 1});
            return colors.pop();
        }
    }

    function generateLabelByGraphType(type, rank){

        var _typeLabels = {
            points : 'Point',
            setPoints : 'Point Set',
            lines : 'Line',
            segments : 'Segment',
            solutionSet : 'Solution Set'
        };

        if(_typeLabels[type]){
            return _typeLabels[type] + ' ' + String.fromCharCode(65 + rank);
        }
    }

    var _defaultConfig = {
        points : {pointRadius : 10},
        setPoints : {max : 5},
        lines : {lineStyle : '', lineStyleToggle : false, lineWidth : 3, pointRadius : 10},
        segments : {lineStyle : '-', lineStyleToggle : false, lineWidth : 3, pointRadius : 10},
        solutionSet : {}
    };

    /**
     * Create a default config width a label and a color
     * @param  {String} graphType the type of the graph
     * @param  {Number} nbElements How many elements you want to generate
     * @params {Number} existingElements How many elements already exists
     * @return {Array}            Element Collection
     */
    function defaultConfig(graphType, nbElements, existingElements){

        var elements = [];
        for(var i = 0; i < nbElements; i++){

            var color = generateColorByGraphType(graphType);
            var label = generateLabelByGraphType(graphType, existingElements + i);
            var generatedConfig = {
                label : label,
                uid : _.uniqueId(graphType)
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
                    generatedConfig.color = color;
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
        /** @type {Object} the old graphs object */
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
            response = interaction.getResponseDeclaration(),
            graphs = interaction.prop('graphs');

        //@todo : provides some caching system
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
            graphs : graphs
        }));

        //init form javascript
        formElement.initWidget($form);

        //set change callbacks:
        var options = {
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
            solutionSet : function(interaction, value, graphType){

                var $availableGraphsContainer = $form.find('#creator-pointAndLineFunctionInteraction-available-graphs');
                var $graphType = $availableGraphsContainer.find('input[name=lines]');
                if(!parseInt($graphType.val())){
                    //set value to one and trigger the ui/incrementer.js change event
                    $graphType.val(1).keyup();
                }

                //if there is no line yet, add one !
                var temp = interaction.prop('graphs');
                if(temp.lines.count < 1){
                    temp.lines.count = 1;
                    temp.lines.elements = defaultConfig('line', 1);
                }

                updateGraphValue(interaction, value, graphType);
                checkMoreTriggerAvailability(graphType);
            }
        };
        changeCallbacks = _.assign(changeCallbacks, xAxisCallbacks, yAxisCallbacks);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, changeCallbacks);

        var _this = this;
        $form.on('click', '.more', function(){

            var $more = $(this),
                type = $more.data('type');

            _this.showOptionsBox(type);
        });
    };

    StateQuestion.prototype.showOptionsBox = function(type){
        console.log(type, graphs);

        var interaction = this.widget.element,
            $container = $('#math-editor-container'),
            $panel = $container.find('.panel-container');
        var rendering = '';

        var graphs = interaction.prop('graphs');
        if(graphs[type] && _tpl[type]){
            _.each(graphs[type].elements, function(element){
                rendering += _tpl[type]({
                });
                rendering += '<hr/>';
            });
        }else{
            throw 'invalid type';
        }

        $panel.empty().html(rendering);

        $container.show();
        $container.find('.closer').click(function(){
            $container.hide();
        });
    }

    return StateQuestion;
});
