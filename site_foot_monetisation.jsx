import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ⚽ Transform data (testable function)
export function transformMatches(matches = []) {
  return matches.map((match) => ({
    title: `${match?.homeTeam?.name || "?"} vs ${match?.awayTeam?.name || "?"}`,
    desc: `Score: ${match?.score?.fullTime?.home ?? 0} - ${match?.score?.fullTime?.away ?? 0} | ${match?.competition?.name || "Unknown"}`,
  }));
}

export default function App() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // ✅ FIX: process is not defined (browser-safe env access)
  const API_KEY =
    (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.NEXT_PUBLIC_FOOTBALL_API_KEY) ||
    (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_FOOTBALL_API_KEY) ||
    "";

  async function fetchNews() {
    try {
      setLoading(true);
      setError(null);

      // ❗ Guard: API key missing
      if (!API_KEY) {
        throw new Error("API key manquante. Configure NEXT_PUBLIC_FOOTBALL_API_KEY");
      }

      const res = await fetch("https://api.football-data.org/v4/matches", {
        headers: { "X-Auth-Token": API_KEY },
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();

      const formatted = transformMatches(data.matches);

      setNews(formatted);
    } catch (err) {
      setError(err.message || "Erreur chargement données football");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredNews = news.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  // 🧪 TESTS SIMPLES (console)
  (function runTests() {
    const sample = [
      {
        homeTeam: { name: "A" },
        awayTeam: { name: "B" },
        score: { fullTime: { home: 1, away: 2 } },
        competition: { name: "League" },
      },
    ];

    const result = transformMatches(sample);

    console.assert(result[0].title === "A vs B", "Title test failed");
    console.assert(result[0].desc.includes("1 - 2"), "Score test failed");
  })();

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* HERO */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold">⚽ Foot News Pro</h1>
        <p className="text-gray-400 mt-2">
          News football live + monétisation + trafic
        </p>
      </div>

      {/* SEARCH */}
      <div className="flex justify-center mb-6">
        <input
          className="p-2 rounded text-black w-1/2"
          placeholder="Rechercher un match..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ADS */}
      <div className="bg-gray-800 text-center p-3 mb-6 rounded">
        💰 Espace publicité
      </div>

      {/* STATUS */}
      {loading && <p className="text-center">Chargement...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* NEWS */}
      <div className="grid md:grid-cols-3 gap-4">
        {filteredNews.slice(0, 9).map((item, i) => (
          <Card key={i} className="bg-gray-900">
            <CardContent className="p-4">
              <h2 className="font-bold">{item.title}</h2>
              <p className="text-gray-300 mt-2">{item.desc}</p>
              <Button className="mt-3 w-full">Voir match</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* GUIDE */}
      <div className="mt-10 bg-gray-900 p-5 rounded">
        <h2 className="text-xl font-bold mb-2">💰 Monétisation</h2>
        <p>- Publicités</p>
        <p>- Trafic réseaux sociaux</p>
        <p>- Affiliation foot</p>

        <h2 className="text-xl font-bold mt-4 mb-2">🌍 Mise en ligne</h2>
        <p>Utilise Vercel pour héberger ton site</p>

        <h2 className="text-xl font-bold mt-4 mb-2">⚽ API football</h2>
        <p>Utilise Football-Data API pour les matchs</p>
      </div>

      <footer className="text-center text-gray-500 mt-10">
        🚀 Site prêt pour production
      </footer>
    </div>
  );
}
