"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

const supabase = createClient();
const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_IMAGE_URL;

type Skill = {
  id: number;
  name: string;
  position: number;
  percentage: number;
};

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    async function fetchSkills() {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .order("position", { ascending: true });
      if (error) {
        console.error("Errore nel recupero skills:", error);
      } else {
        setSkills(data || []);
      }
    }

    if (isMounted) {
      fetchSkills();
    } else {
      setIsMounted(true);
    }
  }, [isMounted]);

  if (!isMounted) return null;

  return (
    <div style={{ width: "clamp(0px, 80%, 1200px)", margin: "0 auto" }}>
      <h1 className="text-4xl font-bold my-6 text-card-foreground">
        My Skills
      </h1>
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(80px,1fr))]">
        {skills.map(({ id, name, percentage }) => {
          const exactSegments = (percentage / 100) * 4;
          const filledSegments = Math.floor(exactSegments);
          const partialFill = exactSegments - filledSegments;

          return (
            <div
              key={id}
              className="bg-white group relative rounded-lg border border-grid bg-card p-3 text-center"
            >
              <div className="relative w-full pt-[75%]">
                <Image
                  src={`${BASE_URL}/${name}.png`}
                  alt={name}
                  fill
                  sizes="(max-width: 768px) 30vw, (max-width: 1200px) 10vw, 80px"
                  className="object-contain"
                  priority
                />
              </div>

              <p className="mt-2 mb-1 text-xs font-medium text-muted-foreground">
                {name}
              </p>

              <div className="flex gap-x-[2px] justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {Array.from({ length: 4 }).map((_, i) => {
                  let overlayWidth = 0;
                  if (i < filledSegments) {
                    overlayWidth = 100;
                  } else if (i === filledSegments) {
                    overlayWidth = partialFill * 100;
                  }

                  return (
                    <div
                      key={i}
                      className="flex-1 h-1 rounded bg-blue-300 relative overflow-hidden"
                    >
                      {overlayWidth > 0 && (
                        <div
                          className="absolute top-0 left-0 h-full bg-blue-800 rounded transition-all duration-300"
                          style={{ width: `${overlayWidth}%` }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
