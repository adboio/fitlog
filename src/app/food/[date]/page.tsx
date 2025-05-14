"use client";

import { supabase } from "@/lib/supabaseClient";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { PostgrestError } from '@supabase/supabase-js';
import { MacroProgressSection } from "@/components/ui/MacroProgressSection";

type Params = Promise<{ date: string }>

type FoodEntry = { description: string; calories: number; protein: number; carbs: number; fat: number };

export default function FoodLogPage(props: { params: Params }) {
  const [data, setData] = useState<FoodEntry | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    (async () => {
      const params = await props.params;
      setDate(params.date);
      const { data, error } = await supabase
        .from("food")
        .select("description, calories, protein, carbs, fat")
        .eq("date", params.date)
        .single();
      setData(data || null);
      setError(error);
      setLoading(false);
    })();
  }, [props.params]);

  if (loading) return <div className="p-8 max-w-xl mx-auto">Loading...</div>;
  if (error || !data || !data.description) {
    return <div className="p-8 max-w-xl mx-auto">No food log found</div>;
  }

  return (
    <div className="p-8 max-w-xl mx-auto food-log workout">
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
      >
        ← Back
      </button>
      <h1 className="text-2xl font-bold mb-4">Food Log for {date}</h1>
      <div className="prose dark:prose-invert">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.description}</ReactMarkdown>
      </div>
      <MacroProgressSection entry={data} className="mb-8" />
    </div>
  );
} 