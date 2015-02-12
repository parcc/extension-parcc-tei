<div class="panel graph-form-container">
    <div class="panel">
        <label for="label" class="has-icon">{{__ "Segment name"}}</label>

        <input type="text"
               name="label"
               value="{{label}}"
               data-role="title"
               placeholder="e.g. Segment A"
               data-validate="$notEmpty;">
    </div>

    <div class="panel item-editor-color-picker">
        <label for="lineColor" class="spinner">{{__ "Segment color"}}</label>
        <span class="color-trigger" id="lineColor"></span>
        <input type="hidden" name="lineColor" value="{{lineColor}}"/>
    </div>

    <div class="panel">
        <label for="lineWeight" class="spinner">{{__ "Segment thickness"}}</label>
        <input name="lineWeight" value="{{lineWeight}}" data-increment="1" data-min="1" type="text" class="incrementer">
    </div>

    <div class="panel">
        <label for="lineStyle" class="spinner">{{__ "Segment style"}}</label>
        <select name="lineStyle" data-has-search="false">
            {{#each lineStyles}}
            <option value="{{@key}}" {{#if selected}}selected="selected"{{/if}}>{{label}}</option>
            {{/each}}
        </select>
    </div>

    <div class="panel">
        <label>
            <span class="lineStyleToggle">{{__ "Segment style toggle"}}</span>
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
        <input name="pointRadius" value="{{pointRadius}}" data-increment="1" data-min="2" type="text" class="incrementer">
    </div>
</div>