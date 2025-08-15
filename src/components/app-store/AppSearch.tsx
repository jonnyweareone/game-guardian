
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface AppSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function AppSearch({ searchQuery, onSearchChange }: AppSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search apps..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
