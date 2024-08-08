import shopify from "../shopify.js";

import { db } from "../db.js";
import { defaultDiscountLevels, defaultFieldsConfig } from "./data.js";
import { applicationFields } from "../helpers/metafield-definitions.js";
import { handlelize } from "../helpers/utility.js";

import { CUSTOMER_META_FIELDS_QUERY, CUSTOMER_META_FIELDS_CREATE, CUSTOMER_META_FIELDS_UPDATE, CUSTOMER_META_FIELDS_DELETE } from "../helpers/graphql.js";

const getStoreSettings = async (shop) => {
    const store = await db.collection('stores').findOne({ store: shop });

    if(store?.settings){
        return store.settings;
    }else{
        const defaultSettings = {
            discountLevels: defaultDiscountLevels,
            fields: defaultFieldsConfig,
            forceAcceptsMarketing: true
        }
        const store = await db.collection('stores').insertOne({ store: shop, settings: defaultSettings });
        return store.settings;
    }
}

const setStoreSettings = async (shop, settings) => {

    settings.fields = settings.fields.map(field => {
        field.key = handlelize(field.key);
        return field
    });

    const store = await db.collection('stores').updateOne({ store: shop }, { $set: { settings: settings } });

    const session = (await shopify.config.sessionStorage.findSessionsByShop(shop))[0];
    await setStoreMetafields(session);

    return store;
}

const setStoreMetafields = async (session) => {
    /* Instantiate a new GraphQL client to query the Shopify GraphQL Admin API */
    const client = new shopify.api.clients.Graphql({
        session: session,
    });

    const metafields = await client.query({
        data: CUSTOMER_META_FIELDS_QUERY,
    });

    const settings = await getStoreSettings(session.shop);
    const settingsFields = settings?.fields || [];


    const result = {
        created: [],
        updated: [],
        deleted: []
    }

    // doesn't work with applicaiton namespace
    metafields.body.data.metafieldDefinitions.edges.forEach(async ({node}) => {

        const fieldDefined = Object.values(applicationFields).find(({definition}) => {
            return node.key == definition.key && node.namespace == definition.namespace;
        });
        const fieldInSettings = settingsFields.find(field => {
            return node.key == field.key && node.namespace == "pro-application";
        });

        if(!fieldDefined && !fieldInSettings){
            const variables = {
                id: node.id
            }
            const deleted = await client.query({
                data: {
                    query: CUSTOMER_META_FIELDS_DELETE,
                    variables: {
                        id: node.id
                    }
                }
            });
            result.deleted.push({
                variables,
                deleted
            });
        }
    });

    for( var i = 0; i < settingsFields.length; i++){
        const field = settingsFields[i];
        const existingField = metafields.body.data.metafieldDefinitions.edges.find(({node}) => {
            //check if basic fields are the same
            if(node.namespace !== "pro-application") return false;
            if(node.key !== field.key) return false;
            return true;
        })?.node;

        if(!existingField){
            const variables = {
                definition: {
                    name: field.name,
                    description: field.helpText,
                    namespace: "pro-application",
                    key: field.key,
                    type: "single_line_text_field",
                    ownerType: "CUSTOMER",
                    visibleToStorefrontApi: true
                }
            }
            const created = await client.query({
                data: {
                    query: CUSTOMER_META_FIELDS_CREATE,
                    variables
                }
            });
            if(created.body?.data?.metafieldDefinitionCreate?.userErrors?.length > 0){
                console.log(`Error Creating Field on ${session.shop}:`, created.body.data.metafieldDefinitionCreate.userErrors, variables);
            }
            result.created.push({
                variables,
                created
            });
        }
    }

    for(var key in applicationFields){
        const variables = applicationFields[key];
        const existingField = metafields.body.data.metafieldDefinitions.edges.find(({node}) => {
            //check if basic fields are the same
            if(node.namespace !== variables.definition.namespace) return false;
            if(node.key !== variables.definition.key) return false;
            return true;
        })?.node;

        if(existingField && variables.definition.type == existingField.type.name){
            const updated = await client.query({
                data: {
                    query: CUSTOMER_META_FIELDS_UPDATE,
                    variables: {
                        definition: {
                            name: variables.definition.name,
                            namespace: variables.definition.namespace,
                            key: variables.definition.key,
                            description: variables.definition.description,
                            ownerType: variables.definition.ownerType,
                            visibleToStorefrontApi: variables.definition.visibleToStorefrontApi
                        }
                    }
                }
            });
            result.updated.push({
                variables,
                updated
            });
        }else if(!existingField){
            const created = await client.query({
                data: {
                    query: CUSTOMER_META_FIELDS_CREATE,
                    variables
                }
            });
            result.created.push({
                variables,
                created
            });
        }
    }

    return result;
}

const deleteStoreSettings = async (shop) => {
    await db.collection('stores').deleteOne({ store: shop });
    console.log("Deleted Store Settings", shop);
}

export {
    getStoreSettings,
    setStoreSettings,
    setStoreMetafields,
    deleteStoreSettings
}