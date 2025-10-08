
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AddVariantPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Labubu Variant</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="e.g., Classic Labubu" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="series">Series</Label>
              <Input id="series" placeholder="e.g., The Monsters" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="variant">Variant</Label>
              <Input id="variant" placeholder="e.g., Original" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" placeholder="e.g., LB-TM-001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rarity">Rarity</Label>
              <Select>
                <SelectTrigger id="rarity">
                  <SelectValue placeholder="Select rarity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="common">Common</SelectItem>
                  <SelectItem value="uncommon">Uncommon</SelectItem>
                  <SelectItem value="rare">Rare</SelectItem>
                  <SelectItem value="epic">Epic</SelectItem>
                  <SelectItem value="legendary">Legendary</SelectItem>
                  <SelectItem value="secret">Secret</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="A short description of the Labubu." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="msrp">MSRP (USD)</Label>
              <Input id="msrp" type="number" placeholder="e.g., 12.99" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retailUrl">Retail URL</Label>
              <Input id="retailUrl" placeholder="https://example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockStatus">Stock Status</Label>
              <Select>
                <SelectTrigger id="stockStatus">
                  <SelectValue placeholder="Select stock status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="pre_order">Pre-order</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">Add Labubu</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
