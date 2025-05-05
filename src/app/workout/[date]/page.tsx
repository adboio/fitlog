import { supabase } from "@/lib/supabaseClient";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface WorkoutPageProps {
  params: { date: string };
}

export default async function WorkoutPage({ params }: WorkoutPageProps) {
  const { date } = params;
  const { data, error } = await supabase
    .from("workouts")
    .select("title, description")
    .eq("date", date);

  if (error || !data || data.length === 0) {
    return <div className="p-8 max-w-xl mx-auto">Workout not found</div>;
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Workouts for {date}</h1>
      {data.map((workout: { title: string; description: string }, idx: number) => (
        <div key={idx} className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{workout.title}</h2>
          <div className="">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{workout.description}</ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );
} 