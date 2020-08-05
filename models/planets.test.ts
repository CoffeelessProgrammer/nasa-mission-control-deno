import { assertEquals, assertNotEquals } from "../deps.ts";

import { findEarthLikeQualities } from "./planets.ts";

const EARTH = {
    koi_disposition: "CONFIRMED",
    koi_prad: "1",
    koi_srad: "1",
    koi_smass: "1"
}

const FALSE_POSITIVE = {
    koi_disposition: "FALSE POSITIVE"
}

const EARTHLIKE_PLANET_SMALL = {
    koi_disposition: "CONFIRMED",
    koi_prad: "0.51",
    koi_srad: "0.991",
    koi_smass: "0.781"
}

const EARTHLIKE_PLANET_LARGE = {
    koi_disposition: "CONFIRMED",
    koi_prad: "1.49",
    koi_srad: "1.009",
    koi_smass: "1.039"
}

const TOO_LARGE_PLANETARY_RADIUS = {
    koi_disposition: "CONFIRMED",
    koi_prad: "1.50",
    koi_srad: "1.009",
    koi_smass: "1.039"
}

const TOO_LARGE_SOLAR_RADIUS = {
    koi_disposition: "CONFIRMED",
    koi_prad: "1.49",
    koi_srad: "1.01",
    koi_smass: "1.039"
}

const TOO_SMALL_SOLAR_MASS = {
    koi_disposition: "CONFIRMED",
    koi_prad: "0.51",
    koi_srad: "0.991",
    koi_smass: "0.78"
}

//---------------------------------------------------------------------
// ----------                  UNIT TESTS                    ----------
//---------------------------------------------------------------------

Deno.test({
    name: "Filter Earthlike Exoplanets",
    fn() {
        const filtered = findEarthLikeQualities([
            EARTH,
            FALSE_POSITIVE,
            EARTHLIKE_PLANET_SMALL,
            EARTHLIKE_PLANET_LARGE,
            TOO_LARGE_PLANETARY_RADIUS,
            TOO_LARGE_SOLAR_RADIUS,
            TOO_SMALL_SOLAR_MASS
        ]);

        assertEquals(filtered ,[
            EARTH,
            EARTHLIKE_PLANET_SMALL,
            EARTHLIKE_PLANET_LARGE
        ]);
    }
});
