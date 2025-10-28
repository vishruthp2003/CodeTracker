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
        .select("status, last_solved_at")
        .eq("user_id", user?.id);

      if (error) throw error;

      const total = questions?.length || 0;
      const completed = questions?.filter((q) => q.status === "Completed").length || 0;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Calculate streaks
      const solvedDates = questions
        ?.filter((q) => q.last_solved_at)
        .map((q) => new Date(q.last_solved_at!))
        .sort((a, b) => b.getTime() - a.getTime());

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      if (solvedDates && solvedDates.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const uniqueDates = Array.from(
          new Set(solvedDates.map((d) => d.toDateString()))
        ).map((d) => new Date(d));

        for (let i = 0; i < uniqueDates.length; i++) {
          const currentDate = uniqueDates[i];
          const expectedDate = new Date(today);
          expectedDate.setDate(today.getDate() - i);
          expectedDate.setHours(0, 0, 0, 0);

          if (currentDate.toDateString() === expectedDate.toDateString()) {
            currentStreak++;
            tempStreak++;
          } else {
            break;
          }
        }

        // Calculate longest streak
        tempStreak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
          const diff = Math.abs(
            (uniqueDates[i - 1].getTime() - uniqueDates[i].getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diff <= 1) {
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
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          My Profile
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
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
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-5xl font-bold text-primary">{stats.currentStreak}</div>
                  <p className="text-sm text-muted-foreground">days</p>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-2xl font-semibold text-secondary">
                    {stats.longestStreak}
                  </div>
                  <p className="text-xs text-muted-foreground">Longest Streak</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, i) => {
                  const isActive = i < stats.currentStreak;
                  return (
                    <div
                      key={i}
                      className={`h-8 rounded ${
                        isActive ? "bg-primary" : "bg-muted"
                      } transition-colors`}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
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

            <Card>
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

            <Card className="md:col-span-2">
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
          <Card className="border-destructive/50">
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
