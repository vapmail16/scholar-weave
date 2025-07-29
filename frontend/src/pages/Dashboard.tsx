import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { Badge } from "@/components/common/ui/badge";
import { BookOpen, FileText, GitBranch, Clock, TrendingUp, Plus } from "lucide-react";

const Dashboard = () => {
  const stats = [
    { label: "Total Papers", value: "0", icon: BookOpen, color: "text-primary" },
    { label: "Notes", value: "0", icon: FileText, color: "text-secondary" },
    { label: "Citations", value: "0", icon: GitBranch, color: "text-accent" },
    { label: "Reading Time", value: "0h", icon: Clock, color: "text-muted-foreground" },
  ];

  const recentActivity = [
    "Welcome to ScholarWeave! Start by importing your first paper.",
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Research Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your academic research workflow efficiently
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Quick Start
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                Ready to start
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest research actions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <p className="text-sm text-muted-foreground">{activity}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to get you started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2">
              <BookOpen className="h-4 w-4" />
              Import First Paper
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <FileText className="h-4 w-4" />
              Create Research Note
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <GitBranch className="h-4 w-4" />
              Explore Citation Network
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Research Collections */}
      <Card>
        <CardHeader>
          <CardTitle>Research Collections</CardTitle>
          <CardDescription>
            Organize your papers into thematic collections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
              <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Create your first collection</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;