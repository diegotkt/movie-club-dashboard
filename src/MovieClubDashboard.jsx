import React, { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend,
  ComposedChart, Area
} from "recharts";
import moviesData from "./data/movies.json";
import "./index.css";

const cleanPresenter = (name) => {
  const map = {
    // Eleonore variations
    "E.": "Eleonore",
    "E": "Eleonore",
    
    // Diego K. variations
    "Diego": "Diego K.",
    "Dieg K": "Diego K.",
    "Diego K": "Diego K.",
    "Dieg K.": "Diego K.",
    "Diego K.": "Diego K.",
    "Ketels": "Diego K.",
    
    // Chachacha variations
    "Cha": "Chachacha",
    "Cha-cha-cha": "Chachacha",
    "Chacha": "Chachacha",
    "chachacha": "Chachacha",
    
    // Juan variations
    "Juanita": "Juan",
    
    // HS/Bonus variations
    "Bonus": "HS",
    "Bonus HS": "HS",
    
    // No presenter cases
    "again": "No-One",
    "null": "No-One"
  };
  return map[name] || name;
};

const MovieClubDashboard = () => {
  const [movies, setMovies] = useState([]);
  const [season, setSeason] = useState("All");
  const [presenter, setPresenter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const enriched = moviesData.map((m) => ({
      ...m,
      "Presented by": cleanPresenter(m["Presented by"]),
      Season: m["Season"]?.toString(),
      Duration: parseInt(m["Duration (min)"] || 0),
    }));
    setMovies(enriched);
  }, []);

  const filtered = movies.filter(
    (m) =>
      (season === "All" || m.Season === season) &&
      (presenter === "All" || m["Presented by"] === presenter) &&
      (search === "" || m.Title.toLowerCase().includes(search.toLowerCase()))
  );

  const originCounts = filtered.reduce((acc, m) => {
    const origin = m.Origin || "Unknown";
    acc[origin] = (acc[origin] || 0) + 1;
    return acc;
  }, {});

  const durationsBySeason = filtered.reduce((acc, m) => {
    const s = m.Season || "Unknown";
    acc[s] = (acc[s] || 0) + (parseInt(m["Duration (min)"] || 0));
    return acc;
  }, {});

  const presenters = Array.from(
    new Set(movies.map((m) => cleanPresenter(m["Presented by"])))
  ).sort();

  const seasons = Array.from(new Set(movies.map((m) => m.Season))).sort();

  // Stats calculations
  const totalMovies = filtered.length;
  const totalMinutes = filtered.reduce((acc, m) => acc + (parseInt(m["Duration (min)"] || 0)), 0);
  const uniqueCountries = new Set(filtered.map(m => m.Origin).filter(Boolean)).size;
  const uniquePresenters = new Set(filtered.map(m => m["Presented by"]).filter(Boolean)).size;

  // Genre distribution
  const genreCount = {};
  filtered.forEach(m => {
    if (m.Genre) {
      const genres = m.Genre.split(',').map(g => g.trim());
      genres.forEach(genre => {
        genreCount[genre] = (genreCount[genre] || 0) + 1;
      });
    }
  });
  const genreData = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([genre, count]) => ({ name: genre, value: count }));

  // Presenter comparison
  const presenterStats = presenters.map(presenter => {
    const presenterMovies = filtered.filter(m => m["Presented by"] === presenter);
    return {
      name: presenter,
      movies: presenterMovies.length,
      duration: presenterMovies.reduce((acc, m) => acc + (parseInt(m["Duration (min)"] || 0)), 0)
    };
  }).filter(p => p.movies > 0).sort((a, b) => b.movies - a.movies).slice(0, 8);

  // Season trend data
  const seasonTrend = seasons.map(s => {
    const seasonMovies = movies.filter(m => m.Season === s);
    const totalDuration = seasonMovies.reduce((acc, m) => acc + (parseInt(m["Duration (min)"] || 0)), 0);
    return {
      season: `S${s}`,
      movies: seasonMovies.length,
      duration: totalDuration,
      avgDuration: Math.round(totalDuration / seasonMovies.length || 0)
    };
  });

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 text-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg p-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-600">
            🎬 Movie Club Dashboard
          </h1>
          <p className="text-sm text-gray-600">
            Explore your cinematic journey • {totalMovies} movies • {Math.round(totalMinutes/60)} hours of cinema
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 shadow-md p-4 text-center hover:shadow-lg transition-all duration-200">
            <div className="text-2xl font-bold text-purple-600">{totalMovies}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Movies</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 shadow-md p-4 text-center hover:shadow-lg transition-all duration-200">
            <div className="text-2xl font-bold text-cyan-600">{Math.round(totalMinutes/60)}h</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Watch Time</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 shadow-md p-4 text-center hover:shadow-lg transition-all duration-200">
            <div className="text-2xl font-bold text-pink-600">{uniqueCountries}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Countries</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 shadow-md p-4 text-center hover:shadow-lg transition-all duration-200">
            <div className="text-2xl font-bold text-indigo-600">{uniquePresenters}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Presenters</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 shadow-md p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1 min-w-[120px]">
              <label className="text-sm font-medium text-gray-700">Season</label>
              <select
                className="px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
              >
                <option value="All">All Seasons</option>
                {seasons.map((s) => (
                  <option key={s} value={s}>Season {s}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1 min-w-[120px]">
              <label className="text-sm font-medium text-gray-700">Presenter</label>
              <select
                className="px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                value={presenter}
                onChange={(e) => setPresenter(e.target.value)}
              >
                <option value="All">All Presenters</option>
                {presenters.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-sm font-medium text-gray-700">Search</label>
              <input
                type="text"
                placeholder="Search movies..."
                className="px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Season Trends */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 shadow-md p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 text-center">📈 Season Trends</h3>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={seasonTrend}>
                <XAxis dataKey="season" stroke="#374151" />
                <YAxis yAxisId="left" stroke="#374151" />
                <YAxis yAxisId="right" orientation="right" stroke="#374151" />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Legend />
                <Bar yAxisId="left" dataKey="movies" fill="#8b5cf6" name="Movies" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="avgDuration" stroke="#06b6d4" strokeWidth={3} name="Avg Duration (min)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Genre Distribution */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 shadow-md p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 text-center">🎭 Genre Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={genreData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {genreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Movies per Origin */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 shadow-md p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 text-center">🌍 Movies by Origin</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={Object.entries(originCounts).map(([name, count]) => ({ name, count }))} layout="horizontal">
                <XAxis type="number" stroke="#374151" />
                <YAxis dataKey="name" type="category" width={80} stroke="#374151" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Presenters */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 shadow-md p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 text-center">🏆 Top Presenters</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={presenterStats}>
                <XAxis dataKey="name" stroke="#374151" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#374151" />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="movies" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Movies Presented" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Movie Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">🎬 Movies ({filtered.length})</h3>
          </div>
          <div className="overflow-x-auto max-h-96 rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">Season</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b border-gray-200 min-w-[200px]">Title</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b border-gray-200 hidden sm:table-cell">Presenter</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b border-gray-200 hidden md:table-cell">Year</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">Duration</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b border-gray-200 hidden md:table-cell">Genre</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b border-gray-200 hidden lg:table-cell">Director</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b border-gray-200 hidden lg:table-cell">Origin</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-3 py-2 font-semibold text-purple-600">S{m.Season}</td>
                    <td className="px-3 py-2 font-medium text-gray-900">{m.Title}</td>
                    <td className="px-3 py-2 text-gray-600 hidden sm:table-cell">{m["Presented by"] || '-'}</td>
                    <td className="px-3 py-2 text-gray-600 hidden md:table-cell">{m["Release Year"] || '-'}</td>
                    <td className="px-3 py-2 text-gray-600">{m["Duration (min)"] || '-'}min</td>
                    <td className="px-3 py-2 text-gray-600 text-xs hidden md:table-cell">{m.Genre ? m.Genre.split(',')[0] : '-'}</td>
                    <td className="px-3 py-2 text-gray-600 text-xs hidden lg:table-cell">{m.Director || '-'}</td>
                    <td className="px-3 py-2 text-gray-500 text-xs hidden lg:table-cell">{m.Origin || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MovieClubDashboard;