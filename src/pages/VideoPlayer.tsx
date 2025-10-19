import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings,
  Captions,
  BookOpen,
  Clock,
  User,
  Calendar,
  Bookmark,
  Share,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function VideoPlayer() {
  const { id } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playerState, setPlayerState] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackRate: 1,
    isMuted: false,
    isFullscreen: false,
    quality: 'auto',
    captionsEnabled: false,
    transcriptVisible: false
  });

  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Mock data
  const reel = {
    id: id,
    title: "CNC Mill Setup - Tool Change",
    duration: 28, // in seconds
    description: "Step-by-step guide for safely changing tools on the CNC mill, including proper setup and safety checks.",
    author: "John Smith",
    published: "2 days ago",
    views: 1247,
    tags: ["CNC", "Setup", "Tool Change"],
    video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnail_url: 'https://via.placeholder.com/1280x720/2563EB/FFFFFF?text=Video+Thumbnail',
    skill_level: 'intermediate',
    machine_model: 'CNC Mill 2000',
    process_type: 'Tool Change',
    tooling: 'Carbide Inserts',
    transcript: [
      { id: '1', start_time: 0, end_time: 5, text: "Welcome to this CNC mill tool change procedure." },
      { id: '2', start_time: 5, end_time: 10, text: "First, ensure the machine is in a safe position." },
      { id: '3', start_time: 10, end_time: 15, text: "Press the emergency stop button to secure the machine." },
      { id: '4', start_time: 15, end_time: 20, text: "Remove the current tool using the tool release mechanism." },
      { id: '5', start_time: 20, end_time: 25, text: "Insert the new tool and secure it properly." },
      { id: '6', start_time: 25, end_time: 28, text: "Test the tool before resuming operations." }
    ]
  };

  // Format time helper
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (playerState.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  // Handle seek
  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setPlayerState(prev => ({ ...prev, currentTime: time }));
    }
  };

  // Handle volume change
  const handleVolumeChange = (volume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      setPlayerState(prev => ({ ...prev, volume, isMuted: volume === 0 }));
    }
  };

  // Handle mute toggle
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !playerState.isMuted;
      setPlayerState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    }
  };

  // Handle playback rate change
  const handlePlaybackRateChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlayerState(prev => ({ ...prev, playbackRate: rate }));
    }
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen();
        setPlayerState(prev => ({ ...prev, isFullscreen: true }));
      } else {
        document.exitFullscreen();
        setPlayerState(prev => ({ ...prev, isFullscreen: false }));
      }
    }
  };

  // Handle transcript click
  const handleTranscriptClick = (timestamp: number) => {
    handleSeek(timestamp);
  };

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setPlayerState(prev => ({
        ...prev,
        duration: video.duration
      }));
    };

    const handleTimeUpdate = () => {
      setPlayerState(prev => ({
        ...prev,
        currentTime: video.currentTime
      }));
    };

    const handlePlay = () => {
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
    };

    const handlePause = () => {
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
    };

    const handleVolumeChange = () => {
      setPlayerState(prev => ({
        ...prev,
        volume: video.volume,
        isMuted: video.muted
      }));
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, []);

  // Auto-hide controls
  useEffect(() => {
    let timeout: number;
    
    const resetTimeout = () => {
      clearTimeout(timeout);
      setShowControls(true);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    if (playerState.isPlaying) {
      resetTimeout();
    }

    return () => clearTimeout(timeout);
  }, [playerState.isPlaying]);

  return (
    <div className="min-h-screen bg-main-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  {/* Video Element */}
                  <video
                    ref={videoRef}
                    className="w-full h-96 lg:h-[500px]"
                    poster={reel.thumbnail_url}
                    preload="metadata"
                    onClick={togglePlay}
                  >
                    <source src={reel.video_url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>

                  {/* Controls Overlay */}
                  <AnimatePresence>
                    {showControls && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                      >
                        {/* Top Controls */}
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-white/20 text-white">
                              {formatTime(playerState.duration)}
                            </Badge>
                            {reel.skill_level && (
                              <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                                {reel.skill_level}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPlayerState(prev => ({ ...prev, transcriptVisible: !prev.transcriptVisible }))}
                              className="text-white hover:bg-white/20"
                            >
                              <BookOpen className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowSettings(!showSettings)}
                              className="text-white hover:bg-white/20"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Bottom Controls */}
                        <div className="absolute bottom-4 left-4 right-4 space-y-2">
                          {/* Progress Bar */}
                          <div className="relative">
                            <Progress
                              value={(playerState.currentTime / playerState.duration) * 100}
                              className="h-1 bg-white/20"
                            />
                            <input
                              type="range"
                              min="0"
                              max={playerState.duration}
                              value={playerState.currentTime}
                              onChange={(e) => handleSeek(Number(e.target.value))}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>

                          {/* Control Buttons */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={togglePlay}
                                className="text-white hover:bg-white/20"
                              >
                                {playerState.isPlaying ? (
                                  <Pause className="h-5 w-5" />
                                ) : (
                                  <Play className="h-5 w-5" />
                                )}
                              </Button>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={toggleMute}
                                  className="text-white hover:bg-white/20"
                                >
                                  {playerState.isMuted ? (
                                    <VolumeX className="h-4 w-4" />
                                  ) : (
                                    <Volume2 className="h-4 w-4" />
                                  )}
                                </Button>
                                <Slider
                                  value={[playerState.volume * 100]}
                                  onValueChange={(values: number[]) => handleVolumeChange(values[0] / 100)}
                                  max={100}
                                  step={1}
                                  className="w-20"
                                />
                              </div>

                              <span className="text-white text-sm">
                                {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPlayerState(prev => ({ ...prev, captionsEnabled: !prev.captionsEnabled }))}
                                className="text-white hover:bg-white/20"
                              >
                                <Captions className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleFullscreen}
                                className="text-white hover:bg-white/20"
                              >
                                {playerState.isFullscreen ? (
                                  <Minimize className="h-4 w-4" />
                                ) : (
                                  <Maximize className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Settings Panel */}
                  <AnimatePresence>
                    {showSettings && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute top-16 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 min-w-[200px]"
                      >
                        <div className="space-y-4">
                          <div>
                            <label className="text-white text-sm font-medium">Playback Speed</label>
                            <div className="flex gap-2 mt-1">
                              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                                <Button
                                  key={rate}
                                  variant={playerState.playbackRate === rate ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handlePlaybackRateChange(rate)}
                                  className="text-white"
                                >
                                  {rate}x
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="text-white text-sm font-medium">Quality</label>
                            <div className="flex gap-2 mt-1">
                              {['auto', '720p', '1080p'].map((quality) => (
                                <Button
                                  key={quality}
                                  variant={playerState.quality === quality ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setPlayerState(prev => ({ ...prev, quality }))}
                                  className="text-white"
                                >
                                  {quality}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>

            {/* Video Information */}
            <Card className="mt-6">
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
                    {formatTime(reel.duration)}
                  </span>
                </div>
                
                <p className="text-secondary-text mb-6">
                  {reel.description}
                </p>

                {/* Video Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Machine Model:</span>
                    <p className="text-sm text-gray-600">{reel.machine_model}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Process Type:</span>
                    <p className="text-sm text-gray-600">{reel.process_type}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Tooling:</span>
                    <p className="text-sm text-gray-600">{reel.tooling}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Views:</span>
                    <p className="text-sm text-gray-600">{reel.views.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {reel.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
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
                  {reel.transcript.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        'p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors',
                        playerState.currentTime >= item.start_time && 
                        playerState.currentTime <= item.end_time && 
                        'bg-blue-100 border-l-4 border-blue-500'
                      )}
                      onClick={() => handleTranscriptClick(item.start_time)}
                    >
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(item.start_time)} - {formatTime(item.end_time)}
                      </div>
                      <p className="text-sm text-primary-text">{item.text}</p>
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