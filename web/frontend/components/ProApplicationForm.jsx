import { useState, useCallback } from "react";
import {
  LegacyCard,
  Form,
  FormLayout,
  Select,
  Layout,
  TextField
} from "@shopify/polaris";
import {
  ContextualSaveBar
} from "@shopify/app-bridge-react";

/* Import the useAuthenticatedFetch hook included in the Node app template */
import { useAuthenticatedFetch } from "../hooks";

/* Import custom hooks for forms */
import { useForm, useField } from "@shopify/react-form";


export function ProApplicationForm({ customer, settings }) {

  const fetch = useAuthenticatedFetch();

  const onSubmit = useCallback(
    async (body) => {
      await (async () => {
        const parsedBody = body;
        const customerId = customer.id.split("/").pop();
        /* use (authenticated) fetch from App Bridge to send the request to the API and, if successful, clear the form to reset the ContextualSaveBar and parse the response JSON */
        const response = await fetch(`/api/customers/${customerId}/application`, {
          method: "POST",
          body: JSON.stringify(parsedBody),
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          makeClean();
          /* Set customer data */
        }
      })();
      return { status: "success" };
    },
    [customer]
  );

  const fieldSetup = {};
  for (const field of settings.fields) {
    fieldSetup[field.key] = useField(customer.application[field.key]);
  }

  const {
    fields,
    dirty,
    reset,
    submitting,
    submit,
    makeClean,
  } = useForm({
    fields: fieldSetup,
    onSubmit: onSubmit
  });

  /* The form layout, created using Polaris and App Bridge components. */
  return (
      <LegacyCard
        sectioned
        title="Application"
        primaryFooterAction={{
          content: 'Save',
          onAction: submit,
          disabled: !dirty || submitting,
          loading: submitting,
        }}>
          <Form onSubmit={submit}>
            <ContextualSaveBar
              saveAction={{
                label: "Save",
                onAction: submit,
                loading: submitting,
                disabled: submitting,
              }}
              discardAction={{
                label: "Discard",
                onAction: reset,
                loading: submitting,
                disabled: submitting,
              }}
              visible={dirty}
              fullWidth
            />
            <FormLayout>
              <FormLayout.Group>
                <TextField label="Applied" value={customer.application["date-applied"] ? new Date(customer.application["date-applied"]) : '' } disabled />
                <TextField label="Approved" value={customer.application["date-approved"] ? new Date(customer.application["date-approved"]) : '' } disabled />
              </FormLayout.Group>
              { settings && settings.fields.map((field, index) => {
                  if(field.type === 'select'){
                    const options = [...field.options];
                    options.unshift({label: 'Select...', value: ''})
                    return <Select
                      key={field.key}
                      label={field.name}
                      options={options}
                      value={fields[field.key].value}
                      onChange={fields[field.key].onChange}
                    />
                  }else{
                    return <TextField
                      key={field.key}
                      label={field.name}
                      type="text"
                      value={fields[field.key].value}
                      onChange={fields[field.key].onChange}
                    />
                  }
              })}
            </FormLayout>
          </Form>
        </LegacyCard>
  );
}