
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Calendar, Filter, TrendingUp } from 'lucide-react';

interface VideoWatch {
  id: string;
  child_id: string;
  child_name: string;
  platform: 'tiktok' | 'youtube' | 'instagram' | 'snapchat';
  video_url: string;
  thumbnail_url: string;
  title?: string;
  watched_at: string;
  duration_seconds: number;
  ai_analysis: {
    content_type: string;
    safety_rating: 'safe' | 'gaming' | 'violent' | 'adult_themes' | 'educational';
    themes: string[];
    summary: string;
    confidence_score: number;
  };
}

interface SocialMediaVideoAnalysisProps {
  videoWatches: VideoWatch[];
}

const SocialMediaVideoAnalysis = ({ videoWatches }: SocialMediaVideoAnalysisProps) => {
  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('today');
  const [selectedVideo, setSelectedVideo] = useState<VideoWatch | null>(null);

  const getSafetyColor = (rating: string) => {
    switch (rating) {
      case 'safe': return 'bg-green-500';
      case 'educational': return 'bg-blue-500';
      case 'gaming': return 'bg-yellow-500';
      case 'adult_themes': return 'bg-orange-500';
      case 'violent': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSafetyLabel = (rating: string) => {
    switch (rating) {
      case 'safe': return '🟢 Safe';
      case 'educational': return '🔵 Educational';
      case 'gaming': return '🟡 Gaming';
      case 'adult_themes': return '🟠 Adult Themes';
      case 'violent': return '🔴 Violent';
      default: return '⚪ Unknown';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'tiktok': return '🎵';
      case 'youtube': return '📺';
      case 'instagram': return '📷';
      case 'snapchat': return '👻';
      default: return '🎥';
    }
  };

  // Filter videos based on selected filters
  const filteredVideos = videoWatches.filter(video => {
    if (selectedChild !== 'all' && video.child_id !== selectedChild) return false;
    if (selectedPlatform !== 'all' && video.platform !== selectedPlatform) return false;
    
    const watchedDate = new Date(video.watched_at);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - watchedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (timeFilter) {
      case 'today': return daysDiff === 0;
      case 'week': return daysDiff <= 7;
      case 'month': return daysDiff <= 30;
      default: return true;
    }
  });

  // Get unique children for filter
  const uniqueChildren = Array.from(new Set(videoWatches.map(v => ({ id: v.child_id, name: v.child_name })))).reduce((acc, curr) => {
    if (!acc.find(child => child.id === curr.id)) {
      acc.push(curr);
    }
    return acc;
  }, [] as { id: string; name: string }[]);

  // Analytics
  const safetyStats = filteredVideos.reduce((acc, video) => {
    acc[video.ai_analysis.safety_rating] = (acc[video.ai_analysis.safety_rating] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger>
                <SelectValue placeholder="Select child" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Children</SelectItem>
                {uniqueChildren.map(child => (
                  <SelectItem key={child.id} value={child.id}>{child.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="snapchat">Snapchat</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {filteredVideos.length} videos analyzed
            </div>
          </div>

          {/* Safety Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Object.entries(safetyStats).map(([rating, count]) => (
              <div key={rating} className="text-center p-2 bg-muted/50 rounded-lg">
                <div className="text-sm font-medium">{getSafetyLabel(rating)}</div>
                <div className="text-lg font-bold">{count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Video Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredVideos.map(video => (
          <Dialog key={video.id}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <div className="relative">
                  <img 
                    src={video.thumbnail_url} 
                    alt={video.title || 'Video thumbnail'}
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="text-lg">{getPlatformIcon(video.platform)}</span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      {formatDuration(video.duration_seconds)}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className={`h-1 rounded-full ${getSafetyColor(video.ai_analysis.safety_rating)}`}></div>
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="text-xs font-medium truncate mb-1">
                    {video.child_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTime(video.watched_at)}
                  </div>
                  <Badge variant="outline" className="text-xs mt-1">
                    {getSafetyLabel(video.ai_analysis.safety_rating)}
                  </Badge>
                </CardContent>
              </Card>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span>{getPlatformIcon(video.platform)}</span>
                  Video Analysis - {video.child_name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <img 
                    src={video.thumbnail_url} 
                    alt="Video thumbnail"
                    className="w-32 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="text-sm font-medium">{video.title || 'No title available'}</div>
                    <div className="text-xs text-muted-foreground">
                      Platform: {video.platform.charAt(0).toUpperCase() + video.platform.slice(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Watched: {formatTime(video.watched_at)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Duration: {formatDuration(video.duration_seconds)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium mb-1">Safety Rating</div>
                    <Badge className={getSafetyColor(video.ai_analysis.safety_rating)}>
                      {getSafetyLabel(video.ai_analysis.safety_rating)}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      Confidence: {Math.round(video.ai_analysis.confidence_score * 100)}%
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">Content Summary</div>
                    <p className="text-sm text-muted-foreground">{video.ai_analysis.summary}</p>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">Themes</div>
                    <div className="flex flex-wrap gap-1">
                      {video.ai_analysis.themes.map((theme, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">Content Type</div>
                    <Badge variant="secondary">{video.ai_analysis.content_type}</Badge>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">No Videos Found</h3>
            <p className="text-muted-foreground">
              No social media videos match your current filters. Try adjusting the time period or child selection.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SocialMediaVideoAnalysis;
