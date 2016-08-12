define([
    'parccTei/pciCreator/dev/multiTabbedExhibit/creator/widget/helper/passageEditor',
    'taoQtiItem/qtiCreator/model/interactions/PortableCustomInteraction',
    'jquery',
    'lodash'
], function (passageEditor, PortableCustomInteraction, $, _) {

    'use strict';

    QUnit.test('loadData', function () {
        
        var $markupContainer = $('.multiTabbedExhibit-markup');
        QUnit.assert.ok($markupContainer.length, 'the markup is present');
        
        var interaction = new PortableCustomInteraction();
        interaction.markup = $markupContainer.html();
        
        passageEditor.loadData(interaction);
        
        var passages = interaction.data('passages');
        QUnit.assert.equal(_.size(passages), 3, 'passages loaded');
        
        var passagesArray = _.values(passages);
        
        //verify passage 1
        QUnit.assert.equal(passagesArray[0].type, 'passage-simple', 'passage type ok');
        QUnit.assert.equal(passagesArray[0].title, 'Passage 1', 'passage title ok');
        QUnit.assert.equal(passagesArray[0].content.trim(), 'Simple passage', 'passage content ok');
        QUnit.assert.equal(passagesArray[0].size, undefined, 'passage size ok');
        
        //verify passage 2
        QUnit.assert.equal(passagesArray[1].type, 'passage-paging', 'passage type ok');
        QUnit.assert.equal(passagesArray[1].title, 'Passage 2', 'passage title ok');
        QUnit.assert.equal(passagesArray[1].pages.length, 4, 'passage content ok');
        QUnit.assert.equal(passagesArray[1].size, 'passage540', 'passage size ok');
        
        //verify passage 3
        QUnit.assert.equal(passagesArray[2].type, 'passage-scrolling', 'passage type ok');
        QUnit.assert.equal(passagesArray[2].title, 'Passage 3', 'passage title ok');
        QUnit.assert.equal(passagesArray[2].content.trim(), 'Passage with scrolling', 'passage content ok');
        QUnit.assert.equal(passagesArray[2].size, 'passage240', 'passage size ok');
    });
    
    QUnit.test('add/get/remove passages', function () {
        
        var interaction = new PortableCustomInteraction();
        QUnit.assert.equal(interaction.data('passages'), undefined, 'passage empty');
        
        var passageId = passageEditor.addPassage(interaction);
        QUnit.assert.equal(_.size(interaction.data('passages')), 1, 'passage created');
        
        var passage = passageEditor.getPassage(interaction, passageId);
        QUnit.assert.equal(passage.type, 'passage-simple', 'new passage type correct');
        QUnit.assert.notEqual(passage.content, undefined, 'new passage has initialized');
        
        passageEditor.removePassage(interaction, passageId);
        QUnit.assert.equal(_.size(interaction.data('passages')), 0, 'passage removed');
    });
    
    QUnit.test('setPassageContent & setType', function () {
        
        var passage;
        var passageContent = 'some content';
        var interaction = new PortableCustomInteraction();
        var passageId = passageEditor.addPassage(interaction);
        QUnit.assert.equal(_.size(interaction.data('passages')), 1, 'passage created');
        
        passageEditor.setPassageContent(interaction, passageId, passageContent);
        passage = passageEditor.getPassage(interaction, passageId);
        QUnit.assert.equal(passage.content, passageContent, 'content correctly set');
        
        //set to paging type
        passageEditor.setType(interaction, passageId, 'passage-paging');
        passage = passageEditor.getPassage(interaction, passageId);
        QUnit.assert.equal(passage.type, 'passage-paging', 'page type set');
        QUnit.assert.equal(passage.content, undefined, 'content transformed');
        QUnit.assert.equal(passage.pages.length, 1, 'one page created');
        QUnit.assert.equal(passage.pages[0].content, passageContent, 'content transformed into page');
        QUnit.assert.equal(passage.size, 'passage240', 'size added');
        
        //set to scrolling type
        passageEditor.setType(interaction, passageId, 'passage-scrolling');
        passage = passageEditor.getPassage(interaction, passageId);
        QUnit.assert.equal(passage.type, 'passage-scrolling', 'page type set');
        QUnit.assert.equal(passage.pages, undefined, 'content transformed');
        QUnit.assert.equal(passage.content, passageContent, 'content correctly transformed back into single page');
        QUnit.assert.equal(passage.size, 'passage240', 'size preserved');
        
        //set to simple type
        passageEditor.setType(interaction, passageId, 'passage-simple');
        passage = passageEditor.getPassage(interaction, passageId);
        QUnit.assert.equal(passage.type, 'passage-simple', 'page type set');
        QUnit.assert.equal(passage.content, passageContent, 'content preserved');
        QUnit.assert.equal(passage.size, undefined, 'size removed');
    });
    
    QUnit.test('addPage & removePage', function () {
        
        QUnit.assert.ok(true, 'in progress');
        
        var passage;
        var interaction = new PortableCustomInteraction();
        var passageId = passageEditor.addPassage(interaction);
        QUnit.assert.equal(_.size(interaction.data('passages')), 1, 'passage created');
        
        //set to paging type
        passageEditor.setType(interaction, passageId, 'passage-paging');
        passage = passageEditor.getPassage(interaction, passageId);
        QUnit.assert.equal(passage.pages.length, 1, 'one page created');
        
        var pageId = passageEditor.addPage(interaction, passageId);
        passage = passageEditor.getPassage(interaction, passageId);
        QUnit.assert.equal(passage.pages.length, 2, 'another page created');
        
        passageEditor.removePage(interaction, passageId, pageId);
        passage = passageEditor.getPassage(interaction, passageId);
        QUnit.assert.equal(passage.pages.length, 1, 'one page removed');
        
    });
});