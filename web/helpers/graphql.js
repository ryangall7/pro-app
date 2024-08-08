import { discountConfiguration } from "../helpers/metafield-definitions.js";

/*
 *  Files GraphQL queries and mutations
 *********************************************/

export const CREATE_FILE_MUTATION = `
    mutation fileCreate($files: [FileCreateInput!]!) {
        fileCreate(files: $files) {
            files {
                id
                fileStatus
                fileErrors {
                    details
                }
            }
            userErrors {
                field
                message
            }
        }
    }
`;

export const DELETE_FILE_MUTATION = `
    mutation fileDelete($fileIds: [ID!]!) {
        fileDelete(fileIds: $fileIds) {
        deletedFileIds
            userErrors {
                field
                message
            }
        }
    }
`;


/*
 *  Pro Application GraphQL queries and mutations
 *********************************************/

export const PRO_APPLICATION_FIELDS_LITE_FRAGMENT = `
  fragment ProApplicationsFields on Customer {
      metafields(first: 10, namespace: "pro-application") {
          edges {
              node {
                  id
                  key
                  value
                  namespace
              }
          }
      }
  }
`;

export const PRO_APPLICATION_FIELDS_FRAGMENT = `
  fragment ProApplicationsFields on Customer {
      metafields(first: 10, namespace: "pro-application") {
          edges {
              node {
                  id
                  key
                  value
                  namespace
                  references(first: 10) {
                    edges {
                      node {
                        ... on MediaImage {
                            id
                            preview {
                                image{
                                    url
                                }
                            }
                            image {
                                url
                            }
                            alt
                            createdAt
                        }
                        ... on GenericFile {
                            id,
                            preview {
                                image{
                                    url
                                }
                            }
                            url
                            alt
                            createdAt
                        }
                      }
                    }
                  }
              }
          }
      }
  }
`;



/*
 *  Customer GraphQL queries and mutations
 *********************************************/

export const CUSTOMER_LIST_QUERY = `
    ${PRO_APPLICATION_FIELDS_LITE_FRAGMENT}
    query customers($first: Int, $after: String, $last: Int, $before: String, $query: String) {
      customers(first: $first, after: $after, last: $last, before: $before, query: $query, sortKey: UPDATED_AT, reverse: true ){
        edges {
          node {
              id
              tags
              displayName
              email
              verifiedEmail
              ...ProApplicationsFields
          }
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          startCursor
          endCursor
        }
      }
    }`;

export const CUSTOMER_UPDATE_MUTATION = `
    ${PRO_APPLICATION_FIELDS_FRAGMENT}
    mutation customerUpdate($input: CustomerInput!) {
      customerUpdate(input: $input) {
        customer {
          id
          tags
          displayName
          email
          verifiedEmail
          ...ProApplicationsFields
        }
        userErrors {
          field
          message
        }
      }
    }`;

export const CUSTOMER_QUERY = `
    ${PRO_APPLICATION_FIELDS_FRAGMENT}
    query customer($id: ID!) {
      customer(id: $id){
        id
        tags
        displayName
        email
        verifiedEmail
        ...ProApplicationsFields
      }
    }
`;

export const MARKETING_CONSENT_SET_MUTATION = `
    mutation customerUpdate($marketingInput: CustomerEmailMarketingConsentUpdateInput!) {
        customerEmailMarketingConsentUpdate(input: $marketingInput) {
            customer {
                # Customer fields
                emailMarketingConsent {
                    marketingState
                    consentUpdatedAt
                    marketingOptInLevel
                }
            }
            userErrors {
                field
                message
            }
        }
    }
`;


/*
 *   Metafield GraphQL queries and mutations
 *********************************************/

export const METAFIELD_SET_MUTATION = `
    mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
            metafields {
                key
                namespace
                value
                createdAt
                updatedAt
            }
            userErrors {
                field
                message
                code
            }
        }
    }
`;

export const CUSTOMER_META_FIELDS_QUERY = `
    query {
        metafieldDefinitions(first: 250, ownerType: CUSTOMER) {
            edges {
                node {
                    id
                    name
                    description
                    namespace
                    key
                    type {
                        name
                    }
                }
            }
        }
    }`

// GraphQL mutation to create metafield definitions for customers in shopify
export const CUSTOMER_META_FIELDS_CREATE = `
    mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
        metafieldDefinitionCreate(definition: $definition) {
            createdDefinition {
                id
                name
            }
            userErrors {
                field
                message
                code
            }
        }
    }`

// GraphQL mutation to update metafield definitions for customers in shopify
export const CUSTOMER_META_FIELDS_UPDATE = `
    mutation metafieldDefinitionUpdate($definition: MetafieldDefinitionUpdateInput!) {
        metafieldDefinitionUpdate(definition: $definition) {
            updatedDefinition {
                id
                name
            }
            userErrors {
                field
                message
                code
            }
        }
    }`

// GraphQL mutation to update metafield definitions for customers in shopify
export const CUSTOMER_META_FIELDS_DELETE = `
    mutation deleteMetafieldDefinition($id: ID!) {
        metafieldDefinitionDelete(id: $id, deleteAllAssociatedMetafields: true) {
            deletedDefinitionId
            userErrors {
                field
                message
                code
            }
        }
    }`






/*
 *   Discount GraphQL queries and mutations
 *********************************************/



export const CREATE_CODE_MUTATION = `
mutation CreateCodeDiscount($discount: DiscountCodeAppInput!) {
  discountCreate: discountCodeAppCreate(codeAppDiscount: $discount) {
    userErrors {
      code
      message
      field
    }
  }
}
`;

export const CREATE_AUTOMATIC_MUTATION = `
mutation CreateAutomaticDiscount($discount: DiscountAutomaticAppInput!) {
  discountCreate: discountAutomaticAppCreate(
    automaticAppDiscount: $discount
  ) {
    userErrors {
      code
      message
      field
    }
  }
}
`;

export const GET_DISCOUNT_QUERY = `
  query GetDiscount($id: ID!) {
    discountNode(id: $id) {
      id
      configurationField: metafield(
        namespace: "${discountConfiguration.namespace}"
        key: "${discountConfiguration.key}"
      ) {
        id
        value
      }
      discount {
        __typename
        ... on DiscountAutomaticApp {
          title
          discountClass
          combinesWith {
            orderDiscounts
            productDiscounts
            shippingDiscounts
          }
          startsAt
          endsAt
        }
        ... on DiscountCodeApp {
          title
          discountClass
          combinesWith {
            orderDiscounts
            productDiscounts
            shippingDiscounts
          }
          startsAt
          endsAt
          usageLimit
          appliesOncePerCustomer
          codes(first: 1) {
            nodes {
              code
            }
          }
        }
      }
    }
  }
`;

export const UPDATE_AUTOMATIC_MUTATION = `
  mutation UpdateDiscount($id: ID!, $discount: DiscountAutomaticAppInput!) {
    discountUpdate: discountAutomaticAppUpdate(
      id: $id
      automaticAppDiscount: $discount
    ) {
      userErrors {
        code
        message
        field
      }
    }
  }
`;

export const UPDATE_CODE_MUTATION = `
  mutation UpdateDiscount($id: ID!, $discount: DiscountCodeAppInput!) {
    discountUpdate: discountCodeAppUpdate(id: $id, codeAppDiscount: $discount) {
      userErrors {
        code
        message
        field
      }
    }
  }
`;

export const DELETE_AUTOMATIC_MUTATION = `
  mutation DeleteDiscount($id: ID!) {
    discountDelete: discountAutomaticDelete(id: $id) {
      userErrors {
        code
        message
        field
      }
    }
  }
`;

export const DELETE_CODE_MUTATION = `
  mutation DeleteDiscount($id: ID!) {
    discountDelete: discountCodeDelete(id: $id) {
      userErrors {
        code
        message
        field
      }
    }
  }
`;
