import { log, _ } from "../deps.ts";

// --------------- Logger Setup ---------------
await log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler("DEBUG"),

    file: new log.handlers.FileHandler("INFO", {
      filename: "./log.txt",
      formatter: "{datetime} {levelName} {msg}",
    }),
  },

  loggers: {
    default: {
      level: "DEBUG",
      handlers: ["console", "file"],
    },
  },
});

// --------------- Program Setup  ---------------
interface Launch_v4 {
  flightNumber: number;
  mission: string;
  youtubeId: string;
  ships: Array<string>;
  launchDate: number;
  upcoming: boolean;
  success?: boolean;
  targetPlanet?: string;
}

export interface Launch_v3 {
  flightNumber: number;
  mission: string;
  launchDate: number;
  rocket: string;
  customers: Array<string>;
  upcoming: boolean;
  success?: boolean;
  target?: string;
}

const launches = new Map<number, Launch_v3>();

// --------------- Helper Functions  ---------------
async function downloadLaunchData() {
  log.info("Downloading launch data...");

  const spacexAPIv4Endpoint: string = "https://api.spacexdata.com/v4/launches";
  const spacexAPIv3Endpoint: string = "https://api.spacexdata.com/v3/launches";

  const response = await fetch(
    spacexAPIv3Endpoint,
    {
      method: "GET",
    },
  );

  if (response.ok) {
    log.info("Launch data successfully downloaded!");
  } else {
    log.warning("Problem downloading launch data.");
    throw new Error("Launch data download failed.");
  }

  const launchData = await response.json();

  for (const launch of launchData) {

    // For SpaceX API v4
    const flightData_v4 = {
      flightNumber: launch["flight_number"],
      mission: launch["name"],
      ships: launch["ships"],
      youtubeId: launch["links"]["youtube_id"],
      upcoming: launch["upcoming"],
      launchDate: launch["date_unix"],
      success: launch["success"],
    };

    // For SpaceX API v3
    const payloads = launch["rocket"]["second_stage"]["payloads"];
    const customers = _.flatMap(payloads, (payload: any) => {
      return payload["customers"];
    });

    const flightData_v3 = {
      flightNumber: launch["flight_number"],
      mission: launch["mission_name"],
      rocket: launch["rocket"]["rocket_name"],
      customers: customers,
      upcoming: launch["upcoming"],
      launchDate: launch["launch_date_unix"],
      success: launch["launch_success"],
    };

    launches.set(flightData_v3.flightNumber, flightData_v3);

    // log.info(JSON.stringify(flightData));
  }
}

async function postExample() {
  const response = await fetch("https://reqres.in/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      name: "Elon Musk",
      job: "billionaire",
    }),
  });

  return response.json();
}

await downloadLaunchData();
log.info(`Downloaded data for ${launches.size} SpaceX launches.`);

export function getAllLaunches() {
  return Array.from(launches.values());
}

export function getLaunchById(launchId: number) {
  if (launches.has(launchId)) {
    return launches.get(launchId);
  }

  return null;
}

export function createLaunch(newLaunch: Launch_v3) {
  let createdLaunch: Launch_v3 = {
    flightNumber: -1,
    mission: "",
    launchDate: 0,
    rocket: "",
    customers: [],
    upcoming: false
  };

  const launchDefaults = {
    upcoming: true,
    customers: ["Zero to Mastery", "NASA"]
  };

  launches.set(newLaunch.flightNumber, Object.assign(createdLaunch, launchDefaults, newLaunch));
}

export function removeLaunch(launchId: number) {
  const aborted: Launch_v3 | undefined = launches.get(launchId);

  if(aborted) {
    aborted.upcoming = false;
    aborted.success = false;
  }

  return aborted;
}

// deno run --allow-net=api.spacexdata.com --allow-write mod.ts
// deno run --allow-net=api.spacexdata.com,reqres.in --allow-write mod.ts