import { DOMAIN_PALETTE } from "./constants";

export function enrichDomains(rawDomains) {
  return rawDomains.map((d, i) => ({
    ...d,
    color: DOMAIN_PALETTE[i]?.color || DOMAIN_PALETTE[0].color,
    bgLight: DOMAIN_PALETTE[i]?.bgLight || DOMAIN_PALETTE[0].bgLight,
  }));
}

export function getAllAuthentic(domains) {
  return domains.flatMap((d) =>
    d.authentic.map((v) => ({ value: v, domain: d }))
  );
}

export function getAllInauthentic(domains) {
  return domains.flatMap((d) =>
    d.inauthentic.map((v) => ({ value: v, domain: d }))
  );
}
