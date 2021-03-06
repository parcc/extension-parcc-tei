<?php
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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

use oat\taoQtiItem\model\SharedLibrariesRegistry;

$libBasePath = ROOT_PATH . 'taoQtiItem/views/js/portableSharedLibraries';
$libRootUrl = ROOT_URL . 'taoQtiItem/views/js/portableSharedLibraries';
$installBasePath = ROOT_PATH . 'parccTei/install/local/portableSharedLibraries';

$registry = new SharedLibrariesRegistry($libBasePath, $libRootUrl);
$registry->registerFromFile('PARCC/graphFunction', $installBasePath . '/PARCC/graphFunction.js');
$registry->registerFromFile('PARCC/gridFactory', $installBasePath . '/PARCC/gridFactory.js');
$registry->registerFromFile('PARCC/plotFactory', $installBasePath . '/PARCC/plotFactory.js');
$registry->registerFromFile('PARCC/pointFactory', $installBasePath . '/PARCC/pointFactory.js');
$registry->registerFromFile('PARCC/axisFactory', $installBasePath . '/PARCC/axisFactory.js');