import { PlusCircle, Search, LocateFixed, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from './ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { ChangeEvent } from 'react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header = ({ searchQuery, setSearchQuery }: HeaderProps) => {
  const navigate = useNavigate();

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim() !== '') {
      navigate(`/catalog?search=${searchQuery}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="cursor-pointer">
              <div className="flex items-center gap-2">
                <LocateFixed className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Labubu Locator
                </h1>
              </div>
            </Link>
          </div>
          
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-4">
            <Link to="/catalog">
              <Button variant="outline">
                <Package className="h-4 w-4 mr-2" />
                Catalog
              </Button>
            </Link>
            <div className="relative w-[500px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search variants, series, SKU..."
                className="pl-10 transition-all duration-200 focus:shadow-card"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </form>
        </div>
      </div>
    </header>
  );
};
