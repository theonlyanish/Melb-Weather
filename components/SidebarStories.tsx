"use client";
import { motion } from "framer-motion";
import { Umbrella, AlertTriangle, Sun, Flame, Coffee, Droplets, CloudLightning, Waves, Sparkles, Shell, Thermometer } from "lucide-react";
import { WeatherStory } from "@/data/types";

interface SidebarStoriesProps {
  stories: WeatherStory[];
  cityName?: string;
}

export default function SidebarStories({ stories, cityName = "Melbourne" }: SidebarStoriesProps) {
  const getIcon = (title: string) => {
     if (title.includes("Umbrella")) return <Umbrella className="w-5 h-5" />;
     if (title.includes("Tram")) return <AlertTriangle className="w-5 h-5" />;
     if (title.includes("Beach")) return <Sun className="w-5 h-5" />;
     if (title.includes("Sunburn") || title.includes("UV")) return <Flame className="w-5 h-5" />;
     if (title.includes("Coffee")) return <Coffee className="w-5 h-5" />;
     if (title.includes("Humidity")) return <Droplets className="w-5 h-5" />;
     if (title.includes("Storm")) return <CloudLightning className="w-5 h-5" />;
     if (title.includes("River")) return <Waves className="w-5 h-5" />;
     if (title.includes("Aurora")) return <Sparkles className="w-5 h-5" />;
     if (title.includes("Fireplace")) return <Flame className="w-5 h-5" />;
     if (title.includes("Oyster")) return <Shell className="w-5 h-5" />;
     return <Thermometer className="w-5 h-5" />;
  };

  return (
    <div className="bg-white/80 dark:bg-[#15161E] backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-white/5 h-full transition-colors duration-500">
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-8 font-display">{cityName} Stories</h3>
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
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-medium font-sans">
                <div className={`p-2 rounded-full ${story.color.replace("bg-", "text-").replace("500", "600")} bg-opacity-10 dark:bg-opacity-20`}>
                   {getIcon(story.title)}
                </div>
                <span>{story.title}</span>
              </div>
              <span className={`font-bold ${story.color.replace("bg-", "text-")}`}>{story.value}</span>
            </div>
            
            {story.type === "bar" && (
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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
        className="mt-10 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-sm text-slate-500 dark:text-slate-400 italic text-center border border-slate-100 dark:border-slate-800"
      >
         &quot;If you don&apos;t like the weather, just wait 5 minutes.&quot;
      </motion.div>
    </div>
  );
}

