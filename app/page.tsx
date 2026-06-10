"use client";

import { useRef, useState, useEffect } from "react";
import { supabase } from "../src/lib/supabase";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

type MediaItem = {
  id: string;
  file_url: string;
  file_type: "image" | "video";
  preferred?: boolean;
};

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [favoriteImages, setFavoriteImages] = useState<MediaItem[]>([]);
const [currentFavorite, setCurrentFavorite] = useState(0);

  const [uploading, setUploading] = useState(false);
  const [showThankYou, setShowThankYou] =
  useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [open, setOpen] = useState(false);
const [index, setIndex] = useState(0);
const [selectedVideo, setSelectedVideo] =
  useState<string | null>(null);

  useEffect(() => {
    fetchMedia();
  }, []);
  useEffect(() => {
  if (favoriteImages.length <= 1) return;

  const interval = setInterval(() => {
    setCurrentFavorite((prev) =>
      (prev + 1) %
      favoriteImages.length
    );
  }, 5000);

  return () => clearInterval(interval);
}, [favoriteImages]);

 async function fetchMedia() {
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Errore recupero media:", error);
    return;
  }

 setMedia(data || []);

const favorites =
  (data || []).filter(
    (item) =>
      item.file_type === "image" &&
      item.preferred
  );

setFavoriteImages(favorites);
}

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;

    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const fileName = `${Date.now()}-${file.name}`;

        // Upload su Supabase Storage
        const { data, error } = await supabase.storage
          .from("wedding-gallery")
          .upload(fileName, file);

        if (error) {
          console.error("Errore upload:", error);
          continue;
        }

        // Recupera URL pubblica
        const {
          data: { publicUrl },
        } = supabase.storage
          .from("wedding-gallery")
          .getPublicUrl(data.path);

        // Salva nel database
        const { error: dbError } = await supabase
          .from("media")
          .insert({
            file_url: publicUrl,
            file_type: file.type.startsWith("video")
              ? "video"
              : "image",
            uploader_name: "Invitato",
          });

        if (dbError) {
          console.error(
            "Errore inserimento database:",
            dbError
          );
        }
      }

      await fetchMedia();

      setShowThankYou(true);

setTimeout(() => {
  setShowThankYou(false);
}, 5000);
    } catch (err) {
      console.error(err);
     console.error(
  "Errore durante il caricamento."
);
    }

    setUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const imageMedia = media.filter(
  (item) => item.file_type === "image"
);
const videoMedia = media.filter(
  (item) => item.file_type === "video"
);

const slides = imageMedia.map((item) => ({
  src: item.file_url,
}));

  return (
  <main className="min-h-screen bg-[#F8F5EF]">
    {/* HERO */}
    <section className="relative h-[80vh]">
      <img
        src="/coppia.jpg"
        alt="Raffaele e Filomena"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <h1 className="text-white text-5xl md:text-7xl font-serif mb-4">
          Raffaele & Filomena
        </h1>

        <div className="w-24 h-[2px] bg-[#C9A227] mb-6" />

        <p className="text-[#F5E6A9] text-xl mb-4">
          24 Ottobre 2026
        </p>

        <p className="text-white max-w-2xl text-lg mb-10">
          Ogni sorriso, ogni abbraccio e ogni momento speciale meritano di essere ricordati.
          Aiutateci a rivivere questa giornata attraverso i vostri occhi.
        </p>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-[#0F4C5C] hover:opacity-90 text-white px-8 py-4 rounded-xl transition"
        >
          {uploading
  ? "✨ Stiamo salvando i vostri ricordi..."
  : "📸 Condividi i tuoi ricordi"}
        </button>

        <input
  ref={fileInputRef}
  type="file"
  accept="image/*,video/*"
  multiple
  className="hidden"
  onChange={handleUpload}
/>

{showThankYou && (
  <div className="mt-6 max-w-lg bg-white/90 backdrop-blur rounded-2xl p-6 shadow-xl">
    <p className="text-[#0F4C5C] text-lg font-serif">
      ❤️ Grazie per aver condiviso
      questo momento speciale con noi.
    </p>

    <p className="text-gray-600 mt-2">
      I vostri ricordi renderanno
      questa giornata ancora più
      indimenticabile.
    </p>
  </div>
)}

</div>
</section>

    <div className="max-w-6xl mx-auto p-8">
      {favoriteImages.length > 0 && (
  <section className="mb-16">
    <h2 className="text-4xl font-serif text-[#0F4C5C] text-center mb-4">
      ✨ I nostri momenti preferiti ✨
    </h2>

    <p className="text-center text-[#C9A227] mb-10">
      Alcuni dei ricordi che ci hanno emozionato di più.
    </p>

    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
      <img
        src={
          favoriteImages[currentFavorite]
            .file_url
        }
        alt="Momento speciale"
        className="
          w-full
          h-[500px]
          object-cover
        "
      />
    </div>

    <div className="flex justify-center gap-2 mt-6">
      {favoriteImages.map((_, i) => (
        <button
          key={i}
          onClick={() =>
            setCurrentFavorite(i)
          }
          className={`
            w-3
            h-3
            rounded-full
            transition
            ${
              i === currentFavorite
                ? "bg-[#C9A227]"
                : "bg-gray-300"
            }
          `}
        />
      ))}
    </div>
  </section>
)}
        
        {/* GALLERIA */}
        <section>
          <h2 className="text-4xl font-serif text-[#0F4C5C] text-center mb-4">
            I ricordi del nostro giorno ❤️
          </h2>

          <p className="text-center text-[#C9A227] mb-10">
  📸 {imageMedia.length} foto • 🎥 {videoMedia.length} video
</p>

          {media.length === 0 ? (
            <p className="text-center text-gray-500">
              Nessun ricordo condiviso ancora.
              Sii il primo a caricare una foto! 📸
            </p>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {media.map((item) => (
                <div
                  key={item.id}
                  className="break-inside-avoid overflow-hidden rounded-2xl shadow-lg bg-white"
                >
               {item.file_type === "image" ? (
  <img
    src={item.file_url}
    alt="Ricordo del matrimonio"
    className="w-full cursor-pointer"
    onClick={() => {
      const imageIndex = imageMedia.findIndex(
        (img) => img.id === item.id
      );

      setIndex(imageIndex);
      setOpen(true);
    }}
  />
) : (
  <div
    className="cursor-pointer relative"
    onClick={() =>
      setSelectedVideo(item.file_url)
    }
  >
    <video className="w-full">
      <source src={item.file_url} />
    </video>

    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
      <div className="bg-white/80 rounded-full p-4 text-2xl">
        ▶️
      </div>
    </div>
  </div>
)}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <Lightbox
  open={open}
  close={() => setOpen(false)}
  slides={slides}
  index={index}
/>
{selectedVideo && (
  <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
    <button
      onClick={() =>
        setSelectedVideo(null)
      }
      className="
        absolute
        top-6
        right-6
        text-white
        text-4xl
      "
    >
      ✕
    </button>

    <video
      controls
      autoPlay
      className="
        max-h-[90vh]
        max-w-[90vw]
        rounded-2xl
      "
    >
      <source src={selectedVideo} />
    </video>
  </div>
)}
    </main>
  );
}
