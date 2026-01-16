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

function getCompoundingLabel(frequency: string): string {
  switch (frequency) {
    case "monthly":
      return "Monthly";
    case "quarterly":
      return "Quarterly";
    default:
      return "Quarterly";
  }
}

// Format tenure for display (e.g., "12 months" or "2 years 6 months")
function formatTenure(months: number): string {
  if (months < 12) {
    return `${months} month${months !== 1 ? "s" : ""}`;
  }
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? "s" : ""}`;
  }
  return `${years}y ${remainingMonths}m`;
}

export async function GET(request: NextRequest) {
  // Fetch font
  const fontData = await fetch(fontUrl).then((res) => res.arrayBuffer());

  // Get the base URL for the logo
  const { origin, searchParams } = new URL(request.url);
  const logoUrl = `${origin}/logo.png`;

  // Get params
  const monthlyDeposit = parseInt(searchParams.get("d") || "5000");
  const interestRate = parseFloat(searchParams.get("r") || "7");
  const timePeriodMonths = parseInt(searchParams.get("m") || "12");
  const maturityAmount = parseInt(searchParams.get("total") || "0");
  const deposited = parseInt(searchParams.get("deposited") || "0");
  const interest = parseInt(searchParams.get("interest") || "0");
  const compounding = searchParams.get("c") || "quarterly";

  // Calculate percentage of returns
  const returnsPercent = deposited > 0 ? Math.round((interest / deposited) * 100) : 0;

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
            RD Calculator
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
                Monthly Deposit
              </span>
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: "600",
                  color: "#1F2937",
                }}
              >
                {formatCurrency(monthlyDeposit)}
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
                Interest Rate
              </span>
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: "600",
                  color: "#1F2937",
                }}
              >
                {interestRate}% p.a.
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
                Tenure
              </span>
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: "600",
                  color: "#1F2937",
                }}
              >
                {formatTenure(timePeriodMonths)}
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
                Compounding
              </span>
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: "500",
                  color: "#1F2937",
                }}
              >
                {getCompoundingLabel(compounding)}
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
            <span style={{ fontSize: "18px", color: "#6B7280" }}>
              Maturity Amount
            </span>
            <span
              style={{
                fontSize: "64px",
                fontWeight: "bold",
                color: "#10B981",
                lineHeight: 1.1,
              }}
            >
              {formatCurrency(maturityAmount)}
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
                  Total Deposited
                </span>
                <span
                  style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    color: "#1F2937",
                  }}
                >
                  {formatCurrency(deposited)}
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
                  {formatCurrency(interest)}
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
              +{returnsPercent}% total interest
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
            Calculate your RD returns at dhankit.com
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
