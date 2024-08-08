import { useState, useCallback } from "react";
import {
  LegacyCard,
  Form,
  FormLayout,
  Checkbox
} from "@shopify/polaris";

import {
  ContextualSaveBar
} from "@shopify/app-bridge-react";

/* Import the useAuthenticatedFetch hook included in the Node app template */
import { useAuthenticatedFetch } from "../hooks";

/* Import custom hooks for forms */
import { useForm, useField } from "@shopify/react-form";
import { DiscountGroupSettings } from "./";
import { ApplicationFieldSettings } from "./";

export function SettingsForm({ settings, refetch }) {

  const fetch = useAuthenticatedFetch();

  const onSubmit = useCallback(
    async (body) => {
      await (async () => {
        const parsedBody = body;
        /* use (authenticated) fetch from App Bridge to send the request to the API and, if successful, clear the form to reset the ContextualSaveBar and parse the response JSON */
        const response = await fetch(`/api/settings/`, {
          method: "POST",
          body: JSON.stringify(parsedBody),
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          /* Set customer data */
          const body = await response.json();
          discountLevels.onChange(body.discountLevels);
          forceAcceptsMarketing.onChange(body.forceAcceptsMarketing);

          fieldsConfig.onChange(body.fields);
          refetch();
          makeClean();
        }else{
          alert("Error saving settings");
          console.log("error", response);
        }
      })();
      return { status: "success" };
    },
    [settings]
  );

  const {
    fields: {
      forceAcceptsMarketing,
      discountLevels,
      fieldsConfig
    },
    dirty,
    reset,
    submitting,
    submit,
    makeClean,
  } = useForm({
    fields: {
      forceAcceptsMarketing: useField(settings?.forceAcceptsMarketing),
      discountLevels: useField(settings?.discountLevels),
      fieldsConfig: useField(settings?.fields),
    },
    onSubmit: onSubmit
  });


  /* The form layout, created using Polaris and App Bridge components. */
  return (
        <div style={{marginBottom: "1em"}}>
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
              <LegacyCard
                sectioned
                title="General"
                primaryFooterAction={{
                  content: 'Save',
                  onAction: submit,
                  disabled: !dirty || submitting,
                  loading: submitting,
                }}
               >
                <Checkbox
                    label="Automatically sign applicants up to receive marketing"
                    checked={forceAcceptsMarketing.value}
                    onChange={forceAcceptsMarketing.onChange}
                  />
              </LegacyCard>
              <DiscountGroupSettings discountLevels={discountLevels} submitting={submitting} dirty={dirty} submit={submit} />
              <ApplicationFieldSettings fieldsConfig={fieldsConfig} submitting={submitting} dirty={dirty} submit={submit} />
            </FormLayout>
          </Form>
        </div>
  );
}