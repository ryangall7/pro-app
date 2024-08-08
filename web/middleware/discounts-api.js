import shopify from "../shopify.js";

import { CREATE_CODE_MUTATION, CREATE_AUTOMATIC_MUTATION, GET_DISCOUNT_QUERY, UPDATE_AUTOMATIC_MUTATION, UPDATE_CODE_MUTATION, DELETE_AUTOMATIC_MUTATION, DELETE_CODE_MUTATION } from "../helpers/graphql.js";

// const CREATE_CODE_MUTATION = `
// mutation CreateCodeDiscount($discount: DiscountCodeAppInput!) {
//   discountCreate: discountCodeAppCreate(codeAppDiscount: $discount) {
//     userErrors {
//       code
//       message
//       field
//     }
//   }
// }
// `;

// const CREATE_AUTOMATIC_MUTATION = `
// mutation CreateAutomaticDiscount($discount: DiscountAutomaticAppInput!) {
//   discountCreate: discountAutomaticAppCreate(
//     automaticAppDiscount: $discount
//   ) {
//     userErrors {
//       code
//       message
//       field
//     }
//   }
// }
// `;

// const GET_DISCOUNT_QUERY = `
//   query GetDiscount($id: ID!) {
//     discountNode(id: $id) {
//       id
//       configurationField: metafield(
//         namespace: "${discountConfiguration.namespace}"
//         key: "${discountConfiguration.key}"
//       ) {
//         id
//         value
//       }
//       discount {
//         __typename
//         ... on DiscountAutomaticApp {
//           title
//           discountClass
//           combinesWith {
//             orderDiscounts
//             productDiscounts
//             shippingDiscounts
//           }
//           startsAt
//           endsAt
//         }
//         ... on DiscountCodeApp {
//           title
//           discountClass
//           combinesWith {
//             orderDiscounts
//             productDiscounts
//             shippingDiscounts
//           }
//           startsAt
//           endsAt
//           usageLimit
//           appliesOncePerCustomer
//           codes(first: 1) {
//             nodes {
//               code
//             }
//           }
//         }
//       }
//     }
//   }
// `;

// const UPDATE_AUTOMATIC_MUTATION = `
//   mutation UpdateDiscount($id: ID!, $discount: DiscountAutomaticAppInput!) {
//     discountUpdate: discountAutomaticAppUpdate(
//       id: $id
//       automaticAppDiscount: $discount
//     ) {
//       userErrors {
//         code
//         message
//         field
//       }
//     }
//   }
// `;

// const UPDATE_CODE_MUTATION = `
//   mutation UpdateDiscount($id: ID!, $discount: DiscountCodeAppInput!) {
//     discountUpdate: discountCodeAppUpdate(id: $id, codeAppDiscount: $discount) {
//       userErrors {
//         code
//         message
//         field
//       }
//     }
//   }
// `;

// const DELETE_AUTOMATIC_MUTATION = `
//   mutation DeleteDiscount($id: ID!) {
//     discountDelete: discountAutomaticDelete(id: $id) {
//       userErrors {
//         code
//         message
//         field
//       }
//     }
//   }
// `;

// const DELETE_CODE_MUTATION = `
//   mutation DeleteDiscount($id: ID!) {
//     discountDelete: discountCodeDelete(id: $id) {
//       userErrors {
//         code
//         message
//         field
//       }
//     }
//   }
// `;


const runDiscountMutation = async (req, res, mutation) => {

    const graphqlClient = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session
    });

    try {
      const data = await graphqlClient.query({
        data: {
          query: mutation,
          variables: req.body,
        },
      });

      res.send(data.body);
    } catch (error) {
      console.log(error);
      console.log(JSON.stringify(error.response));
      // Handle errors thrown by the graphql client
      return res.status(500).send({ error: error.response });
    }
};

function idToGid(resource, id) {
  return `gid://shopify/${resource}/${id}`;
}

export default function applyDiscountApiEndpoints(app) {

  app.post("/api/discounts/code", async (req, res) => {
    await runDiscountMutation(req, res, CREATE_CODE_MUTATION);
  });

  app.post("/api/discounts/automatic", async (req, res) => {
    await runDiscountMutation(req, res, CREATE_AUTOMATIC_MUTATION);
  });

  app.get("/api/discounts/:discountId", async (req, res) => {
    req.body.id = idToGid("DiscountNode", req.params.discountId);

    await runDiscountMutation(req, res, GET_DISCOUNT_QUERY);
  });

  app.post("/api/discounts/automatic/:discountId", async (req, res) => {
    req.body.id = idToGid("DiscountAutomaticApp", req.params.discountId);

    await runDiscountMutation(req, res, UPDATE_AUTOMATIC_MUTATION);
  });

  app.post("/api/discounts/code/:discountId", async (req, res) => {
    req.body.id = idToGid("DiscountCodeApp", req.params.discountId);

    await runDiscountMutation(req, res, UPDATE_CODE_MUTATION);
  });

  app.delete("/api/discounts/automatic/:discountId", async (req, res) => {
    req.body.id = idToGid("DiscountAutomaticApp", req.params.discountId);

    await runDiscountMutation(req, res, DELETE_AUTOMATIC_MUTATION);
  });

  app.delete("/api/discounts/code/:discountId", async (req, res) => {
    req.body.id = idToGid("DiscountCodeApp", req.params.discountId);

    await runDiscountMutation(req, res, DELETE_CODE_MUTATION);
  });

}