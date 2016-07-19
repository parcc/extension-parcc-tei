<div class="static-point-container" data-idx="{{idx}}">
    <div class="static-point-props">
        <label for="label">{{__ "label"}}</label>
        <input name="label" value="{{label}}" type="text" />
    </div>
    <div class="static-point-props">
        <label for="x" class="spinner">{{__ "X"}}</label>
        <input name="x" value="{{x}}" data-increment="{{xStep}}" data-min="0" data-max="{{xMax}}" type="text" class="incrementer">
        <label for="y" class="spinner">{{__ "Y"}}</label>
        <input name="y" value="{{y}}" data-increment="{{yStep}}" data-min="0" data-max="{{yMax}}"  type="text" class="incrementer">
        <span class="static-point-delete icon-bin" title="{{__ "Delete this static point"}}" data-role="rule"></span>
    </div>
</div>
