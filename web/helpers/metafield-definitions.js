// Definitions of metafields that are used by the app.
// Notes:
// - The namespace should be unique to the app.
// - There is currently no way to delete metafield definitions.
// - There is currently no way to change the `type` of a metafield definition.

export const metafieldVersion = "0.9"

export const dateApplied = {
    "definition": {
        "name": "Pro Application Date",
        "namespace": "pro-application",
        "key": "date-applied",
        "description": `[${metafieldVersion}] The date customer applied to become a pro.`,
        "type": "date_time",
        "ownerType": "CUSTOMER",
       //"visibleToStorefrontApi": true
    }
}

export const dateApproved = {
    "definition": {
        "name": "Pro Approval Date",
        "namespace": "pro-application",
        "key": "date-approved",
        "description": `[${metafieldVersion}] The date customer approved as a pro.`,
        "type": "date_time",
        "ownerType": "CUSTOMER",
        //"visibleToStorefrontApi": true
    }
}

export const files = {
    "definition": {
        "name": "Files",
        "namespace": "pro-application",
        "key": "files",
        "description": `[${metafieldVersion}] The files for proof of employment.`,
        "type": "list.file_reference",
        "ownerType": "CUSTOMER",
        //"visibleToStorefrontApi": true
    }
}

export const applicationFields = {
    dateApplied,
    dateApproved,
    files
}

/**
 *   Discount Metafields
 */

export const discountConfiguration = {
    namespace: '$app:custom-discount',
    key: 'function-configuration',
}