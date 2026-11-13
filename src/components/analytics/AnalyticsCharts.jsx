import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { CATEGORIES } from '../../services/mockData';

const STATUS_COLORS = {
  Pending: '#f59e0b',
  Assigned: '#3b82f6',
  'In Progress': '#6366f1',
  Resolved: '#10b981',
  Rejected: '#ef4444',
};

const CATEGORY_COLORS = [
  '#0284c7', // Electrical - sky
  '#0d9488', // Plumbing - teal
  '#d97706', // Furniture - amber
  '#059669', // Cleaning - emerald
  '#7c3aed', // Lab Equipment - violet
  '#4f46e5', // Classroom - indigo
  '#06b6d4', // Network - cyan
  '#64748b', // Other - slate
];

export function CategoryBarChart({ complaints }) {
  const data = CATEGORIES.map((cat) => ({
    name: cat.length > 15 ? cat.substring(0, 13) + '..' : cat,
    fullName: cat,
    count: complaints.filter((c) => c.category === cat).length,
  }));

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
      <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
        <span>Complaints by Category</span>
        <span className="text-xs text-slate-400 font-normal">Campus wide</span>
      </h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#64748b' }}
              interval={0}
              angle={-25}
              textAnchor="end"
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white text-xs p-2 rounded-lg shadow-lg">
                      <div className="font-bold">{payload[0].payload.fullName}</div>
                      <div>Total Issues: {payload[0].value}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function StatusDonutChart({ complaints }) {
  const statuses = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];
  const data = statuses
    .map((status) => ({
      name: status,
      value: complaints.filter((c) => c.status === status).length,
      color: STATUS_COLORS[status],
    }))
    .filter((item) => item.value > 0);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
      <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
        <span>Status Distribution</span>
        <span className="text-xs text-slate-400 font-normal">Work in progress</span>
      </h4>
      <div className="h-64 flex items-center justify-center">
        {data.length === 0 ? (
          <p className="text-xs text-slate-400">No complaints logged yet</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white text-xs p-2 rounded-lg shadow-lg">
                        <div className="font-bold">{payload[0].name}</div>
                        <div>Count: {payload[0].value} tickets</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export function BuildingBarChart({ complaints }) {
  // Aggregate by building
  const buildingCounts = {};
  complaints.forEach((c) => {
    const bldg = c.building || 'Unknown';
    buildingCounts[bldg] = (buildingCounts[bldg] || 0) + 1;
  });

  const data = Object.keys(buildingCounts).map((bldg) => {
    // Shorten long names
    const shortName = bldg.split('(')[0].replace('Complex', '').trim();
    return {
      name: shortName,
      fullName: bldg,
      count: buildingCounts[bldg],
    };
  });

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
      <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
        <span>Complaints by Campus Building</span>
        <span className="text-xs text-slate-400 font-normal">Hotspots</span>
      </h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10, fill: '#64748b' }}
              width={90}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white text-xs p-2 rounded-lg shadow-lg">
                      <div className="font-bold">{payload[0].payload.fullName}</div>
                      <div>Total Complaints: {payload[0].value}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
