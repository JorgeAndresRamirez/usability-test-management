import { Document, Image, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { FindingsReport } from "@/lib/findings-report";
import { formatReportDate } from "@/lib/executive-report";

const colors = {
  primary: "#5746AF",
  slate: "#64748b",
  border: "#e2e8f0",
  accent: "#f4f1fb",
};

const styles = StyleSheet.create({
  page: { padding: 44, fontFamily: "Helvetica", fontSize: 10, color: "#1e293b" },
  header: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  brand: { fontSize: 9, color: colors.primary, letterSpacing: 1.2, marginBottom: 6 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  meta: { fontSize: 9, color: colors.slate, marginBottom: 2 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
    marginTop: 4,
  },
  markerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 6,
    gap: 8,
  },
  markerTime: { width: 48, fontFamily: "Courier", fontSize: 9, color: colors.primary },
  markerLabel: { flex: 1, fontSize: 9 },
  situationBlock: { marginBottom: 16 },
  situationHeader: {
    backgroundColor: colors.accent,
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  findingCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  findingTitle: { fontSize: 11, fontWeight: "bold", marginBottom: 6 },
  label: {
    fontSize: 8,
    color: colors.slate,
    textTransform: "uppercase",
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  body: { fontSize: 9, lineHeight: 1.45, marginBottom: 8 },
  recommendation: {
    fontSize: 9,
    lineHeight: 1.45,
    backgroundColor: colors.accent,
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  screenshot: { maxHeight: 180, objectFit: "contain", marginTop: 4 },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 44,
    right: 44,
    fontSize: 8,
    color: colors.slate,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  link: { color: colors.primary, fontSize: 9 },
});

export function FindingsPdfDocument({ report }: { report: FindingsReport }) {
  const hasContent =
    report.executions.length > 0 ||
    report.markers.length > 0 ||
    report.recordingUrl ||
    report.recordingNotes;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>HALLAZGOS DE SESIÓN</Text>
          <Text style={styles.title}>{report.projectName}</Text>
          <Text style={styles.meta}>Participante: {report.participantCode}</Text>
          <Text style={styles.meta}>
            Generado: {formatReportDate(report.generatedAt)}
            {report.completedAt
              ? ` · Sesión completada: ${formatReportDate(report.completedAt)}`
              : ""}
          </Text>
        </View>

        {(report.recordingUrl || report.recordingNotes) && (
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.sectionTitle}>Registro audiovisual</Text>
            {report.recordingUrl && (
              <Link src={report.recordingUrl} style={styles.link}>
                {report.recordingUrl}
              </Link>
            )}
            {report.recordingNotes && (
              <Text style={[styles.body, { marginTop: 6 }]}>{report.recordingNotes}</Text>
            )}
          </View>
        )}

        {report.markers.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.sectionTitle}>Marcadores de tiempo</Text>
            {report.markers.map((marker, index) => (
              <View key={index} style={styles.markerRow}>
                <Text style={styles.markerTime}>{marker.offsetFormatted}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.markerLabel}>{marker.label}</Text>
                  {marker.situationLabel && (
                    <Text style={{ fontSize: 8, color: colors.slate }}>{marker.situationLabel}</Text>
                  )}
                  {marker.notes && (
                    <Text style={{ fontSize: 8, color: colors.slate, marginTop: 2 }}>
                      {marker.notes}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {report.executions.length > 0 ? (
          report.executions.map((execution, execIndex) => (
            <View key={execIndex} style={styles.situationBlock} wrap={false}>
              <View style={styles.situationHeader}>
                <Text style={{ fontSize: 11, fontWeight: "bold" }}>{execution.situationLabel}</Text>
                <Text style={{ fontSize: 9, color: colors.slate, marginTop: 2 }}>
                  {execution.resultLabel} · ToT {execution.timeOnTaskFormatted}
                </Text>
              </View>

              {execution.findings.map((finding, findingIndex) => (
                <View key={findingIndex} style={styles.findingCard}>
                  <Text style={styles.findingTitle}>{finding.title}</Text>
                  {finding.recordingOffsetFormatted && (
                    <Text style={{ fontSize: 8, color: colors.primary, marginBottom: 6 }}>
                      Momento en grabación: {finding.recordingOffsetFormatted}
                    </Text>
                  )}
                  <Text style={styles.label}>Observación</Text>
                  <Text style={styles.body}>{finding.observation}</Text>
                  <Text style={styles.label}>Recomendación</Text>
                  <Text style={styles.recommendation}>{finding.recommendation}</Text>
                  {finding.screenshotDataUrl && (
                    // eslint-disable-next-line jsx-a11y/alt-text -- PDF renderer Image
                    <Image src={finding.screenshotDataUrl} style={styles.screenshot} />
                  )}
                </View>
              ))}
            </View>
          ))
        ) : (
          !hasContent && (
            <Text style={styles.body}>
              No hay hallazgos documentados para esta sesión. Completa la síntesis post-sesión en la
              aplicación.
            </Text>
          )
        )}

        <Text style={styles.footer} fixed>
          {report.authorName} · Test de Usabilidad
        </Text>
      </Page>
    </Document>
  );
}
