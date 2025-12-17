export interface DataPoint {
  label: string;
  value: number;
  category: "A" | "B" | "C";
}

export function generateData(n = 8): DataPoint[] {
  const categories: DataPoint["category"][] = ["A", "B", "C"];
  const arr: DataPoint[] = [];
  for (let i = 0; i < n; i++) {
    const cat = categories[i % categories.length];
    arr.push({
      label: `Day ${i + 1}`,
      value: Math.floor(30 + Math.random() * 120),
      category: cat
    });
  }
  return arr;
}
