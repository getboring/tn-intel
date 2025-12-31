import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

export async function POST(
  request: Request,
  { params }: { params: { source: string } }
) {
  const { source } = params;

  // Validate source
  if (source !== "weather") {
    return NextResponse.json(
      { error: "Unknown data source" },
      { status: 400 }
    );
  }

  // Check if service key is configured
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json(
      { error: "Server not configured for manual sync" },
      { status: 500 }
    );
  }

  try {
    // Call the Supabase Edge Function
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/sync-weather`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ triggered_by: "manual" }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Sync failed:", text);
      return NextResponse.json(
        { error: "Sync failed", details: text },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Failed to trigger sync" },
      { status: 500 }
    );
  }
}
