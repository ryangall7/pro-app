import React, {useCallback} from "react";

import { LegacyCard } from "@shopify/polaris";
import { OptionInput } from ".";

export function DiscountGroupSettings({ discountLevels, loading, submitting, dirty, submit }) {

    const handleDiscountLevelChange = useCallback((index) => (attribute, value) => {
        const levels = [...discountLevels.value];
        levels[index] = {
          ...levels[index],
          [attribute]: value
        };
        discountLevels.onChange(levels);
      }, [discountLevels]);

      const addDiscountLevel = useCallback(() => {
        const levels = [...discountLevels.value];
        levels.push({label: '', value: '', new:true});
        discountLevels.onChange(levels);
      }, [discountLevels])

      const removeDiscountLevel = useCallback((index) => {
        const levels = [...discountLevels.value];
        levels.splice(index, 1);
        discountLevels.onChange(levels);
      }, [discountLevels]);

    return <LegacyCard
                sectioned
                title="Discount Groups"
                secondaryFooterActions={[{
                    content: 'Add Discount Level',
                    onAction: addDiscountLevel,
                    disabled: submitting,
                    loading: submitting
                }]}
                primaryFooterAction={{
                    content: 'Save',
                    onAction: submit,
                    disabled: !dirty || submitting,
                    loading: submitting
                }}>
                {discountLevels.value.map((option, index) =>
                    <OptionInput
                        {...option}
                        key={"discount-" + index}
                        valueEditable={option.new}
                        onChange={handleDiscountLevelChange(index)}
                        onDelete={()=>removeDiscountLevel(index)} />
                )}
            </LegacyCard>
}