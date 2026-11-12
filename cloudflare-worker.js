// Cloudflare Worker — Radar Motorista / TomTom
// Configure TOMTOM_API_KEY as a Worker Secret. Never put the key in index.html or GitHub.
const ALLOWED_ORIGIN = "https://marcelofrancisco1984.github.io";

function cors(origin) {
  const allowed = origin === ALLOWED_ORIGIN || origin === "http://localhost:8787";
  return {
    "Access-Control-Allow-Origin": allowed ? origin : ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...cors(origin), "Cache-Control": "no-store" }
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(origin) });
    }
    const url = new URL(request.url);
    if (url.pathname !== "/traffic" || request.method !== "GET") {
      return json({ error: "Endpoint não encontrado." }, 404, origin);
    }
    if (!env.TOMTOM_API_KEY) return json({ error: "Chave TomTom não configurada no servidor." }, 503, origin);

    const lat = Number(url.searchParams.get("lat"));
    const lon = Number(url.searchParams.get("lon"));
    const radius = Math.min(10, Math.max(2, Number(url.searchParams.get("radiusKm")) || 5));
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      return json({ error: "Coordenadas inválidas." }, 400, origin);
    }

    // Cache compartilhado por quadrícula aproximada durante 5 minutos para reduzir chamadas e custo.
    const qLat = lat.toFixed(2), qLon = lon.toFixed(2);
    const cacheUrl = new URL(request.url);
    cacheUrl.search = "?lat=" + qLat + "&lon=" + qLon + "&radiusKm=" + radius;
    const cacheKey = new Request(cacheUrl.toString(), { method: "GET" });
    const cache = caches.default;
    const cached = await cache.match(cacheKey);
    if (cached) {
      const headers = new Headers(cached.headers);
      Object.entries(cors(origin)).forEach(([k, v]) => headers.set(k, v));
      return new Response(cached.body, { status: cached.status, headers });
    }

    const dLat = radius / 111;
    const dLon = radius / (111 * Math.max(0.2, Math.cos(lat * Math.PI / 180)));
    const bbox = [lon - dLon, lat - dLat, lon + dLon, lat + dLat].join(",");
    const apiUrl = new URL("https://api.tomtom.com/maps/orbis/traffic/incidents/details");
    apiUrl.searchParams.set("apiVersion", "2");
    apiUrl.searchParams.set("bbox", bbox);
    apiUrl.searchParams.set("timeValidity", "present");

    try {
      const response = await fetch(apiUrl.toString(), {
        headers: {
          "TomTom-Api-Key": env.TOMTOM_API_KEY,
          "TomTom-Api-Version": "2",
          "Attributes": "incidents(type,geometry(type,coordinates),properties(iconCategory,magnitudeOfDelay,delayInSeconds,from,to,lengthInMeters,roadNumbers,lastReportTime))",
          "Accept": "application/json"
        }
      });
      if (!response.ok) {
        return json({ error: "TomTom retornou erro.", providerStatus: response.status }, 502, origin);
      }
      const payload = await response.json();
      const incidents = Array.isArray(payload.incidents) ? payload.incidents : [];
      const summary = {
        source: "TomTom",
        updatedAt: new Date().toISOString(),
        incidentCount: incidents.length,
        severeCount: incidents.filter(x => ["major", "undefined"].includes(x?.properties?.magnitudeOfDelay)).length,
        jamCount: incidents.filter(x => x?.properties?.iconCategory === "jam").length,
        accidentCount: incidents.filter(x => x?.properties?.iconCategory === "accident").length,
        roadWorkCount: incidents.filter(x => x?.properties?.iconCategory === "roadWorks").length,
        incidents: incidents.slice(0, 30).map(x => ({
          type: x?.properties?.iconCategory || "unknown",
          severity: x?.properties?.magnitudeOfDelay || "unknown",
          delaySeconds: x?.properties?.delayInSeconds || 0,
          from: x?.properties?.from || "",
          to: x?.properties?.to || "",
          lengthMeters: x?.properties?.lengthInMeters || 0,
          roadNumbers: x?.properties?.roadNumbers || []
        }))
      };
      const result = new Response(JSON.stringify(summary), {
        headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=300", ...cors(origin) }
      });
      await cache.put(cacheKey, result.clone());
      return result;
    } catch (_) {
      return json({ error: "Não foi possível consultar o serviço TomTom." }, 502, origin);
    }
  }
};
