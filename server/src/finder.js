// Scores products against the three NAS Finder answers and returns the best matches.
const capacityTb = { '10tb': 10, '20tb': 20, '50tb': 50, '100tb': 100 };
const segmentRank = { home: 0, creator: 1, business: 2, enterprise: 3 };

export function recommend(products, { storing, capacity, work_style }) {
  const needTb = capacityTb[capacity] ?? 10;
  const wantRank = segmentRank[work_style] ?? 0;

  return products
    .map((p) => {
      let score = 0;
      if (p.use_cases.includes(storing)) score += 3;
      // Rough rule: usable space with RAID 5/SHR is about (bays - 1) / bays of raw capacity.
      const usable = (p.max_raw_tb ?? 0) * ((p.bays - 1) / p.bays);
      score += usable >= needTb ? 3 : -4;
      score += 3 - Math.abs(segmentRank[p.segment] - wantRank) * 1.5;
      if (needTb >= 100 && p.bays >= 5) score += 2;
      return { product: p, score };
    })
    .sort((a, b) => b.score - a.score || (a.product.price_inr ?? 0) - (b.product.price_inr ?? 0))
    .slice(0, 3)
    .map(({ product }) => product);
}
