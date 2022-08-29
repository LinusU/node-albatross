import * as mongodb from 'mongodb'

export { Binary, Code, Decimal128, Double, Int32, Long, MaxKey, MinKey, ObjectId, Timestamp } from 'mongodb'

type DeepReadonly<T> = T extends Date | RegExp | string | number | boolean | bigint | symbol | undefined | null
  ? T
  : T extends {}
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : Readonly<T>

type SpecificProjection<T, TProjection> = Omit<T, 'projection'> & { projection: TProjection }
type WithoutProjection<T> = T & { fields?: undefined, projection?: undefined }

export interface Collection<TSchema extends { _id: any }> {
  readonly parent: Albatross
  id (hexString?: mongodb.ObjectId | string): mongodb.ObjectId

  findOne (filter: mongodb.Filter<TSchema>, options?: WithoutProjection<mongodb.FindOptions<TSchema>>): Promise<TSchema | null>
  findOne<TKey extends keyof TSchema> (filter: mongodb.Filter<TSchema>, options: SpecificProjection<mongodb.FindOptions<TSchema>, { [key in TKey]: 1 | true } & { _id: 0 | false }>): Promise<Pick<TSchema, TKey> | null>
  findOne<TKey extends keyof TSchema> (filter: mongodb.Filter<TSchema>, options: SpecificProjection<mongodb.FindOptions<TSchema>, { [key in TKey]: 1 | true } & { _id?: 1 | true }>): Promise<Pick<TSchema, '_id' | TKey> | null>
  findOne (filter: mongodb.Filter<TSchema>, options: mongodb.FindOptions<TSchema>): Promise<object | null>

  find (query: mongodb.Filter<TSchema>, options?: WithoutProjection<mongodb.FindOptions<TSchema>>): Promise<TSchema[]>
  find<TKey extends keyof TSchema> (query: mongodb.Filter<TSchema>, options: SpecificProjection<mongodb.FindOptions<TSchema>, { [key in TKey]: 1 | true } & { _id: 0 | false }>): Promise<Array<Pick<TSchema, TKey>>>
  find<TKey extends keyof TSchema> (query: mongodb.Filter<TSchema>, options: SpecificProjection<mongodb.FindOptions<TSchema>, { [key in TKey]: 1 | true } & { _id?: 1 | true }>): Promise<Array<Pick<TSchema, '_id' | TKey>>>
  find (query: mongodb.Filter<TSchema>, options: mongodb.FindOptions<TSchema>): Promise<object[]>

  count (query?: mongodb.Filter<TSchema>, options?: mongodb.CountOptions): Promise<number>

  distinct<TKey extends keyof mongodb.WithId<TSchema>> (key: TKey, query?: mongodb.Filter<TSchema>, options?: mongodb.DistinctOptions): Promise<Array<mongodb.Flatten<mongodb.WithId<TSchema>[TKey]>>>
  distinct (key: string, query?: mongodb.Filter<TSchema>, options?: mongodb.DistinctOptions): Promise<any[]>

  exists (query?: mongodb.Filter<TSchema>): Promise<boolean>

  insert (doc: DeepReadonly<mongodb.OptionalId<TSchema>>, options?: mongodb.InsertOneOptions): Promise<mongodb.WithId<TSchema>>
  insert (docs: DeepReadonly<mongodb.OptionalId<TSchema>>[], options?: mongodb.BulkWriteOptions): Promise<mongodb.WithId<TSchema>[]>

  findOneAndUpdate (filter: mongodb.Filter<TSchema>, update: mongodb.UpdateFilter<TSchema>, options: WithoutProjection<mongodb.FindOneAndUpdateOptions & { returnDocument: 'after', upsert: true }>): Promise<TSchema>
  findOneAndUpdate (filter: mongodb.Filter<TSchema>, update: mongodb.UpdateFilter<TSchema>, options?: WithoutProjection<mongodb.FindOneAndUpdateOptions>): Promise<TSchema | null>

  findOneAndUpdate<TKey extends keyof TSchema> (filter: mongodb.Filter<TSchema>, update: mongodb.UpdateFilter<TSchema>, options: SpecificProjection<mongodb.FindOneAndUpdateOptions & { returnDocument: 'after', upsert: true }, { [key in TKey]: 1 | true } & { _id: 0 | false }>): Promise<Pick<TSchema, TKey>>
  findOneAndUpdate<TKey extends keyof TSchema> (filter: mongodb.Filter<TSchema>, update: mongodb.UpdateFilter<TSchema>, options: SpecificProjection<mongodb.FindOneAndUpdateOptions, { [key in TKey]: 1 | true } & { _id: 0 | false }>): Promise<Pick<TSchema, TKey> | null>

  findOneAndUpdate<TKey extends keyof TSchema> (filter: mongodb.Filter<TSchema>, update: mongodb.UpdateFilter<TSchema>, options: SpecificProjection<mongodb.FindOneAndUpdateOptions & { returnDocument: 'after', upsert: true }, { [key in TKey]: 1 | true } & { _id?: 1 | true }>): Promise<Pick<TSchema, '_id' | TKey>>
  findOneAndUpdate<TKey extends keyof TSchema> (filter: mongodb.Filter<TSchema>, update: mongodb.UpdateFilter<TSchema>, options: SpecificProjection<mongodb.FindOneAndUpdateOptions, { [key in TKey]: 1 | true } & { _id?: 1 | true }>): Promise<Pick<TSchema, '_id' | TKey> | null>

  findOneAndUpdate (filter: mongodb.Filter<TSchema>, update: mongodb.UpdateFilter<TSchema>, options: mongodb.FindOneAndUpdateOptions & { returnDocument: 'after', upsert: true }): Promise<object>
  findOneAndUpdate (filter: mongodb.Filter<TSchema>, update: mongodb.UpdateFilter<TSchema>, options?: mongodb.FindOneAndUpdateOptions): Promise<object | null>

  updateOne (filter: mongodb.Filter<TSchema>, update: mongodb.UpdateFilter<TSchema> | Partial<TSchema>, options?: mongodb.UpdateOptions): Promise<{ matched: 0 | 1, modified: 0 | 1 }>
  updateMany (filter: mongodb.Filter<TSchema>, update: mongodb.UpdateFilter<TSchema>, options?: mongodb.UpdateOptions): Promise<{ matched: number, modified: number }>

  deleteOne (filter: mongodb.Filter<TSchema>, options?: mongodb.DeleteOptions): Promise<0 | 1>
  deleteMany (filter: mongodb.Filter<TSchema>, options?: mongodb.DeleteOptions): Promise<number>

  aggregate (pipeline: object[], options?: mongodb.AggregateOptions): Promise<object[]>
}

export interface FileInfo {
  id: mongodb.ObjectId
  length: number
  chunkSize: number
  uploadDate: Date
  contentType: string
  filename: string
  metadata: any
}

export interface Grid {
  readonly parent: Albatross
  id (hexString?: mongodb.ObjectId | string): mongodb.ObjectId
  upload (stream: NodeJS.ReadableStream, options?: mongodb.GridFSBucketWriteStreamOptions & { filename?: string }): Promise<FileInfo>
  download (id: mongodb.ObjectId): Promise<FileInfo & { stream: NodeJS.ReadableStream }>
  delete (id: mongodb.ObjectId): Promise<void>
}

export interface Albatross {
  id (hexString?: mongodb.ObjectId | string): mongodb.ObjectId
  collection<TSchema extends { _id: any }> (name: string): Collection<TSchema>
  grid (name?: string): Grid
  ping (timeout?: number): Promise<void>
  transaction<T> (fn: (session: mongodb.ClientSession) => PromiseLike<T>): Promise<T>
  close (force?: boolean): Promise<void>
}

export default function albatross (uri: string): Albatross
