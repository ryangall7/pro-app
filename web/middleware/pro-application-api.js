
import shopify from "../shopify.js";

import {
  formatCustomerFromGQLResponse
} from "../helpers/pro-applications.js";

import { getStoreSettings } from "../helpers/stores.js";
import { discountLevels, proStatuses } from "../helpers/data.js";
import { applicationFields } from "../helpers/metafield-definitions.js";
import { CUSTOMER_LIST_QUERY, CUSTOMER_QUERY, CUSTOMER_UPDATE_MUTATION, METAFIELD_SET_MUTATION } from "../helpers/graphql.js";


export default function applyProApplicationApiEndpoints(app) {

  // retrieve a list of customers from shopify
  app.get("/api/customers", async (req, res) => {

    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    const pagination = 40;

    let variables = {};

    if(req.query.after){
      variables.first = pagination;
      variables.after = req.query.after;
    }else if (req.query.before){
      variables.last = pagination;
      variables.before = req.query.before;
    }else{
      variables.first = pagination;
    }
    let statuses = req.query.applicationStatus ? req.query.applicationStatus.split(",") : [];
    let levels = req.query.discountLevel ? req.query.discountLevel.split(",") : [];
    let query = req.query.query;

    if(statuses.length > 0 || levels.length > 0){
      const tags = [];
      if(statuses.length == 0){
        statuses = proStatuses.filter(({disabled}) => !disabled).map(status => status.value);
      }
      if(levels.length == 0){
        levels = discountLevels.filter(({disabled}) => !disabled).map(level => level.value);
      }
      statuses.forEach(status => {
        levels.forEach(level => {
          tags.push(`tag:'pro-app:${status}:${level}'`);
        });
      });
      if(tags.length > 0){
        if(query){
          query = `${query} ( ${tags.join(" OR ")} )`;
        }else{
          query = tags.join(" OR ");
        }
      }
    } else if (!query) {
      const tags = [];
      proStatuses.forEach(status => {
        tags.push(`tag:'pro-app-status:${status.value}'`);
      });
      if(tags.length > 0){
        if(query){
          query = `${query} ( ${tags.join(" OR ")} )`;
        }else{
          query = tags.join(" OR ");
        }
      }
    }
    if(query){
      variables.query = query;
    }

    // fetch customer list
    const customerData = await client.query({
      data: {
        query: CUSTOMER_LIST_QUERY,
        variables,
      },
    });

    res.send({
      customers: customerData.body.data.customers.edges.map(({node}) => formatCustomerFromGQLResponse(node)),
      pageInfo: customerData.body.data.customers.pageInfo
    });
  });

  // get a single customers from shopify
  app.get("/api/customers/:id", async (req, res) => {
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    // fetch customer
    const customerData = await client.query({
      data: {
        query: CUSTOMER_QUERY,
        variables: {
          id: `gid://shopify/Customer/${req.params.id}`,
        },
      },
    });

    const customer = formatCustomerFromGQLResponse(customerData.body.data.customer);

    res.send(customer);
  });

  /** Update a customer pro approval in shopify
   *  example body:
   *    {
   *      "proStatus": "approved",
   *      "discountLevel": "guide"
   *    }
   */
  app.post("/api/customers/:id/approval", async (req, res) => {

    const customer = req.body;

    if(!customer.discountLevel || !customer.proStatus){
      res.status(400).send("Invalid request body");
      return;
    }

    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    const customerId = `gid://shopify/Customer/${req.params.id}`;

    // fetch customer
    const customerData = await client.query({
      data: {
        query: CUSTOMER_QUERY,
        variables: {
          id: customerId
        },
      },
    });

    if(customer.proStatus == "approved"){
      const metafields = [
        {
          "key": applicationFields.dateApproved.definition.key,
          "namespace": applicationFields.dateApproved.definition.namespace,
          "value": new Date().toISOString(),
          "ownerId": customerId,
        }
      ]

      await client.query({
        data: {
          query: METAFIELD_SET_MUTATION,
          variables: {
            metafields
          },
        },
      });

    }


    const proAppTag = `pro-app:${customer.proStatus}:${customer.discountLevel}`;
    const proAppStatusTag = `pro-app-status:${customer.proStatus}`;
    const proAppDiscountTag = `pro-app-discount:${customer.discountLevel}`;
    const customerTags = customerData.body.data.customer.tags.filter(tag => !tag.startsWith("pro-app"));
    customerTags.push(proAppTag, proAppDiscountTag, proAppStatusTag);

    const input = {
      id: customerId,
      tags: customerTags,
    };

    const newCustomerData = await client.query({
      data: {
        query: CUSTOMER_UPDATE_MUTATION,
        variables: {
          input
        }
      }
    });

    if(newCustomerData.body.data.customerUpdate.userErrors > 0){
      res.send({
        success: false,
        customer: newCustomerData.body.data.customerUpdate,
        errors: newCustomerData.body.data.customerUpdate.userErrors
      });
    }else{
      res.send({
        success: true,
        customer: newCustomerData.body.data.customerUpdate
      });
    }
  });


   /** Update a customer pro application in shopify
   *   example body:
   *      {
   *        "dateApplied": "2022-01-01T12:30:00"
   *        "dateApproved": "2022-01-01T12:30:00"
   *      }
   */
  app.post("/api/customers/:id/application", async (req, res) => {
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    const customer = req.body;
    const customerId = `gid://shopify/Customer/${req.params.id}`;
    const metafields = [];

    for(var key in customer) {
      if(applicationFields[key] && customer[key]){
        metafields.push({
          "key": applicationFields[key].definition.key,
          "namespace": applicationFields[key].definition.namespace,
          "ownerId": customerId,
          "value": customer[key]
        });
      }
    }

    const settings = await getStoreSettings(res.locals.shopify.session.shop);

    settings.fields.forEach(field => {
      //TODO: handle possibility of duplicate keys
      if(customer[field.key]){
        metafields.push({
          "key": field.key,
          "namespace": "pro-application",
          "ownerId": customerId,
          "value": customer[field.key],
          "type": "single_line_text_field",
        });
      }
    });

    if(metafields.length){
      // update metafields
      const response = await client.query({
        data: {
          query: METAFIELD_SET_MUTATION,
          variables: {
            metafields
          },
        },
      });

      res.send({
        success: true,
        metafields
      });

    }else{
      res.send({
        success: false,
        message: "No metafields to update"
      });
    }

  });

}