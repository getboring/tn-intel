import { createClient } from "@supabase/supabase-js";

// All 95 Tennessee counties with FIPS codes and center coordinates
const TN_COUNTIES = [
  { fips: "47001", name: "Anderson", lat: 36.1189, lon: -84.1983 },
  { fips: "47003", name: "Bedford", lat: 35.5136, lon: -86.4589 },
  { fips: "47005", name: "Benton", lat: 36.0692, lon: -88.0683 },
  { fips: "47007", name: "Bledsoe", lat: 35.5936, lon: -85.2047 },
  { fips: "47009", name: "Blount", lat: 35.6867, lon: -83.9253 },
  { fips: "47011", name: "Bradley", lat: 35.1536, lon: -84.8614 },
  { fips: "47013", name: "Campbell", lat: 36.3981, lon: -84.1494 },
  { fips: "47015", name: "Cannon", lat: 35.8086, lon: -86.0614 },
  { fips: "47017", name: "Carroll", lat: 35.9756, lon: -88.4342 },
  { fips: "47019", name: "Carter", lat: 36.2917, lon: -82.1264 },
  { fips: "47021", name: "Cheatham", lat: 36.2631, lon: -87.0861 },
  { fips: "47023", name: "Chester", lat: 35.4206, lon: -88.6139 },
  { fips: "47025", name: "Claiborne", lat: 36.4853, lon: -83.6603 },
  { fips: "47027", name: "Clay", lat: 36.5514, lon: -85.5428 },
  { fips: "47029", name: "Cocke", lat: 35.9281, lon: -83.1186 },
  { fips: "47031", name: "Coffee", lat: 35.4847, lon: -86.0764 },
  { fips: "47033", name: "Crockett", lat: 35.8128, lon: -89.1425 },
  { fips: "47035", name: "Cumberland", lat: 35.9508, lon: -84.9983 },
  { fips: "47037", name: "Davidson", lat: 36.1667, lon: -86.7833 },
  { fips: "47039", name: "Decatur", lat: 35.6028, lon: -88.1089 },
  { fips: "47041", name: "DeKalb", lat: 35.9797, lon: -85.8336 },
  { fips: "47043", name: "Dickson", lat: 36.1478, lon: -87.3639 },
  { fips: "47045", name: "Dyer", lat: 36.0592, lon: -89.4147 },
  { fips: "47047", name: "Fayette", lat: 35.1972, lon: -89.4139 },
  { fips: "47049", name: "Fentress", lat: 36.3803, lon: -84.9372 },
  { fips: "47051", name: "Franklin", lat: 35.1544, lon: -86.0911 },
  { fips: "47053", name: "Gibson", lat: 35.9903, lon: -88.9347 },
  { fips: "47055", name: "Giles", lat: 35.2022, lon: -87.0314 },
  { fips: "47057", name: "Grainger", lat: 36.2781, lon: -83.5092 },
  { fips: "47059", name: "Greene", lat: 36.1750, lon: -82.8450 },
  { fips: "47061", name: "Grundy", lat: 35.3872, lon: -85.7228 },
  { fips: "47063", name: "Hamblen", lat: 36.2172, lon: -83.2689 },
  { fips: "47065", name: "Hamilton", lat: 35.1817, lon: -85.1603 },
  { fips: "47067", name: "Hancock", lat: 36.5236, lon: -83.2219 },
  { fips: "47069", name: "Hardeman", lat: 35.2058, lon: -88.9947 },
  { fips: "47071", name: "Hardin", lat: 35.2022, lon: -88.1839 },
  { fips: "47073", name: "Hawkins", lat: 36.4469, lon: -82.9411 },
  { fips: "47075", name: "Haywood", lat: 35.5803, lon: -89.2808 },
  { fips: "47077", name: "Henderson", lat: 35.6508, lon: -88.3917 },
  { fips: "47079", name: "Henry", lat: 36.3303, lon: -88.2989 },
  { fips: "47081", name: "Hickman", lat: 35.8022, lon: -87.4739 },
  { fips: "47083", name: "Houston", lat: 36.2833, lon: -87.7167 },
  { fips: "47085", name: "Humphreys", lat: 36.0414, lon: -87.7794 },
  { fips: "47087", name: "Jackson", lat: 36.3581, lon: -85.6683 },
  { fips: "47089", name: "Jefferson", lat: 36.0433, lon: -83.4486 },
  { fips: "47091", name: "Johnson", lat: 36.4558, lon: -81.8581 },
  { fips: "47093", name: "Knox", lat: 35.9928, lon: -83.9372 },
  { fips: "47095", name: "Lake", lat: 36.3403, lon: -89.4881 },
  { fips: "47097", name: "Lauderdale", lat: 35.7603, lon: -89.6289 },
  { fips: "47099", name: "Lawrence", lat: 35.2206, lon: -87.3967 },
  { fips: "47101", name: "Lewis", lat: 35.5244, lon: -87.4978 },
  { fips: "47103", name: "Lincoln", lat: 35.1486, lon: -86.5803 },
  { fips: "47105", name: "Loudon", lat: 35.7386, lon: -84.3103 },
  { fips: "47107", name: "McMinn", lat: 35.4344, lon: -84.6186 },
  { fips: "47109", name: "McNairy", lat: 35.1764, lon: -88.5603 },
  { fips: "47111", name: "Macon", lat: 36.5306, lon: -86.0058 },
  { fips: "47113", name: "Madison", lat: 35.6103, lon: -88.8372 },
  { fips: "47115", name: "Marion", lat: 35.1361, lon: -85.6172 },
  { fips: "47117", name: "Marshall", lat: 35.4678, lon: -86.7647 },
  { fips: "47119", name: "Maury", lat: 35.6186, lon: -87.0778 },
  { fips: "47121", name: "Meigs", lat: 35.5125, lon: -84.8119 },
  { fips: "47123", name: "Monroe", lat: 35.4428, lon: -84.2494 },
  { fips: "47125", name: "Montgomery", lat: 36.4978, lon: -87.3783 },
  { fips: "47127", name: "Moore", lat: 35.2858, lon: -86.3581 },
  { fips: "47129", name: "Morgan", lat: 36.1361, lon: -84.6167 },
  { fips: "47131", name: "Obion", lat: 36.3575, lon: -89.1478 },
  { fips: "47133", name: "Overton", lat: 36.3456, lon: -85.3022 },
  { fips: "47135", name: "Perry", lat: 35.6389, lon: -87.8672 },
  { fips: "47137", name: "Pickett", lat: 36.5561, lon: -85.0592 },
  { fips: "47139", name: "Polk", lat: 35.1114, lon: -84.5303 },
  { fips: "47141", name: "Putnam", lat: 36.1650, lon: -85.4947 },
  { fips: "47143", name: "Rhea", lat: 35.6058, lon: -84.9261 },
  { fips: "47145", name: "Roane", lat: 35.8478, lon: -84.5275 },
  { fips: "47147", name: "Robertson", lat: 36.5250, lon: -86.8694 },
  { fips: "47149", name: "Rutherford", lat: 35.8428, lon: -86.4161 },
  { fips: "47151", name: "Scott", lat: 36.4328, lon: -84.5058 },
  { fips: "47153", name: "Sequatchie", lat: 35.3700, lon: -85.4072 },
  { fips: "47155", name: "Sevier", lat: 35.7867, lon: -83.5219 },
  { fips: "47157", name: "Shelby", lat: 35.1867, lon: -89.8958 },
  { fips: "47159", name: "Smith", lat: 36.2550, lon: -85.9583 },
  { fips: "47161", name: "Stewart", lat: 36.5003, lon: -87.8369 },
  { fips: "47163", name: "Sullivan", lat: 36.5122, lon: -82.3047 },
  { fips: "47165", name: "Sumner", lat: 36.4686, lon: -86.4597 },
  { fips: "47167", name: "Tipton", lat: 35.4994, lon: -89.7594 },
  { fips: "47169", name: "Trousdale", lat: 36.3928, lon: -86.1547 },
  { fips: "47171", name: "Unicoi", lat: 36.1086, lon: -82.4308 },
  { fips: "47173", name: "Union", lat: 36.2878, lon: -83.8378 },
  { fips: "47175", name: "Van Buren", lat: 35.6972, lon: -85.4522 },
  { fips: "47177", name: "Warren", lat: 35.6781, lon: -85.7753 },
  { fips: "47179", name: "Washington", lat: 36.2933, lon: -82.4972 },
  { fips: "47181", name: "Wayne", lat: 35.2392, lon: -87.7889 },
  { fips: "47183", name: "Weakley", lat: 36.2986, lon: -88.7189 },
  { fips: "47185", name: "White", lat: 35.9278, lon: -85.4550 },
  { fips: "47187", name: "Williamson", lat: 35.8933, lon: -86.8992 },
  { fips: "47189", name: "Wilson", lat: 36.1522, lon: -86.2989 },
];

async function fetchNWSGridPoint(lat: number, lon: number): Promise<{ gridId: string; gridX: number; gridY: number } | null> {
  try {
    const response = await fetch(`https://api.weather.gov/points/${lat},${lon}`, {
      headers: { "User-Agent": "tn-intel/1.0 (github.com/getboring/tn-intel)" },
    });

    if (!response.ok) {
      console.error(`NWS API error for ${lat},${lon}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return {
      gridId: data.properties.gridId,
      gridX: data.properties.gridX,
      gridY: data.properties.gridY,
    };
  } catch (error) {
    console.error(`Failed to fetch NWS grid for ${lat},${lon}:`, error);
    return null;
  }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function seedCounties() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log(`Seeding ${TN_COUNTIES.length} Tennessee counties...`);

  for (let i = 0; i < TN_COUNTIES.length; i++) {
    const county = TN_COUNTIES[i];

    // Fetch NWS grid point (with rate limiting)
    console.log(`[${i + 1}/${TN_COUNTIES.length}] Processing ${county.name}...`);

    const nwsGrid = await fetchNWSGridPoint(county.lat, county.lon);

    const { error } = await supabase.from("counties").upsert(
      {
        fips_code: county.fips,
        name: county.name,
        lat: county.lat,
        lon: county.lon,
        nws_grid_id: nwsGrid?.gridId || null,
        nws_grid_x: nwsGrid?.gridX || null,
        nws_grid_y: nwsGrid?.gridY || null,
      },
      { onConflict: "fips_code" }
    );

    if (error) {
      console.error(`Failed to insert ${county.name}:`, error);
    } else {
      console.log(`  ✓ ${county.name} (${nwsGrid?.gridId || "no grid"})`);
    }

    // Rate limit: NWS asks for no more than ~1 req/sec
    await sleep(500);
  }

  console.log("\nSeeding complete!");
}

seedCounties();
