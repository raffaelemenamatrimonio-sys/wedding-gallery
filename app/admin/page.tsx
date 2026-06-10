"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../src/lib/supabase";

type MediaItem = {
  id: string;
  file_url: string;
  file_type: "image" | "video";
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);

  useEffect(() => {
    if (authenticated) {
      fetchMedia();
    }
  }, [authenticated]);

  async function fetchMedia() {
    const { data, error } = await supabase
      .from("media")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setMedia(data || []);
  }

  function handleLogin() {
    if (password === "rm100817") {
      setAuthenticated(true);
    } else {
      alert("Password errata");
    }
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[#F8F5EF] flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-serif text-[#0F4C5C] text-center mb-6">
            Area Admin
          </h1>

          <input
            type="password"
            placeholder="Inserisci la password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 mb-4"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-[#0F4C5C] text-white py-3 rounded-xl"
          >
            Accedi
          </button>
        </div>
      </main>
    );
  }

async function handleDelete(
  id: string,
  fileUrl: string
) {
  const confirmed = window.confirm(
    "Sei sicuro di voler eliminare questo ricordo?"
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      "/api/admin/delete",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          id,
          fileUrl,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error(result);
      alert(
        result.error ||
        "Errore durante l'eliminazione."
      );
      return;
    }

  
    alert("Ricordo eliminato.");

    fetchMedia();
  } catch (error) {
    console.error(error);

    alert(
      "Errore durante l'eliminazione."
    );
  }
}




  return (
    <main className="min-h-screen bg-[#F8F5EF] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-serif text-[#0F4C5C] text-center mb-4">
          Area Admin
        </h1>

        <p className="text-center text-[#C9A227] mb-10">
          {media.length} ricordi caricati
        </p>

        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="break-inside-avoid bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              {item.file_type === "image" ? (
                <img
                  src={item.file_url}
                  alt=""
                  className="w-full"
                />
              ) : (
                <video controls className="w-full">
                  <source src={item.file_url} />
                </video>
              )}

<div className="p-4 space-y-2">
  <a
    href={item.file_url}
    download
    target="_blank"
    rel="noopener noreferrer"
    className="block w-full text-center bg-[#C9A227] text-white py-2 rounded-xl"
  >
    ⬇️ Scarica
  </a>

  <button
    onClick={() =>
      handleDelete(
        item.id,
        item.file_url
      )
    }
    className="
      w-full
      bg-red-600
      text-white
      py-2
      rounded-xl
      hover:bg-red-700
      transition
    "
  >
    🗑️ Elimina
  </button>
</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
