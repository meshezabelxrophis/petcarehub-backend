import { NextResponse } from 'next/server';
import { updatePetLocation } from '../../../lib/petLocationStore.js';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.pet_id || !body.latitude || !body.longitude) {
      return NextResponse.json(
        { error: 'Missing required fields: pet_id, latitude, longitude' },
        { status: 400 }
      );
    }

    // Validate coordinate ranges
    if (body.latitude < -90 || body.latitude > 90) {
      return NextResponse.json(
        { error: 'Invalid latitude. Must be between -90 and 90' },
        { status: 400 }
      );
    }

    if (body.longitude < -180 || body.longitude > 180) {
      return NextResponse.json(
        { error: 'Invalid longitude. Must be between -180 and 180' },
        { status: 400 }
      );
    }

    // Update the stored location data using shared storage
    const updatedData = updatePetLocation(body);

    console.log('Pet location updated:', updatedData);

    return NextResponse.json({
      success: true,
      message: 'Location updated successfully',
      data: updatedData
    });

  } catch (error) {
    console.error('Error updating pet location:', error);
    return NextResponse.json(
      { error: 'Invalid JSON data' },
      { status: 400 }
    );
  }
}

