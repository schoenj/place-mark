import { IUserReadOnlyDto } from "./user-read-only-dto.js";
import { ILookupDto } from "../lookup-dto.js";
import { IPlaceMarkLookupDto } from "../place-mark/place-mark-lookup-dto.js";

export interface IUserDetailsDto extends IUserReadOnlyDto {
  categories: ILookupDto[];
  placeMarks: IPlaceMarkLookupDto[];
}
