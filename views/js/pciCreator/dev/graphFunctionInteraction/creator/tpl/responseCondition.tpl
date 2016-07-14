<responseCondition>
    <responseIf>
        <and>
            <match>
                <index n="1">
                    <customOperator class="qti.customOperators.CsvToOrdered">
                        <fieldValue fieldIdentifier="points">
                            <variable identifier="{{responseIdentifier}}"/>
                        </fieldValue>
                    </customOperator>
                </index>
                <fieldValue fieldIdentifier="vertex">
                    <correct identifier="{{responseIdentifier}}"/>
                </fieldValue>
            </match>
            <match>
                <fieldValue fieldIdentifier="functionGraphType">
                    <variable identifier="{{responseIdentifier}}"/>
                </fieldValue>
                <fieldValue fieldIdentifier="functionGraphType">
                    <correct identifier="{{responseIdentifier}}"/>
                </fieldValue>
            </match>
            <not>
                <match>
                    <index n="1">
                        <customOperator class="qti.customOperators.CsvToOrdered">
                            <fieldValue fieldIdentifier="points">
                                <variable identifier="{{responseIdentifier}}"/>
                            </fieldValue>
                        </customOperator>
                    </index>
                    <index n="2">
                        <customOperator class="qti.customOperators.CsvToOrdered">
                            <fieldValue fieldIdentifier="points">
                                <variable identifier="{{responseIdentifier}}"/>
                            </fieldValue>
                        </customOperator>
                    </index>
                </match>
            </not>
            <equal toleranceMode="exact">
                <customOperator class="qti.customOperators.math.graph.CountPointsThatSatisfyEquation">
                    <customOperator class="qti.customOperators.CsvToMultiple">
                        <fieldValue fieldIdentifier="points">
                            <variable identifier="{{responseIdentifier}}"/>
                        </fieldValue>
                    </customOperator>
                    <fieldValue fieldIdentifier="equation">
                        <correct identifier="{{responseIdentifier}}"/>
                    </fieldValue>
                </customOperator>
                <fieldValue fieldIdentifier="numberPointsRequired">
                    <correct identifier="{{responseIdentifier}}"/>
                </fieldValue>
            </equal>
        </and>
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