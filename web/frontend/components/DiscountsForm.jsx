import { useState, useCallback } from "react";
import {
  LegacyCard,
  Form,
  FormLayout,
  Select
} from "@shopify/polaris";
import {
  ContextualSaveBar
} from "@shopify/app-bridge-react";

import { ProStatusBadge } from ".";
import { useAuthenticatedFetch } from "../hooks";
import { useForm, useField } from "@shopify/react-form";
import { proStatuses } from "../../helpers/data"

export function DiscountsForm({ customer, settings, onCustomerUpdate }) {

  const fetch = useAuthenticatedFetch();
  const [ currentStatus ] = useState(customer.proStatus);

  const onSubmit = useCallback(
    async (body) => {
      await (async () => {
        const parsedBody = body;
        const customerId = customer.id.split("/").pop();
        /* use (authenticated) fetch from App Bridge to send the request to the API and, if successful, clear the form to reset the ContextualSaveBar and parse the response JSON */
        const response = await fetch(`/api/customers/${customerId}/approval`, {
          method: "POST",
          body: JSON.stringify(parsedBody),
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          makeClean();
          //setCurrentStatus(parsedBody.proStatus);
          onCustomerUpdate && onCustomerUpdate();
        }
      })();
      return { status: "success" };
    },
    [customer]
  );


  const {
    fields: {
      proStatus,
      discountLevel,
    },
    dirty,
    reset,
    submitting,
    submit,
    makeClean
  } = useForm({
    fields: {
      proStatus: useField(customer.proStatus),
      discountLevel: useField(customer.discountLevel),
    },
    onSubmit: onSubmit
  });

  let discountLevelOptions = [];
  if(settings.discountLevels.length){
    discountLevelOptions = [...settings.discountLevels]
  }

  discountLevelOptions.unshift({
    label: "Please Select...",
    value: "",
    disabled: true
  });

  /* The form layout, created using Polaris and App Bridge components. */
  return (
          <LegacyCard
            sectioned
            title={<>Approval <ProStatusBadge status={currentStatus}/></>}
            primaryFooterAction={{
              content: 'Save',
              onAction: submit,
              disabled: !dirty || submitting,
              loading: submitting,
            }}
            >
            <Form>
              <ContextualSaveBar
                saveAction={{
                  label: "Save Approval",
                  onAction: submit,
                  loading: submitting,
                  disabled: submitting,
                }}
                discardAction={{
                  label: "Cancel",
                  onAction: reset,
                  loading: submitting,
                  disabled: submitting,
                }}
                visible={dirty}
              />
              <FormLayout>
                <Select
                  label="Discount Level"
                  options={discountLevelOptions}
                  value={discountLevel.value}
                  onChange={discountLevel.onChange}
                />
                <Select
                  label="Pro Status"
                  options={proStatuses || false}
                  value={proStatus.value}
                  onChange={proStatus.onChange}
                />
              </FormLayout>
            </Form>
          </LegacyCard>
          );
}