// Redirection configuration
export const REDIRECT_CONFIG = {
  enabled: true,
  baseUrl: "https://casebuddy.gradnext.co",
  excludePaths: ["/login", "/register", "/forgot-password", "/not-authorized"],
  preserveQueryParams: true,
  preserveHash: true,
  redirectMethod: "replace" as "replace" | "assign" | "open", // replace, assign, or open
};

// Utility function to check if a path should be excluded from redirection
export const shouldExcludeFromRedirect = (path: string): boolean => {
  return REDIRECT_CONFIG.excludePaths.some((excludePath) =>
    path.startsWith(excludePath)
  );
};

// Utility function to construct redirect URL
export const constructRedirectUrl = (
  path: string,
  search?: string,
  hash?: string
): string => {
  let redirectUrl = `${REDIRECT_CONFIG.baseUrl}${path}`;

  if (REDIRECT_CONFIG.preserveQueryParams && search) {
    redirectUrl += search;
  }

  if (REDIRECT_CONFIG.preserveHash && hash) {
    redirectUrl += hash;
  }

  return redirectUrl;
};

// Main redirection function
export const performRedirect = (
  path: string,
  search?: string,
  hash?: string
): void => {
  if (!REDIRECT_CONFIG.enabled) return;

  if (shouldExcludeFromRedirect(path)) return;

  const redirectUrl = constructRedirectUrl(path, search, hash);

  switch (REDIRECT_CONFIG.redirectMethod) {
    case "replace":
      window.location.replace(redirectUrl);
      break;
    case "assign":
      window.location.assign(redirectUrl);
      break;
    case "open":
      window.open(redirectUrl, "_self");
      break;
    default:
      window.location.href = redirectUrl;
  }
};

// Function to redirect with custom parameters
export const redirectWithParams = (
  path: string,
  params?: Record<string, string>,
  hash?: string
): void => {
  if (!REDIRECT_CONFIG.enabled) return;

  if (shouldExcludeFromRedirect(path)) return;

  let redirectUrl = `${REDIRECT_CONFIG.baseUrl}${path}`;

  // Add custom parameters
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value);
    });
    redirectUrl += `?${searchParams.toString()}`;
  }

  if (REDIRECT_CONFIG.preserveHash && hash) {
    redirectUrl += hash;
  }

  performRedirect(
    path,
    params ? `?${new URLSearchParams(params).toString()}` : undefined,
    hash
  );
};
