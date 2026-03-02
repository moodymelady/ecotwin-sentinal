// ━━━ Data Ingestion Webhook – IoT / Satellite / Document ━━━
import { NextRequest, NextResponse } from "next/server";
import type { SensorReading, SatelliteDataPoint } from "@/types";

// In-memory store for demo (replace with DB in production)
const sensorBuffer: SensorReading[] = [];
const satelliteBuffer: SatelliteDataPoint[] = [];

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { type, payload } = body;

        switch (type) {
            case "sensor": {
                const reading: SensorReading = {
                    sensorId: payload.sensorId ?? `SEN-${Date.now()}`,
                    facilityId: payload.facilityId ?? "FAC-001",
                    metric: payload.metric ?? "energy_kwh",
                    value: payload.value ?? 0,
                    unit: payload.unit ?? "kWh",
                    timestamp: payload.timestamp ?? new Date().toISOString(),
                    location: payload.location ?? { lat: 0, lng: 0 },
                };
                sensorBuffer.push(reading);
                return NextResponse.json({
                    success: true,
                    message: "Sensor data ingested",
                    dataPointId: reading.sensorId,
                    bufferSize: sensorBuffer.length,
                });
            }

            case "satellite": {
                const dataPoint: SatelliteDataPoint = {
                    source: payload.source ?? "sentinel_2",
                    captureDate: payload.captureDate ?? new Date().toISOString(),
                    region: payload.region ?? { lat: 0, lng: 0, radius_km: 10 },
                    indices: payload.indices ?? {},
                    imageUrl: payload.imageUrl,
                };
                satelliteBuffer.push(dataPoint);
                return NextResponse.json({
                    success: true,
                    message: "Satellite data ingested",
                    source: dataPoint.source,
                    bufferSize: satelliteBuffer.length,
                });
            }

            case "document": {
                // For documents / PDFs — in production, this would upload to GCS
                // and trigger the context caching pipeline
                return NextResponse.json({
                    success: true,
                    message: "Document queued for processing",
                    documentId: `DOC-${Date.now()}`,
                    nextStep: "context_caching",
                });
            }

            default:
                return NextResponse.json(
                    { error: `Unknown ingestion type: ${type}` },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error("Ingestion error:", error);
        return NextResponse.json(
            { error: "Failed to process ingestion payload" },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        sensorCount: sensorBuffer.length,
        satelliteCount: satelliteBuffer.length,
        recentSensors: sensorBuffer.slice(-5),
        recentSatellite: satelliteBuffer.slice(-5),
    });
}
