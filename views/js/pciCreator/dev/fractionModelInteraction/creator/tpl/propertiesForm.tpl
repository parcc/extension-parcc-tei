<div class="panel">
    <label for="someProp">{{__ "Radius"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "Radius Description"}}</span>
    <input type="number" name="radius" value="{{radius}}" min="0"/>
</div>
<div class="item-editor-color-picker">
    <div class="color-picker-container sidebar-popup">
        <div class="color-picker"></div>
        <input class="color-picker-input" type="text" value="#000000">
        <a class="closer" href="#" data-close="#color-picker-container"></a>
    </div>
    <div class="panel">
        <label for="partitionsColor">{{__ "Default Partition"}}</label>
        <span class="color-trigger" id="partitionsColor"></span>
        <input type="hidden" name="partitionsColor" value="{{partitionsColor}}"/>
    </div>
    <div class="panel">
        <label for="selectedPartitionsColor">{{__ "Selected Partition"}}</label>
        <span class="color-trigger" id="selectedPartitionsColor"></span>
        <input type="hidden" name="selectedPartitionsColor" value="{{selectedPartitionsColor}}"/>
    </div>
    <div class="panel">
        <label for="outlineColor">{{__ "Outline"}}</label>
        <span class="color-trigger" id="outlineColor"></span>
        <input type="hidden" name="outlineColor" value="{{outlineColor}}"/>
    </div>
</div>
<div class="panel">
    <label for="outlineThickness">{{__ "Outline Thickness"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "Outline Thickness Description"}}</span>
    <input type="number" name="outlineThickness" value="{{outlineThickness}}" min="0"/>
</div>
<div class="panel">
    <label for="partitionMin">{{__ "Minimum Partitions"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "Minimum Partitions Description"}}</span>
    <input type="nulber" name="partitionMin" value="{{partitionMin}}" disabled/>
</div>
<div class="panel">
    <label for="partitionMax">{{__ "Maximum Partitions"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "Maximum Partitions Description"}}</span>
    <input type="number" name="partitionMax" value="{{partitionMax}}" disabled/>
</div>
