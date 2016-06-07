define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'tpl!graphPointLineGraphInteraction/creator/tpl/propertiesForm',
    'lodash',
    'jquery',
    'i18n'
], function(stateFactory, Question, formElement, containerEditor, formTpl, _, $, __){

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
            xTitle : interaction.prop('xTitle'),
            xStart : interaction.prop('xStart'),
            xEnd : interaction.prop('xEnd'),
            xStep : interaction.prop('xStep'),
            xSubStep : interaction.prop('xSubStep'),
            xAllowOuter : getBoolean(interaction.prop('xAllowOuter'), true),

            yLabel : interaction.prop('yLabel'),
            yTitle : interaction.prop('yTitle'),
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

        function getMinStep(start, end) {
            var maxSubDiv = 100,
                range = Math.abs(interaction.prop(end) - interaction.prop(start));

            return Math.round(range / maxSubDiv);
        }

        updateMinStepInfo('.xStepInfo', getMinStep('xStart', 'xEnd'));
        updateMinStepInfo('.yStepInfo', getMinStep('yStart', 'yEnd'));
/
        var xAxisCallbacks = formElement.getMinMaxAttributeCallbacks(this.widget.$form, 'xStart', 'xEnd', options);
        var yAxisCallbacks = formElement.getMinMaxAttributeCallbacks(this.widget.$form, 'yStart', 'yEnd', options);

        function updateMinStepInfo(stepInfo, minStep) {
            var $stepInfo = $(stepInfo);
            $stepInfo.html(__('(min. increment: ' + minStep + ')'));
        }

        function adjustStepToRange(start, end, step) {
            var $step = $form.find('input[name=' + step + ']'),
                currentStep = $step.val(),
                minStep = getMinStep(start, end, step),
                stepInfoSelector = '.' + step + 'Info';

            if (currentStep < minStep) {
                updateMinStepInfo(stepInfoSelector, minStep);
                highlightStepError(stepInfoSelector);
                highlightStepError('.' + step + 'Value');
                $step.val(minStep);
                interaction.prop(step, minStep);
                $step.trigger('change');

            } else if (currentStep !== minStep) {
                highlightStepInfo(stepInfoSelector);
            }
        }


        function highlightStep(selector, classname) {
            var $stepInfo = $(selector);
            $stepInfo.addClass(classname);
            setTimeout(function() {
                $stepInfo.removeClass(classname);
            }, 1000);
        }

        function highlightStepInfo(selector) {
            highlightStep(selector, 'feedback-info');
        }

        function highlightStepError(selector) {
            highlightStep(selector, 'feedback-error');

        }

        // we wrap axis getMinMaxAttributeCallbacks callbacks to provide a safety check for the step value
        var axisCallbacks = {
            xStart: function (element, value, name) {
                if (interaction.prop(name) !== value) {
                    adjustStepToRange('xStart', 'xEnd', 'xStep');
                    xAxisCallbacks.xStart(element, value, name);
                }
            },
            xEnd: function (element, value, name) {
                if (interaction.prop(name) !== value) {
                    adjustStepToRange('xStart', 'xEnd', 'xStep');
                    xAxisCallbacks.xEnd(element, value, name);
                }
            },
            yStart: function (element, value, name) {
                yAxisCallbacks.yStart(element, value, name);
                adjustStepToRange('yStart', 'yEnd', 'yStep');
            },
            yEnd: function (element, value, name) {
                yAxisCallbacks.yEnd(element, value, name);
                adjustStepToRange('yStart', 'yEnd', 'yStep');
            }
        };

        // safety check for step value
        var stepCallbacks = {
            xStep: function (element, value, name) {
                var minStep = getMinStep('xStart', 'xEnd'),
                    $step = $form.find('input[name=xStep]');

                if (value < minStep) {
                    value = minStep;
                    $step.val(value);
                    highlightStepError('.xStepInfo');
                }
                graphGridChangeCallback(element, value, name);
            },
            yStep: function (element, value, name) {
                var safeStep = getMinStep('yStart', 'yEnd', 'yStep');
                graphGridChangeCallback(element, safeStep, name);
            }
        };


        var changeCallbacks = {
            identifier : function(i, value){
                response.id(value);
                interaction.attr('responseIdentifier', value);
            },
            // reset state
            width : graphGridChangeCallback,
            height : graphGridChangeCallback,
            maxPoints : graphGridChangeCallback,
            // xStep : graphGridChangeCallback,
            xSubStep : graphGridChangeCallback,
            // yStep : graphGridChangeCallback,
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
            xTitle : graphConfigChangeCallback,
            yLabel : graphConfigChangeCallback,
            yTitle : graphConfigChangeCallback,

            plotColor : graphConfigChangeCallback,
            plotThickness : graphConfigChangeCallback,
            pointRadius : graphConfigChangeCallback,
            pointGlow : graphConfigChangeCallback,
            pointColor : graphConfigChangeCallback,
            innerLineWeight : graphConfigChangeCallback
        };
        changeCallbacks = _.assign(changeCallbacks, axisCallbacks, stepCallbacks);

        formElement.setChangeCallbacks($form, interaction, changeCallbacks);
    };

    return StateQuestion;
});
