/**
 * AI-assigned urgency levels for a complaint.
 *
 * Set by MS-07 (AI Insight Service) via RabbitMQ queue "ai.analysis.results".
 * HIGH and CRITICAL trigger MQTT alerts to the analyst mobile app.
 * This enum is framework-agnostic (pure TypeScript).
 */
export enum UrgencyLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}
