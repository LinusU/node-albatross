import * as mongodb from 'mongodb'

type ExtractIdType<TSchema> = TSchema extends { _id: infer U }
  ? {} extends U
    ? Exclude<U, {}>
    : unknown extends U
      ? mongodb.ObjectId
      : U
  : mongodb.ObjectId

type FlattenIfArray<T> = T extends Array<infer R> ? R : T
type OptionalId<TSchema> = Omit<TSchema, '_id'> & { _id?: any }
type WithId<TSchema> = Omit<TSchema, '_id'> & { _id: ExtractIdType<TSchema> }

declare function albatross (uri: string): albatross.Albatross

declare namespace albatross {
  interface Collection<TSchema = any> {
    readonly parent: Albatross
    id (hexString?: mongodb.ObjectId | string): mongodb.ObjectId

    findOne<T = TSchema> (filter: mongodb.FilterQuery<TSchema>, options?: mongodb.FindOneOptions): Promise<T | null>
    find<T = TSchema> (query: mongodb.FilterQuery<TSchema>, options?: mongodb.FindOneOptions): Promise<T[]>

    count (query?: mongodb.FilterQuery<TSchema>, options?: mongodb.MongoCountPreferences): Promise<number>

    distinct<Key extends keyof WithId<TSchema>> (key: Key, query?: mongodb.FilterQuery<TSchema>, options?: { readPreference?: mongodb.ReadPreference | string, maxTimeMS?: number, session?: mongodb.ClientSession }): Promise<Array<FlattenIfArray<WithId<TSchema>[Key]>>>
    distinct (key: string, query?: mongodb.FilterQuery<TSchema>, options?: { readPreference?: mongodb.ReadPreference | string, maxTimeMS?: number, session?: mongodb.ClientSession }): Promise<any[]>

    exists (query?: mongodb.FilterQuery<TSchema>): Promise<boolean>

    insert (doc: OptionalId<TSchema>, options?: mongodb.CollectionInsertOneOptions): Promise<WithId<TSchema>>
    insert (docs: OptionalId<TSchema>[], options?: mongodb.CollectionInsertManyOptions): Promise<WithId<TSchema>[]>

    findOneAndUpdate (filter: mongodb.FilterQuery<TSchema>, update: mongodb.UpdateQuery<TSchema> | Partial<TSchema>, options: mongodb.FindOneAndUpdateOption & { returnOriginal: false, upsert: true }): Promise<TSchema>
    findOneAndUpdate (filter: mongodb.FilterQuery<TSchema>, update: mongodb.UpdateQuery<TSchema> | Partial<TSchema>, options?: mongodb.FindOneAndUpdateOption): Promise<TSchema | null>

    updateOne (filter: mongodb.FilterQuery<TSchema>, update: mongodb.UpdateQuery<TSchema> | Partial<TSchema>, options?: mongodb.UpdateOneOptions): Promise<{ matched: 0 | 1, modified: 0 | 1 }>
    updateMany (filter: mongodb.FilterQuery<TSchema>, update: mongodb.UpdateQuery<TSchema> | Partial<TSchema>, options?: mongodb.UpdateManyOptions): Promise<{ matched: number, modified: number }>

    deleteOne (filter: mongodb.FilterQuery<TSchema>, options?: mongodb.CommonOptions & { bypassDocumentValidation?: boolean }): Promise<0 | 1>
    deleteMany (filter: mongodb.FilterQuery<TSchema>, options?: mongodb.CommonOptions): Promise<number>

    aggregate<T = TSchema> (pipeline: object[], options?: mongodb.CollectionAggregationOptions): Promise<T[]>
  }

  interface FileInfo {
    id: mongodb.ObjectId
    md5: string
    length: number
    chunkSize: number
    uploadDate: Date
    contentType: string
    filename: string
    metadata: any
  }

  interface Grid {
    readonly parent: Albatross
    id (hexString?: mongodb.ObjectId | string): mongodb.ObjectId
    upload (stream: NodeJS.ReadableStream, options?: mongodb.GridFSBucketOpenUploadStreamOptions & { filename?: string }): Promise<FileInfo>
    download (id: mongodb.ObjectId): Promise<FileInfo & { stream: NodeJS.ReadableStream }>
    delete (id: mongodb.ObjectId): Promise<void>
  }

  interface Albatross {
    id (hexString?: mongodb.ObjectId | string): mongodb.ObjectId
    collection<TSchema> (name: string): Collection<TSchema>
    grid (name?: string): Grid
    ping (): Promise<void>
    close (force?: boolean): Promise<void>
  }

  const Binary: typeof mongodb.Binary
  const Code: typeof mongodb.Code
  const DBRef: typeof mongodb.DBRef
  const Decimal128: typeof mongodb.Decimal128
  const Double: typeof mongodb.Double
  const Int32: typeof mongodb.Int32
  const Long: typeof mongodb.Long
  const MaxKey: typeof mongodb.MaxKey
  const MinKey: typeof mongodb.MinKey
  const ObjectId: typeof mongodb.ObjectId
  const Timestamp: typeof mongodb.Timestamp
}

export = albatross
