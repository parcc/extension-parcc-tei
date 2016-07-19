define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'tpl!graphPointLineGraphInteraction/creator/tpl/propertiesForm',
    'tpl!graphPointLineGraphInteraction/creator/tpl/staticPoint',
    'lodash',
    'jquery',
    'ui/incrementer'
], function(stateFactory, Question, formElement, containerEditor, formTpl, staticPointTpl, _, $, spinner){

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
            staticPoints = {},
            staticPointsNb = 0,
            $form = widget.$form,
            $staticPointsForms, $staticPointsPanel,
            response = interaction.getResponseDeclaration();

        function getBoolean(value, defaultValue) {
            if (typeof(value) === "undefined") {
                return defaultValue;
            } else {
                return (value === true || value === "true");
            }
        }

        function graphGridChangeStaticPointsCallback() {
            graphGridChangeCallback.apply(this, arguments);
            buildStaticPointsForms();
            updateStaticPoints();
        }

        function updateStaticPoints() {
            graphConfigChangeCallback(interaction, _.compact(_.values(staticPoints)), 'staticPoints');
        }

        function buildStaticPointsForms() {
            staticPoints = {};
            staticPointsNb = 0;
            $staticPointsForms.empty();
            _.forEach(interaction.prop('staticPoints'), addStaticPoint);
        }

        function addStaticPoint(staticPoint) {
            var idx = staticPointsNb ++;
            var $staticPoint;
            staticPoint = staticPoint || {x: 0, y: 0};

            $staticPoint = $(staticPointTpl({
                idx: idx,
                x: staticPoint.x,
                y: staticPoint.y,
                xMax: interaction.prop('xEnd'),
                xStep: parseInt(interaction.prop('xStep')) / (parseInt(interaction.prop('xSubStep')) || 0),
                yMax: interaction.prop('yEnd'),
                yStep: parseInt(interaction.prop('yStep')) / (parseInt(interaction.prop('ySubStep')) || 0),
                label: staticPoint.label
            }));
            spinner($staticPoint);

            staticPoints[idx] = staticPoint;
            $staticPointsForms.append($staticPoint);
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
            pointColor : interaction.prop('pointColor'),

            staticPoints : interaction.prop('staticPoints'),
            staticPointColor : interaction.prop('staticPointColor'),
            staticPointGlow : getBoolean(interaction.prop('staticPointGlow'), false),
            staticPointRadius : interaction.prop('staticPointRadius'),
            staticPointLabelSize : interaction.prop('staticPointLabelSize'),
            staticPointLabelWeight : interaction.prop('staticPointLabelWeight'),
            staticPointLabelColor : interaction.prop('staticPointLabelColor'),
            staticDisplayPoints : getBoolean(interaction.prop('staticDisplayPoints'), true),
            staticLineColor : interaction.prop('staticLineColor'),
            staticLineThickness : interaction.prop('staticLineThickness'),
            staticShowLine : getBoolean(interaction.prop('staticShowLine'), true)
        }));
        $staticPointsPanel = $form.find('.static-points-panel');
        $staticPointsForms = $staticPointsPanel.find('.static-points');

        //init form javascript
        formElement.initWidget($form);

        buildStaticPointsForms();
        $staticPointsPanel
            .on('click', '.static-point-add', function(e) {
                e.preventDefault();
                addStaticPoint();
                updateStaticPoints();
            })
            .on('click', '.static-point-delete', function(e) {
                var $panel = $(this).closest('.static-point-container');
                var idx = $panel.data('idx');
                e.preventDefault();
                $panel.remove();
                staticPoints[idx] = null;
                updateStaticPoints();
            })
            .on('change', '.static-point-container input', function() {
                var $panel = $(this).closest('.static-point-container');
                var idx = $panel.data('idx');
                var staticPoint = staticPoints[idx];
                if (staticPoint) {
                    staticPoint.x = $panel.find('input[name="x"]').val();
                    staticPoint.y = $panel.find('input[name="y"]').val();
                    staticPoint.label = $panel.find('input[name="label"]').val();
                    updateStaticPoints();
                }
            });

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
            width : graphGridChangeStaticPointsCallback,
            height : graphGridChangeStaticPointsCallback,
            maxPoints : graphGridChangeCallback,
            xStep : graphGridChangeStaticPointsCallback,
            xSubStep : graphGridChangeStaticPointsCallback,
            yStep : graphGridChangeStaticPointsCallback,
            ySubStep : graphGridChangeStaticPointsCallback,
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
            innerLineWeight : graphConfigChangeCallback,

            staticPoints : graphConfigChangeCallback,
            staticPointColor : graphConfigChangeCallback,
            staticPointGlow : graphConfigChangeCallback,
            staticPointRadius : graphConfigChangeCallback,
            staticPointLabelSize : graphConfigChangeCallback,
            staticPointLabelWeight : graphConfigChangeCallback,
            staticPointLabelColor : graphConfigChangeCallback,
            staticDisplayPoints : graphConfigChangeCallback,
            staticLineColor : graphConfigChangeCallback,
            staticLineThickness : graphConfigChangeCallback,
            staticShowLine : graphConfigChangeCallback
        };
        changeCallbacks = _.assign(changeCallbacks, xAxisCallbacks, yAxisCallbacks);

        formElement.setChangeCallbacks($form, interaction, changeCallbacks);
    };

    return StateQuestion;
});
