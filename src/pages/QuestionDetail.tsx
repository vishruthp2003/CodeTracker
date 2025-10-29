import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CodeEditor from "@/components/CodeEditor";
import { toast } from "sonner";
import { ArrowLeft, Edit, Trash2, Code2, Plus, X } from "lucide-react";

interface Question {
  id: string;
  title: string;
  description: string;
  language: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "To Do" | "In Progress" | "Completed";
  solution_code: string | null;
  notes: string | null;
  created_at: string;
}

interface Solution {
  id: string;
  question_id: string;
  language: string;
  solution_code: string;
  notes: string | null;
  created_at: string;
}

const QuestionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingSolution, setIsAddingSolution] = useState(false);
  const [newSolution, setNewSolution] = useState({
    language: "",
    solution_code: "",
    notes: "",
  });

  useEffect(() => {
    if (id) {
      fetchQuestion();
      fetchSolutions();
    }
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const { data, error } = await supabase
        .from("coding_questions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setQuestion(data as Question);
    } catch (error) {
      console.error("Error fetching question:", error);
      toast.error("Failed to load question");
      navigate("/questions");
    } finally {
      setLoading(false);
    }
  };

  const fetchSolutions = async () => {
    try {
      const { data, error } = await supabase
        .from("question_solutions")
        .select("*")
        .eq("question_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSolutions(data as Solution[]);
    } catch (error) {
      console.error("Error fetching solutions:", error);
    }
  };

  const handleAddSolution = async () => {
    if (!newSolution.language || !newSolution.solution_code) {
      toast.error("Please fill in language and solution code");
      return;
    }

    try {
      const { error } = await supabase.from("question_solutions").insert({
        question_id: id,
        language: newSolution.language,
        solution_code: newSolution.solution_code,
        notes: newSolution.notes || null,
      });

      if (error) throw error;
      toast.success("Solution added successfully!");
      setIsAddingSolution(false);
      setNewSolution({ language: "", solution_code: "", notes: "" });
      fetchSolutions();
    } catch (error) {
      console.error("Error adding solution:", error);
      toast.error("Failed to add solution");
    }
  };

  const handleDeleteSolution = async (solutionId: string) => {
    if (!confirm("Are you sure you want to delete this solution?")) return;

    try {
      const { error } = await supabase
        .from("question_solutions")
        .delete()
        .eq("id", solutionId);

      if (error) throw error;
      toast.success("Solution deleted successfully");
      fetchSolutions();
    } catch (error) {
      console.error("Error deleting solution:", error);
      toast.error("Failed to delete solution");
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-success text-success-foreground";
      case "Medium":
        return "bg-warning text-warning-foreground";
      case "Hard":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-success text-success-foreground";
      case "In Progress":
        return "bg-warning text-warning-foreground";
      case "To Do":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-primary">Loading question...</div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-muted-foreground">Question not found</p>
        <Button onClick={() => navigate("/questions")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Questions
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-3xl">{question.title}</CardTitle>
              <CardDescription className="text-base">{question.description}</CardDescription>
            </div>
            <div className="flex flex-col gap-2">
              <Badge className={getDifficultyColor(question.difficulty)}>
                {question.difficulty}
              </Badge>
              <Badge className={getStatusColor(question.status)}>
                {question.status}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Badge variant="outline">{question.language}</Badge>
            <Badge variant="outline">{question.topic}</Badge>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="space-y-6 pt-6">
          {question.notes && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-3">Notes / Approach</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {question.notes}
                </p>
              </div>
              <Separator />
            </>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Code2 className="w-5 h-5 text-primary" />
                Solutions
              </h3>
              <Dialog open={isAddingSolution} onOpenChange={setIsAddingSolution}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Solution
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Solution</DialogTitle>
                    <DialogDescription>
                      Add a solution in a different programming language
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="solution-language">Language *</Label>
                      <Input
                        id="solution-language"
                        placeholder="e.g., Python, Java, C++"
                        value={newSolution.language}
                        onChange={(e) =>
                          setNewSolution({ ...newSolution, language: e.target.value })
                        }
                      />
                    </div>
                    <CodeEditor
                      value={newSolution.solution_code}
                      onChange={(value) =>
                        setNewSolution({ ...newSolution, solution_code: value })
                      }
                      language={newSolution.language || "code"}
                      label="Solution Code *"
                      rows={12}
                    />
                    <div className="space-y-2">
                      <Label htmlFor="solution-notes">Notes (Optional)</Label>
                      <Input
                        id="solution-notes"
                        placeholder="Any additional notes about this solution..."
                        value={newSolution.notes}
                        onChange={(e) =>
                          setNewSolution({ ...newSolution, notes: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddingSolution(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddSolution}>Add Solution</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Tabs defaultValue="main" className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="main">
                  Main ({question.language})
                </TabsTrigger>
                {solutions.map((solution, index) => (
                  <TabsTrigger key={solution.id} value={solution.id}>
                    {solution.language} #{index + 1}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="main" className="space-y-4">
                {question.solution_code ? (
                  <div className="relative">
                    <pre className="rounded-md border border-border bg-muted/40 p-4 text-sm overflow-x-auto">
                      <code>{question.solution_code}</code>
                    </pre>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No solution code added yet</p>
                )}
              </TabsContent>

              {solutions.map((solution) => (
                <TabsContent key={solution.id} value={solution.id} className="space-y-4">
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSolution(solution.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                  <div className="relative">
                    <pre className="rounded-md border border-border bg-muted/40 p-4 text-sm overflow-x-auto">
                      <code>{solution.solution_code}</code>
                    </pre>
                  </div>
                  {solution.notes && (
                    <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                      <strong>Notes:</strong> {solution.notes}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionDetail;
