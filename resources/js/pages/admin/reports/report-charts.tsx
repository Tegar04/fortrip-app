import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type ReportChartPoint = {
    start_date: string;
    end_date: string;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    revenue: number;
};

export type ReportChartData = {
    granularity: "day" | "week" | "month";
    points: ReportChartPoint[];
};

const chartColors = {
    pending: "#f59e0b",
    confirmed: "#3b82f6",
    completed: "#10b981",
    cancelled: "#ef4444",
    revenue: "#0d9488",
};

const currency = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
});

const compactNumber = new Intl.NumberFormat("id-ID", {
    notation: "compact",
    maximumFractionDigits: 1,
});

const tooltipStyle = {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "0.5rem",
    color: "var(--card-foreground)",
};

export function ReportCharts({ charts }: { charts: ReportChartData }) {
    return (
        <div className="grid gap-6 xl:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Tren booking per status</CardTitle>
                    <p className="text-muted-foreground text-sm">
                        Komposisi booking {granularityLabel(charts.granularity)}.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={charts.points}
                                margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
                            >
                                <CartesianGrid strokeDasharray="4 4" className="stroke-border" />
                                <XAxis
                                    dataKey="start_date"
                                    tickFormatter={(value: string) =>
                                        formatTick(value, charts.granularity)
                                    }
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={20}
                                    tick={{ fontSize: 11 }}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tickLine={false}
                                    axisLine={false}
                                    width={36}
                                    tick={{ fontSize: 11 }}
                                />
                                <Tooltip
                                    labelFormatter={(value) =>
                                        formatTooltipLabel(String(value), charts)
                                    }
                                    contentStyle={tooltipStyle}
                                    cursor={{ fill: "var(--muted)", opacity: 0.35 }}
                                />
                                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                                <Bar
                                    dataKey="pending"
                                    name="Pending"
                                    stackId="booking"
                                    fill={chartColors.pending}
                                    maxBarSize={28}
                                />
                                <Bar
                                    dataKey="confirmed"
                                    name="Dikonfirmasi"
                                    stackId="booking"
                                    fill={chartColors.confirmed}
                                    maxBarSize={28}
                                />
                                <Bar
                                    dataKey="completed"
                                    name="Selesai"
                                    stackId="booking"
                                    fill={chartColors.completed}
                                    maxBarSize={28}
                                />
                                <Bar
                                    dataKey="cancelled"
                                    name="Dibatalkan"
                                    stackId="booking"
                                    fill={chartColors.cancelled}
                                    maxBarSize={28}
                                    radius={[3, 3, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Tren pendapatan</CardTitle>
                    <p className="text-muted-foreground text-sm">
                        Pembayaran berhasil dikelompokkan berdasarkan tanggal booking.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={charts.points}
                                margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
                            >
                                <defs>
                                    <linearGradient
                                        id="report-revenue-area"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor={chartColors.revenue}
                                            stopOpacity={0.45}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor={chartColors.revenue}
                                            stopOpacity={0.04}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="4 4" className="stroke-border" />
                                <XAxis
                                    dataKey="start_date"
                                    tickFormatter={(value: string) =>
                                        formatTick(value, charts.granularity)
                                    }
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={20}
                                    tick={{ fontSize: 11 }}
                                />
                                <YAxis
                                    tickFormatter={(value: number) =>
                                        `Rp${compactNumber.format(value)}`
                                    }
                                    tickLine={false}
                                    axisLine={false}
                                    width={58}
                                    tick={{ fontSize: 11 }}
                                />
                                <Tooltip
                                    labelFormatter={(value) =>
                                        formatTooltipLabel(String(value), charts)
                                    }
                                    formatter={formatRevenueTooltip}
                                    contentStyle={tooltipStyle}
                                    cursor={{ stroke: chartColors.revenue, strokeDasharray: "4 4" }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    name="Revenue"
                                    stroke={chartColors.revenue}
                                    strokeWidth={3}
                                    fill="url(#report-revenue-area)"
                                    connectNulls
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function granularityLabel(granularity: ReportChartData["granularity"]) {
    return {
        day: "per hari",
        week: "per minggu",
        month: "per bulan",
    }[granularity];
}

function formatTick(value: string, granularity: ReportChartData["granularity"]) {
    const date = new Date(`${value}T00:00:00`);

    if (granularity === "month") {
        return date.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
    }

    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function formatTooltipLabel(value: string, charts: ReportChartData) {
    const point = charts.points.find((item) => item.start_date === value);

    if (!point) {
        return formatTick(value, charts.granularity);
    }

    const start = new Date(`${point.start_date}T00:00:00`);
    const end = new Date(`${point.end_date}T00:00:00`);
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };

    if (charts.granularity === "day") {
        return start.toLocaleDateString("id-ID", options);
    }

    return `${start.toLocaleDateString("id-ID", options)}–${end.toLocaleDateString("id-ID", options)}`;
}

function formatRevenueTooltip(value: unknown): [string, string] {
    return [currency.format(Number(value ?? 0)), "Revenue"];
}
