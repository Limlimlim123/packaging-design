import { Sentry } from '@sentry/nextjs'
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import { metrics } from '@opentelemetry/api-metrics'

// Sentry 配置
export const initSentry = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Prisma()
    ]
  })
}

// Prometheus 指标
const metricsExporter = new PrometheusExporter({
  port: 9464,
  startServer: true
})

export const metrics = {
  requestDuration: metrics.createHistogram('http_request_duration_ms'),
  activeUsers: metrics.createGauge('active_users_total'),
  designsCreated: metrics.createCounter('designs_created_total'),
  uploadErrors: metrics.createCounter('upload_errors_total')
}