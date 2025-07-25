"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useLoadingManager } from "@/components/loadingManager";

const supabase = createClient();
const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_IMAGE_URL ?? "";

type Skill = {
  id: number;
  name: string;
  position: number;
  percentage: number;
  dark: boolean;
};

export default function Skills({ language }: { language: string }) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const { theme } = useTheme();
  const { registerLoader, hideLoader } = useLoadingManager();

  useEffect(() => {
    async function fetchSkills() {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .order("position", { ascending: true });

      if (error) {
        console.error("Errore nel recupero skills:", error);
      } else {
        setSkills(data ?? []);
        if (data && data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            registerLoader();
          }
        }
      }
    }

    fetchSkills();
  }, [registerLoader]);

  return (
    <div style={{ width: "clamp(0px, 80%, 1200px)", margin: "0 auto" }}>
      <h1 className="text-4xl font-bold my-6 text-card-foreground">
        {language === "it" ? "Le mie Competenze" : "My Skills"}
      </h1>

      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(80px,1fr))]">
        {skills.map(({ id, name, percentage, dark }) => {
          const exactSegments = (percentage / 100) * 4;
          const filledSegments = Math.floor(exactSegments);
          const partialFill = exactSegments - filledSegments;

          const imageUrl = `${BASE_URL}/${name}${
            dark && theme === "dark" ? "-dark" : ""
          }.png`;

          return (
            <div
              key={id}
              className="group relative rounded-lg border border-grid p-3 text-center bg-background"
            >
              <div className="relative w-full pt-[75%]">
                <Image
                  src={imageUrl}
                  alt={name}
                  fill
                  sizes="(max-width: 768px) 30vw, (max-width: 1200px) 10vw, 80px"
                  className="object-contain"
                  priority
                  onLoad={() => {
                    hideLoader();
                  }}
                />
              </div>

              <p className="mt-2 mb-1 text-xs font-medium text-primary">
                {name}
              </p>

              <div className="flex gap-x-[2px] justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded overflow-hidden">
                {Array.from({ length: 4 }).map((_, i) => {
                  let overlayWidth = 0;
                  if (i < filledSegments) overlayWidth = 100;
                  else if (i === filledSegments)
                    overlayWidth = partialFill * 100;

                  const partialGradient =
                    overlayWidth > 0 && overlayWidth < 100
                      ? `linear-gradient(to right, #1e40af ${overlayWidth}%, transparent ${overlayWidth}%)`
                      : "none";

                  return (
                    <div
                      key={i}
                      className="flex-1 h-1 relative rounded bg-blue-300"
                      style={{
                        backgroundColor: "#93c5fd",
                        backgroundImage:
                          overlayWidth === 100 ? "none" : partialGradient,
                        transition: "background-image 0.3s ease",
                        ...(overlayWidth === 100 && {
                          backgroundColor: "#1e40af",
                          backgroundImage: "none",
                        }),
                      }}
                    />
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
