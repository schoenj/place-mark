export interface IPlaceMarkReadWriteDto {
    id: string;
    designation: string;
    description: string | null;
    latitude: number;
    longitude: number;
    categoryId: string | undefined;
}