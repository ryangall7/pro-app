import {
    LegacyCard,
    LegacyStack,
    Text,
    Tag,
    Select,
    TextField,
} from '@shopify/polaris';

import { discountLevels } from "../../../helpers/data"
import { useAppQuery } from "../../hooks";

export function DiscountConfigProLevelCard({configuration}){


    const {
        data: settings,
        isLoading: settingsLoading,
        isRefetching: settingsRefetching,
    } = useAppQuery({
        url: `/api/settings`
    });

    var tagOptions = [];
    if (settings && settings.discountLevels) {
        tagOptions = settings.discountLevels.map((level) => {
            return {
                label: level.label,
                value: level.value ? `pro-app:approved:${level.value}` : false,
                disabled: level.disabled
            };
        });
    }

    return <LegacyCard title={<LegacyStack>
        <Text variant="headingMd" as="h2">
          Customer
        </Text>
        {configuration.customerTag.value ? <Tag>{configuration.customerTag.value}</Tag> : null }
      </LegacyStack>}>
      <LegacyCard.Section>
          <LegacyStack>
              <Select
                  label="Discount Level"
                  options={tagOptions || false}
                  {...configuration.customerTag}
                  value={configuration.customerTag.value || false}
              />
              <TextField label="Discount percentage" {...configuration.percentage} suffix="%" />
          </LegacyStack>
      </LegacyCard.Section>
  </LegacyCard>
}