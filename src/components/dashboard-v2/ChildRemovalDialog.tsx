
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertTriangle } from 'lucide-react';

interface Child {
  id: string;
  name: string;
  age?: number;
  avatar_url?: string;
}

interface ChildRemovalDialogProps {
  child: Child | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (childId: string) => void;
}

const ChildRemovalDialog = ({ child, open, onOpenChange, onConfirm }: ChildRemovalDialogProps) => {
  if (!child) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle className="text-left">
                Remove Child Profile
              </AlertDialogTitle>
            </div>
          </div>
          
          <AlertDialogDescription className="text-left space-y-4">
            <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/50">
              <Avatar className="h-12 w-12">
                <AvatarImage src={child.avatar_url} alt={child.name} />
                <AvatarFallback className="text-lg">
                  {child.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-foreground">{child.name}</div>
                {child.age && (
                  <div className="text-sm text-muted-foreground">{child.age} years old</div>
                )}
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <p>
                Are you sure you want to remove <strong>{child.name}'s</strong> profile? 
                This action cannot be undone.
              </p>
              <p>
                <strong>What will happen:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                <li>All monitoring data for this child will be permanently deleted</li>
                <li>Any linked devices will be reset to factory settings</li>
                <li>App restrictions and time limits will be removed</li>
                <li>Alert history will be permanently lost</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(child.id)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Yes, Remove {child.name}'s Profile
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ChildRemovalDialog;
