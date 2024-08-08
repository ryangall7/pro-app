import React from 'react';

import {
    HorizontalStack,
    TextField,
    Button
} from "@shopify/polaris";

import {
    DeleteMinor
} from '@shopify/polaris-icons';

export function OptionInput({ label, value, valueEditable = false, onChange, onDelete }) {
    return <div style={{marginBottom: "1em"}}>
          <HorizontalStack blockAlign="end" align="space-between" wrap={false}>
          <span style={{ display: "block", width: "100%", marginRight: "1em" }}>
            <TextField
              value={label}
              onChange={(value) => {onChange('label', value)}}
              label="Label"
              type="text"
            />
          </span>
          <span style={{ display: "block", width: "100%", marginRight: "1em" }}>
            <TextField
              disabled={!valueEditable}
              value={value}
              onChange={(value) => {onChange('value', value)}}
              label="Value"
              type="text"
            />
          </span>
          <Button onClick={onDelete} icon={DeleteMinor}></Button>
        </HorizontalStack>
      </div>
}