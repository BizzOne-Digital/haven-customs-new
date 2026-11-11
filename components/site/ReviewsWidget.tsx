"use client";

import Script from "next/script";

/** Haven Customs review widget (ReputationHub / LeadConnector). Public embed — not a secret. */
const WIDGET_SRC =
  "https://reputationhub.site/reputation/widgets/review_widget/VgoGJ8FINdBM0F5Hbqhw?widgetId=6af4a86f47524273e3456846";

export default function ReviewsWidget() {
  return (
    <>
      {/* The vendor script resizes .lc_reviews_widget iframes to fit their content */}
      <Script src="https://reputationhub.site/reputation/assets/review-widget.js" strategy="afterInteractive" />
      <iframe
        className="lc_reviews_widget block min-h-[420px] w-full border-0"
        src={WIDGET_SRC}
        title="Haven Customs customer reviews"
        scrolling="no"
        loading="lazy"
        style={{ minWidth: "100%", width: "100%" }}
      />
    </>
  );
}
