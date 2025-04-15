import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

const PRICE_CHART_ID = "price-chart-widget-container";

export const PriceChartWidget = () => {
  const containerRef = useRef(null);
  const { chain, address } = useParams();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadWidget = () => {
      if (typeof window.createMyWidget === "function") {
        window.createMyWidget(PRICE_CHART_ID, {
          autoSize: true,
          chainId: chain || "solana",
          tokenAddress:
            address || "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
          showHoldersChart: true,
          defaultInterval: "60",
          timeZone:
            Intl.DateTimeFormat().resolvedOptions().timeZone ?? "Etc/UTC",
          theme: "dark",
          locale: "en",
          backgroundColor: "#13151f",
          gridColor: "#13151f",
          textColor: "#9ca3af",
          candleUpColor: "#10b981",
          candleDownColor: "#ef4444",
          hideLeftToolbar: true,
          hideTopToolbar: true,
          hideBottomToolbar: true,
        });
      } else {
        console.error("createMyWidget function is not defined.");
      }
    };

    if (!document.getElementById("moralis-chart-widget")) {
      const script = document.createElement("script");
      script.id = "moralis-chart-widget";
      script.src = "https://moralis.com/static/embed/chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.onload = loadWidget;
      script.onerror = () => {
        console.error("Failed to load the chart widget script.");
      };
      document.body.appendChild(script);
    } else {
      loadWidget();
    }

    const handleResize = () => {
      if (window.createMyWidget && containerRef.current) {
        loadWidget();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [chain, address]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div
        id={PRICE_CHART_ID}
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      />
    </div>
  );
};
