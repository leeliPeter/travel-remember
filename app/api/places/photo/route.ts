import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("placeId");

  if (!placeId) {
    return NextResponse.json(
      { error: "Place ID is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();

    if (!data.result?.photos?.[0]?.photo_reference) {
      return NextResponse.json({ photoUrl: "/images/emptyImage.jpg" });
    }

    const photoReference = data.result.photos[0].photo_reference;
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    return NextResponse.json({ photoUrl });
  } catch (error) {
    console.error("Error fetching photo:", error);
    return NextResponse.json({ photoUrl: "/images/emptyImage.jpg" });
  }
}
