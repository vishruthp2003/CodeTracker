import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Clock, Code2, TrendingUp, Flame, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface Stats {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  byDifficulty: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
  streak: number;
  weeklyCompleted: number;
  monthlyCompleted: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    total: 0,
    completed: 0,
    inProgress: 0,
    todo: 0,
    byDifficulty: { Easy: 0, Medium: 0, Hard: 0 },
    streak: 0,
    weeklyCompleted: 0,
    monthlyCompleted: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from("coding_questions")
        .select("status, difficulty, last_solved_at, updated_at")
        .eq("user_id", user?.id);

      if (error) throw error;

      // Calculate streak
      const sortedDates = data
        .filter((q) => q.last_solved_at)
        .map((q) => new Date(q.last_solved_at!))
        .sort((a, b) => b.getTime() - a.getTime());

      let streak = 0;
      if (sortedDates.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let currentDate = new Date(today);
        const uniqueDates = new Set(sortedDates.map(d => d.toDateString()));
        
        // Check if there's activity today or yesterday to start streak
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (uniqueDates.has(today.toDateString()) || uniqueDates.has(yesterday.toDateString())) {
          while (uniqueDates.has(currentDate.toDateString())) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
          }
        }
      }

      // Calculate weekly and monthly
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const weeklyCompleted = data.filter(
        (q) => q.status === "Completed" && q.updated_at && new Date(q.updated_at) >= weekAgo
      ).length;

      const monthlyCompleted = data.filter(
        (q) => q.status === "Completed" && q.updated_at && new Date(q.updated_at) >= monthAgo
      ).length;

      const newStats: Stats = {
        total: data.length,
        completed: data.filter((q) => q.status === "Completed").length,
        inProgress: data.filter((q) => q.status === "In Progress").length,
        todo: data.filter((q) => q.status === "To Do").length,
        byDifficulty: {
          Easy: data.filter((q) => q.difficulty === "Easy").length,
          Medium: data.filter((q) => q.difficulty === "Medium").length,
          Hard: data.filter((q) => q.difficulty === "Hard").length,
        },
        streak,
        weeklyCompleted,
        monthlyCompleted,
      };

      setStats(newStats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  const chartData = [
    { name: "Completed", value: stats.completed, color: "hsl(var(--success))" },
    { name: "In Progress", value: stats.inProgress, color: "hsl(var(--warning))" },
    { name: "To Do", value: stats.todo, color: "hsl(var(--muted))" },
  ].filter(item => item.value > 0);

  const totalVsCompletedData = [
    { name: "Completed", value: stats.completed, color: "hsl(var(--success))" },
    { name: "Remaining", value: stats.total - stats.completed, color: "hsl(var(--muted))" },
  ].filter(item => item.value > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-primary">Loading stats...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Track your coding progress and stats</p>
        </div>
        <Link to="/questions">
          <Button>View All Questions</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50 animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <Code2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All tracked questions</p>
          </CardContent>
        </Card>

        <Card className="border-success/20 bg-gradient-to-br from-card to-card/50 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {progressPercentage.toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="border-warning/20 bg-gradient-to-br from-card to-card/50 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently working on</p>
          </CardContent>
        </Card>

        <Card className="border-muted bg-gradient-to-br from-card to-card/50 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">To Do</CardTitle>
            <Circle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.todo}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending questions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{stats.streak}</div>
            <p className="text-xs text-muted-foreground mt-1">Consecutive days</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.weeklyCompleted}</div>
            <p className="text-xs text-muted-foreground mt-1">Questions completed</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.monthlyCompleted}</div>
            <p className="text-xs text-muted-foreground mt-1">Questions completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="relative flex-shrink-0">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Easy", value: stats.byDifficulty.Easy, color: "hsl(var(--success))" },
                        { name: "Medium", value: stats.byDifficulty.Medium, color: "hsl(var(--warning))" },
                        { name: "Hard", value: stats.byDifficulty.Hard, color: "hsl(var(--destructive))" },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {[
                        { name: "Easy", value: stats.byDifficulty.Easy, color: "hsl(var(--success))" },
                        { name: "Medium", value: stats.byDifficulty.Medium, color: "hsl(var(--warning))" },
                        { name: "Hard", value: stats.byDifficulty.Hard, color: "hsl(var(--destructive))" },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold">{stats.completed}</div>
                  <div className="text-2xl text-muted-foreground">/{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Solved</div>
                </div>
              </div>
              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                  <span className="font-medium text-success">Easy</span>
                  <span className="text-xl font-bold text-success">{stats.byDifficulty.Easy}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10">
                  <span className="font-medium text-warning">Med.</span>
                  <span className="text-xl font-bold text-warning">{stats.byDifficulty.Medium}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10">
                  <span className="font-medium text-destructive">Hard</span>
                  <span className="text-xl font-bold text-destructive">{stats.byDifficulty.Hard}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {stats.total > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No data to display
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
