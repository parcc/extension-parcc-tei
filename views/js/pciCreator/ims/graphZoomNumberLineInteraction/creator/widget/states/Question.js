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
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!graphZoomNumberLineInteraction/creator/tpl/propertiesForm',
    'lodash',
    'jquery'
], function(stateFactory, Question, formElement, formTpl, _, $){

    'use strict';

    var StateQuestion = stateFactory.extend(Question, function(){

    }, function(){

        var pci = this.widget.element.data('pci');
        if(pci){
            pci.reset();
        }
    });

    StateQuestion.prototype.initForm = function(){

        //code to init your interaction property form (on the right side bar)

        var widget = this.widget,
            interaction = widget.element,
            $form = widget.$form,
            response = interaction.getResponseDeclaration();

        //render the form using the form template
        $form.html(formTpl({
            serial : response.serial,
            identifier : interaction.attr('responseIdentifier'),
            min : interaction.prop('min'),
            max : interaction.prop('max'),
            unitSubDivision : interaction.prop('unitSubDivision'),
            snapTo : interaction.prop('snapTo'),
            increment : interaction.prop('increment')
        }));

        //init form javascript
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, {
            identifier : function(i, value){
                response.id(value);
                interaction.attr('responseIdentifier', value);
            }
        });

        //prevent user to enter start > end
        var $start = $('[name="min"]','#creator-graphFunctionInteraction-axis'),
            $end = $('[name="max"]','#creator-graphFunctionInteraction-axis');
        $start.on('change',function(){
            // If start >= end , set it to end - 1
            if (parseInt($start.val()) >= parseInt($end.val())) {
                $start.val(parseInt($end.val())-1);
            }
        });
        $end.on('change',function(){
            // If end <= start, set it to start + 1
            if (parseInt($end.val()) <= parseInt($start.val())) {
                $end.val(parseInt($start.val())+1);
            }
        });

        $form.find('#creator-graphFunctionInteraction-axis input').on('change',function(){
            var property = $(this).attr('name'),
            value = $(this).val(),
            result = {};
            result[property] = value;
            interaction.prop(property,parseInt(value));
            interaction.triggerPci('axischange', [result] );
        });
    };

    return StateQuestion;
});
