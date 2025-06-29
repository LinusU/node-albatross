import * as mongodb from 'mongodb'

export { Binary, Code, Decimal128, Double, Int32, Long, MaxKey, MinKey, ObjectId, Timestamp } from 'mongodb'

type DeepReadonly<T> = T extends Date | RegExp | string | number | boolean | bigint | symbol | undefined | null
  ? T
  : T extends {}
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : Readonly<T>

type SpecificProjection<T, TProjection> = Omit<T, 'projection'> & { projection: TProjection }
type WithoutProjection<T> = T & { fields?: undefined, projection?: undefined }

// The upstream types have misstyped the `hint` option
interface FindOneAndUpdateOptions extends Omit<mongodb.FindOneAndUpdateOptions, 'hint'> {
  hint?: mongodb.Hint
}

export interface Collection<TSchema extends { _id: any }> {
  readonly parent: Albatross
  id (hexString?: mongodb.ObjectId | string): mongodb.ObjectId

  findOne (filter: mongodb.StrictFilter<TSchema>, options?: WithoutProjection<mongodb.FindOptions<TSchema>>): Promise<TSchema | null>
  findOne<TKey extends keyof TSchema> (filter: mongodb.StrictFilter<TSchema>, options: SpecificProjection<mongodb.FindOptions<TSchema>, { [key in TKey]: 1 | true } & { _id: 0 | false }>): Promise<Pick<TSchema, TKey> | null>
  findOne<TKey extends keyof TSchema> (filter: mongodb.StrictFilter<TSchema>, options: SpecificProjection<mongodb.FindOptions<TSchema>, { [key in TKey]: 1 | true } & { _id?: 1 | true }>): Promise<Pick<TSchema, '_id' | TKey> | null>
  findOne (filter: mongodb.StrictFilter<TSchema>, options: mongodb.FindOptions<TSchema>): Promise<object | null>

  find (query: mongodb.StrictFilter<TSchema>, options?: WithoutProjection<mongodb.FindOptions<TSchema>>): Promise<TSchema[]>
  find<TKey extends keyof TSchema> (query: mongodb.StrictFilter<TSchema>, options: SpecificProjection<mongodb.FindOptions<TSchema>, { [key in TKey]: 1 | true } & { _id: 0 | false }>): Promise<Array<Pick<TSchema, TKey>>>
  find<TKey extends keyof TSchema> (query: mongodb.StrictFilter<TSchema>, options: SpecificProjection<mongodb.FindOptions<TSchema>, { [key in TKey]: 1 | true } & { _id?: 1 | true }>): Promise<Array<Pick<TSchema, '_id' | TKey>>>
  find (query: mongodb.StrictFilter<TSchema>, options: mongodb.FindOptions<TSchema>): Promise<object[]>

  count (query?: mongodb.StrictFilter<TSchema>, options?: mongodb.CountOptions): Promise<number>

  distinct<TKey extends keyof mongodb.WithId<TSchema>> (key: TKey, query?: mongodb.StrictFilter<TSchema>, options?: mongodb.DistinctOptions): Promise<Array<mongodb.Flatten<mongodb.WithId<TSchema>[TKey]>>>
  distinct (key: string, query?: mongodb.StrictFilter<TSchema>, options?: mongodb.DistinctOptions): Promise<any[]>

  exists (query?: mongodb.StrictFilter<TSchema>, options?: { hint?: mongodb.Hint }): Promise<boolean>

  insert (doc: DeepReadonly<mongodb.OptionalId<TSchema>>, options?: mongodb.InsertOneOptions): Promise<mongodb.WithId<TSchema>>
  insert (docs: DeepReadonly<mongodb.OptionalId<TSchema>>[], options?: mongodb.BulkWriteOptions): Promise<mongodb.WithId<TSchema>[]>

  findOneAndUpdate (filter: mongodb.StrictFilter<TSchema>, update: mongodb.StrictUpdateFilter<TSchema>, options: WithoutProjection<FindOneAndUpdateOptions & { returnDocument: 'after', upsert: true }>): Promise<TSchema>
  findOneAndUpdate (filter: mongodb.StrictFilter<TSchema>, update: mongodb.StrictUpdateFilter<TSchema>, options?: WithoutProjection<FindOneAndUpdateOptions>): Promise<TSchema | null>

  findOneAndUpdate<TKey extends keyof TSchema> (filter: mongodb.StrictFilter<TSchema>, update: mongodb.StrictUpdateFilter<TSchema>, options: SpecificProjection<FindOneAndUpdateOptions & { returnDocument: 'after', upsert: true }, { [key in TKey]: 1 | true } & { _id: 0 | false }>): Promise<Pick<TSchema, TKey>>
  findOneAndUpdate<TKey extends keyof TSchema> (filter: mongodb.StrictFilter<TSchema>, update: mongodb.StrictUpdateFilter<TSchema>, options: SpecificProjection<FindOneAndUpdateOptions, { [key in TKey]: 1 | true } & { _id: 0 | false }>): Promise<Pick<TSchema, TKey> | null>

  findOneAndUpdate<TKey extends keyof TSchema> (filter: mongodb.StrictFilter<TSchema>, update: mongodb.StrictUpdateFilter<TSchema>, options: SpecificProjection<FindOneAndUpdateOptions & { returnDocument: 'after', upsert: true }, { [key in TKey]: 1 | true } & { _id?: 1 | true }>): Promise<Pick<TSchema, '_id' | TKey>>
  findOneAndUpdate<TKey extends keyof TSchema> (filter: mongodb.StrictFilter<TSchema>, update: mongodb.StrictUpdateFilter<TSchema>, options: SpecificProjection<FindOneAndUpdateOptions, { [key in TKey]: 1 | true } & { _id?: 1 | true }>): Promise<Pick<TSchema, '_id' | TKey> | null>

  findOneAndUpdate (filter: mongodb.StrictFilter<TSchema>, update: mongodb.StrictUpdateFilter<TSchema>, options: FindOneAndUpdateOptions & { returnDocument: 'after', upsert: true }): Promise<object>
  findOneAndUpdate (filter: mongodb.StrictFilter<TSchema>, update: mongodb.StrictUpdateFilter<TSchema>, options?: FindOneAndUpdateOptions): Promise<object | null>

  updateOne (filter: mongodb.StrictFilter<TSchema>, update: mongodb.StrictUpdateFilter<TSchema> | Partial<TSchema>, options?: mongodb.UpdateOptions): Promise<{ matched: 0 | 1, modified: 0 | 1 }>
  updateMany (filter: mongodb.StrictFilter<TSchema>, update: mongodb.StrictUpdateFilter<TSchema>, options?: mongodb.UpdateOptions): Promise<{ matched: number, modified: number }>

  deleteOne (filter: mongodb.StrictFilter<TSchema>, options?: mongodb.DeleteOptions): Promise<0 | 1>
  deleteMany (filter: mongodb.StrictFilter<TSchema>, options?: mongodb.DeleteOptions): Promise<number>

  aggregate (pipeline: object[], options?: mongodb.AggregateOptions): Promise<object[]>

  createIndex (indexSpec: mongodb.IndexSpecification, options?: mongodb.CreateIndexesOptions): Promise<string>
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
