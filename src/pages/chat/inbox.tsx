import React from "react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Inbox,
  MessageSquare,
  Bell,
  Calendar,
  Search,
  Filter,
  Settings,
  Zap,
  Users,
  BarChart3,
  FileText,
  Headphones,
  Video,
  Mic,
  Sparkles,
  Globe,
  Smartphone,
  Clock,
} from "lucide-react";

const ComingSoonPage: React.FC = () => {
  const upcomingFeatures = [
    {
      icon: <Inbox className="w-6 h-6" />,
      title: "Advanced Inbox Management",
      description: "Organize and prioritize customer messages with smart filtering and categorization",
      category: "Organization",
      status: "In Development",
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Smart Search & Filtering",
      description: "Quickly find conversations using powerful search with filters by date, status, and priority",
      category: "Search",
      status: "Coming Soon",
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Real-time Notifications",
      description: "Get instant alerts for new messages, urgent tickets, and status changes",
      category: "Notifications",
      status: "In Development",
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "File Attachments",
      description: "Send and receive documents, images, and other files in conversations",
      category: "Communication",
      status: "Coming Soon",
    },
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Voice Messages",
      description: "Support for audio messages to provide more personal customer support",
      category: "Communication",
      status: "Planned",
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: "Video Call Integration",
      description: "Seamlessly start video calls with customers directly from the chat interface",
      category: "Communication",
      status: "Planned",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI Response Suggestions",
      description: "Get intelligent response suggestions powered by AI to improve response quality",
      category: "AI",
      status: "In Development",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Chat Analytics",
      description: "Detailed insights on response times, customer satisfaction, and team performance",
      category: "Analytics",
      status: "Coming Soon",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Collaboration",
      description: "Collaborate with team members, transfer chats, and add internal notes",
      category: "Collaboration",
      status: "Planned",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Multi-language Support",
      description: "Support multiple languages with automatic translation capabilities",
      category: "Localization",
      status: "Planned",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Quick Actions",
      description: "Preset responses and quick actions for common customer inquiries",
      category: "Efficiency",
      status: "Coming Soon",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Scheduled Messages",
      description: "Schedule messages to be sent at specific times or trigger-based events",
      category: "Automation",
      status: "Planned",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Development":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Coming Soon":
        return "bg-green-100 text-green-700 border-green-200";
      case "Planned":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Organization: "bg-orange-50 text-orange-700",
      Search: "bg-cyan-50 text-cyan-700",
      Notifications: "bg-red-50 text-red-700",
      Communication: "bg-green-50 text-green-700",
      AI: "bg-purple-50 text-purple-700",
      Analytics: "bg-blue-50 text-blue-700",
      Collaboration: "bg-yellow-50 text-yellow-700",
      Localization: "bg-indigo-50 text-indigo-700",
      Efficiency: "bg-emerald-50 text-emerald-700",
      Automation: "bg-pink-50 text-pink-700",
    };
    return colors[category as keyof typeof colors] || "bg-gray-50 text-gray-700";
  };

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-yellow-800" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Advanced Inbox Features
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            We're working on exciting new features to revolutionize your customer support experience. 
            Here's what's coming to make your inbox even more powerful and efficient.
          </p>
          
          <div className="flex justify-center gap-4 mb-8">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-4 py-2 text-sm">
              🚀 12 New Features
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-700 px-4 py-2 text-sm">
              🎯 Enhanced Experience
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 px-4 py-2 text-sm">
              🤖 AI Powered
            </Badge>
          </div>
        </div>

        {/* Status Legend */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">In Development</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Coming Soon</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Planned</span>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {upcomingFeatures.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:scale-105 bg-white/80 backdrop-blur-sm"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg group-hover:from-blue-200 group-hover:to-purple-200 transition-colors">
                      {feature.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {feature.title}
                      </CardTitle>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs px-2 py-1 border ${getStatusColor(feature.status)}`}
                  >
                    {feature.status}
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs px-2 py-1 ${getCategoryColor(feature.category)}`}
                  >
                    {feature.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Stay Updated
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Want to be the first to know when these features are released? 
            We'll notify you as soon as they're available.
          </p>
          
          <div className="flex justify-center gap-4">
            <Button 
              variant="default" 
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
            >
              <Bell className="w-4 h-4 mr-2" />
              Get Notified
            </Button>
            <Button variant="outline" size="lg" className="border-gray-300 hover:bg-gray-50">
              <MessageSquare className="w-4 h-4 mr-2" />
              Back to Chat
            </Button>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Development Timeline
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center bg-blue-50 border-blue-200">
              <CardHeader>
                <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-blue-900">Q1 2025</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700 font-medium">Phase 1</p>
                <p className="text-blue-600 text-sm">Advanced Inbox, Search, and AI Suggestions</p>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-green-50 border-green-200">
              <CardHeader>
                <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-green-900">Q2 2025</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700 font-medium">Phase 2</p>
                <p className="text-green-600 text-sm">File Attachments, Analytics, and Quick Actions</p>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-purple-50 border-purple-200">
              <CardHeader>
                <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <CardTitle className="text-purple-900">Q3 2025</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-700 font-medium">Phase 3</p>
                <p className="text-purple-600 text-sm">Voice, Video, Team Collaboration, and Automation</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;