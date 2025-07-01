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

  const presenters = Array.from(
    new Set(movies.map((m) => cleanPresenter(m["Presented by"])))
  ).sort();

  const seasons = Array.from(new Set(movies.map((m) => m.Season))).sort();

  // Stats calculations
  const totalMovies = filtered.length;
  const totalMinutes = filtered.reduce((acc, m) => acc + (parseInt(m["Duration (min)"] || 0)), 0);
  const uniqueCountries = new Set(filtered.map(m => m.Origin).filter(Boolean)).size;
  const avgRating = filtered.length > 0 ? 
    filtered.reduce((acc, m) => acc + parseFloat(m["RottenTomatoes Rating"]?.split('%')[0] || 0), 0) / filtered.length : 0;

  // Genre distribution for pie chart
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
    .slice(0, 6)
    .map(([genre, count]) => ({ name: genre, value: count }));

  // Top presenters data
  const presenterStats = presenters.map(presenter => {
    const presenterMovies = filtered.filter(m => m["Presented by"] === presenter);
    return {
      name: presenter.length > 8 ? presenter.substring(0, 8) : presenter,
      movies: presenterMovies.length,
      avgRating: presenterMovies.length > 0 ? 
        presenterMovies.reduce((acc, m) => acc + parseFloat(m["RottenTomatoes Rating"]?.split('%')[0] || 0), 0) / presenterMovies.length : 0
    };
  }).filter(p => p.movies > 0).sort((a, b) => b.movies - a.movies).slice(0, 7);

  // Season trend data
  const seasonTrend = seasons.map(s => {
    const seasonMovies = movies.filter(m => m.Season === s);
    const totalDuration = seasonMovies.reduce((acc, m) => acc + (parseInt(m["Duration (min)"] || 0)), 0);
    const avgRatingForSeason = seasonMovies.length > 0 ? 
      seasonMovies.reduce((acc, m) => acc + parseFloat(m["RottenTomatoes Rating"]?.split('%')[0] || 0), 0) / seasonMovies.length : 0;
    return {
      season: s,
      movies: seasonMovies.length,
      avgRating: Math.round(avgRatingForSeason * 100) / 100
    };
  });

  const GOLDEN_COLORS = ['#FFD700', '#FFA500', '#FFB347', '#FFCC5C', '#F4A460', '#DAA520'];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-black border-b-2 border-yellow-500 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-yellow-500 text-black px-4 py-2 rounded font-bold text-xl">
              MOVIE CLUB
            </div>
            <div>
              <h1 className="text-2xl font-bold text-yellow-500">{totalMovies}</h1>
              <p className="text-sm text-gray-400">TOTAL MOVIES</p>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-yellow-500">{Math.round(avgRating * 10) / 10}</h1>
              <p className="text-sm text-gray-400">AVERAGE RATING</p>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-yellow-500">{Math.round(totalMinutes / 60)}</h1>
              <p className="text-sm text-gray-400">TOTAL HOURS</p>
            </div>
          </div>
          
          {/* Search by year filter (mimicking IMDb) */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400 uppercase tracking-wide">Searched by Season</div>
            <div className="flex border border-gray-600 rounded">
              {seasons.map((s, idx) => (
                <button
                  key={s}
                  onClick={() => setSeason(s)}
                  className={`px-3 py-1 text-xs ${
                    season === s 
                      ? 'bg-yellow-500 text-black' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  } ${idx === 0 ? 'rounded-l' : ''} ${idx === seasons.length - 1 ? 'rounded-r' : ''}`}
                >
                  {s}
                </button>
              ))}
              <button
                onClick={() => setSeason("All")}
                className={`px-3 py-1 text-xs rounded-r ${
                  season === "All" 
                    ? 'bg-yellow-500 text-black' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                ALL
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Controls */}
        <div className="flex gap-4 items-center">
          <div>
            <select
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
              value={presenter}
              onChange={(e) => setPresenter(e.target.value)}
            >
              <option value="All">All Presenters</option>
              {presenters.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="text"
              placeholder="Search movies..."
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Presenters */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-yellow-500 text-center">RATING VS PRESENTER</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={presenterStats}>
                <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #4B5563', 
                    borderRadius: '4px',
                    color: '#F3F4F6'
                  }} 
                />
                <Bar dataKey="movies" fill="#FFD700" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Season Trends */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-yellow-500 text-center">RATING AVG. VS SEASON</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={seasonTrend}>
                <XAxis dataKey="season" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #4B5563', 
                    borderRadius: '4px',
                    color: '#F3F4F6'
                  }} 
                />
                <Bar dataKey="movies" fill="#FFD700" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="avgRating" stroke="#FF6B6B" strokeWidth={3} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Genre Distribution */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-yellow-500 text-center">RATING VS GENRE</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={genreData} layout="horizontal">
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis dataKey="name" type="category" width={100} stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #4B5563', 
                    borderRadius: '4px',
                    color: '#F3F4F6'
                  }} 
                />
                <Bar dataKey="value" fill="#FFD700" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Movies by Origin */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-yellow-500 text-center">MOVIES BY ORIGIN</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(originCounts).map(([name, count]) => ({ 
                name: name.length > 15 ? name.substring(0, 12) + '...' : name, 
                count 
              })).slice(0, 8)} layout="horizontal">
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis dataKey="name" type="category" width={100} stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #4B5563', 
                    borderRadius: '4px',
                    color: '#F3F4F6'
                  }} 
                />
                <Bar dataKey="count" fill="#FFD700" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Movie Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-yellow-500">MOVIES ({filtered.length})</h3>
          </div>
          <div className="overflow-x-auto max-h-96 rounded-lg border border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-yellow-500 border-b border-gray-700">Season</th>
                  <th className="px-4 py-3 text-left font-semibold text-yellow-500 border-b border-gray-700 min-w-[200px]">Title</th>
                  <th className="px-4 py-3 text-left font-semibold text-yellow-500 border-b border-gray-700 hidden sm:table-cell">Presenter</th>
                  <th className="px-4 py-3 text-left font-semibold text-yellow-500 border-b border-gray-700 hidden md:table-cell">Year</th>
                  <th className="px-4 py-3 text-left font-semibold text-yellow-500 border-b border-gray-700">Duration</th>
                  <th className="px-4 py-3 text-left font-semibold text-yellow-500 border-b border-gray-700 hidden md:table-cell">Genre</th>
                  <th className="px-4 py-3 text-left font-semibold text-yellow-500 border-b border-gray-700 hidden lg:table-cell">Director</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <tr key={i} className="border-b border-gray-700 hover:bg-gray-700 transition-colors duration-150">
                    <td className="px-4 py-3 font-semibold text-yellow-500">{m.Season}</td>
                    <td className="px-4 py-3 font-medium text-white">{m.Title}</td>
                    <td className="px-4 py-3 text-gray-300 hidden sm:table-cell">{m["Presented by"] || '-'}</td>
                    <td className="px-4 py-3 text-gray-300 hidden md:table-cell">{m["Release Year"] || '-'}</td>
                    <td className="px-4 py-3 text-gray-300">{m["Duration (min)"] || '-'}min</td>
                    <td className="px-4 py-3 text-gray-300 text-xs hidden md:table-cell">{m.Genre ? m.Genre.split(',')[0] : '-'}</td>
                    <td className="px-4 py-3 text-gray-300 text-xs hidden lg:table-cell">{m.Director || '-'}</td>
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