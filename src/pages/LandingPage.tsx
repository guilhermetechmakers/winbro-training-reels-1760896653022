import { useState, useEffect } from 'react';
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
  Youtube
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
    // Show success message
    alert('Thank you for your interest! We\'ll contact you within 24 hours.');
  };

  const features = [
    {
      icon: <Video className="h-8 w-8 text-accent-blue" />,
      title: "Ultra-Short Training Reels",
      description: "Capture 20-30 second instructional videos for machine operations, maintenance, and troubleshooting with crystal clear quality.",
      benefits: ["Quick capture", "Mobile-friendly", "HD quality"]
    },
    {
      icon: <Search className="h-8 w-8 text-accent-blue" />,
      title: "AI-Powered Search Library",
      description: "Find exactly what you need with intelligent search across video transcripts, metadata, and machine specifications.",
      benefits: ["Voice search", "Smart filters", "Instant results"]
    },
    {
      icon: <BookOpen className="h-8 w-8 text-accent-blue" />,
      title: "Course Builder",
      description: "Create structured training modules by combining multiple reels with quizzes, assessments, and progress tracking.",
      benefits: ["Drag & drop", "Custom paths", "Progress tracking"]
    },
    {
      icon: <Award className="h-8 w-8 text-accent-blue" />,
      title: "Quizzes & Certificates",
      description: "Validate learning with interactive quizzes and generate professional certificates upon course completion.",
      benefits: ["Auto-grading", "Digital certificates", "Compliance ready"]
    }
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Capture",
      description: "Record 20-30 second videos of machine operations, maintenance procedures, and troubleshooting steps using any device.",
      icon: <Video className="h-12 w-12 text-white" />,
      color: "from-blue-500 to-blue-600"
    },
    {
      step: "02", 
      title: "Curate",
      description: "AI automatically transcribes, tags, and organizes your content for easy discovery and search across your organization.",
      icon: <Zap className="h-12 w-12 text-white" />,
      color: "from-purple-500 to-purple-600"
    },
    {
      step: "03",
      title: "Train",
      description: "Build courses, assign training, and let your team access knowledge instantly when they need it most.",
      icon: <Users className="h-12 w-12 text-white" />,
      color: "from-green-500 to-green-600"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Training Manager",
      company: "Manufacturing Corp",
      content: "Winbro Training Reels has revolutionized how we capture and share knowledge. Our operators can now access critical procedures in seconds, reducing training time by 70%.",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Mike Chen",
      role: "Operations Director", 
      company: "Industrial Solutions",
      content: "The AI search capabilities are incredible. We can find specific machine procedures instantly, saving hours of training time and reducing errors significantly.",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Lisa Rodriguez",
      role: "Safety Coordinator",
      company: "Precision Manufacturing",
      content: "The course builder has made it so easy to create comprehensive training programs. Our safety compliance rates have improved dramatically.",
      rating: 5,
      avatar: "LR"
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
        {/* Animated Background */}
        <div className="absolute inset-0 hero-gradient">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent-blue/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent-blue/10 text-accent-blue text-sm font-semibold mb-8 animate-fade-in-up">
              <Zap className="h-4 w-4 mr-2" />
              Trusted by 500+ Manufacturing Companies
            </div>
            
            <h1 id="hero-heading" className="text-5xl lg:text-7xl font-bold mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Transform Machine Training with
              <span className="hero-text-gradient block mt-2">Ultra-Short Video Reels</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-secondary-text mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Capture, organize, and deliver 20-30 second instructional videos that document machine operations, 
              maintenance, and troubleshooting techniques for your entire team.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Button size="lg" className="btn-primary text-xl px-12 py-6 group" aria-label="Request a demo of Winbro Training Reels">
                Request Demo
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              <Button size="lg" variant="outline" className="btn-secondary text-xl px-12 py-6 group" aria-label="Watch the product demo video">
                <Play className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                Watch Demo Video
              </Button>
            </div>

            {/* Hero Video Placeholder */}
            <div className="relative max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-accent-blue/20 to-purple-500/20 flex items-center justify-center">
                  <button 
                    className="text-center group focus:outline-none focus:ring-4 focus:ring-white/50 rounded-full"
                    aria-label="Play 2-minute product demo video"
                  >
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-all duration-300">
                      <Play className="h-8 w-8 text-white ml-1" />
                    </div>
                    <p className="text-white/80 text-lg">Watch 2-minute product demo</p>
                  </button>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent-blue/10 text-accent-blue text-sm font-semibold mb-6">
              <CheckCircle className="h-4 w-4 mr-2" />
              Everything You Need
            </div>
            <h2 id="features-heading" className="text-4xl lg:text-5xl font-bold text-primary-text mb-6">
              Powerful Features for Modern Training
            </h2>
            <p className="text-xl text-secondary-text max-w-3xl mx-auto">
              Comprehensive tools designed specifically for industrial training and knowledge management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="feature-card animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl text-center">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-base text-center mb-6">
                    {feature.description}
                  </CardDescription>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center text-sm text-secondary-text">
                        <CheckCircle className="h-4 w-4 text-status-green mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-main-bg" aria-labelledby="how-it-works-heading">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent-blue/10 text-accent-blue text-sm font-semibold mb-6">
              <Zap className="h-4 w-4 mr-2" />
              Simple Process
            </div>
            <h2 id="how-it-works-heading" className="text-4xl lg:text-5xl font-bold text-primary-text mb-6">
              How It Works
            </h2>
            <p className="text-xl text-secondary-text max-w-3xl mx-auto">
              Get started in three simple steps and transform your training process
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center group animate-fade-in-up" style={{ animationDelay: `${index * 200}ms` }}>
                <div className={`relative w-24 h-24 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  {step.icon}
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-accent-blue shadow-lg">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-primary-text mb-4">{step.title}</h3>
                <p className="text-secondary-text text-lg leading-relaxed">
                  {step.description}
                </p>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-accent-blue to-transparent transform translate-x-6"></div>
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
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-main-bg" aria-labelledby="testimonials-heading">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent-blue/10 text-accent-blue text-sm font-semibold mb-6">
              <Star className="h-4 w-4 mr-2" />
              Customer Stories
            </div>
            <h2 id="testimonials-heading" className="text-4xl lg:text-5xl font-bold text-primary-text mb-6">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-secondary-text">
              See what our customers are saying about their transformation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="testimonial-card animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-accent-blue mb-6" />
                  <p className="text-lg text-secondary-text mb-8 italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-accent-blue text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-primary-text">{testimonial.name}</p>
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
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white" aria-labelledby="pricing-heading">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent-blue/10 text-accent-blue text-sm font-semibold mb-6">
              <Award className="h-4 w-4 mr-2" />
              Simple Pricing
            </div>
            <h2 id="pricing-heading" className="text-4xl lg:text-5xl font-bold text-primary-text mb-6">
              Choose Your Plan
            </h2>
            <p className="text-xl text-secondary-text max-w-3xl mx-auto">
              Start with a free trial and scale as you grow
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`pricing-card ${plan.popular ? 'featured' : ''} animate-fade-in-up`} style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-bold text-primary-text">{plan.price}</span>
                    <span className="text-secondary-text ml-2">{plan.period}</span>
                  </div>
                  <CardDescription className="text-lg mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-status-green mr-3 flex-shrink-0" />
                        <span className="text-secondary-text">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                    size="lg"
                  >
                    {plan.cta}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Request Demo Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-accent-blue to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Training?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Request a demo and see how Winbro Training Reels can revolutionize your organization's knowledge sharing.
          </p>
          
          <Card className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-primary-text">Request a Demo</CardTitle>
              <CardDescription className="text-lg">
                Fill out the form below and our team will contact you within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDemoSubmit} className="space-y-6" role="form" aria-label="Request a demo form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="demo-name" className="form-label">Full Name</label>
                    <Input
                      id="demo-name"
                      className="form-input"
                      placeholder="Enter your full name"
                      value={demoForm.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDemoForm({...demoForm, name: e.target.value})}
                      required
                      aria-describedby="demo-name-help"
                    />
                    <div id="demo-name-help" className="sr-only">Enter your full name for the demo request</div>
                  </div>
                  <div>
                    <label htmlFor="demo-company" className="form-label">Company</label>
                    <Input
                      id="demo-company"
                      className="form-input"
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
                  <label htmlFor="demo-email" className="form-label">Email Address</label>
                  <Input
                    id="demo-email"
                    type="email"
                    className="form-input"
                    placeholder="Enter your email address"
                    value={demoForm.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDemoForm({...demoForm, email: e.target.value})}
                    required
                    aria-describedby="demo-email-help"
                  />
                  <div id="demo-email-help" className="sr-only">Enter your email address for the demo request</div>
                </div>
                <div>
                  <label htmlFor="demo-machines" className="form-label">Machines Owned</label>
                  <Input
                    id="demo-machines"
                    className="form-input"
                    placeholder="e.g., CNC Mills, Lathes, Presses"
                    value={demoForm.machines}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDemoForm({...demoForm, machines: e.target.value})}
                    aria-describedby="demo-machines-help"
                  />
                  <div id="demo-machines-help" className="sr-only">Optional: List the types of machines your company owns</div>
                </div>
                <Button type="submit" className="w-full btn-primary text-lg py-4" aria-label="Submit demo request form">
                  Request Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-blue-600 rounded-lg flex items-center justify-center">
                  <Video className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-primary-text">Winbro Training Reels</h3>
              </div>
              <p className="text-secondary-text mb-6 leading-relaxed">
                Transform how your organization captures, organizes, and shares machine operation knowledge with ultra-short video reels.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-accent-blue hover:text-white transition-colors duration-300">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-accent-blue hover:text-white transition-colors duration-300">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-accent-blue hover:text-white transition-colors duration-300">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-accent-blue hover:text-white transition-colors duration-300">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-primary-text mb-6">Product</h3>
              <ul className="space-y-3 text-secondary-text">
                <li><a href="#features" className="hover:text-accent-blue transition-colors duration-300">Features</a></li>
                <li><a href="#pricing" className="hover:text-accent-blue transition-colors duration-300">Pricing</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors duration-300">Demo</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors duration-300">API</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors duration-300">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-primary-text mb-6">Company</h3>
              <ul className="space-y-3 text-secondary-text">
                <li><a href="#" className="hover:text-accent-blue transition-colors duration-300">About</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors duration-300">Contact</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors duration-300">Careers</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors duration-300">Blog</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors duration-300">Press</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-primary-text mb-6">Support</h3>
              <ul className="space-y-3 text-secondary-text">
                <li><a href="#" className="hover:text-accent-blue transition-colors duration-300">Help Center</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors duration-300">Documentation</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors duration-300">Status</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors duration-300">Community</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors duration-300">Training</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-16 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex flex-wrap gap-6 text-secondary-text mb-4 md:mb-0">
                <a href="#" className="hover:text-accent-blue transition-colors duration-300">Privacy Policy</a>
                <a href="#" className="hover:text-accent-blue transition-colors duration-300">Terms of Service</a>
                <a href="#" className="hover:text-accent-blue transition-colors duration-300">Cookie Policy</a>
                <a href="#" className="hover:text-accent-blue transition-colors duration-300">Security</a>
              </div>
              <p className="text-secondary-text">&copy; 2024 Winbro Training Reels. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}