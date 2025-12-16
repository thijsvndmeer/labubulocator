import { CatalogConfig } from '@/types/admin-config';
import { ConfigField } from '@/components/ui/ConfigField';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';


interface CatalogConfigEditorProps {
  value: CatalogConfig;
  onChange: (newValue: CatalogConfig) => void;
}

const descriptions: Record<string, string> = {
  csvPath: 'Path to the CSV file containing product data.',
  'fieldMappings.name': 'CSV column header for product name.',
  'fieldMappings.sku': 'CSV column header for product SKU.',
  'fieldMappings.series': 'CSV column header for product series.',
  'fieldMappings.variant': 'CSV column header for product variant.',
  'fieldMappings.rarity': 'CSV column header for product rarity.',
  'fieldMappings.lowestPrice': 'CSV column header for the lowest price.',
  'fieldMappings.stockStatus': 'CSV column header for stock status.',
  'display.showMsrp': 'Show Manufacturer Suggested Retail Price on product details.',
  'display.showVariant': 'Show variant information on product cards and details.',
};

export const CatalogConfigEditor: React.FC<CatalogConfigEditorProps> = ({ value, onChange }) => {
  const handleChange = (path: string, newValue: string | number | boolean) => {
    const newConfig = JSON.parse(JSON.stringify(value)); // Deep copy
    const parts = path.split('.');
    let current: any = newConfig;

    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = newValue;
    onChange(newConfig);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Catalog General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ConfigField
            id="csvPath"
            label="CSV Path"
            type="string"
            value={value.csvPath}
            onChange={(val) => handleChange('csvPath', val)}
            description={descriptions.csvPath}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Field Mappings (CSV Headers)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ConfigField
            id="fieldMappings-name"
            label="Name"
            type="string"
            value={value.fieldMappings.name}
            onChange={(val) => handleChange('fieldMappings.name', val)}
            description={descriptions['fieldMappings.name']}
          />
          <ConfigField
            id="fieldMappings-sku"
            label="SKU"
            type="string"
            value={value.fieldMappings.sku}
            onChange={(val) => handleChange('fieldMappings.sku', val)}
            description={descriptions['fieldMappings.sku']}
          />
          <ConfigField
            id="fieldMappings-series"
            label="Series"
            type="string"
            value={value.fieldMappings.series}
            onChange={(val) => handleChange('fieldMappings.series', val)}
            description={descriptions['fieldMappings.series']}
          />
          <ConfigField
            id="fieldMappings-variant"
            label="Variant"
            type="string"
            value={value.fieldMappings.variant}
            onChange={(val) => handleChange('fieldMappings.variant', val)}
            description={descriptions['fieldMappings.variant']}
          />
          <ConfigField
            id="fieldMappings-rarity"
            label="Rarity"
            type="string"
            value={value.fieldMappings.rarity}
            onChange={(val) => handleChange('fieldMappings.rarity', val)}
            description={descriptions['fieldMappings.rarity']}
          />
          <ConfigField
            id="fieldMappings-lowestPrice"
            label="Lowest Price"
            type="string"
            value={value.fieldMappings.lowestPrice}
            onChange={(val) => handleChange('fieldMappings.lowestPrice', val)}
            description={descriptions['fieldMappings.lowestPrice']}
          />
          <ConfigField
            id="fieldMappings-stockStatus"
            label="Stock Status"
            type="string"
            value={value.fieldMappings.stockStatus}
            onChange={(val) => handleChange('fieldMappings.stockStatus', val)}
            description={descriptions['fieldMappings.stockStatus']}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ConfigField
            id="display-showMsrp"
            label="Show MSRP"
            type="boolean"
            value={value.display.showMsrp}
            onChange={(val) => handleChange('display.showMsrp', val)}
            description={descriptions['display.showMsrp']}
          />
          <ConfigField
            id="display-showVariant"
            label="Show Variant"
            type="boolean"
            value={value.display.showVariant}
            onChange={(val) => handleChange('display.showVariant', val)}
            description={descriptions['display.showVariant']}
          />
        </CardContent>
      </Card>
    </div>
  );
};
