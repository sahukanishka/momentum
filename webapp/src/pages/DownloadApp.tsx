import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Monitor,
  Shield,
  Clock,
  BarChart3,
  Users,
  CheckCircle,
  Apple,
  Zap,
  Eye,
  Lock,
  Activity,
  ArrowRight,
  Star,
  Globe,
  Smartphone,
  Laptop,
} from "lucide-react";
import { getMacOSAppDownload } from "@/api/endpoints/app";
import { toast } from "sonner";
import { utils } from "@/utils/const";

interface AppInfo {
  download_url: string;
  version: string;
  file_size: string;
  release_notes: string;
  last_updated: string;
}

export function DownloadApp() {
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetchAppInfo();
  }, []);

  const fetchAppInfo = () => {
    // setIsLoading(true);
    // utils.fetchData(
    //   getMacOSAppDownload,
    //   (data) => {
    //     setAppInfo(data);
    //     setIsLoading(false);
    //   },
    //   (err) => {
    //     console.error("Failed to fetch app info:", err);
    //     toast.error(err?.message || "Failed to fetch app information");
    //     setIsLoading(false);
    //   }
    // );
  };

  const handleDownload = async () => {
    if (!appInfo?.download_url) {
      toast.error("Download URL not available");
      return;
    }

    setIsDownloading(true);
    try {
      // Create a temporary link element to trigger download
      const link = document.createElement("a");
      link.href = appInfo.download_url;
      link.download = `Momentum-${appInfo.version}.dmg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Download started! Check your Downloads folder.");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const features = [
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Real-time Activity Tracking",
      description:
        "Monitor productivity with live activity feeds and detailed analytics",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Privacy-First Design",
      description: "Your data stays secure with enterprise-grade encryption",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Advanced Analytics",
      description:
        "Get insights into productivity patterns and team performance",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Team Collaboration",
      description: "Manage projects and tasks with seamless team coordination",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Time Tracking",
      description:
        "Accurate time tracking with automatic project categorization",
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Screenshot Monitoring",
      description: "Visual activity tracking with privacy controls",
    },
  ];

  const systemRequirements = [
    "macOS 11.0 (Big Sur) or later",
    "4GB RAM minimum (8GB recommended)",
    "500MB available disk space",
    "Intel or Apple Silicon processor",
    "Internet connection for cloud sync",
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading app information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/20 dark:to-purple-950/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-indigo-600/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-full">
                <Monitor className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Momentum
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {" "}
                Desktop
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              The ultimate productivity tracking app for macOS. Monitor
              activity, track time, and boost your team's performance with
              powerful analytics and insights.
            </p>

            {/* Download Section */}
            <Card className="max-w-md mx-auto mb-12 bg-background/80 backdrop-blur-sm border-purple-200/50 dark:border-purple-800/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-lg">
                    <Apple className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left ml-3">
                    <h3 className="font-semibold text-lg">macOS App</h3>
                    {appInfo && (
                      <p className="text-sm text-muted-foreground">
                        Version {appInfo.version} • {appInfo.file_size}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => {
                    window.open(
                      "https://sixeye-audio-files.s3.us-east-1.amazonaws.com/Momentum+Time+Tracker-1.0.0-arm64.dmg",
                      "_blank"
                    );
                  }}
                  disabled={false}
                  size="lg"
                  className="w-full mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isDownloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download for macOS
                    </>
                  )}
                </Button>

                {appInfo && (
                  <p className="text-xs text-muted-foreground text-center">
                    Last updated:{" "}
                    {new Date(appInfo.last_updated).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-8 text-muted-foreground mb-12">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-1 rounded-full">
                  <Shield className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm">Secure & Private</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-1 rounded-full">
                  <Zap className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm">Lightning Fast</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-1 rounded-full">
                  <Star className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm">4.9/5 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Powerful Features for Modern Teams
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to track productivity, manage projects, and
            boost team performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 border-purple-200/30 dark:border-purple-800/30 hover:border-purple-400/50 dark:hover:border-purple-600/50 hover:scale-105"
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-lg group-hover:from-purple-700 group-hover:to-indigo-700 transition-all duration-300">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* System Requirements */}
      <div className="bg-gradient-to-r from-purple-50/50 to-indigo-50/50 dark:from-purple-950/30 dark:to-indigo-950/30 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              System Requirements
            </h2>
            <p className="text-muted-foreground">
              Ensure your Mac meets these requirements for optimal performance
            </p>
          </div>

          <Card className="max-w-2xl mx-auto border-purple-200/50 dark:border-purple-800/50">
            <CardContent className="p-6">
              <div className="space-y-3">
                {systemRequirements.map((requirement, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-1 rounded-full">
                      <CheckCircle className="h-3 w-3 text-white flex-shrink-0" />
                    </div>
                    <span className="text-foreground">{requirement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Ready to Boost Your Productivity?
        </h2>
        <p className="text-xl text-muted-foreground mb-8">
          Join thousands of teams already using Momentum to track and improve
          their performance
        </p>
        <Button
          onClick={() => {
            window.open(
              "https://sixeye-audio-files.s3.us-east-1.amazonaws.com/Momentum+Time+Tracker-1.0.0-arm64.dmg",
              "_blank"
            );
          }}
          disabled={false}
          size="lg"
          className="mr-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isDownloading ? "Downloading..." : "Download Now"}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50"
        >
          <Globe className="h-4 w-4 mr-2" />
          Learn More
        </Button>
      </div>
    </div>
  );
}
