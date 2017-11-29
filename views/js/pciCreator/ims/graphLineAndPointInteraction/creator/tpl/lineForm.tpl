<div class="panel graph-form-container">
    <div class="panel">
        <label for="label" class="has-icon">{{__ "Line name"}}</label>

        <input type="text"
               name="label"
               data-role="title"
               value="{{label}}"
               placeholder="e.g. Line A"
               data-validate="$notEmpty;">
    </div>

    <div class="panel item-editor-color-picker">
        <label for="lineColor" class="spinner">{{__ "Line color"}}</label>
        <span class="color-trigger" id="lineColor"></span>
        <input type="hidden" name="lineColor" value="{{lineColor}}"/>
    </div>

    <div class="panel">
        <label for="lineWeight" class="spinner">{{__ "Line thickness"}}</label>
        <input name="lineWeight" value="{{lineWeight}}" data-increment="1" data-min="1" type="text" class="incrementer">
    </div>

    <div class="panel">
        <label for="lineStyle" class="spinner">{{__ "Line style"}}</label>
        <select name="lineStyle">
            {{#each lineStyles}}
            <option value="{{@key}}" {{#if selected}}selected="selected"{{/if}}>{{label}}</option>
            {{/each}}
        </select>
    </div>

    <div class="panel">
        <label>
            <span class="lineStyleToggle">{{__ "Line style toggle"}}</span>
            <input name="lineStyleToggle" type="checkbox" {{#if lineStyleToggle}}checked="checked"{{/if}}/>
                   <span class="icon-checkbox"></span>
        </label>
    </div>

    <div class="panel item-editor-color-picker">
        <label for="pointColor" class="spinner">{{__ "Point color"}}</label>
        <span class="color-trigger" id="pointColor"></span>
        <input type="hidden" name="pointColor" value="{{pointColor}}"/>
    </div>

    <div class="panel">
        <label for="pointRadius" class="spinner">{{__ "Point Radius"}}</label>
        <input name="pointRadius" value="{{pointRadius}}" data-increment="1" data-min="0" type="text" class="incrementer">
    </div>
</div>