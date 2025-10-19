import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Play, 
  Users, 
  Zap, 
  ArrowRight, 
  Star, 
  Quote, 
  CheckCircle,
  Video,
  Search,
  BookOpen,
  Award,
  ChevronRight,
  Menu,
  X,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Shield,
  Clock,
  TrendingUp
} from 'lucide-react';

export default function LandingPage() {
  const [demoForm, setDemoForm] = useState({
    name: '',
    company: '',
    email: '',
    machines: ''
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle demo request submission
    console.log('Demo request:', demoForm);
    // Show success message with better UX
    alert('Thank you for your interest! We\'ll contact you within 24 hours.');
    // Reset form
    setDemoForm({
      name: '',
      company: '',
      email: '',
      machines: ''
    });
  };

  const features = [
    {
      icon: <Video className="h-8 w-8 text-accent-blue" />,
      title: "Ultra-Short Training Reels",
      description: "Capture 20-30 second instructional videos for machine operations, maintenance, and troubleshooting with crystal clear quality.",
      benefits: ["Quick capture", "Mobile-friendly", "HD quality"],
      gradient: "from-blue-500 to-blue-600",
      stats: "20-30s videos"
    },
    {
      icon: <Search className="h-8 w-8 text-accent-blue" />,
      title: "AI-Powered Search Library",
      description: "Find exactly what you need with intelligent search across video transcripts, metadata, and machine specifications.",
      benefits: ["Voice search", "Smart filters", "Instant results"],
      gradient: "from-purple-500 to-purple-600",
      stats: "99% accuracy"
    },
    {
      icon: <BookOpen className="h-8 w-8 text-accent-blue" />,
      title: "Course Builder",
      description: "Create structured training modules by combining multiple reels with quizzes, assessments, and progress tracking.",
      benefits: ["Drag & drop", "Custom paths", "Progress tracking"],
      gradient: "from-green-500 to-green-600",
      stats: "Unlimited courses"
    },
    {
      icon: <Award className="h-8 w-8 text-accent-blue" />,
      title: "Quizzes & Certificates",
      description: "Validate learning with interactive quizzes and generate professional certificates upon course completion.",
      benefits: ["Auto-grading", "Digital certificates", "Compliance ready"],
      gradient: "from-orange-500 to-orange-600",
      stats: "Auto-generated"
    }
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Capture",
      description: "Record 20-30 second videos of machine operations, maintenance procedures, and troubleshooting steps using any device.",
      icon: <Video className="h-12 w-12 text-white" />,
      color: "from-blue-500 to-blue-600",
      details: ["Mobile recording", "HD quality", "Instant upload"]
    },
    {
      step: "02", 
      title: "Curate",
      description: "AI automatically transcribes, tags, and organizes your content for easy discovery and search across your organization.",
      icon: <Zap className="h-12 w-12 text-white" />,
      color: "from-purple-500 to-purple-600",
      details: ["Auto-transcription", "Smart tagging", "Search indexing"]
    },
    {
      step: "03",
      title: "Train",
      description: "Build courses, assign training, and let your team access knowledge instantly when they need it most.",
      icon: <Users className="h-12 w-12 text-white" />,
      color: "from-green-500 to-green-600",
      details: ["Course builder", "Progress tracking", "Certificates"]
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Training Manager",
      company: "Manufacturing Corp",
      content: "Winbro Training Reels has revolutionized how we capture and share knowledge. Our operators can now access critical procedures in seconds, reducing training time by 70%.",
      rating: 5,
      avatar: "SJ",
      stats: "70% time saved"
    },
    {
      name: "Mike Chen",
      role: "Operations Director", 
      company: "Industrial Solutions",
      content: "The AI search capabilities are incredible. We can find specific machine procedures instantly, saving hours of training time and reducing errors significantly.",
      rating: 5,
      avatar: "MC",
      stats: "99% accuracy"
    },
    {
      name: "Lisa Rodriguez",
      role: "Safety Coordinator",
      company: "Precision Manufacturing",
      content: "The course builder has made it so easy to create comprehensive training programs. Our safety compliance rates have improved dramatically.",
      rating: 5,
      avatar: "LR",
      stats: "95% compliance"
    }
  ];

  const customerLogos = [
    "Manufacturing Corp", "Industrial Solutions", "Precision Manufacturing", 
    "Tech Industries", "Global Manufacturing", "Advanced Systems"
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$99",
      period: "per month",
      description: "Perfect for small teams getting started",
      features: [
        "Up to 100 videos",
        "5 team members",
        "Basic search",
        "Email support"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Professional",
      price: "$299",
      period: "per month", 
      description: "Ideal for growing organizations",
      features: [
        "Unlimited videos",
        "25 team members",
        "AI-powered search",
        "Course builder",
        "Certificates",
        "Priority support"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact sales",
      description: "For large organizations with specific needs",
      features: [
        "Everything in Professional",
        "Unlimited team members",
        "SSO integration",
        "Custom branding",
        "Dedicated support",
        "SLA guarantee"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-main-bg">
      {/* Skip to main content link for screen readers */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-accent-blue text-white px-4 py-2 rounded-md z-50">
        Skip to main content
      </a>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-blue-600 rounded-lg flex items-center justify-center">
                  <Video className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-primary-text">Winbro Training Reels</h1>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
              <a href="#features" className="text-secondary-text hover:text-accent-blue transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 rounded-md px-2 py-1">Features</a>
              <a href="#how-it-works" className="text-secondary-text hover:text-accent-blue transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 rounded-md px-2 py-1">How It Works</a>
              <a href="#pricing" className="text-secondary-text hover:text-accent-blue transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 rounded-md px-2 py-1">Pricing</a>
              <a href="#testimonials" className="text-secondary-text hover:text-accent-blue transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 rounded-md px-2 py-1">Testimonials</a>
              <Button variant="ghost" className="btn-ghost">Help</Button>
              <Button variant="outline" className="btn-secondary">Login</Button>
              <Button className="btn-primary">Request Demo</Button>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t shadow-lg" role="navigation" aria-label="Mobile navigation">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="#features" className="block px-3 py-2 text-secondary-text hover:text-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 rounded-md" onClick={() => setIsMenuOpen(false)}>Features</a>
                <a href="#how-it-works" className="block px-3 py-2 text-secondary-text hover:text-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 rounded-md" onClick={() => setIsMenuOpen(false)}>How It Works</a>
                <a href="#pricing" className="block px-3 py-2 text-secondary-text hover:text-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 rounded-md" onClick={() => setIsMenuOpen(false)}>Pricing</a>
                <a href="#testimonials" className="block px-3 py-2 text-secondary-text hover:text-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 rounded-md" onClick={() => setIsMenuOpen(false)}>Testimonials</a>
                <div className="pt-4 space-y-2">
                  <Button variant="outline" className="w-full btn-secondary">Login</Button>
                  <Button className="w-full btn-primary">Request Demo</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="main-content" className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden" aria-labelledby="hero-heading">
        {/* Enhanced Animated Background with Modern Design */}
        <div className="absolute inset-0 hero-gradient">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-indigo-50/30"></div>
          {/* Floating geometric shapes with enhanced animations */}
          <motion.div 
            className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-accent-blue/15 to-blue-600/10 rounded-full blur-3xl"
            animate={{ 
              y: [0, -20, 0],
              x: [0, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-500/15 to-pink-500/10 rounded-full blur-3xl"
            animate={{ 
              y: [0, 20, 0],
              x: [0, -15, 0],
              scale: [1, 0.9, 1]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-green-400/10 to-blue-500/10 rounded-full blur-2xl"
            animate={{ 
              y: [0, -15, 0],
              x: [0, 20, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4
            }}
          />
          {/* Additional floating elements for more visual interest */}
          <motion.div 
            className="absolute top-32 right-1/4 w-4 h-4 bg-accent-blue/20 rounded-full"
            animate={{ 
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-32 left-1/3 w-6 h-6 bg-purple-500/20 rounded-full"
            animate={{ 
              y: [0, 25, 0],
              opacity: [0.4, 0.9, 0.4]
            }}
            transition={{ 
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            {/* Enhanced trust badge with better animation */}
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-accent-blue/10 to-blue-600/10 text-accent-blue text-sm font-semibold mb-8 animate-fade-in-up border border-accent-blue/20 backdrop-blur-sm">
              <Shield className="h-4 w-4 mr-2" />
              Trusted by 500+ Manufacturing Companies
              <TrendingUp className="h-4 w-4 ml-2" />
            </div>
            
            {/* Enhanced headline with better typography hierarchy */}
            <h1 id="hero-heading" className="text-5xl lg:text-7xl xl:text-8xl font-bold mb-8 animate-fade-in-up leading-tight" style={{ animationDelay: '0.1s' }}>
              Transform Machine Training with
              <span className="hero-text-gradient block mt-2 bg-gradient-to-r from-accent-blue via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Ultra-Short Video Reels
              </span>
            </h1>
            
            {/* Enhanced subheadline with better readability */}
            <p className="text-xl lg:text-2xl xl:text-3xl text-secondary-text mb-12 max-w-5xl mx-auto leading-relaxed animate-fade-in-up font-light" style={{ animationDelay: '0.2s' }}>
              Capture, organize, and deliver 20-30 second instructional videos that document machine operations, 
              maintenance, and troubleshooting techniques for your entire team.
            </p>
            
            {/* Enhanced CTA buttons with better micro-interactions */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Button 
                size="lg" 
                className="btn-primary text-xl px-12 py-6 group relative overflow-hidden" 
                aria-label="Request a demo of Winbro Training Reels"
              >
                <span className="relative z-10 flex items-center">
                  Request Demo
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-blue to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="btn-secondary text-xl px-12 py-6 group hover:shadow-xl hover:shadow-accent-blue/25" 
                aria-label="Watch the product demo video"
              >
                <Play className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                Watch Demo Video
              </Button>
            </div>

            {/* Enhanced Hero Video with better visual design */}
            <div className="relative max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-700/50">
                <div className="aspect-video bg-gradient-to-br from-accent-blue/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center relative">
                  {/* Video thumbnail overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  <button 
                    className="text-center group focus:outline-none focus:ring-4 focus:ring-white/50 rounded-full relative z-10"
                    aria-label="Play 2-minute product demo video"
                  >
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 border border-white/30">
                      <Play className="h-10 w-10 text-white ml-1" />
                    </div>
                    <p className="text-white/90 text-xl font-medium">Watch 2-minute product demo</p>
                    <p className="text-white/70 text-sm mt-2">See how it works in action</p>
                  </button>
                  
                  {/* Floating elements for visual interest */}
                  <div className="absolute top-4 right-4 w-3 h-3 bg-accent-blue rounded-full animate-pulse"></div>
                  <div className="absolute bottom-4 left-4 w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>
              </div>
              
              {/* Video stats overlay */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-xl border border-gray-200 px-6 py-4 flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-text">20-30s</div>
                  <div className="text-sm text-secondary-text">Video Length</div>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-text">500+</div>
                  <div className="text-sm text-secondary-text">Companies</div>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-text">70%</div>
                  <div className="text-sm text-secondary-text">Time Saved</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-accent-blue/10 to-blue-600/10 text-accent-blue text-sm font-semibold mb-6 border border-accent-blue/20">
              <CheckCircle className="h-4 w-4 mr-2" />
              Everything You Need
            </div>
            <h2 id="features-heading" className="text-4xl lg:text-5xl xl:text-6xl font-bold text-primary-text mb-6">
              Powerful Features for Modern Training
            </h2>
            <p className="text-xl lg:text-2xl text-secondary-text max-w-4xl mx-auto leading-relaxed">
              Comprehensive tools designed specifically for industrial training and knowledge management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="feature-card group hover:shadow-2xl hover:shadow-accent-blue/10 transition-all duration-500 hover:-translate-y-2 animate-fade-in-up relative overflow-hidden" 
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                {/* Feature icon with enhanced design */}
                <div className="relative z-10">
                  <div className="feature-icon group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    {feature.icon}
                  </div>
                  
                  {/* Stats badge */}
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-accent-blue to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {feature.stats}
                  </div>
                  
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl text-center group-hover:text-accent-blue transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <CardDescription className="text-base text-center mb-6 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                    
                    <ul className="space-y-3">
                      {feature.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center text-sm text-secondary-text group-hover:text-primary-text transition-colors duration-300">
                          <CheckCircle className="h-4 w-4 text-status-green mr-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-main-bg relative overflow-hidden" aria-labelledby="how-it-works-heading">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-indigo-50/30"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-accent-blue/10 to-blue-600/10 text-accent-blue text-sm font-semibold mb-6 border border-accent-blue/20">
              <Zap className="h-4 w-4 mr-2" />
              Simple Process
            </div>
            <h2 id="how-it-works-heading" className="text-4xl lg:text-5xl xl:text-6xl font-bold text-primary-text mb-6">
              How It Works
            </h2>
            <p className="text-xl lg:text-2xl text-secondary-text max-w-4xl mx-auto leading-relaxed">
              Get started in three simple steps and transform your training process
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
            {/* Connection lines for desktop */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent-blue/30 to-transparent"></div>
            
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center group animate-fade-in-up relative" style={{ animationDelay: `${index * 200}ms` }}>
                {/* Step number badge */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-accent-blue shadow-lg border-2 border-accent-blue">
                    {step.step}
                  </div>
                </div>
                
                {/* Main step card */}
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 group-hover:shadow-2xl group-hover:shadow-accent-blue/10 transition-all duration-500 group-hover:-translate-y-2 relative overflow-hidden">
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  
                  <div className="relative z-10">
                    {/* Icon with enhanced design */}
                    <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                      {step.icon}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-primary-text mb-4 group-hover:text-accent-blue transition-colors duration-300">
                      {step.title}
                    </h3>
                    
                    <p className="text-secondary-text text-lg leading-relaxed mb-6">
                      {step.description}
                    </p>
                    
                    {/* Feature details */}
                    <ul className="space-y-2">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-center justify-center text-sm text-secondary-text group-hover:text-primary-text transition-colors duration-300">
                          <CheckCircle className="h-4 w-4 text-status-green mr-2 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Arrow connector for mobile */}
                {index < howItWorks.length - 1 && (
                  <div className="lg:hidden flex justify-center mt-8 mb-4">
                    <ArrowRight className="h-6 w-6 text-accent-blue rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Logos Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-secondary-text text-lg">Trusted by industry leaders</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {customerLogos.map((logo, index) => (
              <div key={index} className="text-center group">
                <div className="h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-300">
                  <span className="text-gray-600 font-semibold text-sm">{logo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-main-bg relative overflow-hidden" aria-labelledby="testimonials-heading">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-purple-50/10 to-indigo-50/20"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-accent-blue/10 to-blue-600/10 text-accent-blue text-sm font-semibold mb-6 border border-accent-blue/20">
              <Star className="h-4 w-4 mr-2" />
              Customer Stories
            </div>
            <h2 id="testimonials-heading" className="text-4xl lg:text-5xl xl:text-6xl font-bold text-primary-text mb-6">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl lg:text-2xl text-secondary-text max-w-3xl mx-auto leading-relaxed">
              See what our customers are saying about their transformation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className="testimonial-card group hover:shadow-2xl hover:shadow-accent-blue/10 transition-all duration-500 hover:-translate-y-2 animate-fade-in-up relative overflow-hidden" 
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <CardContent className="p-8 relative z-10">
                  {/* Rating stars */}
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current group-hover:scale-110 transition-transform duration-300" style={{ animationDelay: `${i * 50}ms` }} />
                    ))}
                  </div>
                  
                  {/* Quote icon */}
                  <Quote className="h-8 w-8 text-accent-blue mb-6 group-hover:scale-110 transition-transform duration-300" />
                  
                  {/* Testimonial content */}
                  <p className="text-lg text-secondary-text mb-8 italic leading-relaxed group-hover:text-primary-text transition-colors duration-300">
                    "{testimonial.content}"
                  </p>
                  
                  {/* Stats badge */}
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-accent-blue to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {testimonial.stats}
                  </div>
                  
                  {/* Author info */}
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-accent-blue to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4 group-hover:scale-110 transition-transform duration-300">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-primary-text text-lg">{testimonial.name}</p>
                      <p className="text-secondary-text">{testimonial.role}</p>
                      <p className="text-accent-blue font-medium">{testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden" aria-labelledby="pricing-heading">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-blue-50/30 to-purple-50/30"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-accent-blue/10 to-blue-600/10 text-accent-blue text-sm font-semibold mb-6 border border-accent-blue/20">
              <Award className="h-4 w-4 mr-2" />
              Simple Pricing
            </div>
            <h2 id="pricing-heading" className="text-4xl lg:text-5xl xl:text-6xl font-bold text-primary-text mb-6">
              Choose Your Plan
            </h2>
            <p className="text-xl lg:text-2xl text-secondary-text max-w-4xl mx-auto leading-relaxed">
              Start with a free trial and scale as you grow
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`pricing-card group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up relative overflow-hidden ${
                  plan.popular ? 'featured border-2 border-accent-blue shadow-xl scale-105' : ''
                }`} 
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-accent-blue to-blue-600 text-white py-3 text-center font-semibold text-sm">
                    Most Popular
                  </div>
                )}
                
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  plan.popular ? 'from-accent-blue/5 to-blue-600/5' : 'from-gray-50/50 to-blue-50/30'
                } opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <CardHeader className={`text-center pb-8 ${plan.popular ? 'pt-12' : 'pt-8'}`}>
                  <CardTitle className="text-2xl group-hover:text-accent-blue transition-colors duration-300">
                    {plan.name}
                  </CardTitle>
                  <div className="mt-6">
                    <span className="text-5xl lg:text-6xl font-bold text-primary-text">
                      {plan.price}
                    </span>
                    <span className="text-secondary-text ml-2 text-lg">{plan.period}</span>
                  </div>
                  <CardDescription className="text-lg mt-4 leading-relaxed">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0 relative z-10">
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center group-hover:text-primary-text transition-colors duration-300">
                        <CheckCircle className="h-5 w-5 text-status-green mr-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-secondary-text">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full group-hover:scale-105 transition-all duration-300 ${
                      plan.popular 
                        ? 'btn-primary shadow-lg shadow-accent-blue/25' 
                        : 'btn-secondary hover:shadow-lg hover:shadow-accent-blue/25'
                    }`}
                    size="lg"
                  >
                    {plan.cta}
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Request Demo Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-accent-blue via-blue-600 to-purple-600 relative overflow-hidden">
        {/* Enhanced background with more visual elements */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to Transform Your Training?
          </h2>
          <p className="text-xl lg:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Request a demo and see how Winbro Training Reels can revolutionize your organization's knowledge sharing.
          </p>
          
          <Card className="max-w-3xl mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border border-white/20">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl text-primary-text mb-2">Request a Demo</CardTitle>
              <CardDescription className="text-lg text-secondary-text">
                Fill out the form below and our team will contact you within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDemoSubmit} className="space-y-6" role="form" aria-label="Request a demo form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="demo-name" className="form-label text-left">Full Name</label>
                    <Input
                      id="demo-name"
                      className="form-input text-lg py-4"
                      placeholder="Enter your full name"
                      value={demoForm.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDemoForm({...demoForm, name: e.target.value})}
                      required
                      aria-describedby="demo-name-help"
                    />
                    <div id="demo-name-help" className="sr-only">Enter your full name for the demo request</div>
                  </div>
                  <div>
                    <label htmlFor="demo-company" className="form-label text-left">Company</label>
                    <Input
                      id="demo-company"
                      className="form-input text-lg py-4"
                      placeholder="Enter your company name"
                      value={demoForm.company}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDemoForm({...demoForm, company: e.target.value})}
                      required
                      aria-describedby="demo-company-help"
                    />
                    <div id="demo-company-help" className="sr-only">Enter your company name for the demo request</div>
                  </div>
                </div>
                <div>
                  <label htmlFor="demo-email" className="form-label text-left">Email Address</label>
                  <Input
                    id="demo-email"
                    type="email"
                    className="form-input text-lg py-4"
                    placeholder="Enter your email address"
                    value={demoForm.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDemoForm({...demoForm, email: e.target.value})}
                    required
                    aria-describedby="demo-email-help"
                  />
                  <div id="demo-email-help" className="sr-only">Enter your email address for the demo request</div>
                </div>
                <div>
                  <label htmlFor="demo-machines" className="form-label text-left">Machines Owned (Optional)</label>
                  <Input
                    id="demo-machines"
                    className="form-input text-lg py-4"
                    placeholder="e.g., CNC Mills, Lathes, Presses"
                    value={demoForm.machines}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDemoForm({...demoForm, machines: e.target.value})}
                    aria-describedby="demo-machines-help"
                  />
                  <div id="demo-machines-help" className="sr-only">Optional: List the types of machines your company owns</div>
                </div>
                
                {/* Trust indicators */}
                <div className="flex items-center justify-center space-x-8 text-sm text-secondary-text py-4">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-status-green" />
                    Secure & Private
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-status-green" />
                    24h Response
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-status-green" />
                    No Spam
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full btn-primary text-xl py-6 group relative overflow-hidden" 
                  aria-label="Submit demo request form"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Request Demo
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-blue to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-blue-50/30 to-purple-50/30"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-primary-text">Winbro Training Reels</h3>
              </div>
              <p className="text-secondary-text mb-8 leading-relaxed text-lg">
                Transform how your organization captures, organizes, and shares machine operation knowledge with ultra-short video reels.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                <a href="#" className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-accent-blue hover:text-white transition-all duration-300 hover:scale-110 group" aria-label="Follow us on Facebook">
                  <Facebook className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                </a>
                <a href="#" className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-accent-blue hover:text-white transition-all duration-300 hover:scale-110 group" aria-label="Follow us on Twitter">
                  <Twitter className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                </a>
                <a href="#" className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-accent-blue hover:text-white transition-all duration-300 hover:scale-110 group" aria-label="Follow us on LinkedIn">
                  <Linkedin className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                </a>
                <a href="#" className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-accent-blue hover:text-white transition-all duration-300 hover:scale-110 group" aria-label="Subscribe to our YouTube">
                  <Youtube className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                </a>
              </div>
            </div>
            
            {/* Product Links */}
            <div>
              <h3 className="text-xl font-semibold text-primary-text mb-6">Product</h3>
              <ul className="space-y-4 text-secondary-text">
                <li><a href="#features" className="hover:text-accent-blue transition-colors duration-300 text-lg hover:translate-x-1 inline-block">Features</a></li>
                <li><a href="#pricing" className="hover:text-accent-blue transition-colors duration-300 text-lg hover:translate-x-1 inline-block">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-accent-blue transition-colors duration-300 text-lg hover:translate-x-1 inline-block">How It Works</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors duration-300 text-lg hover:translate-x-1 inline-block">API</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors duration-300 text-lg hover:translate-x-1 inline-block">Integrations</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors duration-300 text-lg hover:translate-x-1 inline-block">Security</a></li>
              </ul>
            </div>
            
            {/* Company Links */}
            <div>
              <h3 className="text-xl font-semibold text-primary-text mb-6">Company</h3>
              <ul className="space-y-4 text-secondary-text">
                <li><a href="#" className="hover:text-accent-blue transition-colors duration-300 text-lg hover:translate-x-1 inline-block">About Us</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors duration-300 text-lg hover:translate-x-1 inline-block">Contact</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors duration-300 text-lg hover:translate-x-1 inline-block">Careers</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors duration-300 text-lg hover:translate-x-1 inline-block">Blog</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors duration-300 text-lg hover:translate-x-1 inline-block">Press</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors duration-300 text-lg hover:translate-x-1 inline-block">Partners</a></li>
              </ul>
            </div>
            
            {/* Support Links */}
            <div>
              <h3 className="text-xl font-semibold text-primary-text mb-6">Support</h3>
              <ul className="space-y-4 text-secondary-text">
                <li><a href="/help" className="hover:text-accent-blue transition-colors duration-300 text-lg hover:translate-x-1 inline-block">Help Center</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors duration-300 text-lg hover:translate-x-1 inline-block">Documentation</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors duration-300 text-lg hover:translate-x-1 inline-block">System Status</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors duration-300 text-lg hover:translate-x-1 inline-block">Community</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors duration-300 text-lg hover:translate-x-1 inline-block">Training</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors duration-300 text-lg hover:translate-x-1 inline-block">Contact Support</a></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="border-t border-gray-200 mt-16 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center">
              <div className="flex flex-wrap gap-8 text-secondary-text mb-6 lg:mb-0">
                <a href="#" className="hover:text-accent-blue transition-colors duration-300 text-lg hover:underline">Privacy Policy</a>
                <a href="#" className="hover:text-accent-blue transition-colors duration-300 text-lg hover:underline">Terms of Service</a>
                <a href="#" className="hover:text-accent-blue transition-colors duration-300 text-lg hover:underline">Cookie Policy</a>
                <a href="#" className="hover:text-accent-blue transition-colors duration-300 text-lg hover:underline">Security</a>
                <a href="#" className="hover:text-accent-blue transition-colors duration-300 text-lg hover:underline">GDPR</a>
              </div>
              <p className="text-secondary-text text-lg">
                &copy; 2024 Winbro Training Reels. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}