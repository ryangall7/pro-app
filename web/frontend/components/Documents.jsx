import { useState, useCallback } from "react";
import {
  LegacyCard,
  Thumbnail,
  LegacyStack,
  Text
} from "@shopify/polaris";

import { useAppQuery } from "../hooks";

export function Documents({ customer }) {

  const files = customer?.files || [];

  /* The form layout, created using Polaris and App Bridge components. */
  return (
          <LegacyCard
            sectioned
            title="Documents">
            {files.length ? <LegacyStack>
              {files.map((file, index)=> <a target="_blank" href={file.url} key={`document-${index}`}>
                <Thumbnail size="large" source={file.preview} alt={file.name} key={index} />
                <Text fontWeight="strong">{file.name}</Text>
                <Text>{file.createdAt}</Text>
              </a>)}
            </LegacyStack>
            : <Text>No documents found.</Text>}
          </LegacyCard>
          );
}