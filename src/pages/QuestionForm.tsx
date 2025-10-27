import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const QuestionForm = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    language: "",
    topic: "",
    difficulty: "Medium",
    status: "To Do",
    solution_code: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      fetchQuestion();
    }
  }, [id, isEdit]);

  const fetchQuestion = async () => {
    try {
      const { data, error } = await supabase
        .from("coding_questions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setFormData({
        title: data.title,
        description: data.description,
        language: data.language,
        topic: data.topic,
        difficulty: data.difficulty,
        status: data.status,
        solution_code: data.solution_code || "",
      });
    } catch (error) {
      console.error("Error fetching question:", error);
      toast.error("Failed to load question");
      navigate("/questions");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        user_id: user?.id,
        solution_code: formData.solution_code || null,
      };

      if (isEdit) {
        const { error } = await supabase
          .from("coding_questions")
          .update(payload)
          .eq("id", id);

        if (error) throw error;
        toast.success("Question updated successfully!");
      } else {
        const { error } = await supabase.from("coding_questions").insert([payload]);

        if (error) throw error;
        toast.success("Question added successfully!");
      }

      navigate("/questions");
    } catch (error) {
      console.error("Error saving question:", error);
      toast.error("Failed to save question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/questions")}
        className="gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Questions
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {isEdit ? "Edit Question" : "Add New Question"}
          </CardTitle>
          <CardDescription>
            {isEdit ? "Update the details of your coding question" : "Track a new coding problem"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Two Sum"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="language">Language *</Label>
                <Input
                  id="language"
                  placeholder="JavaScript"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic *</Label>
                <Input
                  id="topic"
                  placeholder="Arrays, Hash Table"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty *</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="To Do">To Do</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="solution_code">Solution Code (Optional)</Label>
              <Textarea
                id="solution_code"
                placeholder="function twoSum(nums, target) { ... }"
                value={formData.solution_code}
                onChange={(e) => setFormData({ ...formData, solution_code: e.target.value })}
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Saving..." : isEdit ? "Update Question" : "Add Question"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/questions")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionForm;
