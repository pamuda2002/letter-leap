"use server";

import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";

export async function seedWordsDatabase() {
  try {
    const filePath = path.join(process.cwd(), "data", "words.txt");
    const fileContent = await fs.readFile(filePath, "utf-8");

    // Clean text (trim, lowercase, split by lines)
    const rawWords = fileContent.split(/\r?\n/);
    const validWords = new Set<string>();

    for (const raw of rawWords) {
      const cleanWord = raw.trim().toLowerCase();
      // Ensure it only contains typical English alphabet letters for spelling words
      if (cleanWord && /^[a-z]+$/.test(cleanWord)) {
        validWords.add(cleanWord);
      }
    }

    const wordsData = Array.from(validWords).map((word) => ({
      text: word,
    }));

    if (wordsData.length === 0) {
      return { success: false, message: "No valid alphabetical words found in file." };
    }

    // Insert to DB using skipDuplicates. (The text field is marked @unique)
    const result = await prisma.word.createMany({
      data: wordsData,
      skipDuplicates: true,
    });

    return { 
      success: true, 
      message: `Seed complete! Processed ${wordsData.length} unique words. Inserted ${result.count} new words into the database (duplicates were skipped).` 
    };

  } catch (error: any) {
    console.error("Failed to seed words:", error);
    return { success: false, message: error?.message || "An unknown error occurred while trying to seed." };
  }
}
