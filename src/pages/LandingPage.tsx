import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Play, Users, Shield, Zap, ArrowRight, Star, Quote } from 'lucide-react';

export default function LandingPage() {
  const [demoForm, setDemoForm] = useState({
    name: '',
    company: '',
    email: '',
    machines: ''
  });

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle demo request submission
    console.log('Demo request:', demoForm);
  };

  const features = [
    {
      icon: <Play className="h-8 w-8 text-accent-blue" />,
      title: "Ultra-Short Training Reels",
      description: "Capture 20-30 second instructional videos for machine operations, maintenance, and troubleshooting."
    },
    {
      icon: <Zap className="h-8 w-8 text-accent-blue" />,
      title: "AI-Powered Search",
      description: "Find exactly what you need with intelligent search across video transcripts and metadata."
    },
    {
      icon: <Users className="h-8 w-8 text-accent-blue" />,
      title: "Team Collaboration",
      description: "Share knowledge across your organization with customer-scoped libraries and course building."
    },
    {
      icon: <Shield className="h-8 w-8 text-accent-blue" />,
      title: "Enterprise Security",
      description: "Bank-level security with SSO, audit logs, and compliance-ready data protection."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Training Manager",
      company: "Manufacturing Corp",
      content: "Winbro Training Reels has revolutionized how we capture and share knowledge. Our operators can now access critical procedures in seconds.",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Operations Director",
      company: "Industrial Solutions",
      content: "The AI search capabilities are incredible. We can find specific machine procedures instantly, saving hours of training time.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-main-bg">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-text">Winbro Training Reels</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost">Help</Button>
              <Button variant="outline">Login</Button>
              <Button className="btn-primary">Request Demo</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl lg:text-6xl font-bold text-primary-text mb-6 animate-fade-in-up">
              Transform Machine Training with
              <span className="text-accent-blue block">Ultra-Short Video Reels</span>
            </h1>
            <p className="text-xl text-secondary-text mb-8 max-w-3xl mx-auto animate-fade-in-up">
              Capture, organize, and deliver 20-30 second instructional videos that document machine operations, 
              maintenance, and troubleshooting techniques for your entire team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
              <Button size="lg" className="btn-primary text-lg px-8 py-4">
                Request Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                Watch Demo Video
                <Play className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary-text mb-4">
              Everything You Need for Modern Training
            </h2>
            <p className="text-xl text-secondary-text max-w-2xl mx-auto">
              Powerful features designed specifically for industrial training and knowledge management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card card-hover animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader>
                  <div className="flex items-center justify-center w-16 h-16 bg-accent-blue/10 rounded-lg mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-main-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary-text mb-4">
              How It Works
            </h2>
            <p className="text-xl text-secondary-text max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center animate-fade-in-up">
              <div className="w-16 h-16 bg-accent-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold text-primary-text mb-4">Capture</h3>
              <p className="text-secondary-text">
                Record 20-30 second videos of machine operations, maintenance procedures, and troubleshooting steps.
              </p>
            </div>
            
            <div className="text-center animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="w-16 h-16 bg-accent-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold text-primary-text mb-4">Process</h3>
              <p className="text-secondary-text">
                AI automatically transcribes, tags, and organizes your content for easy discovery and search.
              </p>
            </div>
            
            <div className="text-center animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="w-16 h-16 bg-accent-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold text-primary-text mb-4">Share</h3>
              <p className="text-secondary-text">
                Build courses, assign training, and let your team access knowledge instantly when they need it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary-text mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-secondary-text">
              See what our customers are saying
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="card animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-accent-blue mb-4" />
                  <p className="text-lg text-secondary-text mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold text-primary-text">{testimonial.name}</p>
                    <p className="text-secondary-text">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Request Demo Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-accent-blue">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Training?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Request a demo and see how Winbro Training Reels can revolutionize your organization's knowledge sharing.
          </p>
          
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Request a Demo</CardTitle>
              <CardDescription>
                Fill out the form below and our team will contact you within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDemoSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Full Name"
                    value={demoForm.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDemoForm({...demoForm, name: e.target.value})}
                    required
                  />
                  <Input
                    placeholder="Company"
                    value={demoForm.company}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDemoForm({...demoForm, company: e.target.value})}
                    required
                  />
                </div>
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={demoForm.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDemoForm({...demoForm, email: e.target.value})}
                  required
                />
                <Input
                  placeholder="Machines Owned (e.g., CNC Mills, Lathes)"
                  value={demoForm.machines}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDemoForm({...demoForm, machines: e.target.value})}
                />
                <Button type="submit" className="w-full btn-primary">
                  Request Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-primary-text mb-4">Product</h3>
              <ul className="space-y-2 text-secondary-text">
                <li><a href="#" className="hover:text-accent-blue">Features</a></li>
                <li><a href="#" className="hover:text-accent-blue">Pricing</a></li>
                <li><a href="#" className="hover:text-accent-blue">Demo</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-text mb-4">Company</h3>
              <ul className="space-y-2 text-secondary-text">
                <li><a href="#" className="hover:text-accent-blue">About</a></li>
                <li><a href="#" className="hover:text-accent-blue">Contact</a></li>
                <li><a href="#" className="hover:text-accent-blue">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-text mb-4">Support</h3>
              <ul className="space-y-2 text-secondary-text">
                <li><a href="#" className="hover:text-accent-blue">Help Center</a></li>
                <li><a href="#" className="hover:text-accent-blue">Documentation</a></li>
                <li><a href="#" className="hover:text-accent-blue">Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-text mb-4">Legal</h3>
              <ul className="space-y-2 text-secondary-text">
                <li><a href="#" className="hover:text-accent-blue">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-accent-blue">Terms of Service</a></li>
                <li><a href="#" className="hover:text-accent-blue">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-secondary-text">
            <p>&copy; 2024 Winbro Training Reels. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}