import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Mail, Calendar, Trophy, Target, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileData {
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface Stats {
  total: number;
  completed: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    username: "",
    avatar_url: "",
    bio: "",
  });
  const [stats, setStats] = useState<Stats>({
    total: 0,
    completed: 0,
    completionRate: 0,
    currentStreak: 0,
    longestStreak: 0,
  });
  const [yearDays, setYearDays] = useState<Date[]>([]);
  const [activityMap, setActivityMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      setProfile({
        username: data.username,
        avatar_url: data.avatar_url,
        bio: data.bio,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: questions, error } = await supabase
        .from("coding_questions")
        .select("status, last_solved_at, updated_at")
        .eq("user_id", user?.id);

      if (error) throw error;

      const total = questions?.length || 0;
      const completed = questions?.filter((q) => q.status === "Completed").length || 0;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Prepare activity map for the past year aligned by weeks (Sun-Sat)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfRange = new Date(today);
      startOfRange.setDate(startOfRange.getDate() - 364);
      // Align start to the previous Sunday
      while (startOfRange.getDay() !== 0) {
        startOfRange.setDate(startOfRange.getDate() - 1);
      }

      const toKey = (d: Date) => d.toISOString().slice(0, 10);

      const activity: Record<string, number> = {};
      questions?.forEach((q) => {
        // Use last_solved_at if present; otherwise, if completed, fallback to updated_at
        const dateSource = q.last_solved_at
          ? new Date(q.last_solved_at)
          : q.status === "Completed" && q.updated_at
          ? new Date(q.updated_at)
          : null;
        if (!dateSource) return;
        dateSource.setHours(0, 0, 0, 0);
        if (dateSource >= startOfRange && dateSource <= today) {
          const key = toKey(dateSource);
          activity[key] = (activity[key] || 0) + 1;
        }
      });

      // Generate the 53 weeks x 7 days range
      const totalDays = 53 * 7;
      const days: Date[] = [];
      for (let i = 0; i < totalDays; i++) {
        const d = new Date(startOfRange);
        d.setDate(startOfRange.getDate() + i);
        days.push(d);
      }

      setActivityMap(activity);
      setYearDays(days);

      // Calculate streaks from activity
      const activeDates = Object.keys(activity)
        .map((k) => new Date(k))
        .sort((a, b) => b.getTime() - a.getTime());

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      if (activeDates.length > 0) {
        // Current streak: count back from today
        const uniqueDates = Array.from(new Set(activeDates.map((d) => d.toDateString()))).map(
          (d) => new Date(d)
        );
        const ref = new Date(today);
        for (let i = 0; i < uniqueDates.length; i++) {
          const expected = new Date(ref);
          expected.setDate(ref.getDate() - i);
          if (uniqueDates[i].toDateString() === expected.toDateString()) {
            currentStreak++;
          } else {
            break;
          }
        }

        // Longest streak: consecutive days within uniqueDates
        tempStreak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
          const diffDays = Math.round(
            (uniqueDates[i - 1].getTime() - uniqueDates[i].getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diffDays === 1) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
          } else {
            tempStreak = 1;
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak);
      }

      setStats({
        total,
        completed,
        completionRate,
        currentStreak,
        longestStreak,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: profile.username,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
        })
        .eq("id", user?.id);

      if (error) throw error;
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone."))
      return;

    try {
      // Delete all user's questions first
      await supabase.from("coding_questions").delete().eq("user_id", user?.id);

      toast.success("Account deletion initiated. Please contact support to complete the process.");
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-primary">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          My Profile
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar_url || ""} />
                <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                  {profile.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-center space-y-1">
                <h3 className="text-xl font-semibold">{profile.username || "Anonymous"}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-2 justify-center">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </p>
              </div>
            </div>

            {!isEditing ? (
              <div className="space-y-4 pt-4">
                {profile.bio && (
                  <div>
                    <Label className="text-muted-foreground">Bio</Label>
                    <p className="text-sm mt-1">{profile.bio}</p>
                  </div>
                )}
                <Button onClick={() => setIsEditing(true)} className="w-full">
                  Edit Profile
                </Button>
              </div>
            ) : (
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profile.username || ""}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    value={profile.avatar_url || ""}
                    onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio || ""}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving} className="flex-1">
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="md:col-span-2 space-y-6">
          {/* Streak Display */}
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-sm">
                <span>{Object.keys(activityMap).length} submissions in the past one year</span>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Total active days: {stats.currentStreak > 0 ? stats.currentStreak : stats.longestStreak}</span>
                  <span>Max streak: {stats.longestStreak}</span>
                  <span>Current: {stats.currentStreak}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="overflow-x-auto pb-2">
                  <div className="inline-grid grid-flow-col auto-cols-max gap-1" style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}>
                    {yearDays.map((date, index) => {
                      const key = date.toISOString().slice(0, 10);
                      const count = activityMap[key] || 0;
                      const cls = count > 0 ? 'bg-success' : 'bg-muted';
                      return (
                        <div
                          key={index}
                          className={`w-2.5 h-2.5 rounded-sm ${cls} transition-colors`}
                          title={date.toDateString()}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  {["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"].map((month) => (
                    <span key={month}>{month}</span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <CardHeader className="pb-3">
                <CardDescription>Total Questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="text-3xl font-bold">{stats.total}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <CardHeader className="pb-3">
                <CardDescription>Completed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-success" />
                  <span className="text-3xl font-bold text-success">{stats.completed}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <CardHeader className="pb-3">
                <CardDescription>Completion Rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">{stats.completionRate}%</span>
                    <Badge variant="outline" className="text-sm">
                      {stats.completed}/{stats.total}
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500"
                      style={{ width: `${stats.completionRate}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Actions */}
          <Card className="border-destructive/50 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="destructive" onClick={handleDeleteAccount} className="w-full">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
