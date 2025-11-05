// My Library Sorted — Stremio Add-on (v2)
const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const fs = require("fs");
const path = require("path");
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 7000;
const GENRE_ORDER = [
  "Comedy",
  "Horror",
  "Drama",
  "Adventure",
  "Action",
  "Science Fiction",
  "Thriller",
  "Romance",
  "Mystery",
  "Western",
  "Fantasy",
  "Crime",
  "Documentary",
  "Music",
  "Noir",
  "War",
  "Biography",
  "History",
  "Musical",
  "Animation",
  "Family",
  "Sport"
];
const GENRE_ALIASES = {
  "Sci-Fi": "Science Fiction",
  "Sci Fi": "Science Fiction",
  "SciFi": "Science Fiction",
  "SF": "Science Fiction",
  "Μusic": "Music",
  "Sports": "Sport",
  "Historical": "History"
};
const DATA_FILE = path.join(__dirname, "data", "library.json");
function readLibrary() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.error(e);
    return [];
  }
}
function normalize(g) {
  if (!g) return null;
  return GENRE_ALIASES[g.trim()] || g.trim();
}
function bestIndex(genres) {
  if (!Array.isArray(genres)) return 999;
  const normalized = genres.map(normalize);
  for (let i = 0; i < GENRE_ORDER.length; i++)
    if (normalized.includes(GENRE_ORDER[i])) return i;
  return 999;
}
function sortItems(a,b) {
  const ai = bestIndex(a.genres);
  const bi = bestIndex(b.genres);
  if (ai !== bi) return ai - bi;
  return (a.name||"").localeCompare(b.name||"");
}
const manifest = {
  id: "org.marios.mylibrary.sorted",
  version: "1.1.0",
  name: "My Library Sorted",
  description: "Shows your library sorted by your custom genre order.",
  resources: ["catalog"],
  types: ["movie"],
  catalogs: [{ type: "movie", id: "mylib", name: "My Library", extra: [{ name: "search" }, { name: "genre" }, { name: "skip" }] }]
};
const builder = new addonBuilder(manifest);
builder.defineCatalogHandler(() => {
  const all = readLibrary();
  all.sort(sortItems);
  return Promise.resolve({ metas: all.map(it => ({
    id: it.id || it.name,
    type: it.type || "movie",
    name: it.name,
    releaseInfo: it.year ? String(it.year) : undefined,
    poster: it.poster,
    genres: it.genres
  })) });
});
serveHTTP(builder.getInterface(), { port: PORT });
console.log(`Running at http://localhost:${PORT}/manifest.json`);
