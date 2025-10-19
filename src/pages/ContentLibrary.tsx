import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Filter, Grid, List, Play, Clock, Eye, Star } from 'lucide-react';

export default function ContentLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data
  const reels = [
    {
      id: 1,
      title: "CNC Mill Setup - Tool Change",
      duration: "0:28",
      thumbnail: "/api/placeholder/300/200",
      tags: ["CNC", "Setup", "Tool Change"],
      views: 1247,
      author: "John Smith",
      published: "2 days ago",
      status: "published"
    },
    {
      id: 2,
      title: "Lathe Safety Check Procedure",
      duration: "0:22",
      thumbnail: "/api/placeholder/300/200",
      tags: ["Safety", "Lathe", "Inspection"],
      views: 892,
      author: "Sarah Johnson",
      published: "1 week ago",
      status: "published"
    },
    {
      id: 3,
      title: "Grinder Maintenance - Belt Replacement",
      duration: "0:31",
      thumbnail: "/api/placeholder/300/200",
      tags: ["Maintenance", "Grinder", "Belt"],
      views: 654,
      author: "Mike Chen",
      published: "2 weeks ago",
      status: "published"
    }
  ];

  return (
    <div className="min-h-screen bg-main-bg">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-text">Content Library</h1>
              <p className="text-secondary-text mt-1">Discover and manage training reels and courses</p>
            </div>
            <Button className="btn-primary">
              Upload New Reel
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-text" />
              <Input
                placeholder="Search reels, courses, or transcripts..."
                value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button 
                variant="outline"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {reels.map((reel) => (
            <Card key={reel.id} className="card card-hover animate-fade-in-up">
              {viewMode === 'grid' ? (
                <>
                  <div className="relative">
                    <img
                      src={reel.thumbnail}
                      alt={reel.title}
                      className="w-full h-40 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                      {reel.duration}
                    </div>
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors rounded-t-lg flex items-center justify-center">
                      <Button size="icon" className="opacity-0 hover:opacity-100 transition-opacity">
                        <Play className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-primary-text mb-2 line-clamp-2">
                      {reel.title}
                    </h3>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {reel.tags.map((tag) => (
                        <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-secondary-text">
                      <span>{reel.views} views</span>
                      <span>{reel.published}</span>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <img
                      src={reel.thumbnail}
                      alt={reel.title}
                      className="w-24 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary-text mb-2">
                        {reel.title}
                      </h3>
                      <p className="text-secondary-text text-sm mb-2">
                        {reel.author} • {reel.published}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {reel.tags.map((tag) => (
                          <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-secondary-text">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {reel.duration}
                        </span>
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {reel.views} views
                        </span>
                        <span className="flex items-center">
                          <Star className="h-4 w-4 mr-1" />
                          Bookmark
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      Play
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}