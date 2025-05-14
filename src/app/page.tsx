'use client'

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { useRouter } from "next/navigation";
import { MacroProgressSection } from "@/components/ui/MacroProgressSection";

// Explicit type for weight data
interface WeightEntry {
  date: string;
  weight: number;
}

interface WorkoutEntry {
  date: string;
  title?: string;
  description?: string;
}

// Add type for food/macro data
interface FoodEntry {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description?: string;
}

export default function Home() {
  const [weightData, setWeightData] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [workoutData, setWorkoutData] = useState<WorkoutEntry[]>([]);
  const [workoutLoading, setWorkoutLoading] = useState(true);
  const [foodData, setFoodData] = useState<FoodEntry[]>([]);
  const [foodLoading, setFoodLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchWeight() {
      console.log("fetching weight");
      setLoading(true);
      const { data, error } = await supabase
        .from("weight")
        .select("date, weight_value")
        .order("date", { ascending: true });
      if (!error && data) {
        setWeightData(
          data.map((row) => ({
            date: row.date,
            weight: row.weight_value,
          }))
        );
      }
      setLoading(false);
    }
    fetchWeight();
  }, []);

  useEffect(() => {
    async function fetchWorkouts() {
      setWorkoutLoading(true);
      const { data, error } = await supabase
        .from("workouts")
        .select("date, title, description");
      if (!error && data) {
        setWorkoutData(data);
        console.log('Fetched workoutData:', data);
      }
      setWorkoutLoading(false);
    }
    fetchWorkouts();
  }, []);

  // Fetch food/macro data
  useEffect(() => {
    async function fetchFood() {
      setFoodLoading(true);
      const { data, error } = await supabase
        .from("food")
        .select("date, calories, protein, carbs, fat, description")
        .order("date", { ascending: true });
      if (!error && data) {
        setFoodData(
          data.map((row) => ({
            date: row.date,
            calories: row.calories ?? 0,
            protein: row.protein ?? 0,
            carbs: row.carbs ?? 0,
            fat: row.fat ?? 0,
            description: row.description,
          }))
        );
      }
      setFoodLoading(false);
    }
    fetchFood();
  }, []);

  // Prepare data for react-calendar-heatmap
  const heatmapValues = workoutData.map(w => ({
    date: w.date,
    count: 1,
    title: w.title,
    description: w.description,
  }));
  console.log('Mapped heatmapValues:', heatmapValues);

  // Set the start date for the heatmap (last 3 months)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(endDate.getMonth() - 3);

  // Macro targets
  const macroTargets = {
    calories: 2361,
    protein: 225,
    carbs: 201,
    fat: 73,
  };

  // Find the latest entry with non-zero calories
  const sortedFood = [...foodData]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestEntry = sortedFood.find(f => f.calories && f.calories !== 0);
  const latestDateStr = latestEntry?.date ?? '';

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    // Get date in PT for each day
    return d.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
  });
  const trendData = last7Days.map(date => {
    const entry = foodData.find(f => f.date === date);
    return {
      date,
      calories: entry?.calories ?? 0,
      protein: entry?.protein ?? 0,
      carbs: entry?.carbs ?? 0,
      fat: entry?.fat ?? 0,
    };
  });

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-white dark:bg-black">
      <div className="w-full flex justify-start">
        <a
          href="https://adboio.fit"
          rel="noopener noreferrer"
          className="mb-4 px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
        >
          ← Back to adboio.fit
        </a>
      </div>
      <main className="flex flex-col gap-8 items-center max-w-4xl w-full">
        <div className="flex flex-col gap-2 items-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-center">adboio.fit/log</h1>
          <h2 className="text-2xl text-center text-gray-700 dark:text-gray-300">open source fitness data</h2>
        </div>
        <div className="w-full mt-8">
          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            {/* Weight Chart */}
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2 text-center">Weight</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-2">current target: 225 lb</p>
              {loading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : (
                <ChartContainer config={{ weight: { label: "Weight", color: "#6366f1" } }}>
                  <LineChart data={weightData} width={400} height={250} margin={{ top: 16, right: 16, left: 0, bottom: 16 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="weight" stroke="#6366f1" dot={true} />
                  </LineChart>
                </ChartContainer>
              )}
            </div>
            {/* Workout Heatmap */}
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2 text-center">Workout Days</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-2">click 🟩 to view workout</p>
              {workoutLoading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <CalendarHeatmap
                    startDate={startDate}
                    endDate={endDate}
                    values={heatmapValues}
                    classForValue={(value: { date: string; count: number; title?: string; description?: string } | undefined) => {
                      if (!value || value.count === 0) {
                        return "color-empty";
                      }
                      return "color-filled";
                    }}
                    showWeekdayLabels={true}
                    onClick={(value: { date: string; count: number; title?: string; description?: string } | undefined) => {
                      if (value && value.date) {
                        router.push(`/workout/${value.date}`);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-full">
          <h3 className="text-xl font-semibold mb-2 text-center">Daily Macros</h3>
          {foodLoading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Progress bars for today */}
              <div className="flex flex-col gap-2 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="font-medium text-center mb-2 flex items-center justify-center gap-2">
                  <span>Latest Entry{latestDateStr ? ` (${latestDateStr})` : ''}</span>
                  {latestEntry && (
                    <button
                      type="button"
                      aria-label="View food log for this day"
                      onClick={() => router.push(`/food/${latestEntry.date}`)}
                      className="ml-1 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors hover:cursor-pointer"
                    >
                      <svg fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 inline-block align-middle">
                        <path d="M14.5 13.5V5.41a1 1 0 0 0-.3-.7L9.8.29A1 1 0 0 0 9.08 0H1.5v13.5A2.5 2.5 0 0 0 4 16h8a2.5 2.5 0 0 0 2.5-2.5m-1.5 0v-7H8v-5H3v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1M9.5 5V2.12L12.38 5zM5.13 5h-.62v1.25h2.12V5zm-.62 3h7.12v1.25H4.5zm.62 3h-.62v1.25h7.12V11z" clipRule="evenodd" fill="#666" fillRule="evenodd"/>
                      </svg>
                    </button>
                  )}
                </div>
                {latestEntry ? (
                  <MacroProgressSection entry={latestEntry} />
                ) : (
                  <div className="text-center text-gray-400">No food entries found</div>
                )}
              </div>
              {/* 7-day trend line chart */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="font-medium text-center mb-2">7-Day Macro Trend</div>
                <ChartContainer config={{
                  calories: { label: "Calories", color: "#f59e42" },
                  protein: { label: "Protein", color: "#60a5fa" },
                  carbs: { label: "Carbs", color: "#34d399" },
                  fat: { label: "Fat", color: "#f472b6" },
                }}>
                  <LineChart data={trendData} width={400} height={250} margin={{ top: 16, right: 16, left: 0, bottom: 16 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="calories" stroke="#f59e42" dot={false} />
                    <Line type="monotone" dataKey="protein" stroke="#60a5fa" dot={false} />
                    <Line type="monotone" dataKey="carbs" stroke="#34d399" dot={false} />
                    <Line type="monotone" dataKey="fat" stroke="#f472b6" dot={false} />
                  </LineChart>
                </ChartContainer>
              </div>
              {/* Last 10 food entries table */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mt-4">
                <div className="font-medium text-center mb-2">Last 10 Food Entries</div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-2">click a row to view what i ate that day</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                        <th className="py-1 px-2 font-semibold">Date</th>
                        <th className="py-1 px-2 font-semibold">Calories</th>
                        <th className="py-1 px-2 font-semibold">Protein</th>
                        <th className="py-1 px-2 font-semibold">Carbs</th>
                        <th className="py-1 px-2 font-semibold">Fat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedFood.slice(0, 10).map(entry => (
                        <tr
                          key={entry.date}
                          className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                          onClick={() => router.push(`/food/${entry.date}`)}
                        >
                          <td className="py-1 px-2 font-mono">{entry.date}</td>
                          <td className="py-1 px-2">{entry.calories}</td>
                          <td className="py-1 px-2">{entry.protein}</td>
                          <td className="py-1 px-2">{entry.carbs}</td>
                          <td className="py-1 px-2">{entry.fat}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <footer className="mt-16 text-sm text-gray-400 dark:text-gray-600">
        &copy; {new Date().getFullYear()} adboio.fit
      </footer>
    </div>
  );
}
