import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    // Log configuration for debugging
    console.log("Cloudinary Config:", {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key_exists: !!process.env.CLOUDINARY_API_KEY,
      api_secret_exists: !!process.env.CLOUDINARY_API_SECRET,
    });

    // Test upload
    const result = await cloudinary.uploader.upload(
      "https://picsum.photos/200/300",
      {
        folder: "travel-icon",
        public_id: `test-${Date.now()}`,
      }
    );

    return NextResponse.json({
      success: true,
      url: result.secure_url,
    });
  } catch (error: any) {
    console.error("Cloudinary Error:", {
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: "Upload test failed",
        details: error.message,
        config: {
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key_exists: !!process.env.CLOUDINARY_API_KEY,
          api_secret_exists: !!process.env.CLOUDINARY_API_SECRET,
        },
      },
      { status: 500 }
    );
  }
}
