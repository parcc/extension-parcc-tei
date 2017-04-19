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
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'multiTabbedExhibit/creator/widget/helper/passageEditor',
    'tpl!multiTabbedExhibit/creator/tpl/propertiesForm',
    'tpl!multiTabbedExhibit/creator/tpl/tabForm',
    'tpl!multiTabbedExhibit/creator/tpl/page-adder',
    'tpl!multiTabbedExhibit/creator/tpl/page-deleter',
    'lodash',
    'jquery'
], function(
    stateFactory,
    Question,
    formElement,
    containerEditor,
    passageEditor,
    formTpl,
    tabTpl,
    pageAdderTpl,
    pageDeleterTpl,
    _,
    $){

    'use strict';

    var StateQuestion = stateFactory.extend(Question, function(){

        var self = this,
            interaction = this.widget.element,
            $currentPassage = this.widget.$container.find('.passage:visible');
        
        //init only the currently visible one    
        this.initEditor($currentPassage.data('passage-id'));

        //init passage editors
        interaction.onPci('passagereload', function(state){
            self.destroyEditors();
            //init the curent one only
            if(state.passage){
                self.initEditor(state.passage);
            }
        }).onPci('activate', function(passageId){
            //activate the editing of the current passage
            self.initEditor(passageId);
        });

    }, function(){

        this.destroyEditors();
    });

    /**
     * Init the sidebar property forms
     */
    StateQuestion.prototype.initForm = function(){

        //code to init your interaction property form (on the right side bar)

        var self = this,
            widget = this.widget,
            $container = widget.$container,
            interaction = widget.element,
            passages = interaction.data('passages') || {},
            tabbed = interaction.prop('tabbed'),
            $form = widget.$form;

        //render the form using the form template
        $form.html(formTpl({
            tabbed : tabbed
        }));

        var $panelTabManager = $form.find('.creator-multiTabbedExhibit'),
            $panelTabAdd = $panelTabManager.find('.tab-form-add'),
            $panelTabForms = $panelTabManager.find('.tab-form-container');

        //add tabs option forms
        _.each(passages, function(passage){
            $panelTabForms.append(renderPassageForm(passage));
        });

        //init form javascript
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, {
            tabbed : function(i, value){
                interaction.prop('tabbed', value);

                //toggle tabbed editing panel visibility
                if(value){
                    $panelTabManager.show();
                }else{
                    $panelTabManager.hide();

                    //ask for confirmation first

                    //merge all tab together
                }

                //communicate change to pci
                self.refreshRendering();
            }
        });

        //toggle visibility of tabs editing panel
        if(!tabbed){
            $panelTabManager.hide();
        }

        //init add tab button
        $panelTabAdd.on('click', function(){
            //create a new passage
            var passageId = passageEditor.addPassage(interaction);

            //append the passage form
            var passage = passageEditor.getPassage(interaction, passageId);
            var $passageForm = $(renderPassageForm(passage));
            $panelTabForms.append($passageForm);
            formElement.initWidget($passageForm);

            //communicate change to pci
            self.refreshRendering();
        });

        //add delete button click event listener
        $panelTabManager.on('click', '.passage-form .passage-button-delete', function(){

            var $passageForm = $(this).parent('.passage-form');
            var id = $passageForm.data('passage-id');

            //delete the passage from the interaction model
            passageEditor.removePassage(interaction, id);

            //remove the form from dom
            $passageForm.remove();

            //communicate change to pci
            self.refreshRendering();

        }).on('change', 'select[name=type]', function(){

            var $select = $(this);
            var type = $select.val();
            var $form = $select.parents('.passage-form');
            var id = $form.data('passage-id');

            passageEditor.setType(interaction, id, type);
            self.refreshRendering();

            //toggle size selection visibility
            if(type === 'passage-simple'){
                //hide size selector
                $form.find('.passage-size').hide();
            }else{
                $form.find('.passage-size').show();
            }

        }).on('change', 'select[name=size]', function(){

            var $select = $(this);
            var size = $select.val();
            var $form = $select.parents('.passage-form');
            var id = $form.data('passage-id');
            var oldSize = passageEditor.getPassage(interaction, id);

            passageEditor.setSize(interaction, id, size);

            //save the change in the model
            interaction.updateMarkup();

            //directly affect the dom
            $container.find('.passage[data-passage-id=' + id + ']').removeClass(oldSize.size).addClass(size);

            //the container has been resized
            interaction.triggerPci('resize');

        }).on('keyup', 'input[name=name]', _.throttle(function(){

            var $input = $(this);
            var name = $input.val();
            var $form = $input.parents('.passage-form');
            var id = $form.data('passage-id');

            passageEditor.setTitle(interaction, id, name);

            //save the change in the model
            interaction.updateMarkup();

            //directly affect the dom
            $container.find('.passages-tab-navigation a[data-passage-id=' + id + ']').html(name);

        }, 400));

    };

    /**
     * Destroy all the editing widgets, including rich html editors and the page managers
     */
    StateQuestion.prototype.destroyEditors = function(){
        var $container = this.widget.$container;
        $container.find('.passage-simple, .passage-scrolling .passage-content, .passage-paging .page .page-content').each(function(){
            containerEditor.destroy($(this));
        });
        $container.off('.page-adder').find('.page-adder, .page-deleter').remove();
        $container.find('.editor-ready').removeClass('editor-ready');
    };

    /**
     * Refresh completely the rendering of the passages with the possibility to define the state upon refresh
     * 
     * @param {object} [state]
     */
    StateQuestion.prototype.refreshRendering = function(state){

        var interaction = this.widget.element;
        var currentState = interaction.data('pci').getSerializedState();
        var newState = _.defaults(state || {}, currentState);

        //update the markup
        interaction.updateMarkup();

        //destroy editors
        this.destroyEditors();

        //reload the pci
        interaction.triggerPci('passagechange', [interaction.markup, interaction.prop('tabbed'), newState]);
    };

    StateQuestion.prototype.initEditor = function(passageId){

        var self = this,
            interaction = this.widget.element,
            $container = this.widget.$container,
            passages = interaction.data('passages');

        var passage = _.find(passages, {uid : passageId});
        if(passage){
            switch(passage.type){
                case 'passage-simple':
                    initContentEditor($container.find('.passage-simple[data-passage-id=' + passage.uid + ']'), passage, interaction);
                    break;
                case 'passage-scrolling':
                    initContentEditor($container.find('.passage-scrolling[data-passage-id=' + passage.uid + '] .passage-content'), passage, interaction);
                    break;
                case 'passage-paging':

                    var $passage = $container.find('.passage-paging[data-passage-id=' + passage.uid + ']');
                    _.each(passage.pages, function(page){

                        var $page = $passage.find('.page[data-page-id=' + page.uid + ']');
                        initContentEditor($page.find('.page-content'), page, interaction);

                        //init delete button
                        if(passage.pages.length > 1){
                            //need to keep at least one page!
                            $page.find('.page-header').prepend(pageDeleterTpl({
                                passage : passage.uid,
                                page : page.uid
                            }));
                        }

                        //init insert page buttons
                        $page.find('.page-footer').append(pageAdderTpl({
                            passage : passage.uid,
                            page : page.uid
                        }));

                    });

                    //init insert page buttons
                    $passage.find('.page:first .page-header').prepend(pageAdderTpl({
                        passage : passage.uid,
                        page : '_prepend'
                    }));

                    //init page adder:
                    $passage.off('.page-adder').on('click.page-adder', '.page-adder .circle', function(){
                        //add new page
                        var $button = $(this);
                        var passage = $button.data('passage');
                        var page = $button.data('page');
                        var newPageId = passageEditor.addPage(interaction, passage, page);
                        self.refreshRendering({page : newPageId});
                    }).on('click.page-adder', '.page-deleter', function(){
                        //delete 
                        var $button = $(this);
                        var passage = $button.data('passage');
                        var page = $button.data('page');
                        passageEditor.removePage(interaction, passage, page);
                        self.refreshRendering();
                    });

                    break;
                default:
                    throw 'unknown type of passage';
            }
        }else{
            throw 'passage not found';
        }
    };

    /**
     * Init the html roch editor
     * 
     * @param {JQuery} $editable - the editable passage content
     * @param {Object} passage - the passage object
     * @param {Object} interaction - the standard interaction object
     * @throws Will throw an exception if the Jquery element is empty (not found)
     */
    function initContentEditor($editable, passage, interaction){
        if($editable.length){

            var $passage = $editable.hasClass('passage') ? $editable : $editable.parents('.passage');

            if(!$editable.hasClass('editor-ready')){

                //init once only
                $editable.addClass('editor-ready');

                containerEditor.create($editable, {
                    change : _.throttle(function(text){
                        passage.content = text;
                        interaction.updateMarkup();
                        interaction.triggerPci('resize');
                    }, 600),
                    markup : passage.content,
                    related : interaction,
                    placeholder : $passage.hasClass('passage-paging') ? 'your page content ...' : 'enter your passage content here ...',
                    $toolbarLocation : $passage,
                    hideTriggerOnBlur : true,
                    toolbar : [{
                            name : 'basicstyles',
                            items : ['Bold', 'Italic', 'Subscript', 'Superscript']
                        }, {
                            name : 'insert',
                            items : ['Image', 'SpecialChar']
                        },
                        {
                            name : 'links',
                            items : ['Link']
                        },
                        {
                            name : 'paragraph',
                            items : ['NumberedList', 'BulletedList', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']
                        },
                        '/',
                        {
                            name : 'styles',
                            items : ['Format', 'TextColor', 'Font', 'FontSize']
                        }]
                });
            }

        }
    }

    /**
     * Render the form html of a passage object
     * 
     * @param {Object} passage - the passage object
     * @returns {String} - the rendered html
     */
    function renderPassageForm(passage){

        var data = {
            passageId : passage.uid,
            name : passage.title,
            hasSize : false
        };

        data.types = [];
        _.each(passageEditor.getAvailableTypes(), function(type){
            if(passage.type === type.cssClass){
                type.selected = true;
            }
            data.types.push(type);
        });

        data.hasSize = (passage.type !== 'passage-simple');
        data.sizes = [];
        _.each(passageEditor.getAvailableSizes(), function(size){
            if(passage.size === size.cssClass){
                size.selected = true;
            }
            data.sizes.push(size);
        });

        return tabTpl(data);
    }

    return StateQuestion;
});
