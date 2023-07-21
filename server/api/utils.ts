function sortCard(cards: number[]) {
  return cards.sort((a, b) => {
    if (a > 51 && b > 51) return a > b ? 1 : -1
    if (a > 51) return 1
    if (b > 51) return -1
    const a1 = a % 13
    const b1 = b % 13
    if (a1 === b1) {
      return a > b ? 1 : -1
    }
    return a1 > b1 ? 1 : -1
  })
}
