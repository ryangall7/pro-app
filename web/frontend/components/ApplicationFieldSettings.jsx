import React, {useCallback} from "react";

import { LegacyCard } from "@shopify/polaris";
import { OptionInput } from "./";
import { ApplicationFieldInput } from "./";

export function ApplicationFieldSettings({ fieldsConfig, loading, submitting, dirty, submit }) {

    const handleFieldChange = useCallback((index) => (attribute, value) => {
      const fields = [...fieldsConfig.value];
      fields[index] = {
        ...fields[index],
        [attribute]: value
      }
      fieldsConfig.onChange(fields);
    }, [fieldsConfig]);

    const addField = useCallback(() => {
      const fields = [...fieldsConfig.value];
      fields.push({name: '', key: '', type: 'text', helpText: '', new:true});
      fieldsConfig.onChange(fields);
    }, [fieldsConfig])

    const removeField = useCallback((index) => {
      const fields = [...fieldsConfig.value];
      fields.splice(index, 1);
      fieldsConfig.onChange(fields);
    }, [fieldsConfig]);

    return <LegacyCard
                sectioned
                title="Application Fields"
                secondaryFooterActions={[{
                    content: 'Add Feild',
                    onAction: addField,
                    disabled: submitting,
                    loading: submitting
                }]}
                primaryFooterAction={{
                    content: 'Save',
                    onAction: submit,
                    disabled: !dirty || submitting,
                    loading: submitting
                }}>
                {fieldsConfig.value.map((field, index) =>
                    <ApplicationFieldInput
                        field={field}
                        key={"field-" + index}
                        keyEditable={field.new}
                        onChange={handleFieldChange(index)}
                        onDelete={()=>removeField(index)} />
                )}
            </LegacyCard>
}