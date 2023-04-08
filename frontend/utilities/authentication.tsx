import { makeRequest } from "../utilities/networking";
import { URL_ROOT, PUBLIC_URLS } from "../utilities/urls";
import { showNotification } from "@mantine/notifications";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

/**
 * Checks if the user is logged in. Here, logged in means 'is there a token cookie set?'.
 * @return {boolean} Whether or not the user is logged in.
 */
export const isLoggedIn = () => {
  return Cookies.get("token") !== undefined;
};

interface IRouteGuardProps {
  /** Child components to show if logged in. */
  children: React.ReactNode;
}

// eslint-disable-next-line valid-jsdoc
/**
 * Component used to wrap the main app. Checks if the user is not logged in and trying to access a URL that isn't in
 * the `PUBLIC_URLS` array found in `src/utilities/urls.tsx`. If they are trying to access a restricted URL without
 * being authorized, it will redirect them back to the login page. It's important to note that this is CLIENT SIDE
 * AUTHENTICATION, and is very possible to get around. However, since a user needs tokens to send any requests to
 * the backend API, all they would see if they disabled this is a bunch of 403 errors and blank pages.
 */
export function RouteGuard(props: IRouteGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoggedIn() && !PUBLIC_URLS.includes(router.route)) {
      router.push("/login").then(() => setIsAuthorized(true));
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  return <>{isAuthorized && props.children}</>;
}

/**
 * Function that properly sets cookies and expirations for logging a user in.
 * @param rememberMe Whether or not the user wants to be remembered. If yes, this token will expire in 10 years.
 * If no, the token is a session token.
 * @param token Token to set.
 */
export function login(rememberMe: boolean, token: string) {
  if (rememberMe) {
    Cookies.set("token", token, { expires: 365 * 10 });
  } else {
    Cookies.set("token", token);
  }
}

/**
 * Logs a user out by removing their cookie.
 */
export function logout() {
  Cookies.remove("token");
}

/**
 * Changes a user's password.
 */
export function changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
  return makeRequest(
    "PATCH",
    URL_ROOT,
    "auth/change-password/",
    {
      current_password: currentPassword,
      password: newPassword,
      password2: confirmPassword,
    },
    true,
    false
  )?.then(() =>
    showNotification({
      title: "Success!",
      message: "Password updated!",
    })
  );
}
