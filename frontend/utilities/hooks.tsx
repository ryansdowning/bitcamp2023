import { UserContext } from "../pages/_app";
import { makeRequest } from "../utilities/networking";
import { User } from "../utilities/types/base";
import { build, IBuildInput } from "../utilities/types/base";
import { URL_ROOT } from "../utilities/urls";
import { Button, Group, Modal, useMantineColorScheme } from "@mantine/core";
import { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from "react";

/**
 * Check if in dark mode.
 * @returns Boolean of if in dark mode.
 */
export function useDark() {
  const { colorScheme } = useMantineColorScheme();
  return colorScheme == "dark";
}

export const BASE_DEBOUNCE_TIME = 500;
export interface useResourceOptions {
  dependsOn?: any[];
  debounceTime?: number;
  required?: any[];
}

// eslint-ignore-next-line
export interface useResourcesOptions extends useResourceOptions {
  filters?: Record<string, any>;
}

/**
 *
 * @param url URL to request to.
 * @param options Options associated with the hook.
 * @returns A tuple of the resources, a function to set the resources, and the refresh function.
 */
export function useResources<T>(url: string, options?: useResourcesOptions) {
  const [resources, setResources] = useState<T[]>([]);
  const [refreshQueue, setRefreshQueue] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  function refresh() {
    setLoading(true);
    return makeRequest(
      "GET",
      URL_ROOT,
      url,
      options?.filters
        ? Object.entries(options.filters).reduce(
            // Only include filters that aren't undefined.
            (prev, el) => (el[0] != undefined && el[0].length != 0 ? { ...prev, [el[0]]: el[1] } : prev),
            {}
          )
        : {},
      true
    )
      ?.then((data) => data.map((el: IBuildInput) => build<T>(el)))
      ?.then((data) => setResources(data))
      ?.then(() => setRefreshQueue(undefined))
      ?.then(() => setLoading(false));
  }

  useEffect(
    () => {
      // If anything in the required array is undefined, do nothing.
      if (options?.required?.some((el) => el === undefined)) return;

      // Debounce the request so we don't send out a ton at once due to dependencies.
      if (refreshQueue != undefined) clearTimeout(refreshQueue);
      setLoading(true);
      setRefreshQueue(
        window.setTimeout(refresh, options?.debounceTime ? options.debounceTime : BASE_DEBOUNCE_TIME)
      );
    },
    options?.dependsOn ? options.dependsOn : []
  );

  return [resources, setResources, refresh, loading] as [
    T[],
    Dispatch<SetStateAction<T[]>>,
    () => Promise<T>,
    boolean
  ];
}

/**
 *
 * @param url URL to request to.
 * @param id Id to request for.
 * @param options Options associated with the hook.
 * @returns A tuple of the resources, a function to set the resources, and the refresh function.
 */
export function useResource<T>(url: string, id: number | string, options?: useResourceOptions) {
  const [resource, setResource] = useState<T>();
  const [refreshQueue, setRefreshQueue] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  function refresh() {
    return makeRequest("GET", URL_ROOT, `${url}${id}/`, {}, true, false)
      ?.then((data: IBuildInput) => build<T>(data))
      ?.then((data) => {
        setResource(data);
        setRefreshQueue(undefined);
        setLoading(false);
        return data;
      })
      .catch((data) => {
        setResource(undefined);
        return undefined;
      });
  }

  useEffect(
    () => {
      // If anything in the required array is undefined, do nothing.
      if (options?.required?.some((el) => el === undefined)) return;

      // Debounce the request so we don't send out a ton at once due to dependencies.
      if (refreshQueue) clearTimeout(refreshQueue);
      setLoading(true);
      setRefreshQueue(
        window.setTimeout(refresh, options?.debounceTime ? options.debounceTime : BASE_DEBOUNCE_TIME)
      );
    },
    options?.dependsOn ? options.dependsOn : []
  );

  return [resource, setResource, refresh, loading] as [
    T,
    Dispatch<SetStateAction<T>>,
    () => Promise<T>,
    boolean
  ];
}

export function useUser() {
  const [user] = useContext(UserContext);
  return [user] as [User | undefined];
}

export function useConfirm() {
  const [promise, setPromise] = useState<{ resolve: (value: unknown) => void } | null>(null);

  const confirm = () =>
    new Promise((resolve, reject) => {
      setPromise({ resolve });
    });

  const handleClose = () => {
    setPromise(null);
  };

  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };
  // You could replace the Dialog with your library's version
  const ConfirmationDialog = (
    <Modal opened={promise !== null} onClose={handleCancel} centered={true} withCloseButton={false}>
      Are you sure?
      <Group position="right">
        <Button variant="outline" onClick={handleCancel} color="gray">
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="red">
          Continue
        </Button>
      </Group>
    </Modal>
  );

  return [ConfirmationDialog, confirm] as [JSX.Element, () => Promise<unknown>];
}

export type Window = {
  width: number;
  height: number;
};

/** Bootstrap breakpoints. */
export type BREAKPOINT_NAMES = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
// eslint-disable-next-line no-unused-vars
export const breakpoints: { [key in BREAKPOINT_NAMES]: number } = {
  xs: 576,
  sm: 768,
  md: 992,
  lg: 1200,
  xl: 1400,
  xxl: 100000,
};

export type Breakpoint = {
  window: Window;
  value: BREAKPOINT_NAMES;
  largerThan: (breakpoint: BREAKPOINT_NAMES) => boolean;
  smallerThan: (breakpoint: BREAKPOINT_NAMES) => boolean;
};

/**
 * Hook used to get the bootstrap breakpoint.
 * @returns {BREAKPOINT_NAMES} Bootstrap breakpoint.
 */
export function useBreakpoint() {
  const [breakpoint, setBreakPoint] = useState<BREAKPOINT_NAMES>("xs");
  const [windowSize, setWindowSize] = useState<Window>({
    width: 0,
    height: 0,
  });

  const handleResize = () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();

    if (0 < windowSize.width && windowSize.width <= breakpoints.xs) {
      setBreakPoint("xs");
    } else if (breakpoints.xs < windowSize.width && windowSize.width <= breakpoints.sm) {
      setBreakPoint("sm");
    } else if (breakpoints.sm < windowSize.width && windowSize.width <= breakpoints.md) {
      setBreakPoint("md");
    } else if (breakpoints.md < windowSize.width && windowSize.width <= breakpoints.lg) {
      setBreakPoint("lg");
    } else if (breakpoints.lg < windowSize.width && windowSize.width <= breakpoints.xl) {
      setBreakPoint("xl");
    } else {
      setBreakPoint("xxl");
    }

    return () => window.removeEventListener("resize", handleResize);
  }, [windowSize.width]);

  return {
    window: windowSize,
    value: breakpoint,
    largerThan: (bp) => breakpoints[breakpoint] > breakpoints[bp],
    smallerThan: (bp) => breakpoints[breakpoint] < breakpoints[bp],
  } as Breakpoint;
}

export const usePrevious = <T extends unknown>(value: T): T | undefined => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

type PageSizeBreakpoint = {
  breakpoint: number;
  pageSize: number;
};

export function useResponsivePagination<T extends unknown>(
  items: T[],
  pageSizeBreakpoints: PageSizeBreakpoint[]
) {
  pageSizeBreakpoints = pageSizeBreakpoints.slice().sort((a, b) => a.breakpoint - b.breakpoint);
  const breakpoint = useBreakpoint();
  const [page, setPage] = useState(0);

  // Gets max possible breakpoint.
  const pageSize: number = pageSizeBreakpoints.reduce(
    (prev, el) => (breakpoint.window.width > el.breakpoint ? el.pageSize : prev),
    pageSizeBreakpoints[0].pageSize
  );

  const prevPageSize = usePrevious(pageSize);
  useEffect(() => {
    if (prevPageSize && prevPageSize !== pageSize) {
      if (page === 0) return;
      const itemNum = prevPageSize * page + 1;
      setPage(Math.ceil(itemNum / pageSize) - 1);
    }
  }, [pageSize]);

  const totalPages = Math.ceil(items.length / pageSize);
  return [page, setPage, totalPages, pageSize] as [number, Dispatch<SetStateAction<number>>, number, number];
}
