import { useState, useEffect } from "react";

export function useLocationPhoto(placeId: string | null, fallbackUrl: string) {
  const [photoUrl, setPhotoUrl] = useState(fallbackUrl);

  useEffect(() => {
    if (!placeId) return;

    const fetchPhoto = async () => {
      try {
        const response = await fetch(`/api/places/photo?placeId=${placeId}`);
        const data = await response.json();
        if (data.photoUrl) {
          setPhotoUrl(data.photoUrl);
        }
      } catch (error) {
        console.error("Error fetching photo:", error);
        setPhotoUrl(fallbackUrl);
      }
    };

    fetchPhoto();
  }, [placeId, fallbackUrl]);

  return photoUrl;
}
