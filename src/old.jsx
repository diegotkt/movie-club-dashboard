import React from 'react';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import movieData from './data/movies.json';

const getUniqueValues = (key) => [...new Set(movieData.map(m => m[key]).filter(Boolean))];

export default function MovieClubDashboard() {
  const [season, setSeason] = useState('All');
  const [presenter, setPresenter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = movieData.filter(m => {
    const matchSeason = season === 'All' || m.Season === season;
    const matchPresenter = presenter === 'All' || m['Presented by'] === presenter;
    const matchSearch = m.Title.toLowerCase().includes(search.toLowerCase());
    return matchSeason && matchPresenter && matchSearch;
  });

  const moviesPerSeason = getUniqueValues('Season').map(s => ({
    name: s,
    count: movieData.filter(m => m.Season === s).length
  }));

  const watchTimePerSeason = getUniqueValues('Season').map(s => ({
    name: s,
    duration: movieData.filter(m => m.Season === s).reduce((acc, m) => acc + (+m['Duration (min)'] || 0), 0)
  }));
  console.log("Loaded movies:", movieData.length);

  //return <h1> It Works!</h1>;
  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🎬 Movie Club Dashboard</h1>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <select value={season} onChange={e => setSeason(e.target.value)}>
          <option value="All">All Seasons</option>
          {getUniqueValues('Season').map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={presenter} onChange={e => setPresenter(e.target.value)}>
          <option value="All">All Presenters</option>
          {getUniqueValues('Presented by').map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        <div style={{ flex: 1 }}>
          <h2>Movies per Season</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={moviesPerSeason}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Movies" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ flex: 1 }}>
          <h2>Watch Time per Season (min)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={watchTimePerSeason}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="duration" name="Minutes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Filtered Movies ({filtered.length})</h2>
        <ul>
          {filtered.map((m, i) => (
            <li key={i} style={{ margin: '0.5rem 0' }}>
              <strong>{m.Title}</strong> — {m.Season}, presented by {m['Presented by']}
              <p style={{ margin: 0 }}>{m.Synopsis}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

