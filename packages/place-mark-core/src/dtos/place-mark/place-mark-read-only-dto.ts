import { ILookupDto } from "../lookup-dto.js";

export interface IPlaceMarkReadOnlyDto {
  id: string;
  designation: string;
  description: string | null;
  latitude: number;
  longitude: number;
  category: ILookupDto;
  createdBy: ILookupDto;
  createdAt: Date;
  updatedAt: Date;
}
