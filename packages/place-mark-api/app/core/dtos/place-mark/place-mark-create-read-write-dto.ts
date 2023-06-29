export interface IPlaceMarkCreateReadWriteDto {
  designation: string;
  description: string | null | undefined;
  latitude: number;
  longitude: number;
  categoryId: string;
  createdById?: string;
}
