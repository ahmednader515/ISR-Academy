import { NextResponse } from "next/server";
import { getCategories } from "@/lib/db";

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("API categories:", error);
    return NextResponse.json(
      { error: "فشل جلب التصنيفات" },
      { status: 500 }
    );
  }
}
