var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/javy/dist/fs/index.js
var o = /* @__PURE__ */ ((r) => (r[r.Stdin = 0] = "Stdin", r[r.Stdout = 1] = "Stdout", r[r.Stderr = 2] = "Stderr", r))(o || {});
function a(r) {
  let e = new Uint8Array(1024), t = 0;
  for (; ; ) {
    const i = Javy.IO.readSync(r, e.subarray(t));
    if (i < 0)
      throw Error("Error while reading from file descriptor");
    if (i === 0)
      return e.subarray(0, t + i);
    if (t += i, t === e.length) {
      const n = new Uint8Array(e.length * 2);
      n.set(e), e = n;
    }
  }
}
function s(r, e) {
  for (; e.length > 0; ) {
    const t = Javy.IO.writeSync(r, e);
    if (t < 0)
      throw Error("Error while writing to file descriptor");
    e = e.subarray(t);
  }
}

// extensions/pro-discount/src/index.js
var src_exports = {};
__export(src_exports, {
  default: () => src_default
});
var EMPTY_DISCOUNT = {
  discountApplicationStrategy: "FIRST" /* First */,
  discounts: []
};
var src_default = (
  /**
  * @param {InputQuery} input
  * @returns {FunctionResult}
  */
  (input) => {
    const configuration = JSON.parse(
      input?.discountNode?.metafield?.value ?? "{}"
    );
    if (!configuration.customerTag || !configuration.percentage) {
      return EMPTY_DISCOUNT;
    }
    if (!input.cart.buyerIdentity || !input.cart.buyerIdentity.customer || input.cart.buyerIdentity.customer.hasAnyTag == false) {
      return EMPTY_DISCOUNT;
    }
    const targets = input.cart.lines.filter((line) => line.merchandise.__typename == "ProductVariant" && line.merchandise.product.isGiftCard == false && line.merchandise.product.inAnyCollection == true).map((line) => {
      const variant = (
        /** @type {ProductVariant} */
        line.merchandise
      );
      return (
        /** @type {Target} */
        {
          productVariant: {
            id: variant.id
          }
        }
      );
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
      discountApplicationStrategy: "FIRST" /* First */
    };
  }
);

// node_modules/@shopify/shopify_function/index.ts
var input_data = a(o.Stdin);
var input_str = new TextDecoder("utf-8").decode(input_data);
var input_obj = JSON.parse(input_str);
var output_obj = src_exports?.default(input_obj);
var output_str = JSON.stringify(output_obj);
var output_data = new TextEncoder().encode(output_str);
s(o.Stdout, output_data);