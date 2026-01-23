import { FeatureFlags } from '@/types/admin-config';
import { ConfigField } from '@/components/ui/ConfigField';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FeatureFlagsEditorProps {
  value: FeatureFlags;
  onChange: (newValue: FeatureFlags) => void;
}

const descriptions: Record<keyof FeatureFlags, string> = {
  affiliateButtons: 'Enable or disable the "Buy Now" affiliate buttons on product cards.',
  stockStatus: 'Display the stock status (In Stock, Low Stock, Out of Stock) on product cards.',
  priceChange: 'Show the 24-hour price change percentage on product cards.',
  collectionGlow: 'Apply a visual glow effect to collected or uncollected items in your collection view.',
};

export const FeatureFlagsEditor: React.FC<FeatureFlagsEditorProps> = ({ value, onChange }) => {
  const handleChange = (field: keyof FeatureFlags, newValue: boolean) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ConfigField
            id="affiliateButtons"
            label="Affiliate Buttons"
            type="boolean"
            value={value.affiliateButtons}
            onChange={(val) => handleChange('affiliateButtons', val as boolean)}
            description={descriptions.affiliateButtons}
          />
          <ConfigField
            id="stockStatus"
            label="Stock Status Display"
            type="boolean"
            value={value.stockStatus}
            onChange={(val) => handleChange('stockStatus', val as boolean)}
            description={descriptions.stockStatus}
          />
          <ConfigField
            id="priceChange"
            label="Price Change Display"
            type="boolean"
            value={value.priceChange}
            onChange={(val) => handleChange('priceChange', val as boolean)}
            description={descriptions.priceChange}
          />
          <ConfigField
            id="collectionGlow"
            label="Collection Glow Effect"
            type="boolean"
            value={value.collectionGlow}
            onChange={(val) => handleChange('collectionGlow', val as boolean)}
            description={descriptions.collectionGlow}
          />
        </CardContent>
      </Card>
    </div>
  );
};
