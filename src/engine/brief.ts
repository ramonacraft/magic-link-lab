import type { GoldenItem } from '../types/loop'

export function briefsForMisses(misses: GoldenItem[]): GoldenItem[] {
  return misses.filter((item) => item.brief)
}
