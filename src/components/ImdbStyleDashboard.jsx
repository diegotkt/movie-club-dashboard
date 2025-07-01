import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, ComposedChart
} from "recharts";
import { LampDemo } from "./ui/lamp";
import moviesData from "../data/movies.json";
import { cn } from "../lib/utils";

const cleanPresenter = (name) => {
  const map = {
    "E.": "Eleonore", "E": "Eleonore",
    "Diego": "Diego K.", "Dieg K": "Diego K.", "Diego K": "Diego K.", 
    "Dieg K.": "Diego K.", "Diego K.": "Diego K.", "Ketels": "Diego K.",
    "Cha": "Chachacha", "Cha-cha-cha": "Chachacha", "Chacha": "Chachacha", 
    "chachacha": "Chachacha", "Juanita": "Juan",
    "Bonus": "HS", "Bonus HS": "HS", "again": "No-One", "null": "No-One"
  };
  return map[name] || name;
};

// Professional Card Component
const Card = ({ children, className, hover = true, ...props }) => (
  <motion.div
    whileHover={hover ? { y: -2, scale: 1.01 } : {}}
    transition={{ duration: 0.2 }}
    className={cn(
      "bg-gray-900 border border-gray-800 rounded-lg shadow-xl",
      "backdrop-blur-sm bg-opacity-90",
      hover && "hover:border-yellow-500/30 hover:shadow-yellow-500/10 hover:shadow-2xl",
      "transition-all duration-300",
      className
    )}
    {...props}
  >
    {children}
  </motion.div>
);

// Statistics Card Component
const StatCard = ({ title, value, subtitle, icon, color = "yellow" }) => (
  <Card className="p-4 text-center">
    <div className="flex items-center justify-center mb-2">
      {icon && <span className="text-2xl mr-2">{icon}</span>}
      <div className={`text-3xl font-bold text-${color}-500`}>{value}</div>
    </div>
    <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold">{title}</div>
    {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
  </Card>
);

// Chart Card Component
const ChartCard = ({ title, children, className }) => (
  <Card className={cn("p-6", className)}>
    <h3 className="text-lg font-bold text-yellow-500 text-center mb-6 tracking-wide">
      {title}
    </h3>
    <div className="h-64">
      {children}
    </div>
  </Card>
);

const ImdbStyleDashboard = () => {
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

  const presenters = Array.from(
    new Set(movies.map((m) => cleanPresenter(m["Presented by"])))
  ).sort();
  const seasons = Array.from(new Set(movies.map((m) => m.Season))).sort();

  // Statistics
  const totalMovies = filtered.length;
  const totalMinutes = filtered.reduce((acc, m) => acc + (parseInt(m["Duration (min)"] || 0)), 0);
  const avgRating = filtered.length > 0 ? 
    filtered.reduce((acc, m) => acc + parseFloat(m["RottenTomatoes Rating"]?.split('%')[0] || 0), 0) / filtered.length : 0;
  const uniqueCountries = new Set(filtered.map(m => m.Origin).filter(Boolean)).size;

  // Chart Data
  const genreData = {};
  filtered.forEach(m => {
    if (m.Genre) {
      const genres = m.Genre.split(',').map(g => g.trim());
      genres.forEach(genre => {
        genreData[genre] = (genreData[genre] || 0) + 1;
      });
    }
  });
  const topGenres = Object.entries(genreData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([genre, count]) => ({ name: genre, value: count }));

  const presenterStats = presenters.map(presenter => {
    const presenterMovies = filtered.filter(m => m["Presented by"] === presenter);
    return {
      name: presenter.length > 8 ? presenter.substring(0, 8) : presenter,
      movies: presenterMovies.length
    };
  }).filter(p => p.movies > 0).sort((a, b) => b.movies - a.movies).slice(0, 8);

  const seasonStats = seasons.map(s => {
    const seasonMovies = movies.filter(m => m.Season === s);
    return {
      season: s,
      movies: seasonMovies.length,
      duration: seasonMovies.reduce((acc, m) => acc + (parseInt(m["Duration (min)"] || 0)), 0)
    };
  });

  const originData = {};
  filtered.forEach(m => {
    if (m.Origin) {
      originData[m.Origin] = (originData[m.Origin] || 0) + 1;
    }
  });
  const topOrigins = Object.entries(originData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([origin, count]) => ({ 
      name: origin.length > 12 ? origin.substring(0, 12) + '...' : origin, 
      count 
    }));

  const PIE_COLORS = ['#FFD700', '#FFA500', '#FF8C00', '#FF7F50', '#FF6347', '#FF4500'];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* IMDb-Style Header */}
      <div className="bg-gray-900 border-b-2 border-yellow-500">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-bold text-xl tracking-wide">
                IMDb
              </div>
              <div className="text-2xl font-bold text-white">Movie Club Dashboard</div>
            </div>
            
            {/* Search Controls */}
            <div className="flex items-center space-x-4">
              <select
                className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
              >
                <option value="All">All Seasons</option>
                {seasons.map((s) => (
                  <option key={s} value={s}>Season {s}</option>
                ))}
              </select>
              <select
                className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
                value={presenter}
                onChange={(e) => setPresenter(e.target.value)}
              >
                <option value="All">All Presenters</option>
                {presenters.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search movies..."
                className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section with Lamp */}
      <div className="h-screen">
        <LampDemo />
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Row 1: Key Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="TOTAL MOVIES" 
            value={totalMovies}
            icon="🎬"
            color="yellow"
          />
          <StatCard
            title="TOTAL HOURS" 
            value={Math.round(totalMinutes / 60)}
            subtitle={`${totalMinutes.toLocaleString()} minutes`}
            icon="⏱️"
            color="orange"
          />
          <StatCard
            title="AVG RATING" 
            value={`${Math.round(avgRating * 10) / 10}%`}
            subtitle="Rotten Tomatoes"
            icon="⭐"
            color="green"
          />
          <StatCard
            title="COUNTRIES" 
            value={uniqueCountries}
            subtitle="Global Cinema"
            icon="🌍"
            color="blue"
          />
        </div>

        {/* Row 2: Large Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="RATING VS PRESENTER">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={presenterStats}>
                <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #4B5563', 
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }} 
                />
                <Bar dataKey="movies" fill="#FFD700" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="SEASON ANALYSIS">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={seasonStats}>
                <XAxis dataKey="season" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #4B5563', 
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }} 
                />
                <Bar dataKey="movies" fill="#FFD700" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="duration" stroke="#FF6B6B" strokeWidth={3} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Row 3: Medium Analysis Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ChartCard title="GENRE DISTRIBUTION" className="md:col-span-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topGenres}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {topGenres.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #4B5563', 
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="MOVIES BY ORIGIN" className="md:col-span-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topOrigins} layout="horizontal">
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis dataKey="name" type="category" width={80} stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #4B5563', 
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }} 
                />
                <Bar dataKey="count" fill="#FFD700" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Row 4: Enhanced Movie Table */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-yellow-500 tracking-wide">MOVIE COLLECTION ({filtered.length})</h3>
          </div>
          <div className="overflow-x-auto max-h-96 rounded-lg border border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-gray-800 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-yellow-500 border-b border-gray-700">Season</th>
                  <th className="px-4 py-3 text-left font-bold text-yellow-500 border-b border-gray-700 min-w-[200px]">Title</th>
                  <th className="px-4 py-3 text-left font-bold text-yellow-500 border-b border-gray-700 hidden sm:table-cell">Presenter</th>
                  <th className="px-4 py-3 text-left font-bold text-yellow-500 border-b border-gray-700 hidden md:table-cell">Year</th>
                  <th className="px-4 py-3 text-left font-bold text-yellow-500 border-b border-gray-700">Duration</th>
                  <th className="px-4 py-3 text-left font-bold text-yellow-500 border-b border-gray-700 hidden md:table-cell">Genre</th>
                  <th className="px-4 py-3 text-left font-bold text-yellow-500 border-b border-gray-700 hidden lg:table-cell">Director</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <motion.tr 
                    key={i} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.01 }}
                    className="border-b border-gray-800 hover:bg-gray-800 transition-colors duration-200"
                  >
                    <td className="px-4 py-3 font-bold text-yellow-500">{m.Season}</td>
                    <td className="px-4 py-3 font-semibold text-white">{m.Title}</td>
                    <td className="px-4 py-3 text-gray-300 hidden sm:table-cell">{m["Presented by"] || '-'}</td>
                    <td className="px-4 py-3 text-gray-300 hidden md:table-cell">{m["Release Year"] || '-'}</td>
                    <td className="px-4 py-3 text-gray-300">{m["Duration (min)"] || '-'}min</td>
                    <td className="px-4 py-3 text-gray-300 text-xs hidden md:table-cell">{m.Genre ? m.Genre.split(',')[0] : '-'}</td>
                    <td className="px-4 py-3 text-gray-300 text-xs hidden lg:table-cell">{m.Director || '-'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default ImdbStyleDashboard;