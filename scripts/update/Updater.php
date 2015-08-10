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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA;
 *
 *
 */

namespace oat\parccTei\scripts\update;

use oat\taoQtiItem\model\SharedLibrariesRegistry;
use oat\taoQtiItem\model\HookRegistry;

/**
 * 
 * @author Sam <sam@taotesting.com>
 */
class Updater extends \common_ext_ExtensionUpdater
{

    /**
     * 
     * @param string $initialVersion
     * @return string
     */
    public function update($initialVersion){

        //add portable shared libraries:
        $libBasePath = ROOT_PATH.'taoQtiItem/views/js/portableSharedLibraries';
        $libRootUrl = ROOT_URL.'taoQtiItem/views/js/portableSharedLibraries';
        $installBasePath = ROOT_PATH.'parccTei/install/local/portableSharedLibraries';
        $registry = new SharedLibrariesRegistry($libBasePath, $libRootUrl);

        $currentVersion = $initialVersion;

        //migrate from 0.1 to 0.1.1
        if($currentVersion == '0.1'){

            $registry->registerFromFile('PARCC/graphFunction', $installBasePath.'/PARCC/graphFunction.js');
            $registry->registerFromFile('PARCC/gridFactory', $installBasePath.'/PARCC/gridFactory.js');
            $registry->registerFromFile('PARCC/plotFactory', $installBasePath.'/PARCC/plotFactory.js');
            $registry->registerFromFile('PARCC/pointFactory', $installBasePath.'/PARCC/pointFactory.js');

            $currentVersion = '0.1.1';
        }

        //migrate from 0.1.1 to 0.1.2
        if($currentVersion == '0.1.1'){

            $registry->registerFromFile('PARCC/axisFactory', $installBasePath.'/PARCC/axisFactory.js');

            $currentVersion = '0.1.2';
        }
        
        //migrate from 0.1.2 to 0.1.3
        if($currentVersion == '0.1.2'){
            
            $registry->registerFromFile('PARCC/graphFunction', $installBasePath.'/PARCC/graphFunction.js');
            $registry->registerFromFile('PARCC/gridFactory', $installBasePath.'/PARCC/gridFactory.js');
            $registry->registerFromFile('PARCC/plotFactory', $installBasePath.'/PARCC/plotFactory.js');
            $registry->registerFromFile('PARCC/pointFactory', $installBasePath.'/PARCC/pointFactory.js');
            $registry->registerFromFile('PARCC/axisFactory', $installBasePath.'/PARCC/axisFactory.js');

            $currentVersion = '0.1.3';
        }
        
        //migrate from 0.1.3 to 0.1.4
        if($currentVersion == '0.1.3'){
            
            HookRegistry::add('teiSystemItem', 'oat\parccTei\model\SystemItemHook');

            $currentVersion = '0.1.4';
        }

        //migrate from 0.1.4 to 0.1.5
        if($currentVersion == '0.1.3'){

            $registry->registerFromFile('PARCC/gridFactory', $installBasePath.'/PARCC/gridFactory.js');
            $registry->registerFromFile('PARCC/axisFactory', $installBasePath.'/PARCC/axisFactory.js');

            $currentVersion = '0.1.5';
        }

        return $currentVersion;
    }

}