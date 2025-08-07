import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronDown, Users } from 'lucide-react';

interface Child {
  id: string;
  name: string;
  age?: number;
  avatar_url?: string;
}

interface ChildSwitcherProps {
  children: Child[];
  selectedChildId: string | null;
  onChildSelect: (childId: string | null) => void;
  alertCounts: Record<string, { total: number; critical: number }>;
}

const ChildSwitcher = ({ children, selectedChildId, onChildSelect, alertCounts }: ChildSwitcherProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedChild = selectedChildId ? children.find(c => c.id === selectedChildId) : null;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">Monitoring:</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2"
            >
              {selectedChild ? (
                <>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={selectedChild.avatar_url} />
                    <AvatarFallback>{selectedChild.name[0]}</AvatarFallback>
                  </Avatar>
                  <span>{selectedChild.name}</span>
                  {alertCounts[selectedChild.id]?.critical > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {alertCounts[selectedChild.id].critical}
                    </Badge>
                  )}
                </>
              ) : (
                <span>All Children</span>
              )}
              <ChevronDown className="h-4 w-4" />
            </Button>

            {isOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-md shadow-lg z-10">
                <Button
                  variant="ghost"
                  onClick={() => {
                    onChildSelect(null);
                    setIsOpen(false);
                  }}
                  className="w-full justify-start p-3"
                >
                  <Users className="h-4 w-4 mr-2" />
                  All Children
                </Button>
                
                {children.map((child) => (
                  <Button
                    key={child.id}
                    variant="ghost"
                    onClick={() => {
                      onChildSelect(child.id);
                      setIsOpen(false);
                    }}
                    className="w-full justify-start p-3 border-t border-border"
                  >
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={child.avatar_url} />
                      <AvatarFallback>{child.name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{child.name}</span>
                    {child.age && (
                      <span className="text-muted-foreground ml-1">({child.age})</span>
                    )}
                    <div className="ml-auto flex gap-1">
                      {alertCounts[child.id]?.total > 0 && (
                        <Badge variant="outline">
                          {alertCounts[child.id].total}
                        </Badge>
                      )}
                      {alertCounts[child.id]?.critical > 0 && (
                        <Badge variant="destructive">
                          {alertCounts[child.id].critical}
                        </Badge>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChildSwitcher;