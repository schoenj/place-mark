export interface IPlaceMarkCreateReadWriteDto {
  designation: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  categoryId: string;
  createdById: string | undefined;
}
