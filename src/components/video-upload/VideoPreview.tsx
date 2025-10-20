import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Scissors,
  Image as ImageIcon,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface VideoPreviewProps {
  videoFile: File;
  onPosterSelect: (time: number) => void;
  onTrim: (startTime: number, endTime: number) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export default function VideoPreview({
  videoFile,
  onPosterSelect,
  onTrim,
  onConfirm,
  onBack,
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedPosterTime, setSelectedPosterTime] = useState<number | null>(null);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);

  const videoUrl = URL.createObjectURL(videoFile);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setTrimEnd(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handleError = () => {
      setVideoError('Failed to load video. Please check the file format.');
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, []);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const selectPosterFrame = () => {
    setSelectedPosterTime(currentTime);
    onPosterSelect(currentTime);
  };

  const applyTrim = () => {
    onTrim(trimStart, trimEnd);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getVideoQuality = () => {
    const video = videoRef.current;
    if (!video) return null;

    return {
      width: video.videoWidth,
      height: video.videoHeight,
      duration: video.duration,
    };
  };

  const quality = getVideoQuality();

  if (videoError) {
    return (
      <Card className="card">
        <CardContent className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-primary-text mb-2">
            Video Preview Error
          </h3>
          <p className="text-secondary-text mb-6">{videoError}</p>
          <Button onClick={onBack} variant="outline">
            Back to Upload
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <Card className="card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-accent-blue" />
            Video Preview
          </CardTitle>
          <CardDescription>
            Review your video and select a poster frame
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Video Container */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-auto max-h-96"
                preload="metadata"
              />
              
              {/* Video Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={togglePlayPause}
                    size="sm"
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 text-white"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  
                  <div className="flex-1">
                    <Slider
                      value={[currentTime]}
                      onValueChange={([value]) => handleSeek(value)}
                      max={duration}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 text-white text-sm">
                    <span>{formatTime(currentTime)}</span>
                    <span>/</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  
                  <Button
                    onClick={toggleMute}
                    size="sm"
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 text-white"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  
                  <div className="w-20">
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      onValueChange={([value]) => handleVolumeChange(value)}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-icon-gray" />
                <span className="text-secondary-text">Duration: {formatTime(duration)}</span>
              </div>
              {quality && (
                <>
                  <div className="flex items-center gap-2">
                    <Maximize2 className="h-4 w-4 text-icon-gray" />
                    <span className="text-secondary-text">
                      {quality.width}×{quality.height}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-icon-gray" />
                    <span className="text-secondary-text">
                      {Math.round((videoFile.size / 1024 / 1024) * 100) / 100} MB
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-icon-gray" />
                    <span className="text-secondary-text">
                      {videoFile.type.split('/')[1].toUpperCase()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Poster Frame Selection */}
      <Card className="card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-accent-blue" />
            Poster Frame
          </CardTitle>
          <CardDescription>
            Select a frame to use as the video thumbnail
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-text">
                  Current time: {formatTime(currentTime)}
                </p>
                {selectedPosterTime !== null && (
                  <p className="text-sm text-green-600 font-medium">
                    Selected: {formatTime(selectedPosterTime)}
                  </p>
                )}
              </div>
              <Button
                onClick={selectPosterFrame}
                size="sm"
                className="btn-primary"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Use Current Frame
              </Button>
            </div>
            
            {selectedPosterTime !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800 font-medium">
                    Poster frame selected at {formatTime(selectedPosterTime)}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trim Controls */}
      <Card className="card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-accent-blue" />
            Trim Video
          </CardTitle>
          <CardDescription>
            Optionally trim your video to focus on the most important content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-secondary-text">
                <span>Start: {formatTime(trimStart)}</span>
                <span>End: {formatTime(trimEnd)}</span>
                <span>Duration: {formatTime(trimEnd - trimStart)}</span>
              </div>
              
              <div className="relative">
                <Slider
                  value={[trimStart, trimEnd]}
                  onValueChange={([start, end]) => {
                    setTrimStart(start);
                    setTrimEnd(end);
                  }}
                  max={duration}
                  step={0.1}
                  className="w-full"
                />
                <div className="absolute top-0 left-0 right-0 h-2 bg-gray-200 rounded-full pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-secondary-text">
                {trimStart > 0 || trimEnd < duration ? (
                  <span className="text-amber-600">
                    Video will be trimmed from {formatTime(trimStart)} to {formatTime(trimEnd)}
                  </span>
                ) : (
                  <span>No trimming applied</span>
                )}
              </div>
              <Button
                onClick={applyTrim}
                size="sm"
                variant="outline"
                disabled={trimStart === 0 && trimEnd === duration}
              >
                <Scissors className="h-4 w-4 mr-2" />
                Apply Trim
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          Back to Metadata
        </Button>
        <Button
          onClick={onConfirm}
          className="btn-primary"
          disabled={selectedPosterTime === null}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Confirm & Submit
        </Button>
      </div>
    </div>
  );
}