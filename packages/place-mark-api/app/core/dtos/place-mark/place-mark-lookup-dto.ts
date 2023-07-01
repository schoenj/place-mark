import { ILookupDto } from "../lookup-dto.js";

export interface IPlaceMarkLookupDto extends ILookupDto {
  latitude: number;
  longitude: number;
}
