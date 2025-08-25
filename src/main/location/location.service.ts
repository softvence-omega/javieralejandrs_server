import { Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';

import axios from 'axios';
import { PrismaService } from '@project/lib/prisma/prisma.service';

interface GeocodingResponse {
  status: string;
  results: {
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }[];
}

@Injectable()
export class LocationService {
  constructor(private prisma: PrismaService) {}
  async createLocation(dto: CreateLocationDto) {
    try {
      const { name, address } = dto;
      // Google Maps Geocoding API
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      const geoRes = await axios.get<GeocodingResponse>(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`,
      );

      console.log('Geo API Response:', geoRes.data);

      if (geoRes.data.status !== 'OK') {
        throw new Error(`Invalid address: ${geoRes.data.status}`);
      }

      const { lat, lng } = geoRes.data.results[0].geometry.location;

      return this.prisma.location.create({
        data: {
          name,
          address,
          latitude: lat,
          longitude: lng,
        },
      });
    } catch (err) {
      console.log(err);
      return { message: 'Location creation failed', error: err.message };
    }
  }

  async getAllLocations() {
    return this.prisma.location.findMany();
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} location`;
  // }

  // update(id: number, updateLocationDto: UpdateLocationDto) {
  //   return `This action updates a #${id} location`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} location`;
  // }
}
