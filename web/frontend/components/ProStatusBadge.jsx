
import { Badge } from "@shopify/polaris";

export function ProStatusBadge({status}) {
    let badge;
    switch(status){
        case "pending":
            badge = <Badge status="attention">Pending</Badge>;
            break;
        case "approved":
            badge = <Badge status="success">Approved</Badge>;
            break;
        case "denied":
            badge = <Badge status="critical">Denied</Badge>;
            break;
        case "expired":
            badge = <Badge status="info">Expired</Badge>;
            break;
        default:
            badge = null;
    }
  return badge;
}
