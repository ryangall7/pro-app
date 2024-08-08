import React from 'react';
import ReactDOM from 'react-dom';
import {
  Provider,
  unstable_Picker as Picker
} from '@shopify/app-bridge-react';

import { useAppQuery } from "../hooks";

export function CustomerPicker() {

  const {
    data: customerData,
    isLoading: isLoadingcustomerData,
    isError: customerDataError,
    /* useAppQuery makes a query to `/api/shop-data`, which the backend authenticates before fetching the data from the Shopify GraphQL Admin API */
  } = useAppQuery({ url: "/api/customer-data" });

  return (
    <Provider config={config}>
      <Picker
        open
        items={ customerData }
        maxSelectable="1"
        canLoadMore="true"
        title="Resource Picker"
        searchQueryPlaceholder="Search Resource"
        primaryActionLabel="Select"
        secondaryActionLabel="Cancel"
        emptySearchLabel={
          {
            title: 'No resources',
            description: 'There are no resources to display',
            withIllustration: true,
          }
        }
        />
    </Provider>
  );
}
