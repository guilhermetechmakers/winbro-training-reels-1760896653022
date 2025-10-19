import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, Volume2, Settings, Bookmark, Share, Download, Clock, User, Calendar } from 'lucide-react';

export default function VideoPlayer() {
  const { id } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);

  // Mock data
  const reel = {
    id: id,
    title: "CNC Mill Setup - Tool Change",
    duration: "0:28",
    description: "Step-by-step guide for safely changing tools on the CNC mill, including proper setup and safety checks.",
    author: "John Smith",
    published: "2 days ago",
    views: 1247,
    tags: ["CNC", "Setup", "Tool Change"],
    transcript: [
      { time: "0:00", text: "Welcome to this CNC mill tool change procedure." },
      { time: "0:05", text: "First, ensure the machine is in a safe position." },
      { time: "0:10", text: "Press the emergency stop button to secure the machine." },
      { time: "0:15", text: "Remove the current tool using the tool release mechanism." },
      { time: "0:20", text: "Insert the new tool and secure it properly." },
      { time: "0:25", text: "Test the tool before resuming operations." }
    ]
  };

  return (
    <div className="min-h-screen bg-main-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card className="card">
              <div className="relative bg-black rounded-t-lg">
                <div className="aspect-video bg-gray-900 flex items-center justify-center">
                  <Button 
                    size="icon" 
                    className="w-16 h-16 bg-white/20 hover:bg-white/30"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                  </Button>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/70 text-white px-4 py-2 rounded flex items-center justify-between">
                    <span>0:15 / {reel.duration}</span>
                    <div className="flex items-center space-x-2">
                      <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                        <Volume2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h1 className="text-2xl font-bold text-primary-text mb-2">
                  {reel.title}
                </h1>
                <div className="flex items-center space-x-4 text-secondary-text mb-4">
                  <span className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {reel.author}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {reel.published}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {reel.duration}
                  </span>
                </div>
                
                <p className="text-secondary-text mb-6">
                  {reel.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {reel.tags.map((tag) => (
                    <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Bookmark
                  </Button>
                  <Button variant="outline">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Transcript */}
            <Card className="card">
              <CardHeader>
                <CardTitle className="text-lg">Transcript</CardTitle>
                <CardDescription>
                  Click on any line to jump to that time in the video
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {reel.transcript.map((item, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-sm font-mono text-accent-blue flex-shrink-0">
                          {item.time}
                        </span>
                        <span className="text-sm text-primary-text">
                          {item.text}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Related Reels */}
            <Card className="card">
              <CardHeader>
                <CardTitle className="text-lg">Related Reels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <img
                      src="/api/placeholder/80/60"
                      alt="Related reel"
                      className="w-20 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-primary-text text-sm line-clamp-2">
                        CNC Mill Safety Procedures
                      </h4>
                      <p className="text-xs text-secondary-text">2:15 • 456 views</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <img
                      src="/api/placeholder/80/60"
                      alt="Related reel"
                      className="w-20 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-primary-text text-sm line-clamp-2">
                        Tool Maintenance Best Practices
                      </h4>
                      <p className="text-xs text-secondary-text">1:45 • 234 views</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}