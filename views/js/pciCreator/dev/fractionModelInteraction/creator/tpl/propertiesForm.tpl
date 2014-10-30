<div class="item-editor-color-picker">
    <h3>{{__ "Pie Chart Colors"}}</h3>
    <div class="color-picker-container sidebar-popup">
        <div class="color-picker"></div>
        <input class="color-picker-input" type="text" value="#000000">
        <a class="closer" href="#" data-close="#color-picker-container"></a>
    </div>
    <div class="panel">
        <label for="partitionColor">{{__ "Default Partition"}}</label>
        <span class="color-trigger" id="partitionColor"></span>
        <input type="hidden" name="partitionColor" value="{{partitionColor}}"/>
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
<hr>
<div class="panel">
    <label for="outlineThickness" class="spinner">{{__ "Outline Thickness"}}</label>
    <input name="outlineThickness" value="{{outlineThickness}}" data-increment="1" data-min="0" type="text" class="incrementer">
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "Outline Thickness Description"}}</span>
</div>
<div class="panel">
    <label for="someProp" class="spinner">{{__ "Radius"}}</label>
    <input name="radius" value="{{radius}}" data-increment="10" data-min="0" type="text" class="incrementer">
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "Radius Description"}}</span>
</div>
