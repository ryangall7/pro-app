import React from 'react';

import {
    HorizontalStack,
    TextField,
    Button,
    Select,
    FormLayout,
    LegacyCard,
    Box,
    LegacyStack
} from "@shopify/polaris";

import {
    DeleteMinor
} from '@shopify/polaris-icons';

import { OptionInput } from './'

const typeOptions = [
  {label: 'Text', value: 'text'},
  {label: 'Select', value: 'select'}
];

export function ApplicationFieldInput({ field, keyEditable, onChange, onDelete }) {

    const handleOptionChange = (index) => (attribute, value) => {
      const options = [...field.options];
      options[index] = {
        ...options[index],
        [attribute]: value
      }
      onChange('options', options);
    }

    const handleAddOption = () => {
      const options = field.options ? [...field.options] : [];
      options.push({label: '', value: '', new: true});
      onChange('options', options);
    }

    const handleRemoveOption = (index) => {
      const options = [...field.options];
      options.splice(index, 1);
      onChange('options', options);
    }

    return <LegacyCard sectioned>
          <FormLayout>
            <div style={{marginBottom: "1em"}}>
              <HorizontalStack blockAlign="end" align="space-between" wrap={false}>
                <span style={{ display: "block", width: "100%", marginRight: "1em" }}>
                  <TextField
                    value={field.name}
                    onChange={(value) => {onChange('name', value)}}
                    label="Label"
                    type="text"
                  />
                </span>
                <span style={{ display: "block", width: "100%", marginRight: "1em" }}>
                  <TextField
                    disabled={!keyEditable}
                    value={field.key}
                    onChange={(value) => {onChange('key', value)}}
                    label="Key"
                    type="text"
                  />
                </span>
                <Button onClick={onDelete} icon={DeleteMinor}></Button>
              </HorizontalStack>
            </div>
            <TextField
              value={field.helpText}
              onChange={(value) => {onChange('helpText', value)}}
              label="Help Text"
              type="text"
            />
            <Select
              label="Field Type"
              options={typeOptions}
              onChange={(value) => {onChange('type', value)}}
              value={field.type}
            />
            { field.type == 'select' ?
              <Box padding="4" background="bg-inset" borderRadius="2">
                { field.options?.map((option, index) => <OptionInput key={`option-${index}`} label={option.label} value={option.value} onChange={handleOptionChange(index)} valueEditable={option.new} onDelete={() => handleRemoveOption(index)}/>) }
                <LegacyStack align="end">
                  <Button size="slim" onClick={handleAddOption}>Add an Option</Button>
                </LegacyStack>
              </Box>
            : null }
          </FormLayout>
      </LegacyCard>
}