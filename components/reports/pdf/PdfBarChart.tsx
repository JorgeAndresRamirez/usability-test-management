import { StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  label: { fontSize: 9, color: "#475569" },
  value: { fontSize: 9, fontWeight: "bold", color: "#1e293b" },
  track: {
    height: 10,
    backgroundColor: "#f1f5f9",
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: { height: 10, borderRadius: 3 },
  dualTrack: {
    flexDirection: "row",
    height: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 3,
    overflow: "hidden",
  },
});

type PdfBarChartProps = {
  label: string;
  value: number;
  maxValue?: number;
  displayValue?: string;
  color?: string;
};

export function PdfBarChart({
  label,
  value,
  maxValue = 100,
  displayValue,
  color = "#4f46e5",
}: PdfBarChartProps) {
  const pct = Math.min(100, Math.max(0, (value / maxValue) * 100));
  const shown =
    displayValue ?? (maxValue === 100 ? `${value.toFixed(0)}%` : String(Math.round(value)));

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{shown}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

type PdfDualBarProps = {
  label: string;
  completion: number;
  success: number;
};

export function PdfDualBarChart({ label, completion, success }: PdfDualBarProps) {
  const completionPct = Math.min(100, Math.max(0, completion));
  const successPct = Math.min(100, Math.max(0, success));
  const gap = completion - success;

  return (
    <View style={{ marginBottom: 10 }}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          Fin. {completionPct.toFixed(0)}% · Éxito {successPct.toFixed(0)}%
          {gap > 0 ? ` · Brecha ${gap.toFixed(0)}pp` : ""}
        </Text>
      </View>
      <View style={styles.dualTrack}>
        <View
          style={{
            width: `${completionPct}%`,
            backgroundColor: "#6366f1",
            height: 12,
          }}
        />
      </View>
      <View style={[styles.dualTrack, { marginTop: 3, height: 8 }]}>
        <View
          style={{
            width: `${successPct}%`,
            backgroundColor: "#16a34a",
            height: 8,
          }}
        />
      </View>
      <View style={{ flexDirection: "row", gap: 12, marginTop: 2 }}>
        <Text style={{ fontSize: 7, color: "#6366f1" }}>■ Finalización</Text>
        <Text style={{ fontSize: 7, color: "#16a34a" }}>■ Éxito</Text>
      </View>
    </View>
  );
}

type PdfGroupedBarProps = {
  title: string;
  items: Array<{ label: string; value: number; color: string }>;
  maxValue?: number;
};

export function PdfGroupedBarChart({ title, items, maxValue }: PdfGroupedBarProps) {
  const max = maxValue ?? Math.max(...items.map((i) => i.value), 1);

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 10, fontWeight: "bold", marginBottom: 8, color: "#334155" }}>
        {title}
      </Text>
      {items.map((item) => (
        <PdfBarChart
          key={item.label}
          label={item.label}
          value={item.value}
          maxValue={max}
          displayValue={String(Math.round(item.value * 10) / 10)}
          color={item.color}
        />
      ))}
    </View>
  );
}

function matrixSymbol(result: string | null, help: boolean, falseFin: boolean): string {
  if (!result) return "—";
  if (result === "SUCCESS") return help || falseFin ? "✓*" : "✓";
  if (result === "NON_CRITICAL_ERROR") return "!";
  return "✗";
}

export function PdfResultMatrix({
  situations,
  rows,
}: {
  situations: Array<{ label: string }>;
  rows: Array<{
    participantCode: string;
    cells: Array<{
      result: string | null;
      helpRequested: boolean;
      isFalseCompletion: boolean;
    }>;
    successRate: number;
  }>;
}) {
  const colWidth = `${Math.floor(70 / Math.max(situations.length, 1))}%`;

  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 4 }}>
        <Text style={{ width: "22%", fontSize: 8, fontWeight: "bold" }}>Participante</Text>
        {situations.map((s) => (
          <Text key={s.label} style={{ width: colWidth, fontSize: 8, fontWeight: "bold", textAlign: "center" }}>
            {s.label}
          </Text>
        ))}
        <Text style={{ width: "8%", fontSize: 8, fontWeight: "bold", textAlign: "center" }}>%</Text>
      </View>
      {rows.map((row) => (
        <View
          key={row.participantCode}
          style={{
            flexDirection: "row",
            paddingVertical: 4,
            borderBottomWidth: 1,
            borderBottomColor: "#f1f5f9",
          }}
        >
          <Text style={{ width: "22%", fontSize: 8 }}>{row.participantCode}</Text>
          {row.cells.map((cell, i) => (
            <Text
              key={i}
              style={{
                width: colWidth,
                fontSize: 8,
                textAlign: "center",
                color:
                  cell.result === "SUCCESS"
                    ? "#16a34a"
                    : cell.result === "NON_CRITICAL_ERROR"
                      ? "#d97706"
                      : cell.result === "CRITICAL_ERROR"
                        ? "#dc2626"
                        : "#94a3b8",
              }}
            >
              {matrixSymbol(cell.result, cell.helpRequested, cell.isFalseCompletion)}
            </Text>
          ))}
          <Text style={{ width: "8%", fontSize: 8, textAlign: "center", fontWeight: "bold" }}>
            {row.successRate.toFixed(0)}
          </Text>
        </View>
      ))}
      <Text style={{ fontSize: 7, color: "#64748b", marginTop: 6 }}>
        ✓ éxito · ! error no crítico · ✗ error crítico · * con ayuda o falsa finalización
      </Text>
    </View>
  );
}
