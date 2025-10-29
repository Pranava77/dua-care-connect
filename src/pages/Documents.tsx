import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Heart, DollarSign, UserCog, BarChart3, FileText, CheckCircle2, Circle, ArrowRight, LogIn, Home, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export default function Documents() {
  const { user } = useAuth();

  const features = [
    {
      icon: Home,
      title: "Dashboard",
      description: "Comprehensive overview with real-time metrics, alerts, and quick access to key information",
      status: "active"
    },
    {
      icon: Users,
      title: "Resident Management",
      description: "Complete resident profiles, admission tracking, care planning, and resident history",
      status: "active"
    },
    {
      icon: Heart,
      title: "Medical Records (EMR)",
      description: "Electronic medical records, prescriptions, treatment history, and medical alerts",
      status: "active"
    },
    {
      icon: FileText,
      title: "Document Management",
      description: "Centralized storage for admission forms, KYC documents, contracts, and medical files",
      status: "active"
    },
    {
      icon: DollarSign,
      title: "Accounting & Billing",
      description: "Invoice generation, payment tracking, financial reporting, and billing management",
      status: "active"
    },
    {
      icon: UserCog,
      title: "HR & Staff Management",
      description: "Staff profiles, scheduling, attendance tracking, and role-based access control",
      status: "active"
    },
    {
      icon: BarChart3,
      title: "Reports & Analytics",
      description: "Comprehensive reporting, data analytics, and insights for informed decision-making",
      status: "active"
    },
    {
      icon: Settings,
      title: "System Settings",
      description: "Configurable settings, user management, and system customization",
      status: "active"
    }
  ];

  const mvpFeatures = [
    "User Authentication & Role-Based Access Control",
    "Dashboard with Key Metrics & Analytics",
    "Resident Management & Profiles",
    "Medical Records & Prescription Management",
    "Document Storage & Management",
    "Invoice Generation & Payment Tracking",
    "Staff Management & Scheduling",
    "Basic Reporting & Analytics",
    "Responsive Web Interface",
    "Secure Data Management"
  ];

  const futurePlans = [
    {
      phase: "Phase 2",
      timeline: "Q2 2024",
      features: [
        "Mobile App (iOS & Android)",
        "Advanced Analytics Dashboard",
        "Automated Reminders & Notifications",
        "Integration with Laboratory Systems",
        "Electronic Signature Support",
        "Bulk Document Upload"
      ]
    },
    {
      phase: "Phase 3",
      timeline: "Q3 2024",
      features: [
        "Multi-Facility Management",
        "Advanced Reporting with Custom Templates",
        "Telemedicine Integration",
        "Family Portal Access",
        "Automated Billing & Payment Processing",
        "Inventory Management"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Hero Section */}
      <Card className="bg-gradient-to-br from-primary/10 via-accent/10 to-success/10 border-primary/20">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <h1 className="text-headline-1 font-bold text-foreground">
                Welcome to <span className="text-gradient-primary">SilverSync</span>
              </h1>
              <p className="text-body text-lg text-muted-foreground max-w-3xl mx-auto">
                A comprehensive care management platform designed for modern healthcare facilities. 
                Streamline operations, improve care quality, and manage everything in one powerful, intuitive system.
              </p>
            </div>

            {!user && (
              <div className="text-center pt-4">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/login">
                    <LogIn className="h-4 w-4" />
                    Sign In to Get Started
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Features Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-headline-2 font-bold text-foreground mb-2">Core Features</h2>
          <p className="text-body text-muted-foreground">
            Comprehensive tools designed to streamline your care facility operations
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-border/50 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{feature.title}</h3>
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">
                          Active
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* MVP Section */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-headline-2 font-bold flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            Minimum Viable Product (MVP)
          </CardTitle>
          <p className="text-body text-muted-foreground">
            Current version includes all essential features for effective care facility management
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mvpFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Future Plans / Roadmap */}
      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle className="text-headline-2 font-bold flex items-center gap-2">
            <ArrowRight className="h-6 w-6 text-accent" />
            Development Roadmap
          </CardTitle>
          <p className="text-body text-muted-foreground">
            Planned features and enhancements coming in future releases
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {futurePlans.map((plan, index) => (
            <div key={index} className="border-l-4 border-accent pl-6 space-y-4">
              <div>
                <h3 className="text-headline-3 font-bold text-foreground">{plan.phase}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3 p-3 rounded-lg bg-accent/5">
                    <Circle className="h-4 w-4 text-accent flex-shrink-0 fill-accent/20" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Call to Action */}
      {!user && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center space-y-4">
            <h3 className="text-headline-2 font-bold text-foreground">
              Ready to Transform Your Care Facility?
            </h3>
            <p className="text-body text-muted-foreground max-w-2xl mx-auto">
              Join modern care facilities using SilverSync to deliver exceptional care and streamline operations.
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link to="/login">
                <LogIn className="h-4 w-4" />
                Get Started Today
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
