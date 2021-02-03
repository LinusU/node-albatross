import * as mongodb from 'mongodb'

type FlattenIfArray<T> = T extends Array<infer R> ? R : T
type WithoutProjection<T> = T & { fields?: undefined, projection?: undefined }
type WithProjection<T extends { projection?: any }> = T & { projection: NonNullable<T['projection']> }

declare function albatross (uri: string): albatross.Albatross

declare namespace albatross {
  interface Collection<TSchema> {
    readonly parent: Albatross
    id (hexString?: mongodb.ObjectId | string): mongodb.ObjectId

    findOne (filter: mongodb.FilterQuery<TSchema>, options?: WithoutProjection<mongodb.FindOneOptions<TSchema>>): Promise<TSchema | null>
    findOne (filter: mongodb.FilterQuery<TSchema>, options: WithProjection<mongodb.FindOneOptions<TSchema>>): Promise<object | null>

    find (query: mongodb.FilterQuery<TSchema>, options?: WithoutProjection<mongodb.FindOneOptions<TSchema>>): Promise<TSchema[]>
    find (query: mongodb.FilterQuery<TSchema>, options: WithProjection<mongodb.FindOneOptions<TSchema>>): Promise<object[]>

    count (query?: mongodb.FilterQuery<TSchema>, options?: mongodb.MongoCountPreferences): Promise<number>

    distinct<Key extends keyof mongodb.WithId<TSchema>> (key: Key, query?: mongodb.FilterQuery<TSchema>, options?: { readPreference?: mongodb.ReadPreference | string, maxTimeMS?: number, session?: mongodb.ClientSession }): Promise<Array<FlattenIfArray<mongodb.WithId<TSchema>[Key]>>>
    distinct (key: string, query?: mongodb.FilterQuery<TSchema>, options?: { readPreference?: mongodb.ReadPreference | string, maxTimeMS?: number, session?: mongodb.ClientSession }): Promise<any[]>

    exists (query?: mongodb.FilterQuery<TSchema>): Promise<boolean>

    insert (doc: mongodb.OptionalId<TSchema>, options?: mongodb.CollectionInsertOneOptions): Promise<mongodb.WithId<TSchema>>
    insert (docs: mongodb.OptionalId<TSchema>[], options?: mongodb.CollectionInsertManyOptions): Promise<mongodb.WithId<TSchema>[]>

    findOneAndUpdate (filter: mongodb.FilterQuery<TSchema>, update: mongodb.UpdateQuery<TSchema> | Partial<TSchema>, options: WithoutProjection<mongodb.FindOneAndUpdateOption<TSchema> & { returnOriginal: false, upsert: true }>): Promise<TSchema>
    findOneAndUpdate (filter: mongodb.FilterQuery<TSchema>, update: mongodb.UpdateQuery<TSchema> | Partial<TSchema>, options?: WithoutProjection<mongodb.FindOneAndUpdateOption<TSchema>>): Promise<TSchema | null>

    findOneAndUpdate (filter: mongodb.FilterQuery<TSchema>, update: mongodb.UpdateQuery<TSchema> | Partial<TSchema>, options: WithProjection<mongodb.FindOneAndUpdateOption<TSchema> & { returnOriginal: false, upsert: true }>): Promise<object>
    findOneAndUpdate (filter: mongodb.FilterQuery<TSchema>, update: mongodb.UpdateQuery<TSchema> | Partial<TSchema>, options?: WithProjection<mongodb.FindOneAndUpdateOption<TSchema>>): Promise<object | null>

    updateOne (filter: mongodb.FilterQuery<TSchema>, update: mongodb.UpdateQuery<TSchema> | Partial<TSchema>, options?: mongodb.UpdateOneOptions): Promise<{ matched: 0 | 1, modified: 0 | 1 }>
    updateMany (filter: mongodb.FilterQuery<TSchema>, update: mongodb.UpdateQuery<TSchema> | Partial<TSchema>, options?: mongodb.UpdateManyOptions): Promise<{ matched: number, modified: number }>

    deleteOne (filter: mongodb.FilterQuery<TSchema>, options?: mongodb.CommonOptions & { bypassDocumentValidation?: boolean }): Promise<0 | 1>
    deleteMany (filter: mongodb.FilterQuery<TSchema>, options?: mongodb.CommonOptions): Promise<number>

    aggregate (pipeline: object[], options?: mongodb.CollectionAggregationOptions): Promise<object[]>
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
    ping (timeout?: number): Promise<void>
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
