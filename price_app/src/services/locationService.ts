import * as Location from "expo-location";
import { Coordinates } from "../types";

export const DEMO_LOCATION: Coordinates = {
  latitude: 37.105,
  longitude: -113.574,
};
export type LocationResult = {
  coordinates: Coordinates;
  isDemo: boolean;
  message: string;
};
export async function loadLocation(): Promise<LocationResult> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== "granted")
      return {
        coordinates: DEMO_LOCATION,
        isDemo: true,
        message: "Location off · exploring St. George",
      };
    const position = await Promise.race([
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Location timed out")), 12000),
      ),
    ]);
    return {
      coordinates: position.coords,
      isDemo: false,
      message: "Your location · stores in St. George",
    };
  } catch {
    return {
      coordinates: DEMO_LOCATION,
      isDemo: true,
      message: "Location unavailable · exploring St. George",
    };
  }
}
