import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { id, fileUrl } = await req.json();

    const path = fileUrl.split("/").pop();

    if (!path) {
      return NextResponse.json(
        { error: "Percorso non valido" },
        { status: 400 }
      );
    }

    const { error: storageError } =
      await supabase.storage
        .from("wedding-gallery")
        .remove([path]);

   if (storageError) {
  console.error("Errore Storage:", storageError);

  return NextResponse.json(
    {
      error: storageError.message,
    },
    { status: 500 }
  );
}

    const { error: dbError } =
      await supabase
        .from("media")
        .delete()
        .eq("id", id);

    if (dbError) {
      throw dbError;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Errore eliminazione" },
      { status: 500 }
    );
  }
}