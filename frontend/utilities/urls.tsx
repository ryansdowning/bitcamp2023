// CHANGE THESE VARIABLES AND NOTHING ELSE.
export const IS_LOCAL_SERVING_RUNNING = true;
const LOCAL_PORT = 8002;
const LOCAL_URL_ROOT = "127.0.0.1";

// FRONTEND (all local urls).
export const HOMEPAGE_URL = "/";
export const PUBLIC_URLS = ["/login", "/signup"];

// BACKEND.
export const PRODUCTION_MODE = process.env.PRODUCTION_MODE === "True";
const LOCAL = !PRODUCTION_MODE ? IS_LOCAL_SERVING_RUNNING : false;
const USE_HTTPS = !LOCAL;

export const DOMAIN = "bryce.ryansdowning.com";
const API_PREFIX = "api.";
export const HTTP_PREFIX = USE_HTTPS ? "https://" : "http://";

/**
 * Builds the basic MWS_ROOT URL.
 * @param {string} httpPrefix Is the server running on HTTP or HTTPS/SSL?
 * @param {string} serverPrefix What is the server prefix? (Ex: api)
 * @param {string} domain What is the root domain? (Ex: quandry.app)
 * @return {string} The fully built URL, accounting for whether the user is in PRODUCTION_MODE or not.
 */
const buildBase = (httpPrefix: string, serverPrefix: string, domain: string) => {
  return LOCAL ? `${HTTP_PREFIX}${LOCAL_URL_ROOT}:${LOCAL_PORT}/` : `${httpPrefix}${serverPrefix}${domain}/`;
};

export const URL_ROOT = buildBase(HTTP_PREFIX, API_PREFIX, DOMAIN) + "v1/";
export const FE_ROOT = buildBase(HTTP_PREFIX, "", DOMAIN);
