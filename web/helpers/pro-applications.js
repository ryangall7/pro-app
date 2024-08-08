
import { applicationFields } from './metafield-definitions.js';

export const getMetafieldValue = (edges, namespace, key) => {
  if(!edges) return null;
  const node = edges.map(({node}) => node).find(node => node.namespace == namespace && node.key === key)
  if(!node) return null;
  if(node.references){
    const values = node.references.edges.map(({node}) => ({
      id: node.id,
      preview: node.preview ? node.preview.image?.url : node.image?.url,
      url: node.image ? node.image.url : node.url,
      name: node.alt,
      createdAt: node.createdAt
    })).filter(image => image.url);
    return values;
  }else{
    return node ? node.value : null;
  }
}

export const getProApprovalStatus = (tags) => {
  if(!tags) return {};
  const proTag = tags.find(tag => tag.indexOf('pro-app:') > -1);
  if(!proTag) return {};
  return {
      status: proTag.split(':')[1],
      discount: proTag.split(':')[2]
  }
}

export const formatCustomerFromGQLResponse = (customerData) => {

  const { status, discount } = getProApprovalStatus(customerData.tags);

  const customer = {
    id: customerData.id,
    displayName: customerData.displayName,
    email: customerData.email,
    phone: customerData.phone,
    proStatus: status,
    discountLevel: discount,
    application: {},
    raw: customerData
  };

  for(let field in customerData.metafields?.edges){
    const node = customerData.metafields.edges[field].node;
    if(node.namespace.startsWith("pro-application")){
      customer.application[node.key] = node.value;
      if(node.key === "files" && node.references){
        customer.files = node.references.edges.map(({node}) => ({
          id: node.id,
          preview: node.preview ? node.preview.image?.url : node.image?.url,
          url: node.image ? node.image.url : node.url,
          name: node.alt,
          createdAt: node.createdAt
        })).filter(image => image.url);
      }
    }
  }

  return customer;
}