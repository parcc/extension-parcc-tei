define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'graphLineAndPointInteraction/creator/libs/randomColor/randomColor',
    'tpl!graphLineAndPointInteraction/creator/tpl/propertiesForm',
    'lodash',
    'jquery'
], function(stateFactory, Question, formElement, containerEditor, randomColor, formTpl, _, $){
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

    function generateColorByGraphType(type){

        var _typeHues = {
            points : 'pink',
            setPoints : 'red',
            lines : 'yellow',
            segments : 'green',
            solutionSet : 'blue'
        };

        if(_typeHues[type]){
            var colors = randomColor({hue : _typeHues[type], count : 1});
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

    /**
     * Create a default config width a label and a color
     * @param  {String} graphType the type of the graph
     * @param  {Number} nbElements How many elements you want to generate
     * @params {Number} existingElements How many elements already exists
     * @return {Array}            Element Collection
     */
    function defaultConfig(graphType, nbElements, existingElements){

        //get a new color :

        var elements = [];

        for(var i = 0; i < nbElements; i++){

            var color = generateColorByGraphType(graphType);
            var label = generateLabelByGraphType(graphType, existingElements + i);

            elements.push({
                color : color,
                label : label,
                uid : _.uniqueId(graphType)
            });
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
            lines : updateGraphValue,
            points : updateGraphValue,
            segments : updateGraphValue,
            setPoints : updateGraphValue,
            solutionSet : function(interaction, value){
                var temp = interaction.prop('graphs');
                temp.solutionSet.count = value;
                if(temp.lines.count < 1){
                    temp.lines.count = 1;
                    temp.lines.elements = defaultConfig('line', 1);
                }
                if(value > temp.solutionSet.elements.length){
                    temp.solutionSet.elements = temp.solutionSet.elements.concat(defaultConfig('solutionSet', value - temp.solutionSet.elements.length));
                }else if(value < temp.solutionSet.elements.length){
                    temp.solutionSet.elements = _.first(temp.solutionSet.elements, value);
                }
                interaction.prop('graphs', temp);
                interaction.triggerPci('configchange', [interaction.getProperties()]);
            }
        };
        changeCallbacks = _.assign(changeCallbacks, xAxisCallbacks, yAxisCallbacks);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, changeCallbacks);

    };

    return StateQuestion;
});
