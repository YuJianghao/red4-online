export const suitMap = ["♠", "♥", "♦", "♣"]

export const rankMap = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
]
export function getCard(card: number) {
  const rank = rankMap[card % 13]
  const suit = suitMap[Math.floor(card / 13)]
  return { rank, suit }
}
