"use strict";

const ALIASES = {
  "brighton": "brighton-hove-albion",
  "brighton and hove albion": "brighton-hove-albion",
  "brighton hove albion": "brighton-hove-albion",
  "man utd": "manchester-united",
  "man united": "manchester-united",
  "manchester utd": "manchester-united",
  "manchester united": "manchester-united",
  "man city": "manchester-city",
  "manchester city": "manchester-city",
  "spurs": "tottenham-hotspur",
  "tottenham": "tottenham-hotspur",
  "tottenham hotspur": "tottenham-hotspur",
  "newcastle": "newcastle-united",
  "newcastle united": "newcastle-united",
  "west ham": "west-ham-united",
  "west ham united": "west-ham-united",
  "wolves": "wolverhampton-wanderers",
  "wolverhampton": "wolverhampton-wanderers",
  "wolverhampton wanderers": "wolverhampton-wanderers",
  "palace": "crystal-palace",
  "crystal palace": "crystal-palace",
  "afc bournemouth": "bournemouth",
  "bournemouth": "bournemouth"
};

function normalize(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(afc|fc)\b/g, " ")
    .replace(/\band\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function teamSlug(value = "") {
  const normalized = normalize(value);
  const canonical = ALIASES[normalized] || normalized;
  return canonical.replace(/\s+/g, "-");
}

const ASSET_ALIASES = {
  "manchester-united": "manutd",
  "brighton-hove-albion": "brighton",
  "leeds-united": "leeds"
};

function assetSlug(value = "") {
  const canonical = teamSlug(value);
  return ASSET_ALIASES[canonical] || canonical;
}

function teamVariants(value = "") {
  const canonical = teamSlug(value);
  const variants = new Set([canonical, assetSlug(value)]);

  for (const [alias, target] of Object.entries(ALIASES)) {
    if (teamSlug(target) === canonical) {
      variants.add(alias.replace(/\s+/g, "-"));
      variants.add(alias.replace(/\s+/g, ""));
    }
  }

  for (const variant of [...variants]) {
    variants.add(variant.replace(/-/g, ""));
  }

  return [...variants].filter(Boolean);
}

function matchKeyVariants(homeTeam, awayTeam) {
  const home = teamVariants(homeTeam);
  const away = teamVariants(awayTeam);
  const keys = new Set();

  const fileParts = values => [...new Set(values.map(value =>
    String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  ).filter(Boolean))];

  for (const h of fileParts(home)) {
    for (const a of fileParts(away)) {
      keys.add(`${h}-${a}`);
      keys.add(`${h}vs${a}`);
      keys.add(`${h}-vs-${a}`);
    }
  }

  return [...keys];
}

function sameTeam(first, second) {
  const a = teamSlug(first);
  return Boolean(a) && a === teamSlug(second);
}

module.exports = { normalize, teamSlug, assetSlug, teamVariants, matchKeyVariants, sameTeam };
