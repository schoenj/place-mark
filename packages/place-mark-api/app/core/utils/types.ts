export type KeyOf<T extends object> = Extract<keyof T, string>;

export type RequiredKeys<T extends object> = { [K in KeyOf<T>]-?: object extends Pick<T, K> ? never : K }[KeyOf<T>];

// export type OptionalKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? K : never }[keyof T];
