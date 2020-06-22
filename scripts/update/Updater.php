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

use oat\parccTei\scripts\install\RegisterGraphFunctionInteraction;
use oat\parccTei\scripts\install\RegisterPciFractionModelInteraction;
use oat\parccTei\scripts\install\RegisterPciGraphNumberLineInteraction;
use oat\parccTei\scripts\install\RegisterPciGraphPointLineGraphInteraction;
use oat\parccTei\scripts\install\RegisterPciGraphZoomNumberLineInteraction;
use oat\parccTei\scripts\install\RegisterPciHistogramInteraction;
use oat\parccTei\scripts\install\RegisterPciLineAndPointInteraction;
use oat\parccTei\scripts\install\RegisterPciMultiTabbedExhibit;
use oat\taoQtiItem\model\HookRegistry;

/**
 *
 * @author Sam <sam@taotesting.com>
 * @deprecated use migrations instead. See https://github.com/oat-sa/generis/wiki/Tao-Update-Process
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
        if (class_exists('\\oat\\taoQtiItem\\model\\SharedLibrariesRegistry')) {
            $registry = new \oat\taoQtiItem\model\SharedLibrariesRegistry($libBasePath, $libRootUrl);
        }

        $currentVersion = $initialVersion;

        //migrate from 0.1 to 0.1.1
        if($currentVersion == '0.1'){

            if (isset($registry)) {
                $registry->registerFromFile('PARCC/graphFunction', $installBasePath.'/PARCC/graphFunction.js');
                $registry->registerFromFile('PARCC/gridFactory', $installBasePath.'/PARCC/gridFactory.js');
                $registry->registerFromFile('PARCC/plotFactory', $installBasePath.'/PARCC/plotFactory.js');
                $registry->registerFromFile('PARCC/pointFactory', $installBasePath.'/PARCC/pointFactory.js');
            }
            $currentVersion = '0.1.1';
        }

        //migrate from 0.1.1 to 0.1.2
        if($currentVersion == '0.1.1'){

            if (isset($registry)) {
                $registry->registerFromFile('PARCC/axisFactory', $installBasePath . '/PARCC/axisFactory.js');
            }
            $currentVersion = '0.1.2';
        }

        //migrate from 0.1.2 to 0.1.3
        if($currentVersion == '0.1.2'){

            if (isset($registry)) {
                $registry->registerFromFile('PARCC/graphFunction', $installBasePath . '/PARCC/graphFunction.js');
                $registry->registerFromFile('PARCC/gridFactory', $installBasePath . '/PARCC/gridFactory.js');
                $registry->registerFromFile('PARCC/plotFactory', $installBasePath . '/PARCC/plotFactory.js');
                $registry->registerFromFile('PARCC/pointFactory', $installBasePath . '/PARCC/pointFactory.js');
                $registry->registerFromFile('PARCC/axisFactory', $installBasePath . '/PARCC/axisFactory.js');
            }
            $currentVersion = '0.1.3';
        }

        //migrate from 0.1.3 to 0.1.4
        if($currentVersion == '0.1.3'){

            HookRegistry::add('teiSystemItem', 'oat\parccTei\model\SystemItemHook');

            $currentVersion = '0.1.4';
        }

        //migrate from 0.1.4 to 0.1.5
        if($currentVersion == '0.1.4'){

            if (isset($registry)) {
                $registry->registerFromFile('PARCC/gridFactory', $installBasePath . '/PARCC/gridFactory.js');
                $registry->registerFromFile('PARCC/axisFactory', $installBasePath . '/PARCC/axisFactory.js');
            }
            $currentVersion = '0.1.5';
        }

        $this->setVersion($currentVersion);

        if($this->isVersion('0.1.5')){

            if (isset($registry)) {
                $registry->registerFromFile('PARCC/plotFactory', $installBasePath . '/PARCC/graphFunction.js');
                $registry->registerFromFile('PARCC/gridFactory', $installBasePath . '/PARCC/gridFactory.js');
                $registry->registerFromFile('PARCC/pointFactory', $installBasePath . '/PARCC/pointFactory.js');
                $registry->registerFromFile('PARCC/plotFactory', $installBasePath . '/PARCC/plotFactory.js');
            }
            $this->setVersion('0.2.0');
        }

        if($this->isVersion('0.2.0')){

            if (isset($registry)) {
                $registry->registerFromFile('PARCC/gridFactory', $installBasePath . '/PARCC/gridFactory.js');
            }
            $this->setVersion('0.2.1');
        }

        if($this->isVersion('0.2.1')){

            if (isset($registry)) {
                $registry->registerFromFile('PARCC/pointFactory', $installBasePath . '/PARCC/pointFactory.js');
            }
            $this->setVersion('0.3.0');
        }

        if($this->isVersion('0.3.0')){

            if (isset($registry)) {
                $registry->registerFromFile('PARCC/graphFunction', $installBasePath . '/PARCC/graphFunction.js');
            }
            $this->setVersion('0.3.1');
        }

        $this->skip('0.3.1', '0.4.0');

        if($this->isVersion('0.4.0')){
            call_user_func(new RegisterPciFractionModelInteraction(), ['1.0.0']);
            call_user_func(new RegisterPciLineAndPointInteraction(), ['1.0.0']);
            call_user_func(new RegisterGraphFunctionInteraction(), ['1.0.0']);
            call_user_func(new RegisterPciGraphNumberLineInteraction(), ['1.0.0']);
            call_user_func(new RegisterPciGraphPointLineGraphInteraction(), ['1.0.0']);
            call_user_func(new RegisterPciGraphZoomNumberLineInteraction(), ['1.0.0']);

            $this->setVersion('0.5.0');
        }

        $this->skip('0.5.0', '0.5.3');
        
        //Updater files are deprecated. Please use migrations.
        //See: https://github.com/oat-sa/generis/wiki/Tao-Update-Process

        $this->setVersion($this->getExtension()->getManifest()->getVersion());
    }

}
