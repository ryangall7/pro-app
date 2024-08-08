import {useState, useCallback} from 'react';
import { useNavigate } from "@shopify/app-bridge-react";

import {
  IndexTable,
  UnstyledLink,
  SkeletonBodyText
} from "@shopify/polaris";

import { ProStatusBadge } from '.';
import { DiamondAlertMajor, ImageMajor } from "@shopify/polaris-icons";
import dayjs from "dayjs";


export function ProApplicationsIndex({ customers, resourceName, loading }) {

  const navigate = useNavigate();

  const rowMarkup = loading ?
    [1, 2, 3, 4, 5].map((i) => <IndexTable.Row key={i}>
    <IndexTable.Cell><SkeletonBodyText lines="1"/></IndexTable.Cell>
    <IndexTable.Cell><SkeletonBodyText lines="1"/></IndexTable.Cell>
    <IndexTable.Cell><SkeletonBodyText lines="1"/></IndexTable.Cell>
    <IndexTable.Cell><SkeletonBodyText lines="1"/></IndexTable.Cell>
    <IndexTable.Cell><ProStatusBadge/></IndexTable.Cell>
  </IndexTable.Row>)
        :
          customers.map(
    ({ id, displayName, dateApplied, dateApproved, proStatus, discountLevel }, index) => {

      const restId = id.split("/")[id.split("/").length - 1];

      /* The form layout, created using Polaris components. Includes the QR code data set above. */
      return (
        <IndexTable.Row
          id={id}
          key={id}
          position={index}
          onClick={() => {
            navigate(`/proapplications/${restId}`);
          }}
        >
          <IndexTable.Cell>
            <UnstyledLink data-primary-link url={`/proapplications/${restId}`}>
              {truncate(displayName, 25)}
            </UnstyledLink>
          </IndexTable.Cell>
          <IndexTable.Cell>
            {dateApplied && dayjs(dateApplied).format("MMMM D, YYYY")}
          </IndexTable.Cell>
          <IndexTable.Cell>
            {dateApproved && dayjs(dateApproved).format("MMMM D, YYYY")}
          </IndexTable.Cell>
          <IndexTable.Cell>{discountLevel}</IndexTable.Cell>
          <IndexTable.Cell>
            <ProStatusBadge status={proStatus} />
          </IndexTable.Cell>
        </IndexTable.Row>
      );
    }
  );

  /* A layout for small screens, built using Polaris components */
  return (
        <IndexTable
          resourceName={resourceName}
          itemCount={loading ? 5 :customers.length}
          headings={[
            { title: "Customer" },
            { title: "Date Applied" },
            { title: "Date Approved" },
            { title: "Discount Level" },
            { title: "Pro Status" }
          ]}
          selectable={false}
          loading={loading}
        >
          {rowMarkup}
        </IndexTable>
  );
}

/* A function to truncate long strings */
function truncate(str, n) {
  return str.length > n ? str.substr(0, n - 1) + "…" : str;
}
