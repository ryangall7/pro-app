import {
    LegacyCard,
    LegacyStack,
    Text,
    Tag,
    Select,
    TextField,
} from '@shopify/polaris';

export function DiscountConfigTitleCard({title}){

    return <LegacyCard title="Discount Configuration">
      <LegacyCard.Section>
            <TextField label="Title" {...title} />
      </LegacyCard.Section>
  </LegacyCard>
}