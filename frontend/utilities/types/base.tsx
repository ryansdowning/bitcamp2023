export interface IBuildInput {
  [key: string]: unknown;
}

const REGEX_ISO_8601 = new RegExp(
  /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T/.source +
    /(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])/.source +
    /(\.[0-9]+)?(Z|[+-](?:2[0-3]|[01][0-9]):[0-5][0-9])?$/.source
);
const DATE_REGEX = new RegExp(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/);

/**
 * Recursively converts all of the timestamps in an object to JS Date objects. For this cast to occur, the key
 * of the datetime string must have either 'date' or 'time' in it. These strings must be in timestamp format.
 * @template T
 * @param input Object to build.
 * @returns {T} Mutated object with timstamps converted into JS Date objects.
 */
export function build<T>(input: IBuildInput, convertToNumbers: string[] | null = null): T {
  Object.keys(input).map((key) => {
    // Check datetimes.
    if (
      typeof input[key] === "string" &&
      ((input[key] as string).match(REGEX_ISO_8601) || (input[key] as string).match(DATE_REGEX))
    ) {
      if ((input[key] as string).match(DATE_REGEX)) {
        const date = new Date(input[key] as string);
        const localOffset = date.getTimezoneOffset();
        const offsetInMinutes = -localOffset;
        const offsetInHours = Math.floor(Math.abs(offsetInMinutes) / 60)
          .toString()
          .padStart(2, "0");
        const offsetInMinutesFormatted = (Math.abs(offsetInMinutes) % 60).toString().padStart(2, "0");
        const offset = `${offsetInMinutes < 0 ? "-" : "+"}${offsetInHours}${offsetInMinutesFormatted}`;
        input[key] = `${date.toISOString().slice(0, -1)}${offset}`;
      }
      input[key] = new Date(input[key] as string);
    } else if (convertToNumbers?.includes(key)) {
      input[key] = parseFloat(input[key] as string);
    }

    // Recursively build.
    else if (typeof input[key] === "object" && input[key] !== null) {
      input[key] = build(input[key] as IBuildInput);
    }
  });
  return input as unknown as T;
}

export type Resource = {
  id: number;
};

export type User = Resource & {
  email: string;
  first_name: string;
  last_name: string;
  username: string;
};
