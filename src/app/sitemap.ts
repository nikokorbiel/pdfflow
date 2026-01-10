import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://pdfflow-kappa.vercel.app";

  // Static pages
  const staticPages = [
    "",
    "/pricing",
    "/blog",
    "/changelog",
    "/compare",
    "/tools",
    "/privacy",
    "/terms",
  ];

  // All PDF tools
  const toolPages = [
    "/merge",
    "/split",
    "/compress",
    "/rotate",
    "/crop",
    "/reorder",
    "/delete-pages",
    "/page-numbers",
    "/pdf-to-image",
    "/pdf-to-word",
    "/pdf-to-excel",
    "/pdf-to-powerpoint",
    "/image-to-pdf",
    "/word-to-pdf",
    "/excel-to-pdf",
    "/powerpoint-to-pdf",
    "/html-to-pdf",
    "/watermark",
    "/sign",
    "/protect",
    "/unlock",
    "/flatten",
    "/redact",
    "/repair",
    "/extract-images",
    "/pdf-to-pdfa",
  ];

  // Comparison pages
  const comparePages = [
    "/compare/ilovepdf",
    "/compare/smallpdf",
    "/compare/adobe-acrobat",
    "/compare/pdf24",
  ];

  const allPages = [...staticPages, ...toolPages, ...comparePages];

  return allPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : route.startsWith("/compare") ? 0.6 : 0.8,
  }));
}
