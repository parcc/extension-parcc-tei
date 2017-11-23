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
    'taoQtiItem/qtiCommonRenderer/helpers/PortableElement',
    'lodash',
    'scale.raphael'
], function(PortableElement, _, scaleRaphael){

    'use strict';

    var paperHeight = 600,
        paperWidth = 800,
        paper = scaleRaphael($('#paper')[0], paperWidth, paperHeight);

    var localRequire = PortableElement.getLocalRequire('graphNumberLineInteraction', 'parccTei/pciCreator/dev/graphNumberLineInteraction/', {}, {
        runtimeLocation : 'parccTei/pciCreator/dev/graphNumberLineInteraction/',
        useExtensionAlias : true
    });

    localRequire(['parccTei/portableLib/axisFactory'], function(axisFactory){

        test('create axis', function(){

            var _top = 80,
                _left = 80;

            var axis = new axisFactory(paper, {
                top : _top,
                left : _left,
                unitSubDivision : 2,
                arrows : true
            });

            ok(axis.isRendered(), 'rendered');

            //positioning test:
            var origin = axis.getOriginPosition();
            equal(origin.top, _top, 'origin position correct');
            equal(origin.left, 330, 'origin position correct');

            //snap test
            //with the given config, the step is 25/2 = 12.5px : config.unitSize / config.unitSubDivision
            var snap = axis.snap(origin.left + 12, 123);
            equal(snap[1], _top, 'snap position correct');
            equal(snap[0], 330, 'snap position correct');

            snap = axis.snap(origin.left - 12, 1234);
            equal(snap[0], 330, 'snap position correct');

            snap = axis.snap(origin.left + 13, 12356);
            notEqual(snap[0], 330, 'snap position correct');

        });

        test('clear axis', function(){

            var axis = new axisFactory(paper);
            ok(axis.isRendered(), 'rendered');

            axis.clear();
            ok(!axis.isRendered(), 'cleared');
        });
    });

});
