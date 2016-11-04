define([
    'lodash',
    'jquery',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Answer',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState',
    'tpl!graphPointLineGraphInteraction/creator/tpl/equationFormElement',
    'tpl!graphPointLineGraphInteraction/creator/tpl/equationWizard',
    'tpl!graphPointLineGraphInteraction/creator/tpl/equationResponseCondition',
    'parccTei/pciCreator/helper/responseCondition',
    'ui/dialog'
], function(_, $, __, stateFactory, Answer, formElement, answerStateHelper, equationFormElementTpl, equationWizardTpl, equationRcTpl, responseCondition, dialog){
    'use strict';

    var StateAnswer = stateFactory.extend(Answer, function(){

        var widget = this.widget;

        initEquationBasedScoring(widget);
        widget.$responseForm.on('initResponseForm', function(){
            initEquationBasedScoring(widget);
        });

        initResponseDeclarationWidget(widget);

    }, function(){

        destroyResponseDeclarationWidget(this.widget);
    });

    function initResponseDeclarationWidget(widget){

        var interaction = widget.element;
        var responseDeclaration = interaction.getResponseDeclaration();

        //set correct response as defined in the model
        interaction.setResponse({
            list : {
                string : responseDeclaration.correctResponse || []
            }
        });

        //init editing widget event listener
        interaction.onPci('responseChange', function(response){
            var correctResponse = [];
            if (response.base !== null && response.list) {
                correctResponse = response.list.string;
            }
            responseDeclaration.setCorrect(correctResponse);
        });
    }

    function destroyResponseDeclarationWidget(widget){
        var interaction = widget.element;
        interaction.offPci('responseChange');
        interaction.setResponse({
            base : null
        });
    }

    /**
     * Init the equation based scoring widget
     *
     * @param widget
     */
    function initEquationBasedScoring(widget){

        var interaction = widget.element;
        var item = interaction.getRelatedItem();
        var rp = item.responseProcessing;
        var $responseForm = widget.$responseForm;
        var $templateSelector = $responseForm.find('select[name="template"]').closest('.panel');
        var $equationFormPanel;

        //currently, only authorize correct and custom response processing mode
        //should not be removed as thecustom response widget will hook to this dom element
        $templateSelector.hide();

        if(!$responseForm.find('.panel.equation-scoring').length){

            $equationFormPanel = $(equationFormElementTpl({
                equationScoring : (rp.processingType === 'custom')
            }));
            $templateSelector.after($equationFormPanel);

            $equationFormPanel.on('change', '[name=equationScoring]', function(){

                var $checkbox = $(this);
                if($checkbox.prop('checked')){
                    //init the prompt box
                    equationWizard(function(equation, mumPointsRequired, score){

                        //turn into custom rp and substitute the resp cond
                        responseCondition.replace(interaction, equationRcTpl({
                            responseIdentifier : interaction.attr('responseIdentifier'),
                            equation : equation,
                            mumPointsRequired : mumPointsRequired,
                            score : score
                        }));

                        //reload
                        answerStateHelper.initResponseForm(widget);

                    }, function(){
                        $checkbox.prop('checked', false);
                    });
                }else{
                    restoreCorrectRp(interaction);
                    //reload
                    answerStateHelper.initResponseForm(widget);
                }
            });
        }
    }

    /**
     * Allow restoring the response processing of an interaction back to the standard correct
     *
     * @param interaction
     */
    function restoreCorrectRp(interaction){
        var responseDeclaration = interaction.getResponseDeclaration();
        var item = interaction.getRelatedItem();
        var rp = item.responseProcessing;
        rp.setProcessingType('templateDriven');
        responseDeclaration.template = 'http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct';
    }

    /**
     * Init equation wizard
     *
     * @param {Function} accept - callback to be executed when the wizard is complete
     * @param {Function} refuse - callback to be executed when the wizard is cancelled
     * @returns {*}
     */
    function equationWizard(accept, refuse) {
        var accepted = false;
        var dlg = dialog({
            message: '',//__('Please enter the equation')
            content: equationWizardTpl(),
            buttons: 'cancel,ok',
            autoRender: true,
            autoDestroy: true,
            onOkBtn: function() {
                var equation = dlg.$html.find('input[name=equation]').val();
                var numPoints = dlg.$html.find('input[name=mumPointsRequired]').val();
                var score = dlg.$html.find('input[name=score]').val();
                accepted = true;
                if (_.isFunction(accept)) {
                    accept.call(this, equation, numPoints, score);
                }
            }
        });

        //@todo validate equation during input

        if (_.isFunction(refuse)) {
            dlg.on('closed.modal', function() {
                if (!accepted) {
                    refuse.call(this);
                }
            });
        }
        return dlg;
    }

    return StateAnswer;
});
