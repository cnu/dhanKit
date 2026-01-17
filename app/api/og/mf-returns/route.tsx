import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

// Load Noto Sans font which supports the rupee symbol
const fontUrl =
  "https://fonts.gstatic.com/s/notosans/v36/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyD9A99d.ttf";

export async function GET(request: NextRequest) {
  // Fetch font
  const fontData = await fetch(fontUrl).then((res) => res.arrayBuffer());

  // Get the base URL for the logo
  const { origin, searchParams } = new URL(request.url);
  const logoUrl = `${origin}/logo.png`;

  // Get params
  const purchaseNAV = parseFloat(searchParams.get("pn") || "100");
  const currentNAV = parseFloat(searchParams.get("cn") || "150");
  const holdingYears = parseInt(searchParams.get("y") || "3");
  const holdingMonths = parseInt(searchParams.get("m") || "0");
  const cagr = parseFloat(searchParams.get("cagr") || "14.47");
  const absoluteReturns = parseFloat(searchParams.get("abs") || "50");

  const isPositive = cagr >= 0;
  const primaryColor = isPositive ? "#10B981" : "#EF4444";

  // Format holding period
  const periodParts = [];
  if (holdingYears > 0) {
    periodParts.push(`${holdingYears} year${holdingYears > 1 ? "s" : ""}`);
  }
  if (holdingMonths > 0) {
    periodParts.push(`${holdingMonths} month${holdingMonths > 1 ? "s" : ""}`);
  }
  const periodText = periodParts.length > 0 ? periodParts.join(" ") : "0 months";

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
            Mutual Fund Returns Calculator
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
                Purchase NAV
              </span>
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: "600",
                  color: "#1F2937",
                }}
              >
                ₹{purchaseNAV.toFixed(2)}
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
                Current NAV
              </span>
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: "600",
                  color: "#1F2937",
                }}
              >
                ₹{currentNAV.toFixed(2)}
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
                Holding Period
              </span>
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: "600",
                  color: "#1F2937",
                }}
              >
                {periodText}
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
              CAGR (Annualized Return)
            </span>
            <span
              style={{
                fontSize: "72px",
                fontWeight: "bold",
                color: primaryColor,
                lineHeight: 1.1,
              }}
            >
              {isPositive ? "+" : ""}
              {cagr}%
            </span>
            <span
              style={{
                fontSize: "16px",
                color: "#6B7280",
                marginTop: "4px",
              }}
            >
              per year (compounded)
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
                  Absolute Return
                </span>
                <span
                  style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    color: primaryColor,
                  }}
                >
                  {isPositive ? "+" : ""}
                  {absoluteReturns}%
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
                  NAV Change
                </span>
                <span
                  style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    color: primaryColor,
                  }}
                >
                  {isPositive ? "+" : ""}₹{(currentNAV - purchaseNAV).toFixed(2)}
                </span>
              </div>
            </div>
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
            Calculate your mutual fund returns at dhankit.com
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
