// Integração com o board de vagas do site (WordPress + WP Job Manager).
// Lê as vagas ao vivo da REST API pública do kick-start.us — assim a lista
// "Outras vagas" fica sempre em sincronia com o site, sem cadastro manual.

export type WpJob = {
  id: number;
  title: string;
  link: string;
  location: string | null;
  visa: string | null; // categoria (Green Card, H1-B, EB-3…) = job_listing_type
};

// Endpoints (configuráveis por ambiente, com fallback para o site).
const API_URL =
  process.env.WP_JOBS_API ?? "https://kick-start.us/wp-json/wp/v2/job-listings";
export const WP_JOBS_BOARD_URL =
  process.env.WP_JOBS_BOARD_URL ?? "https://kick-start.us/our-vacancies-all-jobs/";

// Decodifica entidades HTML comuns que a API retorna nos títulos.
function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#038;/g, "&")
    .replace(/&#8211;/g, "–")
    .replace(/&#8217;/g, "’")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

type RawJob = {
  id: number;
  link: string;
  title?: { rendered?: string };
  meta?: { _job_location?: string };
  _embedded?: { "wp:term"?: { taxonomy?: string; name?: string }[][] };
};

function mapJob(j: RawJob): WpJob {
  const terms = (j._embedded?.["wp:term"] ?? []).flat();
  const visaTerm = terms.find((t) => t?.taxonomy === "job_listing_type");
  const loc = j.meta?._job_location?.trim();
  return {
    id: j.id,
    title: decode(j.title?.rendered ?? "Vaga"),
    link: j.link,
    location: loc ? decode(loc) : null,
    visa: visaTerm?.name ? decode(visaTerm.name) : null,
  };
}

/**
 * Busca as vagas mais recentes do board do site. Cacheado por 1h (revalidate)
 * para não sobrecarregar o WordPress. Em caso de erro, retorna lista vazia —
 * a seção simplesmente não aparece (não quebra a página).
 */
export async function getWpJobs(limit = 12): Promise<WpJob[]> {
  try {
    const url = `${API_URL}?per_page=${limit}&orderby=date&order=desc&_embed=1`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = (await res.json()) as RawJob[];
    if (!Array.isArray(data)) return [];
    return data.map(mapJob);
  } catch (err) {
    console.error("[EB-3] Falha ao buscar vagas do site (WP):", err);
    return [];
  }
}
