"use client";

import { supabase } from "@/lib/supabaseClient";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Params = Promise<{ date: string }>


export default function WorkoutPageWrapper(props: { params: Params }) {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    (async () => {
      const params = await props.params;
      setDate(params.date);
      const { data, error } = await supabase
        .from("workouts")
        .select("title, description")
        .eq("date", params.date);
      setData(data || []);
      setError(error);
      setLoading(false);
    })();
  }, [props.params]);

  if (loading) return <div className="p-8 max-w-xl mx-auto">Loading...</div>;
  if (error || !data || data.length === 0) {
    return <div className="p-8 max-w-xl mx-auto">Workout not found</div>;
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
      >
        ← Back
      </button>
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