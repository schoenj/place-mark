import { ICategoryReadOnlyDto } from "./category-read-only-dto.js";
import { IPlaceMarkLookupDto } from "../place-mark/place-mark-lookup-dto.js";

export interface ICategoryDetailsDto extends ICategoryReadOnlyDto {
  placeMarks: IPlaceMarkLookupDto[];
}
