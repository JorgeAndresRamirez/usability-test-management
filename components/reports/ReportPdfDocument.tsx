import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import {
  PdfBarChart,
  PdfDualBarChart,
  PdfResultMatrix,
} from "@/components/reports/pdf/PdfBarChart";
import type { ExecutiveReport } from "@/lib/executive-report";
import { formatReportDate, formatSeconds } from "@/lib/executive-report";

const colors = {
  indigo: "#4f46e5",
  green: "#16a34a",
  amber: "#d97706",
  red: "#dc2626",
  slate: "#64748b",
  border: "#e2e8f0",
};

const styles = StyleSheet.create({
  page: { padding: 44, fontFamily: "Helvetica", fontSize: 10, color: "#1e293b" },
  cover: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.indigo,
  },
  brand: { fontSize: 9, color: colors.indigo, letterSpacing: 1.5, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 6 },
  subtitle: { fontSize: 11, color: colors.slate, marginBottom: 4 },
  meta: { fontSize: 9, color: colors.slate },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.indigo,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  kpiCard: {
    width: "47%",
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kpiLabel: { fontSize: 8, color: colors.slate, marginBottom: 4, textTransform: "uppercase" },
  kpiValue: { fontSize: 18, fontWeight: "bold" },
  kpiHint: { fontSize: 7, color: colors.slate, marginTop: 2 },
  verdictBox: { padding: 14, borderRadius: 4, marginBottom: 16, borderWidth: 1 },
  verdictFavorable: { backgroundColor: "#f0fdf4", borderColor: "#86efac" },
  verdictMejorable: { backgroundColor: "#fffbeb", borderColor: "#fcd34d" },
  verdictCritico: { backgroundColor: "#fef2f2", borderColor: "#fca5a5" },
  verdictTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 4 },
  narrative: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#334155",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
  },
  actionRow: { flexDirection: "row", marginBottom: 8, paddingLeft: 2 },
  actionNum: {
    width: 16,
    fontSize: 10,
    fontWeight: "bold",
    color: colors.indigo,
  },
  actionTitle: { fontSize: 10, fontWeight: "bold", marginBottom: 2 },
  actionDesc: { fontSize: 9, color: colors.slate, lineHeight: 1.4 },
  frictionCard: {
    marginBottom: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    padding: 6,
    fontWeight: "bold",
    fontSize: 8,
  },
  tableRow: {
    flexDirection: "row",
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    fontSize: 8,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 44,
    right: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: colors.slate,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
});

function PageFooter({ projectName, page }: { projectName: string; page: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text>{projectName} — Informe ejecutivo</Text>
      <Text>{page}</Text>
    </View>
  );
}

function VerdictBox({ report }: { report: ExecutiveReport }) {
  const boxStyle =
    report.verdict === "favorable"
      ? styles.verdictFavorable
      : report.verdict === "mejorable"
        ? styles.verdictMejorable
        : styles.verdictCritico;

  return (
    <View style={[styles.verdictBox, boxStyle]}>
      <Text style={styles.verdictTitle}>{report.verdictLabel}</Text>
      <Text style={{ fontSize: 9, color: colors.slate }}>
        {report.totalParticipants} participante(s) · {report.completedSessions} sesión(es) ·{" "}
        {report.testMetadata.totalSituations} situación(es)
      </Text>
    </View>
  );
}

function buildNarrative(report: ExecutiveReport): string {
  if (report.totalExecutions === 0) {
    return "No hay datos de ejecución suficientes para emitir una recomendación.";
  }

  const top = report.frictionSituations[0];
  let text = `El ${report.overallSuccessRate.toFixed(0)}% de las ejecuciones fue éxito sin fricción y el ${report.autonomousSuccessRate.toFixed(0)}% se resolvió sin ayuda del moderador.`;

  if (report.recoveryGap > 10) {
    text += ` Existe una brecha de recuperación de ${report.recoveryGap.toFixed(0)} puntos porcentuales (finalización − éxito), lo que indica tareas completadas con errores intermedios.`;
  }

  if (report.falseCompletionCount > 0) {
    text += ` Se detectaron ${report.falseCompletionCount} falsa(s) finalización(es): revisar retroalimentación al usuario.`;
  }

  if (top && report.verdict !== "favorable") {
    text += ` Prioridad inmediata: ${top.label} — ${top.action.toLowerCase()}.`;
  } else if (report.verdict === "favorable") {
    text += " El prototipo muestra señales favorables para avanzar con ajustes menores.";
  }

  return text;
}

export function ReportPdfDocument({ report }: { report: ExecutiveReport }) {
  const topFriction = report.frictionSituations.slice(0, 5);
  const matrixRows = report.participantMatrix.rows.map((row) => ({
    participantCode: row.participantCode,
    cells: row.cells.map((cell) => ({
      result: cell.result,
      helpRequested: cell.helpRequested,
      isFalseCompletion: cell.isFalseCompletion,
    })),
    successRate: row.metrics.successRate,
  }));

  return (
    <Document>
      {/* Página 1: Decisión */}
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          <Text style={styles.brand}>INFORME EJECUTIVO DE USABILIDAD</Text>
          <Text style={styles.title}>{report.projectName}</Text>
          <Text style={styles.subtitle}>Test de Usabilidad</Text>
          <Text style={styles.meta}>Generado: {formatReportDate(report.generatedAt)}</Text>
        </View>

        <VerdictBox report={report} />

        <Text style={styles.narrative}>{buildNarrative(report)}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Indicadores para decidir</Text>
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Finalización (eficacia)</Text>
              <Text style={styles.kpiValue}>{report.overallCompletionRate.toFixed(0)}%</Text>
              <Text style={styles.kpiHint}>¿Se logró la meta?</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Éxito sin fricción</Text>
              <Text style={[styles.kpiValue, { color: colors.green }]}>
                {report.overallSuccessRate.toFixed(0)}%
              </Text>
              <Text style={styles.kpiHint}>¿Sin errores relevantes?</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Brecha recuperación</Text>
              <Text
                style={[
                  styles.kpiValue,
                  { color: report.recoveryGap > 15 ? colors.red : colors.amber },
                ]}
              >
                {report.recoveryGap.toFixed(0)} pp
              </Text>
              <Text style={styles.kpiHint}>Finalización − éxito</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Éxito autónomo</Text>
              <Text style={styles.kpiValue}>{report.autonomousSuccessRate.toFixed(0)}%</Text>
              <Text style={styles.kpiHint}>Sin ayuda del moderador</Text>
            </View>
          </View>
        </View>

        {report.priorityActions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acciones prioritarias</Text>
            {report.priorityActions.map((action, index) => (
              <View key={index} style={styles.actionRow}>
                <Text style={styles.actionNum}>{index + 1}.</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDesc}>{action.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <PageFooter projectName={report.projectName} page="1 / 3" />
      </Page>

      {/* Página 2: Dónde actuar */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>¿Dónde se pierde el éxito?</Text>
        <Text style={{ fontSize: 9, color: colors.slate, marginBottom: 12, lineHeight: 1.4 }}>
          Barras superiores: finalización. Inferiores: éxito puro. Una brecha amplia señala
          situaciones donde los usuarios terminan pero con fricción recuperable.
        </Text>

        {report.taskDetails.map((task) => (
          <PdfDualBarChart
            key={task.taskId}
            label={task.label}
            completion={task.completionRate}
            success={task.successRate}
          />
        ))}

        {topFriction.length > 0 && (
          <View style={[styles.section, { marginTop: 8 }]}>
            <Text style={styles.sectionTitle}>Ranking de prioridad</Text>
            {topFriction.map((item, index) => (
              <View key={item.taskId} style={styles.frictionCard}>
                <Text style={{ fontSize: 10, fontWeight: "bold" }}>
                  {index + 1}. {item.label} — éxito {item.successRate.toFixed(0)}%
                </Text>
                <Text style={{ fontSize: 9, color: colors.slate, marginTop: 2 }}>
                  {item.action}
                </Text>
              </View>
            ))}
          </View>
        )}

        {report.participantMetrics.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comparación por participante</Text>
            {report.participantMetrics.map((p) => (
              <PdfBarChart
                key={p.participantCode}
                label={`${p.participantCode} — éxito autónomo`}
                value={p.autonomousSuccessRate}
                color={colors.indigo}
              />
            ))}
          </View>
        )}

        <PageFooter projectName={report.projectName} page="2 / 3" />
      </Page>

      {/* Página 3: Detalle operativo */}
      <Page size="A4" style={styles.page}>
        {matrixRows.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mapa de resultados</Text>
            <PdfResultMatrix
              situations={report.participantMatrix.situations}
              rows={matrixRows}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen por situación</Text>
          <View style={styles.tableHeader}>
            <Text style={{ width: "22%" }}>Situación</Text>
            <Text style={{ width: "14%" }}>Fin.</Text>
            <Text style={{ width: "14%" }}>Éxito</Text>
            <Text style={{ width: "18%" }}>ToT</Text>
            <Text style={{ width: "14%" }}>Crít.</Text>
            <Text style={{ width: "18%" }}>n</Text>
          </View>
          {report.taskDetails.map((task) => (
            <View key={task.taskId} style={styles.tableRow}>
              <Text style={{ width: "22%" }}>{task.shortLabel}</Text>
              <Text style={{ width: "14%" }}>{task.completionRate.toFixed(0)}%</Text>
              <Text style={{ width: "14%" }}>{task.successRate.toFixed(0)}%</Text>
              <Text style={{ width: "18%" }}>{formatSeconds(task.avgTimeOnTaskSeconds)}</Text>
              <Text style={{ width: "14%", color: task.criticalErrors > 0 ? colors.red : colors.slate }}>
                {task.criticalErrors}
              </Text>
              <Text style={{ width: "18%" }}>{task.totalExecutions}</Text>
            </View>
          ))}
        </View>

        <Text style={{ fontSize: 8, color: colors.slate, marginTop: 8, lineHeight: 1.4 }}>
          Detalle cualitativo (Think Aloud) disponible en la plataforma, sección Reportes →
          Observaciones por participante.
        </Text>

        <PageFooter projectName={report.projectName} page="3 / 3" />
      </Page>
    </Document>
  );
}
