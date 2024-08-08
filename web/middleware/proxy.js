import shopify from "../shopify.js";
import fileUpload from "express-fileupload";
import path from "path";

const { createHmac } = await import('node:crypto');
import { applicationFields } from "../helpers/metafield-definitions.js";
import { CUSTOMER_UPDATE_MUTATION, CUSTOMER_QUERY, METAFIELD_SET_MUTATION, MARKETING_CONSENT_SET_MUTATION } from "../helpers/graphql.js";

import { uploadImages, deleteFiles } from "../helpers/files.js";
import { getStoreSettings } from "../helpers/stores.js";
import fs from "fs";

import {
    formatCustomerFromGQLResponse
  } from "../helpers/pro-applications.js";


export default function applyProxyEndpoints(app) {

    app.use(fileUpload());

    app.get("/proxy/pro-app", verifyProxyRequest, verifyLoggedIn, async (req, res) => {

        console.log("GET: proxy/pro-app");

        const session = (await shopify.config.sessionStorage.findSessionsByShop(req.query.shop))[0];

        if(!session){
            console.log("Missing offline shop token.");
            res.status(500).send("Missing offline shop token.");
            return;
        }

        const client = new shopify.api.clients.Graphql({
            session
        });

        // fetch customer
        const customerData = await client.query({
            data: {
                query: CUSTOMER_QUERY,
                variables: {
                    id: `gid://shopify/Customer/${req.query.logged_in_customer_id}`
                },
            },
        });

        const customer = formatCustomerFromGQLResponse(customerData.body.data.customer);

        const settings = await getStoreSettings(req.query.shop);
        if(settings && settings.fields){
            customer.fields = settings.fields.map(field => {
                return {
                    ...field,
                    value: customer.application[field.key]
                }
            })
        }

        res.status(200).send(customer);
    })

    app.post("/proxy/pro-app", verifyProxyRequest, verifyLoggedIn, async (req, res) => {

        const session = (await shopify.config.sessionStorage.findSessionsByShop(req.query.shop))[0];

        if(!session){
            res.status(500).send("Missing offline shop token.");
            return;
        }

        const client = new shopify.api.clients.Graphql({
            session
        });

        // update pro application fields
        const customer = req.body;
        const customerId = `gid://shopify/Customer/${req.query.logged_in_customer_id}`;
        const metafields = [{
            "key": applicationFields.dateApplied.definition.key,
            "namespace": applicationFields.dateApplied.definition.namespace,
            "value": new Date().toISOString(),
            "ownerId": customerId,
          }];

        const settings = await getStoreSettings(req.query.shop);
        const settingsFields = {}
        settings.fields.forEach(field => {
            settingsFields[field.key] = field;
        });

        for(var key in customer) {
            if(key != "dateApproved"
                && key != "dateApplied"
                && key != "files"
                && settingsFields[key]
            ){
                metafields.push({
                    "key": key,
                    "namespace": "pro-application",
                    "ownerId": customerId,
                    "value": customer[key]
                });
            }
        }

        await client.query({
            data: {
              query: METAFIELD_SET_MUTATION,
              variables: {
                metafields
              },
            },
        });

        // fetch customer data
        const customerData = await client.query({
            data: {
                query: CUSTOMER_QUERY,
                variables: {
                    id: customerId
                },
            },
        });

        //update customer status
        const proAppTag = `pro-app:pending:${customer.employerType}`;
        const proAppStatusTag = `pro-app-status:pending`;
        const customerTags = customerData.body.data.customer.tags.filter(tag => !tag.startsWith("pro-app"));
        customerTags.push(proAppTag, proAppStatusTag);

        const input = {
          id: customerId,
          tags: customerTags
        };

        const newCustomerData = await client.query({
          data: {
            query: CUSTOMER_UPDATE_MUTATION,
            variables: {
              input
            }
          }
        });

        if(newCustomerData.body.data.customerUpdate.userErrors.length > 0){
            res.status(500).send("Error updating customer.");
            console.log("Error updating customer.", newCustomerData.body.data.customerUpdate.userErrors);
            return;
        }


        const newCustomer = formatCustomerFromGQLResponse(newCustomerData.body.data.customerUpdate.customer);

        try{
            const marketingInput = {
                customerId: customerId,
                emailMarketingConsent: {
                    marketingOptInLevel: "SINGLE_OPT_IN",
                    marketingState: "SUBSCRIBED"
                }
            };

            const marketingData = await client.query({
                data: {
                  query: MARKETING_CONSENT_SET_MUTATION,
                  variables: {
                    marketingInput
                  }
                }
            });

            if(marketingData.body.data.customerEmailMarketingConsentUpdate.userErrors.length > 0){
                console.log(`Error signing customer ${customerId} up for marketing`, marketingData.body.data.customerEmailMarketingConsentUpdate.userErrors);
            }

        }catch(e){
            console.log(e);
        }

        res.status(200).send({
            success: true,
            customer: newCustomer
        });
    });


    app.post("/proxy/pro-app/file", verifyProxyRequest, verifyLoggedIn, async (req, res) => {

        if (!req.files
            || Object.keys(req.files).length === 0
            || !req.query.logged_in_customer_id
            || !req.query.shop
            ) {
            return res.status(400).send('No files were uploaded.');
        }

        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        const file = req.files.file;
        const uploadDir = `${process.cwd()}/files/`;
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        fs.readdir(uploadDir, (err, files) => {
            if (err) throw err;

            for (const file of files) {
              fs.unlink(path.join(uploadDir, file), (err) => {
                if (err) throw err;
              });
            }
        });

        try {
            const uploads = await moveAndUploadFile(file, uploadDir, req);
            res.status(200).send({
                status: "success",
                uploads
            });
        } catch (error) {
            console.log("Error uploading file", error);
            res.status(500).send({
                status: "error",
                message: "Error uploading file."
            });
        }
    });

    app.delete("/proxy/pro-app/file", verifyProxyRequest, verifyLoggedIn, async (req, res) => {
        const session = (await shopify.config.sessionStorage.findSessionsByShop(req.query.shop))[0];

        const { id } = req.body

        if(!session || !id){
            res.status(422).send({
                status: "error",
                message: "Missing offline shop token or file id."
            })
        }

        const client = new shopify.api.clients.Graphql({
            session
        });

        const graphQLResponse = await deleteFiles([id], client);

        if(graphQLResponse.userErrors.length){
            console.log("delete file error", graphQLResponse.userErrors);
            res.status(500).send({
                status: "error",
            });
        }else{
            res.status(200).json({
                status: "success"
            });
        }

    });

}

const moveAndUploadFile = (file, uploadDir, req) => {
    const fileHash = createHmac('sha256', process.env.SHOPIFY_API_SECRET)
                        .update(`${req.query.shop}${req.query.logged_in_customer_id}${file.name}`)
                        .digest('hex');
    const fileName = `pro-app--${fileHash}.${file.name.split(".").pop()}`;
    const uploadPath = `${uploadDir}/${fileName}`;

    return new Promise((resolve, reject) => {
        // Use the mv() method to place the file somewhere on your server
        file.mv(uploadPath, async function(err) {
            if (err){
                console.log(err);
                return res.status(500).send(err)
            };

            try{
                const session = (await shopify.config.sessionStorage.findSessionsByShop(req.query.shop))[0];

                const client = new shopify.api.clients.Graphql({
                    session
                });

                const uploads = await uploadImages([{
                    name: fileName,
                    file: file
                }], client);

                if(uploads.files.length > 0){

                    const customerId = `gid://shopify/Customer/${req.query.logged_in_customer_id}`;

                    // fetch customer
                    const customerData = await client.query({
                        data: {
                            query: CUSTOMER_QUERY,
                            variables: {
                                id: `gid://shopify/Customer/${req.query.logged_in_customer_id}`
                            },
                        },
                    });
                    const currentFilesFeild = customerData.body.data.customer.metafields.edges
                                                .find(metafield => metafield.node.key == applicationFields.files.definition.key);
                    const currentFiles = currentFilesFeild ? JSON.parse(currentFilesFeild.node.value) : [];
                    currentFiles.push(uploads.files[0].id);

                    const metafieldsInput = [{
                        "key": applicationFields.files.definition.key,
                        "namespace": applicationFields.files.definition.namespace,
                        "value": JSON.stringify(currentFiles),
                        "ownerId": customerId,
                    }];

                    const metafields = await client.query({
                        data: {
                        query: METAFIELD_SET_MUTATION,
                        variables: {
                            metafields: metafieldsInput
                        },
                        },
                    });

                    resolve(uploads.files);
                }else{
                    console.log("Error uploading file to shopify.", uploads);
                    reject()
                }
            }catch(error){
                reject(error);
            }
        });
    });
}

const verifyProxyRequest = async (req, res, next) => {

    const query_signature = req.query.signature;
    const query = req.query;
    delete query.signature;

    const sorted_query_string = Object.keys(query).map(key => key + '=' + (typeof query[key] == "array" ? query[key].join(",") : query[key])).sort().join("");

    const generatedHash = createHmac('sha256', process.env.SHOPIFY_API_SECRET)
                .update(sorted_query_string)
                .digest('hex');

    if(generatedHash != query_signature){
        if(process.env.NODE_ENV == "development"){
            console.log("Development mode: Proxy signature mismatch - skipping proxy check.");
            next();
        }else{
            res.status(401).send("Unauthorized - invalid proxy signature.");
        }
    }else{
        next();
    }
}

const verifyLoggedIn = async (req, res, next) => {

    if(req.query.logged_in_customer_id){
        next();
    }else{
        res.status(401).send("Unauthorized - not logged in.");
    }
}