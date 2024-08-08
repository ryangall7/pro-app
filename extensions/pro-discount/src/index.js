// @ts-check
import { DiscountApplicationStrategy } from "../generated/api";

/**
 * @typedef {import("../generated/api").InputQuery} InputQuery
 * @typedef {import("../generated/api").FunctionResult} FunctionResult
 * @typedef {import("../generated/api").Target} Target
 * @typedef {import("../generated/api").ProductVariant} ProductVariant
 */

/**
 * @type {FunctionResult}
 */
const EMPTY_DISCOUNT = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

export default /**
 * @param {InputQuery} input
 * @returns {FunctionResult}
 */
  (input) => {
    /**
     * @type {{
    *   percentage: number
    *   customerTag: string
    * }}
    */
    const configuration = JSON.parse(
      input?.discountNode?.metafield?.value ?? "{}"
    );


    if (!configuration.customerTag || !configuration.percentage) {
      return EMPTY_DISCOUNT;
    }

    if (!input.cart.buyerIdentity || !input.cart.buyerIdentity.customer || input.cart.buyerIdentity.customer.hasAnyTag == false) {
      return EMPTY_DISCOUNT;
    }

    const targets = input.cart.lines
      .filter(line => line.merchandise.__typename == "ProductVariant" && line.merchandise.product.isGiftCard == false && line.merchandise.product.inAnyCollection == true)
      .map(line => {
        const variant = /** @type {ProductVariant} */ (line.merchandise);
        return /** @type {Target} */ ({
          productVariant: {
            id: variant.id
          }
        });
      });
    if (!targets.length) {
      console.error("No cart lines qualify for the pro discount.");
      return EMPTY_DISCOUNT;
    }

    return {
      discounts: [
        {
          targets,
          value: {
            percentage: {
              value: configuration.percentage.toString()
            }
          }
        }
      ],
      discountApplicationStrategy: DiscountApplicationStrategy.First
    };
  };
