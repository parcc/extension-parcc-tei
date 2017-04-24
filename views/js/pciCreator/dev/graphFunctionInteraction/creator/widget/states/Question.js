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
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'tpl!graphFunctionInteraction/creator/tpl/propertiesForm',
    'lodash',
    'jquery'
], function(stateFactory, Question, formElement, containerEditor, formTpl, _, $){

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

    StateQuestion.prototype.initForm = function(){

        var widget = this.widget,
            interaction = widget.element,
            $form = widget.$form,
            response = interaction.getResponseDeclaration();
        var graphs = {
            linear : {label : 'Linear'},
            absolute : {label : 'Absolute Value'},
            quadratic : {label : 'Quadratic'},
            exponential : {label : 'Exponential'},
            logarithmic : {label : 'Logarithmic'},
            cosine : {label : 'Sin/Cos'},
            tangent : {label : 'Tan/Cotan'}
        };

        var graphSet = interaction.prop('graphs');
        graphSet = graphSet ? graphSet.split(',') : [];
        _.each(graphSet, function(graph){
            graphs[graph].checked = true;
        });

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
            graphs : graphs,

            graphTitle : interaction.prop('graphTitle'),
            graphTitleRequired : getBoolean(interaction.prop('graphTitleRequired'), true),

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
            xStep : graphGridChangeCallback,
            xSubStep : graphGridChangeCallback,
            yStep : graphGridChangeCallback,
            ySubStep : graphGridChangeCallback,
            yAllowOuter : graphConfigChangeCallback,
            xAllowOuter : graphConfigChangeCallback,

            // maintain state
            graphTitle : graphConfigChangeCallback,
            graphTitleRequired : graphConfigChangeCallback,
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
        changeCallbacks = _.assign(changeCallbacks, xAxisCallbacks, yAxisCallbacks);

        formElement.setChangeCallbacks($form, interaction, changeCallbacks);

        //manually get array of checked graphs
        var $graphs = $form.find('[name=graphs]');
        $graphs.on('change', function(){
            var checked = [];
            $graphs.filter(':checked').each(function(){
                checked.push($(this).val());
            });
            interaction.prop('graphs', checked.join(','));
            interaction.triggerPci('functionsChange', [checked]);
        });
    };

    function graphGridChangeCallback(interaction, value, name){
        interaction.prop(name, value);
        interaction.triggerPci('gridChange', [interaction.getProperties()]);
    }

    function graphConfigChangeCallback(interaction, value, name){
        interaction.prop(name, value);
        interaction.triggerPci('configChange', [interaction.getProperties()]);
    }

    return StateQuestion;
});
