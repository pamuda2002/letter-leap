"use server";

import { prisma } from "@/lib/db";

// ─── Timezone Constants ─────────────────────────────────────────────────────
// Asia/Colombo is UTC+5:30 = 330 minutes
const TZ_OFFSET_MINUTES = 5 * 60 + 30; // 330

/**
 * Get the current time as it would appear on a clock in Sri Lanka.
 * Returns a Date object whose UTC methods reflect Sri Lanka local time values.
 * 
 * e.g. If it's 2026-03-19T14:30:00Z (UTC), this returns a Date object
 * where getUTCHours() = 20, getUTCDate() = 19, matching 8:00 PM Sri Lanka.
 * 
 * This is used solely for "what day/time is it in Sri Lanka right now?" logic.
 */
function getNowInSriLanka(): Date {
  const now = new Date();
  return new Date(now.getTime() + TZ_OFFSET_MINUTES * 60 * 1000);
}

/**
 * Standardize a date to 01:30:00.000 Sri Lanka time on the given day.
 * Since 01:30 AM in UTC+5:30 = 20:00:00 UTC on the previous day,
 * the returned Date is the correct UTC instant.
 * 
 * @param refDate — a "virtual local" Date (from getNowInSriLanka or similar)
 *   whose UTC fields represent the Sri Lanka calendar date to target.
 */
function standardizeToRolloverTime(refDate: Date): Date {
  // We want: <refDate's UTC year/month/day> at 01:30 AM Sri Lanka
  // 01:30 Sri Lanka = 01:30 - 05:30 = 20:00 UTC on the PREVIOUS calendar day
  const year = refDate.getUTCFullYear();
  const month = refDate.getUTCMonth();
  const day = refDate.getUTCDate();

  // Build 1:30 AM "local" as a UTC timestamp, then subtract the offset
  // to get the true UTC instant.
  // local 01:30:00 on that day => UTC = local - offset
  return new Date(Date.UTC(year, month, day, 1, 30, 0, 0) - TZ_OFFSET_MINUTES * 60 * 1000);
}

/**
 * Get the start (00:00:00) and end (23:59:59.999) of "today" in Sri Lanka
 * as proper UTC instants for database queries.
 */
function getTodayRangeSriLanka(): { start: Date; end: Date } {
  const localNow = getNowInSriLanka();
  const year = localNow.getUTCFullYear();
  const month = localNow.getUTCMonth();
  const day = localNow.getUTCDate();

  // 00:00:00.000 Sri Lanka = UTC - 5:30
  const start = new Date(Date.UTC(year, month, day, 0, 0, 0, 0) - TZ_OFFSET_MINUTES * 60 * 1000);
  // 23:59:59.999 Sri Lanka = UTC - 5:30
  const end = new Date(Date.UTC(year, month, day, 23, 59, 59, 999) - TZ_OFFSET_MINUTES * 60 * 1000);

  return { start, end };
}

/**
 * Get the day range (in UTC) for a specific Sri Lanka calendar date.
 * @param refDate — a "virtual local" Date whose UTC fields = Sri Lanka date
 */
function getDayRangeSriLanka(refDate: Date): { start: Date; end: Date } {
  const year = refDate.getUTCFullYear();
  const month = refDate.getUTCMonth();
  const day = refDate.getUTCDate();

  const start = new Date(Date.UTC(year, month, day, 0, 0, 0, 0) - TZ_OFFSET_MINUTES * 60 * 1000);
  const end = new Date(Date.UTC(year, month, day, 23, 59, 59, 999) - TZ_OFFSET_MINUTES * 60 * 1000);

  return { start, end };
}

// ─── Daily Limit ────────────────────────────────────────────────────────────

/**
 * Count how many DeckCards were created today (Sri Lanka calendar day).
 */
export async function getCardsAddedToday(): Promise<number> {
  const { start, end } = getTodayRangeSriLanka();
  const count = await prisma.deckCard.count({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
  });
  return count;
}

// ─── Spillover Logic ────────────────────────────────────────────────────────

/**
 * Find the next available date (with < 100 cards scheduled) starting from
 * a given target date. Increments by 1 Sri Lanka calendar day at a time.
 * Returns a proper UTC Date set to 20:00:00 UTC (= 1:30 AM Sri Lanka).
 */
async function findNextAvailableDate(targetDate: Date): Promise<Date> {
  // Convert targetDate (UTC instant) to a virtual-local date for day math
  let localRef = new Date(targetDate.getTime() + TZ_OFFSET_MINUTES * 60 * 1000);

  while (true) {
    const { start, end } = getDayRangeSriLanka(localRef);

    const count = await prisma.deckCard.count({
      where: {
        nextReviewDate: {
          gte: start,
          lte: end,
        },
      },
    });

    if (count < 100) {
      return standardizeToRolloverTime(localRef);
    }

    // Move to next Sri Lanka calendar day
    localRef = new Date(Date.UTC(
      localRef.getUTCFullYear(),
      localRef.getUTCMonth(),
      localRef.getUTCDate() + 1
    ));
  }
}

// ─── Core Queries ───────────────────────────────────────────────────────────

// Count how many DeckCards are due right now or earlier (Sri Lanka aware)
export async function getDueCardCount() {
  const count = await prisma.deckCard.count({
    where: {
      nextReviewDate: {
        lte: new Date(), // This is correct: compare stored UTC vs current UTC instant
      },
    },
  });
  return count;
}

// Get up to N words that have never been placed in the deck
export async function getNewWords(limit = 10) {
  const words = await prisma.word.findMany({
    where: {
      cards: {
        none: {},
      },
    },
    take: limit,
    orderBy: {
      createdAt: "asc",
    },
  });
  return words;
}

// ─── Card Operations ────────────────────────────────────────────────────────

// Add a word to the user's active Deck
export async function addWordToDeck(wordId: string) {
  const localNow = getNowInSriLanka();
  
  // Shift local time back by 90 minutes (1.5 hours) to determine the "logical" day.
  // Because rollover is at 1:30 AM, any time before 1:30 AM belongs to the previous calendar day.
  const logicalNow = new Date(localNow.getTime() - 90 * 60 * 1000);
  
  const targetDate = standardizeToRolloverTime(logicalNow);
  const nextReviewDate = await findNextAvailableDate(targetDate);

  const card = await prisma.deckCard.create({
    data: {
      wordId,
      isNew: true,
      intervalDays: 0,
      nextReviewDate,
    },
  });
  return card;
}

// Fetch cards due for review (nextReviewDate <= current UTC instant)
export async function getDueCards() {
  const cards = await prisma.deckCard.findMany({
    where: {
      nextReviewDate: {
        lte: new Date(), // Correct: both sides are UTC instants
      },
    },
    include: {
      word: true,
    },
    orderBy: {
      nextReviewDate: "asc",
    },
  });
  return cards;
}

// Update a card after review (Spaced Repetition)
export async function updateCardReview(
  cardId: string,
  multiplier: number | "reset",
  roundedDays?: number
) {
  const card = await prisma.deckCard.findUnique({ where: { id: cardId } });
  if (!card) throw new Error("Card not found");

  let newInterval: number;
  let daysToAdd: number;

  if (multiplier === "reset") {
    newInterval = 0;
    daysToAdd = 0;
  } else {
    const baseInterval = card.intervalDays === 0 ? 1 : card.intervalDays;
    newInterval = baseInterval * multiplier;
    daysToAdd = roundedDays ?? Math.round(newInterval);
  }

  // Start from today in Sri Lanka, add the required days
  const localNow = getNowInSriLanka();
  
  // Shift to logical day (rollover at 1:30 AM)
  const logicalNow = new Date(localNow.getTime() - 90 * 60 * 1000);
  
  const futureLocal = new Date(Date.UTC(
    logicalNow.getUTCFullYear(),
    logicalNow.getUTCMonth(),
    logicalNow.getUTCDate() + daysToAdd
  ));

  const standardized = standardizeToRolloverTime(futureLocal);
  const finalDate = await findNextAvailableDate(standardized);

  await prisma.deckCard.update({
    where: { id: cardId },
    data: {
      intervalDays: newInterval,
      nextReviewDate: finalDate,
      isNew: false,
    },
  });
}
