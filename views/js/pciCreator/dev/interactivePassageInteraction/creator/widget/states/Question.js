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
 * Copyright (c) 2014 (original work) Parcc, Inc.
 */

define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/simpleContentEditableElement',
    'tpl!interactivePassageInteraction/creator/tpl/propertiesForm',
    'lodash'
], function(stateFactory, Question, formElement, editor, formTpl, _){

    var StateQuestion = stateFactory.extend(Question, function(){
        
        //code to execute when entering this state

    }, function(){
        
        //code to execute when leaving this state

    });

    StateQuestion.prototype.initForm = function(){

        //code to init your interaction property form (on the right side bar)
        
        var widget = this.widget, 
            interaction = widget.element,
            $form = widget.$form,
            response = interaction.getResponseDeclaration(),
            somePropValue = 'some prop value';
        
        //render the form using the form template
        $form.html(formTpl({
            serial : response.serial,
            someProp : somePropValue,
            identifier : interaction.attr('responseIdentifier')
        }));
        
        //init form javascript
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, {
            someProp : function(interaction, value){

                //update the pci property value:
                interaction.prop('someProp', value);

                //update rendering (if required to update the visual)
                //warning heavy operation : might be a good idea to use lodash.throttle()
                widget.refresh();
            },
            identifier : function(i, value){
                response.id(value);
                interaction.attr('responseIdentifier', value);
            }
        });
    };

    return StateQuestion;
});
