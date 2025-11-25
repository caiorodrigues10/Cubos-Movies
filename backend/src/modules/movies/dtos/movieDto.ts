import { Type, type Static } from '@sinclair/typebox'

const NullableString = Type.Union([Type.String(), Type.Null()])
const NullableNumber = Type.Union([Type.Number(), Type.Null()])

export const MovieEntitySchema = Type.Object({
	id: Type.String(),
	title: Type.String(),
	originalTitle: Type.Optional(NullableString),
	tagline: Type.Optional(NullableString),
	overview: Type.Optional(NullableString),
	releaseDate: Type.Optional(NullableString),
	runtime: Type.Optional(NullableNumber),
	genres: Type.Array(Type.String()),
	posterUrl: Type.Optional(NullableString),
	backdropUrl: Type.Optional(NullableString),
	trailer: Type.Optional(NullableString),
	voteAverage: Type.Optional(NullableNumber),
	voteCount: Type.Optional(NullableNumber),
	budget: Type.Optional(NullableNumber),
	revenue: Type.Optional(NullableNumber),
	reminderSent: Type.Boolean(),
	ownerId: Type.String(),
	createdAt: Type.String(),
	updatedAt: Type.String(),
	deletedAt: Type.Optional(NullableString),
})

export const MovieBodySchema = Type.Object(
	{
		title: Type.String({ minLength: 1 }),
		originalTitle: Type.Optional(Type.String({ minLength: 1 })),
		tagline: Type.Optional(Type.String()),
		overview: Type.Optional(Type.String()),
		releaseDate: Type.Optional(Type.String()),
		runtime: Type.Optional(Type.Integer({ minimum: 0 })),
		genres: Type.Optional(Type.Array(Type.String())),
		posterUrl: Type.Optional(Type.String({ format: 'uri' })),
		backdropUrl: Type.Optional(Type.String({ format: 'uri' })),
		trailer: Type.Optional(Type.String({ format: 'uri' })),
		voteAverage: Type.Optional(Type.Number({ minimum: 0, maximum: 10 })),
		voteCount: Type.Optional(Type.Integer({ minimum: 0 })),
		budget: Type.Optional(Type.Integer({ minimum: 0 })),
		revenue: Type.Optional(Type.Integer({ minimum: 0 })),
	},
	{ additionalProperties: false },
)

export const UpdateMovieBodySchema = Type.Partial(MovieBodySchema, {
	additionalProperties: false,
})

export const MovieParamsSchema = Type.Object(
	{ id: Type.String() },
	{ additionalProperties: false },
)

export const MovieListQuerySchema = Type.Object(
	{
		page: Type.Optional(Type.Integer({ minimum: 1 })),
		perPage: Type.Optional(Type.Integer({ minimum: 1, maximum: 50 })),
		search: Type.Optional(Type.String()),
		filters: Type.Optional(Type.String()),
	},
	{ additionalProperties: false },
)

export const MovieListResponseSchema = Type.Object({
	items: Type.Array(MovieEntitySchema),
	page: Type.Integer(),
	perPage: Type.Integer(),
	total: Type.Integer(),
})

export type MovieEntity = Static<typeof MovieEntitySchema>
export type MovieBody = Static<typeof MovieBodySchema>
export type UpdateMovieBody = Static<typeof UpdateMovieBodySchema>
export type MovieParams = Static<typeof MovieParamsSchema>
export type MovieListQuery = Static<typeof MovieListQuerySchema>
export type MovieListResponse = Static<typeof MovieListResponseSchema>
