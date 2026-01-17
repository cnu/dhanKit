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
  const monthlyInvestment = parseInt(searchParams.get("m") || "5000");
  const expectedReturn = parseFloat(searchParams.get("r") || "12");
  const currentAge = parseInt(searchParams.get("a") || "25");
  const retirementAge = parseInt(searchParams.get("ra") || "60");
  const delayYears = parseInt(searchParams.get("d") || "5");
  const costOfDelay = parseInt(searchParams.get("cost") || "0");
  const startNowCorpus = parseInt(searchParams.get("startNow") || "0");
  const startLaterCorpus = parseInt(searchParams.get("startLater") || "0");
  const percentageLoss = parseInt(searchParams.get("pctLoss") || "0");

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
            Cost of Delay Calculator
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
                Monthly SIP
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
                Age Range
              </span>
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#1F2937",
                }}
              >
                {currentAge} → {retirementAge} years
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
                Delay Period
              </span>
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#DC2626",
                }}
              >
                {delayYears} years
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
              Cost of Delay
            </span>
            <span
              style={{
                fontSize: "56px",
                fontWeight: "bold",
                color: "#DC2626",
                lineHeight: 1.1,
              }}
            >
              {formatCurrency(costOfDelay)}
            </span>
            <span
              style={{
                fontSize: "18px",
                color: "#DC2626",
                marginTop: "4px",
              }}
            >
              -{percentageLoss}% of potential wealth
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
                <span style={{ fontSize: "12px", color: "#6B7280" }}>
                  Start at {currentAge}
                </span>
                <span
                  style={{
                    fontSize: "22px",
                    fontWeight: "600",
                    color: "#10B981",
                  }}
                >
                  {formatCurrency(startNowCorpus)}
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
                  Start at {currentAge + delayYears}
                </span>
                <span
                  style={{
                    fontSize: "22px",
                    fontWeight: "600",
                    color: "#6B7280",
                  }}
                >
                  {formatCurrency(startLaterCorpus)}
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
            Calculate your cost of delay at dhankit.com
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
