import { Resource } from "../utilities/types/base";
import { URL_ROOT } from "../utilities/urls";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import Cookies from "js-cookie";

/**
 * Interval to refresh data. This is used when we want to dynamically update user's components with new information.
 * An example of this is when displaying backtests, we want to refresh that data every once in a while to show updated
 * time estimates, completions, etc.
 */
export const DATA_REFRESH_INTERVAL = 5000; // ms

export interface MakeRequestOptions {
  autoCatch?: boolean;
  notify?: boolean;
}

/**
 * Method to make a request.
 * @param {string} method Type of request to make, currently supports GET|POST|PUT|DELETE.
 * @param {string} URL Base URL to make the request to.
 * @param {string} extension URL Extension to use. Will be appended to URL.
 * @param {Record<String, any>} params Any parameters to pass to this argument. For GET|DELETE, these arguments are
 * passed as query parameters, but for POST|PUT, they are passed as FormData.
 * @param {boolean} isAuthorized Whether or not this user should be authorized to make this request. If false, no
 * token will be sent, but if true, the token will be sent.
 * @param {string} contentType ContentType header.
 * @return {Promise} Promise of request made.
 */
export const makeRequest = (
  method: string,
  URL: string,
  extension: string,
  params: { [key: string]: unknown },
  isAuthorized = false,
  autoCatch = true,
  contentType = "application/json"
) => {
  const toFormData = (data: { [key: string]: unknown }) => {
    const formData = new FormData();
    Object.keys(data).forEach((key: string) => formData.append(key, data[key] as string));
    return formData;
  };

  // Add auth header.
  if (isAuthorized) {
    axios.defaults.headers.common["Authorization"] = "Token " + Cookies.get("token");
  } else {
    axios.defaults.headers.common["Authorization"] = "";
  }

  const headers = {
    "Content-Type": contentType,
  };

  let chain = null;
  switch (method) {
    case "GET":
      chain = axios.get(URL + extension, { headers: headers, params: params }).then((res) => res.data);
      break;
    case "DELETE":
      chain = axios
        .delete(URL + extension, { headers: headers, data: toFormData(params) })
        .then((res) => res.data);
      break;
    case "PUT":
      chain = axios.put(URL + extension, toFormData(params), { headers: headers }).then((res) => res.data);
      break;
    case "POST":
      chain = axios
        .post(URL + extension, toFormData(params), {
          headers: { ...headers, "Content-Type": "multipart/form-data" },
        })
        .then((res) => res.data);
      break;
    case "PATCH":
      chain = axios.patch(URL + extension, toFormData(params), { headers: headers }).then((res) => res.data);
  }
  if (autoCatch && chain)
    chain = chain.catch(() => showNotification({ title: "Error", message: "Something went wrong." }));
  return chain;
};

/**
 * Function that returns a promise to have a delay effect without blocking React.
 * @param delay Milliseconds of delay.
 * @returns {Promise<void>} Promise that finished after delay is over.
 */
export function delay(delay: number) {
  return new Promise((res) => setTimeout(res, delay));
}

export function removeUndefinedValues(record: Record<string, any>) {
  return Object.keys(record).forEach((key) => record[key] === undefined && delete record[key]);
}

export function convertDatesToISOString(record: Record<string, any>) {
  return Object.entries(record).forEach(
    ([key, value]) => value instanceof Date && (record[key] = value.toISOString())
  );
}

export function createResource<T extends Resource>(
  url: string,
  resource: {
    [x in keyof Omit<T, "id">]: T[x] extends Resource | undefined ? number : T[x];
  },
  options?: MakeRequestOptions
) {
  removeUndefinedValues(resource);
  convertDatesToISOString(resource);
  return makeRequest(
    "POST",
    URL_ROOT,
    url,
    resource as Record<string, unknown>,
    true,
    options?.autoCatch ? options.autoCatch : true
  )?.then((data: T) => {
    options?.notify != false &&
      showNotification({
        color: "green",
        title: "Resource created 👍",
        message: "Popped into existence!",
      });
    return data;
  });
}

export function updateResource<T extends Resource>(
  url: string,
  resource: Resource & Partial<Omit<T, "id">>,
  options?: MakeRequestOptions & { omit?: Set<string> }
) {
  const { id, ..._resource } = resource;
  Object.keys(_resource).forEach((key) => {
    if (
      options?.omit?.has(key) ||
      (_resource as any)[key] === undefined ||
      (_resource as any)[key] === null
    ) {
      delete (_resource as any)[key];
      return;
    }

    // If we're passing in an object, use the ID.
    if (
      typeof (_resource as any)[key] === "object" &&
      (_resource as any)[key] !== null &&
      !Array.isArray((_resource as any)[key])
    ) {
      (_resource as any)[key] = ((_resource as any)[key] as Resource).id;
    }
  });
  convertDatesToISOString(_resource);
  return makeRequest(
    "PATCH",
    URL_ROOT,
    url + id.toString() + "/",
    _resource as Record<string, unknown>,
    true,
    options?.autoCatch ? options.autoCatch : true
  )?.then(
    () =>
      options?.notify != false &&
      showNotification({
        title: "Sucess!",
        message: "Resource updated!",
        color: "green",
      })
  );
}

export function deleteResource(url: string, id: number | string, options?: MakeRequestOptions) {
  return makeRequest("DELETE", URL_ROOT, url + id + "/", {}, true)?.then(
    () =>
      options?.notify != false &&
      showNotification({
        color: "green",
        title: "Resource deleted 👍",
        message: "Wiped from your mind!",
      })
  );
}
