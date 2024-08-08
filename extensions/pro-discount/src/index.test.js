import { describe, it, expect } from 'vitest';
import { DiscountApplicationStrategy } from '../generated/api';
import productDiscount from './index';

/**
 * @typedef {import("../generated/api").FunctionResult} FunctionResult
 */

describe('product discount function', () => {
    it('returns no discounts without configuration', () => {
        const result = productDiscount({
            "cart": {
                "lines": [
                    {
                        "quantity": 10,
                        "merchandise": {
                            "__typename": "ProductVariant",
                            "id": "gid://shopify/ProductVariant/123456789",
                                "product": {
                                    "isGiftCard": false
                                }
                        }
                    }
                ],
                "buyerIdentity": {
                    "customer": {
                        "id": "gid://shopify/Customer/7057728602411",
                        "hasAnyTag": false
                    }
                }
            },
            "discountNode": {}
        });

        expect(result.discounts.length).toBe(0);
    });

    it('returns no discounts when quantity is unmet', () => {
        const result = productDiscount({
            "cart": {
                "lines": [
                    {
                        "quantity": 1,
                        "merchandise": {
                            "__typename": "ProductVariant",
                            "id": "gid://shopify/ProductVariant/123456789",
                                "product": {
                                    "isGiftCard": false
                                }
                        }
                    }
                ],
                "buyerIdentity": {
                    "customer": {
                        "id": "gid://shopify/Customer/7050539860267",
                        "hasAnyTag": false
                    }
                }
            },
            "discountNode": {
                "metafield": {
                    "value": "{\"customerTag\":\"\",\"percentage\":5}"
                }
            }
        });
        expect(result.discounts.length).toBe(0);
    });
    
    it('returns no discount when product not in category', () => {
        const result = productDiscount({
            "cart": {
                "lines": [
                    {
                        "quantity": 1,
                        "merchandise": {
                            "__typename": "ProductVariant",
                            "id": "gid://shopify/ProductVariant/8188917612822",
                                "product": {
                                    "isGiftCard": false
                                }
                        }
                    }
                ],
                "buyerIdentity": {
                    "customer": {
                        "id": "gid://shopify/Customer/7057728602411",
                        "hasAnyTag": true
                    }
                }
            },
            "discountNode": {
                "metafield": {
                    "value": "{\"customerTag\":\"\",\"percentage\":5}"
                }
            }
        });
        expect(result.discounts.length).toBe(0);
    });

    it('discounts variants when quantity is met and product in category', () => {
        const result = productDiscount({
            "cart": {
                "lines": [
                    {
                        "quantity": 2,
                        "merchandise": {
                            "__typename": "ProductVariant",
                            "id": "gid://shopify/ProductVariant/44480296943894",
                                "product": {
                                    "isGiftCard": false,
                                    "inAnyCollection": true
                                }
                        }
                    },
                    {
                        "quantity": 3,
                        "merchandise": {
                            "__typename": "ProductVariant",
                            "id": "gid://shopify/ProductVariant/987654321",
                                "product": {
                                    "isGiftCard": true
                                }
                        }
                    }
                ],
                "buyerIdentity": {
                    "customer": {
                        "id": "gid://shopify/Customer/7057728602411",
                        "hasAnyTag": true
                    }
                }
            },
            "discountNode": {
                "metafield": {
                    "value": "{\"customerTag\":\"Test\",\"percentage\":5}"
                }
            }
        });
        const expected = /** @type {FunctionResult} */ ({
            discountApplicationStrategy: DiscountApplicationStrategy.First,
            discounts: [{
                targets: [
                    {
                        productVariant: {
                            id: "gid://shopify/ProductVariant/44480296943894"
                        }
                    }
                ],
                value: {
                    percentage: {
                        value: "5"
                    }
                }
            }]
        });
        expect(result).toEqual(expected);
    });
});
