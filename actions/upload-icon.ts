"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const uploadIcon = async (result: any) => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    // Get the secure URL from the Cloudinary response
    const imageUrl = result?.info?.secure_url;
    if (!imageUrl) {
      return { error: "No image URL provided" };
    }

    // Add Cloudinary transformations for avatar optimization
    const optimizedImageUrl = imageUrl.replace(
      "/upload/",
      "/upload/c_fill,w_200,h_200,g_face/"
    );

    // Update user profile with optimized image URL
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { image: optimizedImageUrl },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/member");

    return {
      success: "Profile image updated successfully!",
      user: updatedUser,
      imageUrl: optimizedImageUrl,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return { error: "Failed to update profile image" };
  }
};
