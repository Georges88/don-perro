import { Product } from "@/types/shopify";

const SYNONYMS: Record<string, string[]> = {
  cat: ["cats", "kitten", "kittens", "feline"],
  cats: ["cat", "kitten", "kittens", "feline"],
  dog: ["dogs", "puppy", "puppies", "canine"],
  dogs: ["dog", "puppy", "puppies", "canine"],
  food: ["kibble", "meal", "nutrition", "organic"],
  kibble: ["food", "meal", "nutrition"],
  treat: ["treats", "snack", "bites"],
  treats: ["treat", "snack", "bites"],
  toy: ["toys", "play", "interactive"],
  toys: ["toy", "play", "interactive"],
  accessory: ["accessories", "collar", "leash", "harness"],
  accessories: ["accessory", "collar", "leash", "harness"],
};

interface SearchableField {
  value: string;
  weight: number;
}

export function searchProducts(products: Product[], query: string) {
  const normalizedQuery = normalizeText(query);
  const queryTokens = expandTokens(tokenize(normalizedQuery));

  if (!queryTokens.length) {
    return products.map((product) => ({ product, score: 0 }));
  }

  return products
    .map((product) => ({
      product,
      score: scoreProduct(product, normalizedQuery, queryTokens),
    }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score);
}

function scoreProduct(product: Product, normalizedQuery: string, queryTokens: string[]) {
  const fields: SearchableField[] = [
    { value: product.title, weight: 10 },
    { value: product.productType, weight: 7 },
    { value: product.tags.join(" "), weight: 6 },
    { value: product.vendor, weight: 3 },
    { value: product.description, weight: 2 },
  ];

  let score = 0;

  for (const field of fields) {
    const fieldValue = normalizeText(field.value);
    const fieldTokens = tokenize(fieldValue);

    if (!fieldValue) continue;

    if (fieldValue === normalizedQuery) {
      score += field.weight * 8;
    } else if (fieldValue.includes(normalizedQuery)) {
      score += field.weight * 4;
    }

    for (const queryToken of queryTokens) {
      score += scoreToken(queryToken, fieldTokens) * field.weight;
    }
  }

  if (product.tags.includes("best-seller")) score += 1.5;
  if (product.tags.includes("new")) score += 1;

  return score;
}

function scoreToken(queryToken: string, fieldTokens: string[]) {
  let best = 0;

  for (const fieldToken of fieldTokens) {
    if (fieldToken === queryToken) {
      best = Math.max(best, 3);
      continue;
    }

    if (fieldToken.startsWith(queryToken) || queryToken.startsWith(fieldToken)) {
      best = Math.max(best, 2);
      continue;
    }

    if (fieldToken.includes(queryToken) || queryToken.includes(fieldToken)) {
      best = Math.max(best, 1.4);
      continue;
    }

    const distance = levenshteinDistance(queryToken, fieldToken);
    const maxDistance = queryToken.length > 5 ? 2 : 1;

    if (distance <= maxDistance) {
      best = Math.max(best, 1);
    }
  }

  return best;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 1);
}

function expandTokens(tokens: string[]) {
  return Array.from(new Set(tokens.flatMap((token) => [token, ...(SYNONYMS[token] || [])])));
}

function levenshteinDistance(a: string, b: string) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = Array.from({ length: b.length + 1 }, () => 0);

  for (let i = 1; i <= a.length; i++) {
    current[0] = i;

    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost,
      );
    }

    for (let j = 0; j <= b.length; j++) {
      previous[j] = current[j];
    }
  }

  return previous[b.length];
}
