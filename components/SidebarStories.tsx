"use client";
import { motion } from "framer-motion";
import { Umbrella, AlertTriangle, Sun, Flame, Coffee } from "lucide-react";
import { WeatherStory } from "@/data/types";

interface SidebarStoriesProps {
  stories: WeatherStory[];
}

export default function SidebarStories({ stories }: SidebarStoriesProps) {
  const getIcon = (title: string) => {
     if (title.includes("Umbrella")) return <Umbrella className="w-5 h-5" />;
     if (title.includes("Tram")) return <AlertTriangle className="w-5 h-5" />;
     if (title.includes("Beach")) return <Sun className="w-5 h-5" />;
     if (title.includes("Sunburn")) return <Flame className="w-5 h-5" />;
     if (title.includes("Coffee")) return <Coffee className="w-5 h-5" />;
     return <Sun className="w-5 h-5" />;
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 h-full">
      <h3 className="text-xl font-bold text-slate-800 mb-8">Melbourne Stories</h3>
      <div className="space-y-8">
        {stories.map((story, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-600 font-medium">
                <div className={`p-2 rounded-full bg-slate-50 ${story.color.replace("bg-", "text-")}`}>
                   {getIcon(story.title)}
                </div>
                <span>{story.title}</span>
              </div>
              <span className={`font-bold ${story.color.replace("bg-", "text-")}`}>{story.value}</span>
            </div>
            
            {story.type === "bar" && (
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: story.value.includes("/") ? `${Math.min(100, (parseInt(story.value.split("/")[0]) / parseInt(story.value.split("/")[1])) * 100)}%` : "0%" }}
                  transition={{ delay: 1, duration: 1.5, type: "spring" }}
                  className={`h-full rounded-full ${story.color}`}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-10 p-4 bg-slate-50 rounded-2xl text-sm text-slate-500 italic text-center border border-slate-100"
      >
         &quot;If you don&apos;t like the weather, just wait 5 minutes.&quot;
      </motion.div>
    </div>
  );
}

