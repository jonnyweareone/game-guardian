import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Palette, Shuffle } from "lucide-react";

// Import avatar images
import avatar01 from "@/assets/avatars/avatar-01.png";
import avatar02 from "@/assets/avatars/avatar-02.png";
import avatar03 from "@/assets/avatars/avatar-03.png";
import avatar04 from "@/assets/avatars/avatar-04.png";
import avatar05 from "@/assets/avatars/avatar-05.png";
import avatar06 from "@/assets/avatars/avatar-06.png";
import avatar07 from "@/assets/avatars/avatar-07.png";
import avatar08 from "@/assets/avatars/avatar-08.png";
import avatar09 from "@/assets/avatars/avatar-09.png";
import avatar10 from "@/assets/avatars/avatar-10.png";
import avatar11 from "@/assets/avatars/avatar-11.png";
import avatar12 from "@/assets/avatars/avatar-12.png";

const PRESET_AVATARS = [
  { id: 1, src: avatar01, name: "Alex" },
  { id: 2, src: avatar02, name: "Bailey" },
  { id: 3, src: avatar03, name: "Casey" },
  { id: 4, src: avatar04, name: "Dana" },
  { id: 5, src: avatar05, name: "Ellis" },
  { id: 6, src: avatar06, name: "Finley" },
  { id: 7, src: avatar07, name: "Gray" },
  { id: 8, src: avatar08, name: "Harper" },
  { id: 9, src: avatar09, name: "Indigo" },
  { id: 10, src: avatar10, name: "Jordan" },
  { id: 11, src: avatar11, name: "Kai" },
  { id: 12, src: avatar12, name: "Lane" },
];

const HAIR_COLORS = ["#8B4513", "#FFD700", "#000000", "#FF4500", "#A0522D", "#DDA0DD"];
const SHIRT_COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57", "#A29BFE"];

interface AvatarSelectorProps {
  selectedAvatar: string | null;
  onAvatarSelect: (avatarUrl: string) => void;
}

export const AvatarSelector = ({ selectedAvatar, onAvatarSelect }: AvatarSelectorProps) => {
  const [customHairColor, setCustomHairColor] = useState(HAIR_COLORS[0]);
  const [customShirtColor, setCustomShirtColor] = useState(SHIRT_COLORS[0]);
  const [generatedAvatar, setGeneratedAvatar] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCustomAvatar = async () => {
    setIsGenerating(true);
    try {
      // Create a simple avatar based on selected colors
      const canvas = document.createElement('canvas');
      canvas.width = 120;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas context not available');

      // Clear canvas
      ctx.clearRect(0, 0, 120, 120);
      
      // Draw simple avatar
      // Face (circle)
      ctx.beginPath();
      ctx.arc(60, 60, 40, 0, 2 * Math.PI);
      ctx.fillStyle = '#FDBCB4'; // skin tone
      ctx.fill();
      ctx.strokeStyle = '#E8A598';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Hair
      ctx.beginPath();
      ctx.arc(60, 45, 35, Math.PI, 2 * Math.PI);
      ctx.fillStyle = customHairColor;
      ctx.fill();
      
      // Eyes
      ctx.beginPath();
      ctx.arc(50, 55, 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#000';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(70, 55, 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#000';
      ctx.fill();
      
      // Smile
      ctx.beginPath();
      ctx.arc(60, 60, 15, 0, Math.PI);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Shirt
      ctx.beginPath();
      ctx.rect(35, 95, 50, 25);
      ctx.fillStyle = customShirtColor;
      ctx.fill();
      
      const avatarUrl = canvas.toDataURL('image/png');
      setGeneratedAvatar(avatarUrl);
      onAvatarSelect(avatarUrl);
    } catch (error) {
      console.error('Error generating avatar:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="preset" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preset">Choose Avatar</TabsTrigger>
          <TabsTrigger value="custom">Create Avatar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="preset" className="space-y-4">
          <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto">
            {PRESET_AVATARS.map((avatar) => (
              <Card
                key={avatar.id}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  selectedAvatar === avatar.src ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onAvatarSelect(avatar.src)}
              >
                <div className="p-2 text-center">
                  <img
                    src={avatar.src}
                    alt={avatar.name}
                    className="w-16 h-20 mx-auto rounded-lg object-cover mb-1"
                  />
                  <p className="text-xs font-medium">{avatar.name}</p>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Hair Color</label>
              <div className="flex gap-2 flex-wrap">
                {HAIR_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      customHairColor === color ? 'border-primary' : 'border-muted'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setCustomHairColor(color)}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Shirt Color</label>
              <div className="flex gap-2 flex-wrap">
                {SHIRT_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      customShirtColor === color ? 'border-primary' : 'border-muted'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setCustomShirtColor(color)}
                  />
                ))}
              </div>
            </div>
            
            <Button 
              onClick={generateCustomAvatar} 
              disabled={isGenerating}
              className="w-full"
            >
              <Palette className="w-4 h-4 mr-2" />
              {isGenerating ? 'Creating...' : 'Create Avatar'}
            </Button>
            
            {generatedAvatar && (
              <Card className="p-4 text-center">
                <img
                  src={generatedAvatar}
                  alt="Custom avatar"
                  className="w-24 h-24 mx-auto rounded-lg mb-2"
                />
                <Badge variant="secondary">Your Custom Avatar</Badge>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};