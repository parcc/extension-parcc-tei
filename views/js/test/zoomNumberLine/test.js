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
 * Copyright (c) 2015-2017 Parcc, Inc.
 */


define([
    'jquery',
    'lodash',
    'taoQtiItem/runner/qtiItemRunner',
    'taoQtiItem/portableElementRegistry/ciRegistry',
    'taoQtiItem/portableElementRegistry/provider/localManifestProvider',
    'json!parccTei/test/samples/zoomNumberLine.json'
], function($, _, qtiItemRunner, ciRegistry, pciTestProvider, graphZoomNumberLineInteractionData){
    'use strict';


    var outsideContainerId = 'outside-container';

    //manually register the pci from its manifest
    pciTestProvider.addManifestPath(
        'graphZoomNumberLineInteraction',
        'parccTei/pciCreator/ims/graphZoomNumberLineInteraction/imsPciCreator.json');
    ciRegistry.resetProviders();
    ciRegistry.registerProvider(pciTestProvider.getModuleName());

    QUnit.module('Visual test');


    QUnit.asyncTest('Display and play', function(assert){
        var $container = $('#' + outsideContainerId);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        qtiItemRunner('qti', graphZoomNumberLineInteractionData)
            .on('render', function(){
                QUnit.start();
            })
            .on('error', function(error) {
                assert.ok(false, error);
            })
            .init()
            .render($container, { state: {} });
    });

});
