import { NextResponse } from 'next/server';
import { getPetLocation } from '../../../lib/petLocationStore.js';

export async function GET() {
  // Get current pet location from storage
  const petLocation = getPetLocation();

  return NextResponse.json({
    latitude: petLocation.latitude,
    longitude: petLocation.longitude,
    timestamp: petLocation.timestamp
  });
}
