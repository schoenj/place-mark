// import type { AxiosInstance, AxiosResponse } from 'axios';
// import axios, { AxiosError } from 'axios';
// import type {
// 	IAuthResultDto,
// 	ICategoryCreateReadWriteDto,
// 	ICategoryReadOnlyDto,
// 	IPaginatedListRequest,
// 	IPaginatedListResponse,
// 	IPlaceMarkCreateReadWriteDto,
// 	IPlaceMarkReadOnlyDto,
// 	IUserReadOnlyDto
// } from '@schoenj/place-mark-core';
// import { dev } from '$app/environment';
//
// export interface IPlaceMarkResponse<T> {
// 	statusCode: number | undefined;
// 	data: T | undefined;
// 	isSuccess: boolean;
// 	isNotFound: boolean;
// 	isValidationError: boolean;
// 	isUnauthenticated: boolean;
// 	isForbidden: boolean;
// 	errors: string[] | undefined;
// }
//
// export class PlaceMarkClient {
// 	private readonly _client: AxiosInstance;
// 	private readonly _isoDateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d*)?Z$/;
//
// 	constructor(private _baseUrl: string) {
// 		this._client = axios.create({
// 			baseURL: this._baseUrl,
// 			timeout: 5000,
// 			headers: {
// 				Accept: 'application/json'
// 			}
// 		});
// 	}
//
// 	public async authenticate$(credentials: {
// 		email: string;
// 		password: string;
// 	}): Promise<IPlaceMarkResponse<IAuthResultDto>> {
// 		const response = await this.handle$<IAuthResultDto>(() =>
// 			this._client.post('api/auth/token', {
// 				email: credentials.email,
// 				password: credentials.password
// 			})
// 		);
//
// 		return response;
// 	}
//
// 	public async createCategory$(
// 		category: ICategoryCreateReadWriteDto
// 	): Promise<IPlaceMarkResponse<ICategoryReadOnlyDto>> {
// 		const response = await this.handle$<ICategoryReadOnlyDto>(() =>
// 			this._client.post('api/category', category)
// 		);
// 		return response;
// 	}
//
// 	public async getCategoryById$(
// 		id: string
// 	): Promise<IPlaceMarkResponse<ICategoryReadOnlyDto | null>> {
// 		const response = await this.handle$<ICategoryReadOnlyDto | null>(() =>
// 			this._client.get(`api/category/${id}`)
// 		);
// 		return response;
// 	}
//
// 	public async getCategories$(
// 		listRequest: IPaginatedListRequest
// 	): Promise<IPlaceMarkResponse<IPaginatedListResponse<ICategoryReadOnlyDto>>> {
// 		const response = await this.handle$<IPaginatedListResponse<ICategoryReadOnlyDto>>(() =>
// 			this._client.get('api/category', {
// 				params: listRequest
// 			})
// 		);
// 		return response;
// 	}
//
// 	public async createPlaceMark$(
// 		placeMark: IPlaceMarkCreateReadWriteDto
// 	): Promise<IPlaceMarkResponse<IPlaceMarkReadOnlyDto>> {
// 		const response = await this.handle$<IPlaceMarkReadOnlyDto>(() =>
// 			this._client.post('api/place-mark', placeMark)
// 		);
// 		return response;
// 	}
//
// 	public async getPlaceMarkById$(
// 		id: string
// 	): Promise<IPlaceMarkResponse<IPlaceMarkReadOnlyDto | null>> {
// 		const response = await this.handle$<IPlaceMarkReadOnlyDto | null>(() =>
// 			this._client.get(`api/place-mark/${id}`)
// 		);
// 		return response;
// 	}
//
// 	public async getPlaceMarks$(
// 		listRequest: IPaginatedListRequest
// 	): Promise<IPlaceMarkResponse<IPaginatedListResponse<IPlaceMarkReadOnlyDto>>> {
// 		const response = await this.handle$<IPaginatedListResponse<IPlaceMarkReadOnlyDto>>(() =>
// 			this._client.get('api/place-mark', { params: listRequest })
// 		);
// 		return response;
// 	}
//
// 	public async getUserById$(id: string): Promise<IPlaceMarkResponse<IUserReadOnlyDto | null>> {
// 		const response = await this.handle$<IUserReadOnlyDto | null>(() =>
// 			this._client.get(`api/user/${id}`)
// 		);
// 		return response;
// 	}
//
// 	public async getUsers$(
// 		listRequest: IPaginatedListRequest
// 	): Promise<IPlaceMarkResponse<IPaginatedListResponse<IUserReadOnlyDto>>> {
// 		const response = await this.handle$<IPaginatedListResponse<IUserReadOnlyDto>>(() =>
// 			this._client.get('api/user', { params: listRequest })
// 		);
// 		return response;
// 	}
//
// 	private async handle$<T>(
// 		request$: () => Promise<AxiosResponse<T>>
// 	): Promise<IPlaceMarkResponse<T>> {
// 		try {
// 			const result = await request$();
// 			return {
// 				data: this.fixDate(result.data),
// 				statusCode: result.status,
// 				isSuccess: true,
// 				isForbidden: false,
// 				isUnauthenticated: false,
// 				isNotFound: false,
// 				isValidationError: false,
// 				errors: undefined
// 			};
// 		} catch (e) {
// 			if (axios.isAxiosError(e)) {
// 				const axiosError = e as AxiosError;
// 				return {
// 					data: undefined,
// 					statusCode: axiosError.status,
// 					isSuccess: false,
// 					isForbidden: axiosError.status === 403,
// 					isNotFound: axiosError.status === 404,
// 					isUnauthenticated: axiosError.status === 401,
// 					isValidationError: axiosError.status === 400,
// 					errors: undefined
// 				};
// 			}
//
// 			throw e;
// 		}
// 	}
//
// 	private fixDate<T>(body: T): T {
// 		if (body === null || body === undefined) {
// 			return body;
// 		}
//
// 		if (typeof body === 'function' || typeof body === 'string') {
// 			return body;
// 		}
//
// 		if (Array.isArray(body)) {
// 			const values: unknown[] = [];
// 			for (let i = 0; i < body.length; i++) {
// 				values.push(this.fixDate(body[i]));
// 			}
// 			return values as T;
// 		}
//
// 		if (typeof body !== 'object') {
// 			return body;
// 		}
//
// 		for (const key of Object.keys(body)) {
// 			const value: unknown = (body as { [key: string]: unknown })[key];
// 			if (typeof value === 'string' && this.isIsoDateString(value)) {
// 				(body as { [key: string]: unknown })[key] = new Date(value);
// 			} else {
// 				(body as { [key: string]: unknown })[key] = this.fixDate(value);
// 			}
// 		}
//
// 		return body;
// 	}
//
// 	private isIsoDateString(value: unknown): boolean {
// 		if (value === null || value === undefined) {
// 			return false;
// 		}
// 		if (typeof value === 'string') {
// 			return this._isoDateFormat.test(value);
// 		}
// 		return false;
// 	}
// }
//
// const url: string = dev
// 	? 'http://localhost:3000/'
// 	: 'https://place-mark-schoenj-backend.onrender.com/';
// export const apiClient: PlaceMarkClient = new PlaceMarkClient(url);
