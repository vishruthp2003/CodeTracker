import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, Edit, Code2, BookOpen, AlertCircle } from "lucide-react";

interface Question {
  id: string;
  title: string;
  description: string;
  language: string;
  topic: string;
  difficulty: string;
  status: string;
  solution_code: string | null;
  created_at: string;
}

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const { data, error } = await supabase
        .from("coding_questions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setQuestion(data);
    } catch (error) {
      console.error("Error fetching question:", error);
      toast.error("Failed to load question");
      navigate("/questions");
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-success/20 text-success border-success/50";
      case "Medium":
        return "bg-warning/20 text-warning border-warning/50";
      case "Hard":
        return "bg-destructive/20 text-destructive border-destructive/50";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-success/20 text-success border-success/50";
      case "In Progress":
        return "bg-warning/20 text-warning border-warning/50";
      case "To Do":
        return "bg-muted text-muted-foreground border-muted-foreground/50";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading question...</div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">Question not found</p>
        <Button onClick={() => navigate("/questions")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Questions
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate("/questions")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Questions
        </Button>
        <Button
          onClick={() => navigate(`/questions/edit/${id}`)}
          className="gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit Question
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Problem Description */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold tracking-tight">{question.title}</h1>
              <Badge className={getDifficultyColor(question.difficulty)}>
                {question.difficulty}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1">
                <Code2 className="w-3 h-3" />
                {question.language}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <BookOpen className="w-3 h-3" />
                {question.topic}
              </Badge>
              <Badge className={getStatusColor(question.status)}>
                {question.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-primary rounded-full" />
                Problem Description
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {question.description}
              </p>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Created</span>
                <p className="font-medium mt-1">
                  {new Date(question.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Status</span>
                <p className="font-medium mt-1">{question.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Solution Code */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-1 h-5 bg-secondary rounded-full" />
              Solution
            </h2>
          </CardHeader>
          <CardContent>
            {question.solution_code ? (
              <div className="relative">
                <div className="absolute top-3 right-3 text-xs text-muted-foreground font-mono">
                  {question.language}
                </div>
                <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto border border-border">
                  <code className="text-sm font-mono leading-relaxed text-foreground">
                    {question.solution_code}
                  </code>
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Code2 className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No solution code available yet</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate(`/questions/edit/${id}`)}
                >
                  Add Solution
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuestionDetail;
