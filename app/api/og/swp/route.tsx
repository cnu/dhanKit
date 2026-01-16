import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

// Load Noto Sans font which supports the rupee symbol
const fontUrl =
  "https://fonts.gstatic.com/s/notosans/v36/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyD9A99d.ttf";

// Format currency in lakhs/crores for display
function formatCurrency(num: number): string {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
}

// Format duration
function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years === 0) return `${remainingMonths} months`;
  if (remainingMonths === 0) return `${years} years`;
  return `${years}y ${remainingMonths}m`;
}

export async function GET(request: NextRequest) {
  // Fetch font
  const fontData = await fetch(fontUrl).then((res) => res.arrayBuffer());

  // Get the base URL for the logo
  const { origin, searchParams } = new URL(request.url);
  const logoUrl = `${origin}/logo.png`;

  // Get params
  const initialCorpus = parseInt(searchParams.get("c") || "5000000");
  const monthlyWithdrawal = parseInt(searchParams.get("w") || "30000");
  const expectedReturn = parseFloat(searchParams.get("r") || "8");
  const timePeriod = parseInt(searchParams.get("y") || "20");
  const finalCorpus = parseInt(searchParams.get("final") || "0");
  const totalWithdrawn = parseInt(searchParams.get("withdrawn") || "0");
  const interestEarned = parseInt(searchParams.get("interest") || "0");
  const corpusLasted = searchParams.get("lasted") === "1";
  const monthsLasted = parseInt(searchParams.get("months") || "0");
  const inflationEnabled = searchParams.get("inf") === "1";
  const inflationRate = parseFloat(searchParams.get("infr") || "6");

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#FAFAFA",
          padding: "48px 64px",
          fontFamily: "Noto Sans, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "32px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt="dhanKit"
            height={48}
            style={{ height: "48px" }}
          />
          <span
            style={{
              fontSize: "20px",
              color: "#6B7280",
            }}
          >
            SWP Calculator
          </span>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: "flex",
            flex: 1,
            gap: "48px",
          }}
        >
          {/* Left - Inputs */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              flex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <span style={{ fontSize: "16px", color: "#6B7280" }}>
                Initial Corpus
              </span>
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: "600",
                  color: "#1F2937",
                }}
              >
                {formatCurrency(initialCorpus)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <span style={{ fontSize: "16px", color: "#6B7280" }}>
                Monthly Withdrawal
              </span>
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: "600",
                  color: "#DC2626",
                }}
              >
                {formatCurrency(monthlyWithdrawal)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                gap: "32px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <span style={{ fontSize: "14px", color: "#6B7280" }}>
                  Expected Return
                </span>
                <span
                  style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    color: "#1F2937",
                  }}
                >
                  {expectedReturn}% p.a.
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <span style={{ fontSize: "14px", color: "#6B7280" }}>
                  Time Period
                </span>
                <span
                  style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    color: "#1F2937",
                  }}
                >
                  {timePeriod} years
                </span>
              </div>
            </div>
            {inflationEnabled && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "8px",
                  padding: "8px 12px",
                  backgroundColor: "#FEF3C7",
                  borderRadius: "8px",
                }}
              >
                <span style={{ fontSize: "14px", color: "#92400E" }}>
                  Inflation adjusted: {inflationRate}% annual increase
                </span>
              </div>
            )}
          </div>

          {/* Right - Results */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <span style={{ fontSize: "18px", color: "#6B7280" }}>
              {corpusLasted ? "Final Corpus" : "Corpus Lasts"}
            </span>
            <span
              style={{
                fontSize: "64px",
                fontWeight: "bold",
                color: corpusLasted ? "#10B981" : "#DC2626",
                lineHeight: 1.1,
              }}
            >
              {corpusLasted
                ? formatCurrency(finalCorpus)
                : formatDuration(monthsLasted)}
            </span>
            <div
              style={{
                display: "flex",
                gap: "32px",
                marginTop: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                }}
              >
                <span style={{ fontSize: "14px", color: "#6B7280" }}>
                  Total Withdrawn
                </span>
                <span
                  style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    color: "#1F2937",
                  }}
                >
                  {formatCurrency(totalWithdrawn)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                }}
              >
                <span style={{ fontSize: "14px", color: "#6B7280" }}>
                  Interest Earned
                </span>
                <span
                  style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    color: "#10B981",
                  }}
                >
                  {formatCurrency(interestEarned)}
                </span>
              </div>
            </div>
            {!corpusLasted && (
              <span
                style={{
                  fontSize: "14px",
                  color: "#DC2626",
                  marginTop: "8px",
                }}
              >
                Corpus depletes before {timePeriod} years
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "32px",
            paddingTop: "24px",
            borderTop: "1px solid #E5E7EB",
          }}
        >
          <span style={{ fontSize: "18px", color: "#6B7280" }}>
            Plan your systematic withdrawals at dhankit.com
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Noto Sans",
          data: fontData,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
