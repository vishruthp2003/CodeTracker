-- Add notes field to coding_questions table
ALTER TABLE public.coding_questions 
ADD COLUMN notes TEXT;

-- Add last_solved_at field to track when questions were completed
ALTER TABLE public.coding_questions 
ADD COLUMN last_solved_at TIMESTAMP WITH TIME ZONE;

-- Create solutions table to support multiple solutions per question
CREATE TABLE public.question_solutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.coding_questions(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  solution_code TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.question_solutions ENABLE ROW LEVEL SECURITY;

-- Create policies for solutions (users can only access solutions for their own questions)
CREATE POLICY "Users can view solutions for their questions" 
ON public.question_solutions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.coding_questions 
    WHERE coding_questions.id = question_solutions.question_id 
    AND coding_questions.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert solutions for their questions" 
ON public.question_solutions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.coding_questions 
    WHERE coding_questions.id = question_solutions.question_id 
    AND coding_questions.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update solutions for their questions" 
ON public.question_solutions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.coding_questions 
    WHERE coding_questions.id = question_solutions.question_id 
    AND coding_questions.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete solutions for their questions" 
ON public.question_solutions 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.coding_questions 
    WHERE coding_questions.id = question_solutions.question_id 
    AND coding_questions.user_id = auth.uid()
  )
);

-- Add trigger for automatic timestamp updates on solutions
CREATE TRIGGER update_question_solutions_updated_at
BEFORE UPDATE ON public.question_solutions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add fields to profiles table for user customization
ALTER TABLE public.profiles 
ADD COLUMN avatar_url TEXT,
ADD COLUMN bio TEXT,
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Add trigger for automatic timestamp updates on profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();