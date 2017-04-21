<?php

namespace oat\parccTei\controller;

use oat\qtiItemPci\controller\PciManager as ParentPciManager;
use oat\parccTei\model\CreatorRegistry;

class PciManager extends ParentPciManager
{
    
    protected function getCreatorRegistry(){
        return new CreatorRegistry();
    }

}
