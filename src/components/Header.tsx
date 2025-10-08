import { PlusCircle, Search, LocateFixed } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <LocateFixed className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Labubu Locator
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search variants, series, SKU..."
                className="pl-10 transition-all duration-200 focus:shadow-card"
              />
            </div>
            <Link to="/add-variant">
              <Button variant="outline">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
