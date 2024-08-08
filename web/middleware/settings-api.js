import shopify from "../shopify.js";

import { getStoreSettings, setStoreSettings } from "../helpers/stores.js";

export default function applySettingsApiEndpoints(app) {

    // retrieve metafields definitions for customers from shopify
    // and compare them with current schema
    app.get("/api/settings", async (req, res) => {
        const settings = await getStoreSettings(res.locals.shopify.session.shop);
        res.json(settings)
    });

    // update metafields definitions for customers in shopify
    app.post("/api/settings", async (req, res) => {

        const settings = await getStoreSettings(res.locals.shopify.session.shop);
        const newSettings = {...settings};

        //only change settings if explicitly set in request
        if(req.body.forceAcceptsMarketing !== undefined){
            newSettings.forceAcceptsMarketing = req.body.forceAcceptsMarketing === true;
        }

        if(req.body.discountLevels && req.body.discountLevels.length > 0){
            newSettings.discountLevels = req.body.discountLevels.map(level => ({
                label: level.label,
                value: level.value
            }));
        }

        if(req.body.fieldsConfig && req.body.fieldsConfig.length > 0){
            newSettings.fields = req.body.fieldsConfig.map(field => ({
                key: field.key,
                name: field.name,
                options: field.options && field.options.length > 0 ? field.options.map(option => ({
                    label: option.label,
                    value: option.value
                })) : null,
                required: field.required === true,
                type: field.type,
                helpText: field.helpText || null
            }));
        }

        const response = await setStoreSettings(res.locals.shopify.session.shop, newSettings);

        if(response.errors){
            res.status(500).json(response.errors);
        }else{
            res.json(newSettings);
        }
    });

}