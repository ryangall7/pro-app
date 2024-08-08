import shopify from "../shopify.js";
import { metafieldVersion } from "../helpers/metafield-definitions.js";
import { setStoreMetafields } from "../helpers/stores.js";

import { CUSTOMER_META_FIELDS_QUERY } from "../helpers/graphql.js";

// const CUSTOMER_META_FIELDS_QUERY = `
//     query {
//         metafieldDefinitions(first: 250, ownerType: CUSTOMER) {
//             edges {
//                 node {
//                     id
//                     name
//                     description
//                     namespace
//                     key
//                     type {
//                         name
//                     }
//                 }
//             }
//         }
//     }`

// // GraphQL mutation to create metafield definitions for customers in shopify
// const CUSTOMER_META_FIELDS_CREATE = `
//     mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
//         metafieldDefinitionCreate(definition: $definition) {
//             createdDefinition {
//                 id
//                 name
//             }
//             userErrors {
//                 field
//                 message
//                 code
//             }
//         }
//     }`

// // GraphQL mutation to update metafield definitions for customers in shopify
// const CUSTOMER_META_FIELDS_UPDATE = `
//     mutation metafieldDefinitionUpdate($definition: MetafieldDefinitionUpdateInput!) {
//         metafieldDefinitionUpdate(definition: $definition) {
//             updatedDefinition {
//                 id
//                 name
//             }
//             userErrors {
//                 field
//                 message
//                 code
//             }
//         }
//     }`
// // GraphQL mutation to update metafield definitions for customers in shopify
// const CUSTOMER_META_FIELDS_DELETE = `
//     mutation deleteMetafieldDefinition($id: ID!) {
//         metafieldDefinitionDelete(id: $id, deleteAllAssociatedMetafields: true) {
//           deletedDefinitionId
//           userErrors {
//             field
//             message
//             code
//           }
//         }
//       }`

export default function applyMetaFieldsApiEndpoints(app) {

    // retrieve metafields definitions for customers from shopify
    // and compare them with current schema
    app.get("/api/metafields", async (req, res) => {

       	/* Instantiate a new GraphQL client to query the Shopify GraphQL Admin API */
        const client = new shopify.api.clients.Graphql({
            session: res.locals.shopify.session,
        });

        try{
            const metafields = await client.query({
                data: CUSTOMER_META_FIELDS_QUERY,
            });

            if(metafields.body.data.metafieldDefinitions.edges.length){
                res.json({
                    status: "success",
                    currentVersion: metafieldVersion,
                    metafields: metafields.body.data.metafieldDefinitions.edges
                });
            }else{
                res.json({
                    status: "success",
                    appVersion: metafieldVersion,
                    metafields: []
                });
            };

        }catch(e){
            console.log(e);
            res.json({
                status: "error",
                error: e
            });
        }
    });

    // update metafields definitions for customers in shopify
    app.post("/api/metafields", async (req, res) => {

        const result = await setStoreMetafields(res.locals.shopify.session);

        res.json({
            status: "success",
            result: result
        });
    });

}