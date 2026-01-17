import { MetadataRoute } from "next";
import { getAllPostSlugs } from "@/lib/posts";

const BASE_URL = "https://dhankit.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static pages with high priority
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/articles`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Calculator pages - high priority, core content
  const calculators = [
    "sip-calculator",
    "emi-calculator",
    "ppf-calculator",
    "fd-calculator",
    "lumpsum-calculator",
    "nps-calculator",
    "swp-calculator",
    "cagr-calculator",
    "rd-calculator",
    "cost-of-delay-calculator",
    "goal-planner-calculator",
    "gratuity-calculator",
  ];

  const calculatorPages: MetadataRoute.Sitemap = calculators.map((calc) => ({
    url: `${BASE_URL}/${calc}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  // Article pages - dynamically generated from _posts
  const articleSlugs = getAllPostSlugs();
  const articlePages: MetadataRoute.Sitemap = articleSlugs.map((slug) => ({
    url: `${BASE_URL}/articles/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...calculatorPages, ...articlePages];
}
