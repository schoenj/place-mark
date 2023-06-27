import { ILookupDto } from "../lookup-dto.js";

export interface ICategoryReadOnlyDto {
  id: string;
  designation: string;
  createdBy: ILookupDto;
  createdAt: Date;
  updatedAt: Date;
}
