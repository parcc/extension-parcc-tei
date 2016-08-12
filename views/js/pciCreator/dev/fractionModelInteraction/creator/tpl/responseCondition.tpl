<responseCondition>
    <responseIf>
        <equal tolerance="0.000000000001" toleranceMode="absolute">
            <divide>
                <customOperator class="qti.customOperators.math.fraction.Numerator">
                    <variable identifier="{{responseIdentifier}}"/>
                </customOperator>
                <customOperator class="qti.customOperators.math.fraction.Denominator">
                    <variable identifier="{{responseIdentifier}}"/>
                </customOperator>
            </divide>
            <divide>
                <customOperator class="qti.customOperators.math.fraction.Numerator">
                    <correct identifier="{{responseIdentifier}}"/>
                </customOperator>
                <customOperator class="qti.customOperators.math.fraction.Denominator">
                    <correct identifier="{{responseIdentifier}}"/>
                </customOperator>
            </divide>
        </equal>
        <setOutcomeValue identifier="SCORE">
            <sum>
                <variable identifier="SCORE"/>
                <baseValue baseType="float">{{score}}</baseValue>
            </sum>
        </setOutcomeValue>
    </responseIf>
    <responseElse>
        <setOutcomeValue identifier="SCORE">
            <baseValue baseType="float">0</baseValue>
        </setOutcomeValue>
    </responseElse>
</responseCondition>