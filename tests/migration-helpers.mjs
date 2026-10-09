export function mergedCounts(counts){const result=structuredClone(counts);if(result.relax){for(const key of ['started','completed','interrupted'])result.sleep[key]+=result.relax[key];delete result.relax;}return result;}
export function oldFields(value,original){return Object.fromEntries(Object.keys(original).map(k=>[k,value[k]]));}
