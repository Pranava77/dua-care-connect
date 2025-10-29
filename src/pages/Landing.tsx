import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Heart, 
  Users, 
  Smartphone,
  Apple,
  Play,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from "lucide-react";

const Landing = () => {
  return (
    <div className="w-full bg-background">
      {/* Section 1: Hero */}
      <section className="w-full py-20 px-4 md:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-headline-1 font-bold text-foreground leading-tight">
                Complete Care
                <br />
                Management for
                <br />
                Modern Facilities
              </h1>
              <p className="text-body text-muted-foreground text-xl max-w-xl">
                Streamline operations, improve care quality, and manage everything in one powerful platform.
              </p>
              <div className="flex gap-4 pt-4">
                <Button asChild size="lg" className="rounded-full">
                  <Link to="/login">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full">
                  <Link to="/login">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-md">
                {/* Device Mockups */}
                <div className="absolute -top-8 -right-8 w-64 h-96 bg-card rounded-3xl shadow-2xl rotate-12 transform border border-border/50">
                  <div className="p-4 h-full flex flex-col">
                    <div className="flex-1 bg-muted rounded-2xl"></div>
                  </div>
                </div>
                <div className="absolute -bottom-8 -left-8 w-64 h-96 bg-card rounded-3xl shadow-2xl -rotate-12 transform border border-border/50">
                  <div className="p-4 h-full flex flex-col">
                    <div className="flex-1 bg-muted rounded-2xl"></div>
                  </div>
                </div>
                <div className="relative z-10 w-64 h-96 bg-card rounded-3xl shadow-2xl border border-border/50">
                  <div className="p-4 h-full flex flex-col">
                    <div className="flex-1 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
                      <Smartphone className="w-24 h-24 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Value Proposition */}
      <section className="w-full py-20 px-4 bg-accent/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6">
            <p className="text-headline-1 font-bold text-foreground leading-tight">
              We make care management
              <br />
              <span className="text-5xl md:text-7xl text-primary">simple</span> and{" "}
              <span className="text-5xl md:text-7xl text-success">intuitive</span> 🏥
              <br />
              so you can focus on what matters most:{" "}
              <span className="text-5xl md:text-7xl">your residents</span> ❤️
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Feature Highlight */}
      <section className="w-full py-24 px-4 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-headline-2 font-bold text-foreground mb-4">
              Everything You Need in One Place
            </h2>
            <p className="text-body text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools for managing residents, medical records, finances, and more.
            </p>
          </div>
          <div className="max-w-4xl mx-auto relative">
            <Card className="p-8 md:p-12 border-border/50 shadow-xl relative">
              <div className="aspect-video bg-muted rounded-2xl mb-6 flex items-center justify-center">
                <div className="text-center">
                  <Users className="w-24 h-24 text-primary mx-auto mb-4" />
                  <p className="text-body text-muted-foreground">Dashboard Preview</p>
                </div>
              </div>
              <p className="text-body text-foreground text-center">
                Streamline daily operations with an intuitive dashboard that gives you instant access to all critical information and tasks.
              </p>
              {/* Decorative corner elements */}
              <div className="absolute top-4 right-4 text-4xl opacity-20 pointer-events-none">✨</div>
              <div className="absolute bottom-4 left-4 text-4xl opacity-20 pointer-events-none">🎯</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 4: Mission/Purpose */}
      <section className="w-full py-24 px-4 bg-background">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-headline-1 font-bold text-foreground">
            Our Mission
          </h2>
          <p className="text-body text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            To empower care facilities with technology that enhances quality of life for residents 
            while simplifying operations for staff. We believe in compassionate, efficient, and 
            transparent care management.
          </p>
          <div className="flex justify-center pt-8">
            <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center">
              <Heart className="w-16 h-16 text-primary" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Brand Statement */}
      <section className="w-full py-24 px-4 bg-muted">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <h2 className="text-headline-1 font-bold">
            <span className="text-gradient-primary">SilverSync</span>
            <br />
            <span className="text-foreground">Where Care Meets</span>
            <br />
            <span className="text-foreground">Technology</span>
          </h2>
        </div>
      </section>

      {/* Section 6: Hero Image */}
      <section className="w-full">
        <div className="aspect-[21/9] bg-muted relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 via-accent/10 to-success/10">
            <div className="text-center space-y-4">
              <Users className="w-32 h-32 text-primary/50 mx-auto" />
              <p className="text-body text-muted-foreground">Lifestyle Photography</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Target Audience */}
      <section className="w-full py-24 px-4 bg-primary/10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <p className="text-headline-1 font-bold text-foreground leading-tight">
            Built for care facilities
            <br />
            that value
            <br />
            <span className="text-5xl md:text-7xl">quality</span> and{" "}
            <span className="text-5xl md:text-7xl">efficiency</span>
          </p>
          <div className="pt-8">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/login">Start Your Journey Today</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Section 8: Social Proof/Stats */}
      <section className="w-full py-24 px-4 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <div className="text-display font-bold text-primary">
                1000+
              </div>
              <p className="text-body text-foreground font-semibold">
                Active Facilities
              </p>
              <p className="text-caption text-muted-foreground">
                Trusted by care providers nationwide
              </p>
            </div>
            <div className="space-y-4">
              <div className="text-display font-bold text-success">
                50K+
              </div>
              <p className="text-body text-foreground font-semibold">
                Residents Managed
              </p>
              <p className="text-caption text-muted-foreground">
                Improving lives every day
              </p>
            </div>
            <div className="space-y-4">
              <div className="text-display font-bold text-accent">
                99%
              </div>
              <p className="text-body text-foreground font-semibold">
                Satisfaction Rate
              </p>
              <p className="text-caption text-muted-foreground">
                Loved by staff and administrators
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9: Location/Search */}
      <section className="w-full py-20 px-4 bg-background">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h2 className="text-headline-2 font-bold text-foreground">
            Find Care Solutions Near You
          </h2>
          <div className="flex gap-2 max-w-md mx-auto">
            <Input 
              type="search" 
              placeholder="Enter location or facility name..." 
              className="rounded-full"
            />
            <Button className="rounded-full px-8">
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Section 10: Footer/CTA */}
      <section className="w-full py-24 px-4 bg-muted relative">
        {/* Curved top edge */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-background rounded-t-[3rem]"></div>
        
        <div className="max-w-4xl mx-auto text-center space-y-8 pt-16">
          <div className="space-y-4">
            <h2 className="text-headline-1 font-bold text-gradient-primary">
              Ready to Transform Your Care Facility?
            </h2>
            <p className="text-body text-muted-foreground text-lg">
              Join thousands of facilities using SilverSync to deliver exceptional care 🚀
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/login">Get Started Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link to="/login">Schedule a Demo</Link>
            </Button>
          </div>

          <div className="pt-12 space-y-6">
            <div className="flex justify-center gap-6">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Linkedin className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex justify-center gap-4 items-center pt-4">
              <Button variant="outline" size="sm" className="rounded-full gap-2">
                <Apple className="w-4 h-4" />
                App Store
              </Button>
              <Button variant="outline" size="sm" className="rounded-full gap-2">
                <Play className="w-4 h-4" />
                Google Play
              </Button>
            </div>

            <p className="text-caption text-muted-foreground pt-8">
              © 2024 SilverSync. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;

