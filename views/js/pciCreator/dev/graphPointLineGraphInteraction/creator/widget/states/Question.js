define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'tpl!graphPointLineGraphInteraction/creator/tpl/propertiesForm',
    'lodash',
    'jquery'
], function(stateFactory, Question, formElement, containerEditor, formTpl, _, $){

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

        //custom interaction state extends
        this.initColorPickers();

    }, function(){

        //destroy editors
        containerEditor.destroy(this.widget.$container.find('.prompt'));
        this.destroyColorPickers();
    });

    function graphGridChangeCallback(interaction, value, name){
        interaction.prop(name, value);
        interaction.triggerPci('gridChange', [interaction.getProperties()]);
    }

    function graphConfigChangeCallback(interaction, value, name){
        interaction.prop(name, value);
        interaction.triggerPci('configChange', [interaction.getProperties()]);
    }

    StateQuestion.prototype.initForm = function(){

        var widget = this.widget,
            interaction = widget.element,
            $form = widget.$form,
            response = interaction.getResponseDeclaration();

        function getBoolean(value, defaultValue) {
            if (typeof(value) === "undefined") {
                return defaultValue;
            } else {
                return (value === true || value === "true");
            }
        }

        //render the form using the form template
        $form.html(formTpl({
            serial : response.serial,
            identifier : interaction.attr('responseIdentifier'),

            graphTitle : interaction.prop('graphTitle'),
            graphTitleRequired : getBoolean(interaction.prop('graphTitleRequired'), true),
            scatterPlot : interaction.prop('graphType') === "scatterPlot",
            maxPoints : interaction.prop('maxPoints'),
            draggable : getBoolean(interaction.prop('draggable'), true),
            segment : getBoolean(interaction.prop('segment'), true),
            width : interaction.prop('width'),
            height : interaction.prop('height'),
            weight : interaction.prop('weight'),

            xLabel : interaction.prop('xLabel'),
            xStart : interaction.prop('xStart'),
            xEnd : interaction.prop('xEnd'),
            xStep : interaction.prop('xStep'),
            xSubStep : interaction.prop('xSubStep'),
            xAllowOuter : getBoolean(interaction.prop('xAllowOuter'), true),

            yLabel : interaction.prop('yLabel'),
            yStart : interaction.prop('yStart'),
            yEnd : interaction.prop('yEnd'),
            yStep : interaction.prop('yStep'),
            ySubStep : interaction.prop('ySubStep'),
            yAllowOuter : getBoolean(interaction.prop('yAllowOuter'), true),

            innerLineWeight : interaction.prop('innerLineWeight'),
            plotColor : interaction.prop('plotColor'),
            plotThickness : interaction.prop('plotThickness'),
            pointRadius : interaction.prop('pointRadius'),
            pointGlow : getBoolean(interaction.prop('pointGlow'), true),
            pointColor : interaction.prop('pointColor')
        }));

        //init form javascript
        formElement.initWidget($form);

        //set change callbacks:
        var options = {
            allowNull : true,
            updateCardinality : false,
            attrMethodNames : {set : 'prop', remove : 'removeProp'},
            callback : function(){
                interaction.triggerPci('gridChange', [interaction.getProperties()]);
            }
        };

        var xAxisCallbacks = formElement.getMinMaxAttributeCallbacks(this.widget.$form, 'xStart', 'xEnd', options);
        var yAxisCallbacks = formElement.getMinMaxAttributeCallbacks(this.widget.$form, 'yStart', 'yEnd', options);
        var changeCallbacks = {
            identifier : function(i, value){
                response.id(value);
                interaction.attr('responseIdentifier', value);
            },
            // reset state
            width : graphGridChangeCallback,
            height : graphGridChangeCallback,
            maxPoints : graphGridChangeCallback,
            xStep : graphGridChangeCallback,
            xSubStep : graphGridChangeCallback,
            yStep : graphGridChangeCallback,
            ySubStep : graphGridChangeCallback,
            yAllowOuter : graphConfigChangeCallback,
            xAllowOuter : graphConfigChangeCallback,

            // maintain state
            graphTitle : graphConfigChangeCallback,
            graphType : graphConfigChangeCallback,
            graphTitleRequired : graphConfigChangeCallback,
            draggable : graphConfigChangeCallback,
            segment : graphConfigChangeCallback,
            weight : graphConfigChangeCallback,

            xLabel : graphConfigChangeCallback,
            yLabel : graphConfigChangeCallback,

            plotColor : graphConfigChangeCallback,
            plotThickness : graphConfigChangeCallback,
            pointRadius : graphConfigChangeCallback,
            pointGlow : graphConfigChangeCallback,
            pointColor : graphConfigChangeCallback,
            innerLineWeight : graphConfigChangeCallback
        };
        changeCallbacks = _.assign(changeCallbacks, xAxisCallbacks, yAxisCallbacks);

        formElement.setChangeCallbacks($form, interaction, changeCallbacks);
    };

    return StateQuestion;
});
