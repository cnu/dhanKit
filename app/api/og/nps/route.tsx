import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

// Load Noto Sans font which supports the rupee symbol
const fontUrl = "https://fonts.gstatic.com/s/notosans/v36/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyD9A99d.ttf";

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

export async function GET(request: NextRequest) {
  // Fetch font
  const fontData = await fetch(fontUrl).then((res) => res.arrayBuffer());

  // Get the base URL for the logo
  const { origin, searchParams } = new URL(request.url);
  const logoUrl = `${origin}/logo.png`;

  // Get params
  const currentAge = parseInt(searchParams.get("a") || "30");
  const monthlyInvestment = parseInt(searchParams.get("m") || "5000");
  const expectedReturn = parseFloat(searchParams.get("r") || "10");
  const annuityRate = parseFloat(searchParams.get("ar") || "6");
  const annuityPercent = parseInt(searchParams.get("ap") || "40");
  const totalCorpus = parseInt(searchParams.get("corpus") || "0");
  const lumpsumWithdrawal = parseInt(searchParams.get("lumpsum") || "0");
  const monthlyPension = parseInt(searchParams.get("pension") || "0");
  const totalInvested = parseInt(searchParams.get("invested") || "0");
  const yearsToRetirement = parseInt(searchParams.get("years") || "0");
  const inflationEnabled = searchParams.get("inf") === "1";
  const inflationRate = parseFloat(searchParams.get("infr") || "6");
  const adjustedCorpus = parseInt(searchParams.get("adjCorpus") || "0");
  const adjustedPension = parseInt(searchParams.get("adjPension") || "0");

  // Calculate percentage of returns and lumpsum percent
  const totalReturns = totalCorpus - totalInvested;
  const returnsPercent = totalInvested > 0 ? Math.round((totalReturns / totalInvested) * 100) : 0;
  const lumpsumPercent = 100 - annuityPercent;

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
            NPS Calculator
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
              gap: "16px",
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
              <span style={{ fontSize: "14px", color: "#6B7280" }}>
                Current Age
              </span>
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#1F2937",
                }}
              >
                {currentAge} years
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
                Monthly Investment
              </span>
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#1F2937",
                }}
              >
                {formatCurrency(monthlyInvestment)}
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
                Expected Return
              </span>
              <span
                style={{
                  fontSize: "28px",
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
                Annuity Rate
              </span>
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#1F2937",
                }}
              >
                {annuityRate}%
              </span>
            </div>
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
            <span style={{ fontSize: "16px", color: "#6B7280" }}>
              Total Corpus at 60
            </span>
            <span
              style={{
                fontSize: "56px",
                fontWeight: "bold",
                color: "#10B981",
                lineHeight: 1.1,
              }}
            >
              {formatCurrency(totalCorpus)}
            </span>
            {inflationEnabled && (
              <span style={{ fontSize: "14px", color: "#6B7280", marginTop: "4px" }}>
                ({formatCurrency(adjustedCorpus)} in today&apos;s money)
              </span>
            )}
            <div
              style={{
                display: "flex",
                gap: "24px",
                marginTop: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                }}
              >
                <span style={{ fontSize: "12px", color: "#6B7280" }}>
                  Lumpsum ({lumpsumPercent}%)
                </span>
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#1F2937",
                  }}
                >
                  {formatCurrency(lumpsumWithdrawal)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                }}
              >
                <span style={{ fontSize: "12px", color: "#6B7280" }}>
                  Monthly Pension
                </span>
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#10B981",
                  }}
                >
                  {formatCurrency(monthlyPension)}
                </span>
              </div>
            </div>
            <span
              style={{
                fontSize: "14px",
                color: "#10B981",
                marginTop: "12px",
              }}
            >
              +{returnsPercent}% returns over {yearsToRetirement} years
            </span>
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
            Plan your retirement at dhankit.com
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
