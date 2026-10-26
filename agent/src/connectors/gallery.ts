/** Popular apps you can connect in one click. Any other app with an MCP link can be added by pasting its link. */
export interface GalleryApp {
  id: string;
  name: string;
  url: string;
  description: string;
  /** "signin": you sign in to the app; "token": paste an API key or token. */
  auth: "signin" | "token";
  tokenHelp?: string;
}

export const GALLERY: GalleryApp[] = [
  { id: "notion", name: "Notion", url: "https://mcp.notion.com/mcp", description: "Search, read and update your pages and databases", auth: "signin" },
  { id: "linear", name: "Linear", url: "https://mcp.linear.app/mcp", description: "Find, create and update issues and projects", auth: "signin" },
  { id: "atlassian", name: "Jira & Confluence", url: "https://mcp.atlassian.com/v1/mcp", description: "Work with Jira issues and Confluence pages", auth: "signin" },
  { id: "zapier", name: "Zapier", url: "https://mcp.zapier.com/api/mcp/mcp", description: "Reach thousands of apps through the actions you set up in Zapier", auth: "signin" },
  { id: "canva", name: "Canva", url: "https://mcp.canva.com/mcp", description: "Find, create and edit designs", auth: "signin" },
  { id: "stripe", name: "Stripe", url: "https://mcp.stripe.com", description: "Look up payments, customers, invoices and balances", auth: "signin" },
  { id: "paypal", name: "PayPal", url: "https://mcp.paypal.com/mcp", description: "Invoices, orders and transactions", auth: "signin" },
  { id: "vercel", name: "Vercel", url: "https://mcp.vercel.com", description: "Projects, deployments and logs", auth: "signin" },
  { id: "sentry", name: "Sentry", url: "https://mcp.sentry.dev/mcp", description: "Investigate errors and performance issues", auth: "signin" },
  {
    id: "github",
    name: "GitHub",
    url: "https://api.githubcopilot.com/mcp/",
    description: "Repositories, issues and pull requests",
    auth: "token",
    tokenHelp: "https://github.com/settings/personal-access-tokens/new",
  },
];
