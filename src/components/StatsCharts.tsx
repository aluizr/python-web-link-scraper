import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import type { CategoryStats, TagStats, GrowthData } from "@/types/stats";

const COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // emerald
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#6366f1", // indigo
];

interface CategoriesChartProps {
  data: CategoryStats[];
}

export function CategoriesChart({ data }: CategoriesChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Categoria</CardTitle>
          <CardDescription>Sem categorias para exibir</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
          Adicione links com categorias para ver a distribuição
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Categoria</CardTitle>
        <CardDescription>{data.length} categorias</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, value }) => `${name}: ${value}`}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} links`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface TagsCloudProps {
  data: TagStats[];
}

export function TagsCloud({ data }: TagsCloudProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tags Populares</CardTitle>
          <CardDescription>Sem tags para exibir</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
          Adicione tags aos seus links para ver a nuvem de tags
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tags Populares</CardTitle>
        <CardDescription>Top {data.length} tags mais usadas</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 100 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={95} />
            <Tooltip formatter={(value) => `${value} uses`} />
            <Bar
              dataKey="count"
              fill="#8b5cf6"
              radius={[0, 8, 8, 0]}
              animationDuration={600}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface GrowthChartProps {
  data: GrowthData[];
}

export function GrowthChart({ data }: GrowthChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crescimento ao Longo do Tempo</CardTitle>
          <CardDescription>Sem dados para exibir</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
          Adicione links para ver o gráfico de crescimento
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crescimento ao Longo do Tempo</CardTitle>
        <CardDescription>Links adicionados por dia (acumulado)</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
            />
            <YAxis />
            <Tooltip
              formatter={(value) => `${value} links`}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString("pt-BR");
              }}
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="#3b82f6"
              dot={false}
              activeDot={{ r: 6 }}
              name="Total Acumulado"
              animationDuration={600}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#10b981"
              dot={false}
              activeDot={{ r: 6 }}
              name="Adicionado no Dia"
              strokeOpacity={0.5}
              animationDuration={600}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
