import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createUserClient, AppError } from '@journal-edge/fastify-framework';
import type { Database } from '@journal-edge/db';
import { env } from '../config/env.js';
import { tagSchema, type TagInput } from '../utils/validation.js';

type Tag = Database['public']['Tables']['tags']['Row'];
type TagInsert = Database['public']['Tables']['tags']['Insert'];
type TagUpdate = Database['public']['Tables']['tags']['Update'];

/**
 * Tag routes
 *
 * Manages tags and trade-tag associations
 */
export async function tagRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /tags
   * Get all tags for authenticated user
   */
  fastify.get(
    '/',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user?.id;
      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      const token = request.headers.authorization?.substring(7) || '';
      const supabase = createUserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, token);

      const { data: tags, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true })
        .returns<Tag[]>();

      if (error) {
        fastify.log.error({ error, userId }, 'Failed to fetch tags');
        throw new AppError(500, 'Failed to fetch tags');
      }

      return reply.status(200).send({ tags: tags || [] });
    }
  );

  /**
   * GET /tags/:id
   * Get a specific tag by ID
   */
  fastify.get(
    '/:id',
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const userId = request.user?.id;
      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      const token = request.headers.authorization?.substring(7) || '';
      const supabase = createUserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, token);

      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('id', request.params.id)
        .eq('user_id', userId)
        .returns<Tag>()
        .single();

      if (error || !data) {
        throw new AppError(404, 'Tag not found');
      }

      return reply.status(200).send({ tag: data });
    }
  );

  /**
   * POST /tags
   * Create a new tag
   */
  fastify.post(
    '/',
    {
      schema: {
        body: tagSchema,
      },
    },
    async (
      request: FastifyRequest<{ Body: TagInput }>,
      reply: FastifyReply
    ) => {
      const userId = request.user?.id;
      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      const token = request.headers.authorization?.substring(7) || '';
      const supabase = createUserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, token);

      const tagData: TagInsert = {
        ...request.body,
        user_id: userId,
      };

      const { data, error } = await supabase
        .from('tags')
        .insert(tagData)
        .select()
        .returns<Tag>()
        .single();

      if (error) {
        fastify.log.error({ error, userId }, 'Failed to create tag');
        throw new AppError(500, 'Failed to create tag');
      }

      fastify.log.info({ userId, tagId: data.id }, 'Tag created successfully');

      return reply.status(201).send({
        message: 'Tag created successfully',
        tag: data,
      });
    }
  );

  /**
   * PUT /tags/:id
   * Update an existing tag
   */
  fastify.put(
    '/:id',
    {
      schema: {
        body: tagSchema.partial(),
      },
    },
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: Partial<TagInput> }>,
      reply: FastifyReply
    ) => {
      const userId = request.user?.id;
      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      const token = request.headers.authorization?.substring(7) || '';
      const supabase = createUserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, token);

      const updateData: TagUpdate = request.body;

      const { data, error } = await supabase
        .from('tags')
        .update(updateData)
        .eq('id', request.params.id)
        .eq('user_id', userId)
        .select()
        .returns<Tag>()
        .single();

      if (error) {
        fastify.log.error({ error, userId, tagId: request.params.id }, 'Failed to update tag');
        throw new AppError(500, 'Failed to update tag');
      }

      if (!data) {
        throw new AppError(404, 'Tag not found');
      }

      fastify.log.info({ userId, tagId: data.id }, 'Tag updated successfully');

      return reply.status(200).send({
        message: 'Tag updated successfully',
        tag: data,
      });
    }
  );

  /**
   * DELETE /tags/:id
   * Delete a tag
   */
  fastify.delete(
    '/:id',
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const userId = request.user?.id;
      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      const token = request.headers.authorization?.substring(7) || '';
      const supabase = createUserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, token);

      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', request.params.id)
        .eq('user_id', userId);

      if (error) {
        fastify.log.error({ error, userId, tagId: request.params.id }, 'Failed to delete tag');
        throw new AppError(500, 'Failed to delete tag');
      }

      fastify.log.info({ userId, tagId: request.params.id }, 'Tag deleted successfully');

      return reply.status(200).send({
        message: 'Tag deleted successfully',
      });
    }
  );
}
