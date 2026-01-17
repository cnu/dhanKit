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

export async function GET(request: NextRequest) {
  // Fetch font
  const fontData = await fetch(fontUrl).then((res) => res.arrayBuffer());

  // Get the base URL for the logo
  const { origin, searchParams } = new URL(request.url);
  const logoUrl = `${origin}/logo.png`;

  // Get params
  const targetAmount = parseInt(searchParams.get("t") || "5000000");
  const expectedReturn = parseFloat(searchParams.get("r") || "12");
  const timePeriod = parseInt(searchParams.get("y") || "10");
  const requiredSIP = parseInt(searchParams.get("sip") || "0");
  const invested = parseInt(searchParams.get("invested") || "0");
  const returns = parseInt(searchParams.get("returns") || "0");
  const stepUpEnabled = searchParams.get("su") === "1";
  const stepUpPercent = parseInt(searchParams.get("sup") || "10");

  // Calculate percentage of returns
  const returnsPercent =
    invested > 0 ? Math.round((returns / invested) * 100) : 0;

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
            Goal Planner
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
                Target Amount
              </span>
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: "600",
                  color: "#1F2937",
                }}
              >
                {formatCurrency(targetAmount)}
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
                Expected Return
              </span>
              <span
                style={{
                  fontSize: "32px",
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
              <span style={{ fontSize: "16px", color: "#6B7280" }}>
                Time Period
              </span>
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: "600",
                  color: "#1F2937",
                }}
              >
                {timePeriod} years
              </span>
            </div>
            {stepUpEnabled && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <span style={{ fontSize: "16px", color: "#6B7280" }}>
                  Annual Step-Up
                </span>
                <span
                  style={{
                    fontSize: "32px",
                    fontWeight: "600",
                    color: "#1F2937",
                  }}
                >
                  {stepUpPercent}%
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
              Required Monthly SIP
            </span>
            <span
              style={{
                fontSize: "64px",
                fontWeight: "bold",
                color: "#10B981",
                lineHeight: 1.1,
              }}
            >
              {formatCurrency(requiredSIP)}
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
                  Total Investment
                </span>
                <span
                  style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    color: "#1F2937",
                  }}
                >
                  {formatCurrency(invested)}
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
                  Returns
                </span>
                <span
                  style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    color: "#10B981",
                  }}
                >
                  {formatCurrency(returns)}
                </span>
              </div>
            </div>
            <span
              style={{
                fontSize: "16px",
                color: "#10B981",
                marginTop: "8px",
              }}
            >
              +{returnsPercent}% total returns
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
            Plan your financial goals at dhankit.com
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
