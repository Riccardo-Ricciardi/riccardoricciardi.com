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
};

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    }
  }, [isMounted]);

  if (!isMounted) return null;

  return (
    <div style={{ width: "clamp(0px, 80%, 1200px)", margin: "0 auto" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
          gap: "16px",
          width: "100%",
        }}
      >
        {skills.map(({ id, name }) => (
          <div
            key={id}
            style={{
              position: "relative",
              width: "100%",
              paddingTop: "100%",
            }}
          >
            <Image
              src={`${BASE_URL}/${name}.png`}
              alt={name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 16vw, 100px"
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
        ))}
      </div>
    </div>
  );
}
