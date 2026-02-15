// Temporarily disable Sentry to fix OpenTelemetry vendor chunk error
// import * as Sentry from "@sentry/nextjs";

// if (process.env.NODE_ENV === "production") {
//   Sentry.init({
//     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

//     tracesSampleRate: 0.1,

//     environment: process.env.NODE_ENV,

//     ignoreErrors: ["ECONNRESET", "ETIMEDOUT"],

//     // Disable OpenTelemetry instrumentation to fix the vendor chunk error
//     integrations: [],

//     beforeSend(event) {
//       // Don't send events from super admin actions to avoid clutter
//       if (event.user?.email === process.env.SUPER_ADMIN_EMAIL) {
//         return null;
//       }
//       return event;
//     },
//   });
// }
