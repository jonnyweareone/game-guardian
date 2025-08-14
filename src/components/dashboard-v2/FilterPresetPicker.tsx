
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, Users, GraduationCap } from 'lucide-react';

interface FilterPresetPickerProps {
  selectedPreset: 'child' | 'teen' | 'adult';
  onPresetChange: (preset: 'child' | 'teen' | 'adult') => void;
  childName?: string;
  childAvatar?: string;
  className?: string;
}

const presets = [
  {
    id: 'child' as const,
    name: 'Child',
    icon: Shield,
    description: 'Maximum protection for young children',
    ageRange: '5-10 years',
    color: 'bg-green-100 text-green-800 border-green-200',
    features: ['Strict content filtering', 'Limited app access', 'Extended bedtime restrictions']
  },
  {
    id: 'teen' as const,
    name: 'Teen',
    icon: Users,
    description: 'Balanced protection for teenagers',
    ageRange: '11-16 years',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    features: ['Moderate content filtering', 'Social media monitoring', 'Flexible schedule']
  },
  {
    id: 'adult' as const,
    name: 'Young Adult',
    icon: GraduationCap,
    description: 'Light monitoring for responsible teens',
    ageRange: '17+ years',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    features: ['Basic safety monitoring', 'Privacy-focused', 'Minimal restrictions']
  }
];

export default function FilterPresetPicker({ selectedPreset, onPresetChange, childName, childAvatar, className }: FilterPresetPickerProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          {childName && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={childAvatar} alt={childName} />
              <AvatarFallback className="text-xs">
                {childName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <span>Protection Level</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {presets.map((preset) => {
          const Icon = preset.icon;
          const isSelected = selectedPreset === preset.id;
          
          return (
            <Button
              key={preset.id}
              variant={isSelected ? "default" : "outline"}
              className={`w-full h-auto p-4 justify-start ${isSelected ? '' : 'hover:bg-muted/50'}`}
              onClick={() => onPresetChange(preset.id)}
            >
              <div className="flex items-start gap-3 w-full">
                <Icon className={`h-5 w-5 mt-0.5 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                <div className="flex-1 text-left space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{preset.name}</span>
                    <Badge variant="outline" className={`text-xs ${preset.color}`}>
                      {preset.ageRange}
                    </Badge>
                  </div>
                  <p className={`text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {preset.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {preset.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
