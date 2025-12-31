// Centralized configuration for all data sources
// This file documents exactly what APIs we use and how

export interface ApiEndpoint {
  method: "GET" | "POST";
  path: string;
  purpose: string;
  description: string;
  example: string;
  exampleResponse?: Record<string, unknown>;
  parameters?: {
    name: string;
    type: string;
    description: string;
    required: boolean;
  }[];
}

export interface DataSource {
  id: string;
  displayName: string;
  description: string;
  baseUrl: string;
  docsUrl: string;
  authType: "none" | "apiKey" | "oauth";
  requiresKey: boolean;
  rateLimit: {
    perSecond: number;
    note: string;
  };
  syncSchedule: {
    cron: string;
    humanReadable: string;
    whyThisSchedule: string;
  };
  endpoints: ApiEndpoint[];
  status: "active" | "planned" | "disabled";
}

export const DATA_SOURCES: Record<string, DataSource> = {
  weather: {
    id: "weather",
    displayName: "National Weather Service",
    description:
      "The NWS provides free, public weather data for the United States. No API key required! This is a government service funded by taxpayers.",
    baseUrl: "https://api.weather.gov",
    docsUrl: "https://www.weather.gov/documentation/services-web-api",
    authType: "none",
    requiresKey: false,
    rateLimit: {
      perSecond: 1,
      note: "NWS asks users to limit requests to avoid overloading their servers. We add a 200ms delay between requests to be respectful.",
    },
    syncSchedule: {
      cron: "0 * * * *",
      humanReadable: "Every hour at :00",
      whyThisSchedule:
        "Weather conditions change gradually. Hourly updates give us fresh data without hitting rate limits. More frequent syncs (every 5 min) would risk being blocked.",
    },
    endpoints: [
      {
        method: "GET",
        path: "/points/{lat},{lon}",
        purpose: "Convert coordinates to NWS grid",
        description:
          "Takes latitude/longitude and returns the NWS forecast office (WFO) and grid coordinates. This is needed because NWS organizes data by forecast grids, not by city names.",
        example: "https://api.weather.gov/points/36.1627,-86.7816",
        parameters: [
          {
            name: "lat",
            type: "number",
            description: "Latitude (e.g., 36.1627 for Nashville)",
            required: true,
          },
          {
            name: "lon",
            type: "number",
            description: "Longitude (e.g., -86.7816 for Nashville)",
            required: true,
          },
        ],
        exampleResponse: {
          properties: {
            gridId: "OHX",
            gridX: 52,
            gridY: 60,
            forecastOffice: "https://api.weather.gov/offices/OHX",
          },
        },
      },
      {
        method: "GET",
        path: "/gridpoints/{wfo}/{x},{y}/stations",
        purpose: "Find nearest weather station",
        description:
          "Returns a list of observation stations near a grid point. We use the first (closest) station to get current conditions.",
        example: "https://api.weather.gov/gridpoints/OHX/52,60/stations",
        parameters: [
          {
            name: "wfo",
            type: "string",
            description:
              "Weather Forecast Office ID (e.g., OHX for Nashville, MRX for Morristown, MEG for Memphis)",
            required: true,
          },
          {
            name: "x",
            type: "integer",
            description: "Grid X coordinate from /points endpoint",
            required: true,
          },
          {
            name: "y",
            type: "integer",
            description: "Grid Y coordinate from /points endpoint",
            required: true,
          },
        ],
        exampleResponse: {
          features: [
            {
              properties: {
                stationIdentifier: "KBNA",
                name: "Nashville International Airport",
              },
            },
          ],
        },
      },
      {
        method: "GET",
        path: "/stations/{stationId}/observations/latest",
        purpose: "Get current weather conditions",
        description:
          "Returns the most recent observation from a weather station. Includes temperature, humidity, wind, and conditions.",
        example: "https://api.weather.gov/stations/KBNA/observations/latest",
        parameters: [
          {
            name: "stationId",
            type: "string",
            description:
              "Station identifier (e.g., KBNA for Nashville airport)",
            required: true,
          },
        ],
        exampleResponse: {
          properties: {
            temperature: { value: 15.5, unitCode: "wmoUnit:degC" },
            relativeHumidity: { value: 65 },
            windSpeed: { value: 5.2, unitCode: "wmoUnit:km_h-1" },
            windDirection: { value: 180 },
            textDescription: "Partly Cloudy",
          },
        },
      },
      {
        method: "GET",
        path: "/alerts/active?area={state}",
        purpose: "Get active weather alerts",
        description:
          "Returns all active weather alerts for a state. Includes severe weather warnings, watches, and advisories.",
        example: "https://api.weather.gov/alerts/active?area=TN",
        parameters: [
          {
            name: "area",
            type: "string",
            description: "Two-letter state code (e.g., TN for Tennessee)",
            required: true,
          },
        ],
        exampleResponse: {
          features: [
            {
              properties: {
                id: "urn:oid:2.49.0.1.840.0.example",
                event: "Winter Storm Warning",
                severity: "Severe",
                headline: "Winter Storm Warning in effect",
                description: "Heavy snow expected...",
                effective: "2024-01-15T12:00:00Z",
                expires: "2024-01-16T12:00:00Z",
              },
            },
          ],
        },
      },
    ],
    status: "active",
  },

  // Planned future data sources
  census: {
    id: "census",
    displayName: "US Census Bureau",
    description:
      "Population, demographics, housing, and economic data from the official US Census. Updated annually with American Community Survey (ACS) data.",
    baseUrl: "https://api.census.gov/data",
    docsUrl: "https://www.census.gov/data/developers/data-sets.html",
    authType: "apiKey",
    requiresKey: true,
    rateLimit: {
      perSecond: 50,
      note: "Census API is quite generous with rate limits. An API key is free but required.",
    },
    syncSchedule: {
      cron: "0 0 1 * *",
      humanReadable: "Monthly on the 1st",
      whyThisSchedule:
        "Census data changes very slowly (annual updates). Monthly syncs are more than enough.",
    },
    endpoints: [
      {
        method: "GET",
        path: "/2023/acs/acs5",
        purpose: "Get American Community Survey data",
        description:
          "5-year estimates of population, income, education, housing, and more at the county level.",
        example:
          "https://api.census.gov/data/2023/acs/acs5?get=NAME,B01001_001E&for=county:*&in=state:47",
      },
    ],
    status: "planned",
  },

  bls: {
    id: "bls",
    displayName: "Bureau of Labor Statistics",
    description:
      "Employment, unemployment, wages, and labor market data. Essential for understanding the economic health of each county.",
    baseUrl: "https://api.bls.gov/publicAPI/v2",
    docsUrl: "https://www.bls.gov/developers/",
    authType: "apiKey",
    requiresKey: true,
    rateLimit: {
      perSecond: 25,
      note: "BLS has a daily limit of 500 requests without a key, 10,000 with a key.",
    },
    syncSchedule: {
      cron: "0 0 15 * *",
      humanReadable: "Monthly on the 15th",
      whyThisSchedule:
        "BLS releases unemployment data around the 15th of each month for the previous month.",
    },
    endpoints: [
      {
        method: "POST",
        path: "/timeseries/data/",
        purpose: "Get unemployment rates",
        description:
          "Retrieve time series data for Local Area Unemployment Statistics (LAUS).",
        example: "https://api.bls.gov/publicAPI/v2/timeseries/data/",
      },
    ],
    status: "planned",
  },

  airnow: {
    id: "airnow",
    displayName: "EPA AirNow",
    description:
      "Real-time air quality data from the Environmental Protection Agency. Shows Air Quality Index (AQI) and pollutant levels.",
    baseUrl: "https://www.airnowapi.org/aq",
    docsUrl: "https://docs.airnowapi.org/",
    authType: "apiKey",
    requiresKey: true,
    rateLimit: {
      perSecond: 10,
      note: "AirNow limits to 500 requests per hour. API key is free.",
    },
    syncSchedule: {
      cron: "0 * * * *",
      humanReadable: "Every hour at :00",
      whyThisSchedule:
        "Air quality can change rapidly, especially during wildfires or high pollution days. Hourly updates keep data relevant.",
    },
    endpoints: [
      {
        method: "GET",
        path: "/observation/latLong/current",
        purpose: "Get current air quality by location",
        description:
          "Returns current AQI and primary pollutant for a geographic point.",
        example:
          "https://www.airnowapi.org/aq/observation/latLong/current/?format=json&latitude=36.16&longitude=-86.78",
      },
    ],
    status: "planned",
  },
};

// Helper to get only active sources
export function getActiveSources(): DataSource[] {
  return Object.values(DATA_SOURCES).filter((s) => s.status === "active");
}

// Helper to get planned sources
export function getPlannedSources(): DataSource[] {
  return Object.values(DATA_SOURCES).filter((s) => s.status === "planned");
}

// Educational glossary
export const GLOSSARY = {
  api: {
    term: "API",
    definition:
      "Application Programming Interface - a way for different software programs to talk to each other. Think of it like a waiter taking your order to the kitchen and bringing back your food.",
  },
  endpoint: {
    term: "Endpoint",
    definition:
      "A specific URL where you can request data. Like different aisles in a grocery store - each endpoint serves a different type of data.",
  },
  rateLimit: {
    term: "Rate Limit",
    definition:
      "A restriction on how many requests you can make in a time period. It prevents you from asking for too much data too quickly. Like a speed limit for data requests.",
  },
  cron: {
    term: "Cron Schedule",
    definition:
      "A way to tell a computer when to run a task automatically. The format '0 * * * *' means 'at minute 0 of every hour'. Named after the Greek word for time (chronos).",
  },
  upsert: {
    term: "Upsert",
    definition:
      "A database operation that updates a record if it exists, or inserts it if it doesn't. Combines 'update' and 'insert'.",
  },
  edgeFunction: {
    term: "Edge Function",
    definition:
      "A small piece of code that runs on servers close to users around the world. 'Edge' refers to the edge of the network, near the user.",
  },
  webhook: {
    term: "Webhook",
    definition:
      "A way for one system to notify another when something happens. Instead of constantly asking 'did anything change?', the system sends a message when there's an update.",
  },
};
