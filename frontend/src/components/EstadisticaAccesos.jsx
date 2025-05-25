import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { nombre: 'Exitosos', cantidad: 27 },
  { nombre: 'Denegados', cantidad: 6 },
  { nombre: 'Intrusiones', cantidad: 0 },
];

function EstadisticaAccesos() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="nombre" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="cantidad" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default EstadisticaAccesos;