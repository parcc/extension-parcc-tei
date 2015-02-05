<div class="panel graph-form-container">
    <div class="panel">
        <label for="label" class="has-icon">{{__ "Point name"}}</label>

        <input type="text"
               name="label"
               data-role="title"
               value="{{label}}"
               placeholder="e.g. Point A"
               data-validate="$notEmpty;">
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