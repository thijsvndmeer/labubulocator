import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { RarityBadge } from '@/components/RarityBadge';
import { ConfidenceScore } from '@/components/ConfidenceScore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { mockVariants } from '@/data/mockVariants';
import { ArrowLeft, ExternalLink, Bell, Heart } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const VariantDetail = () => {
  const { id } = useParams();
  const variant = mockVariants.find((v) => v.id === id);

  if (!variant) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Variant not found</h2>
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to catalog
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Image Section */}
          <Card className="overflow-hidden">
            <div className="aspect-square bg-muted">
              <img
                src={variant.images[0]}
                alt={variant.name}
                className="w-full h-full object-cover"
              />
            </div>
          </Card>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">{variant.name}</h1>
                <RarityBadge rarity={variant.rarity} />
              </div>
              <p className="text-lg text-muted-foreground mb-1">{variant.series}</p>
              <p className="text-sm text-muted-foreground">SKU: {variant.sku}</p>
            </div>

            <Card className="p-6 bg-gradient-primary">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-primary-foreground/80 mb-1">Estimated Market Value</p>
                  <p className="text-4xl font-bold text-primary-foreground">
                    ${variant.estimatedValue.toFixed(2)}
                  </p>
                  <p className="text-sm text-primary-foreground/80 mt-1">
                    Range: ${variant.priceRange.low} - ${variant.priceRange.high}
                  </p>
                </div>
                <ConfidenceScore score={variant.confidenceScore} className="text-primary-foreground/90" />
              </div>
            </Card>

            <div className="flex gap-3">
              <Button className="flex-1" size="lg">
                <Bell className="h-4 w-4 mr-2" />
                Watch This Variant
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Price History (Last 90 Days)</h3>
              <div className="space-y-3">
                {variant.priceHistory.map((snapshot, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{snapshot.date}</span>
                    <div className="text-right">
                      <p className="font-semibold">${snapshot.median30d.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{snapshot.volume} sales</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Sales */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Recent Sales</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead className="text-right">Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variant.recentSales.map((sale, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{sale.date}</TableCell>
                    <TableCell>{sale.source}</TableCell>
                    <TableCell className="font-semibold text-primary">
                      ${sale.price.toFixed(2)}
                    </TableCell>
                    <TableCell>{sale.currency}</TableCell>
                    <TableCell className="text-right">
                      <a
                        href={sale.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        View
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Sales data sourced from verified marketplace transactions. Prices shown in original currency.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default VariantDetail;
