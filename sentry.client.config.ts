// Temporarily disable Sentry to fix OpenTelemetry vendor chunk error
// import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry in production
// if (process.env.NODE_ENV === "production") {
//   Sentry.init({
//     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://your-dsn@sentry.io/project-id",

//     // Performance Monitoring
//     tracesSampleRate: 0.1, // 10% of transactions for performance monitoring

//     // Session Replay
//     replaysOnErrorSampleRate: 1.0, // 100% of errors
//     replaysSessionSampleRate: 0.1, // 10% of sessions

//     // Environment
//     environment: process.env.NODE_ENV,

//     // Ignore common errors
//     ignoreErrors: [
//       "ResizeObserver loop limit exceeded",
//       "Non-Error promise rejection captured",
//       "cancelled", // User cancelled operations
//     ],

//     // Filter out sensitive data
//     beforeSend(event) {
//       // Remove sensitive data from event
//       if (event.request) {
//         delete event.request.cookies;
//       }
//       return event;
//     },
//   });
// }
