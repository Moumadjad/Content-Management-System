const Post = require('../models/Post');
const {
  generateUniqueSlug,
  paginate,
  getPaginationMeta,
  successResponse,
  errorResponse,
  calculateReadingTime,
  extractExcerpt,
} = require('../utils/helpers');

const canModify = (post, user) => {
  if (user.role === 'admin' || user.role === 'editor') return true;
  return post.author_id === user.userId;
};

const list = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query.page, req.query.limit);
    const { posts, totalItems } = await Post.list({
      limit,
      offset,
      status: 'published',
      categoryId: req.query.category,
      search: req.query.search,
    });
    res.json(successResponse({ posts, pagination: getPaginationMeta(totalItems, page, limit) }));
  } catch (error) {
    next(error);
  }
};

const mine = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query.page, req.query.limit);
    const { posts, totalItems } = await Post.list({
      limit,
      offset,
      authorId: req.user.userId,
      status: req.query.status,
    });
    res.json(successResponse({ posts, pagination: getPaginationMeta(totalItems, page, limit) }));
  } catch (error) {
    next(error);
  }
};

const getBySlug = async (req, res, next) => {
  try {
    const post = await Post.findBySlug(req.params.slug);
    if (!post || post.status !== 'published') {
      return res.status(404).json(errorResponse('Post not found'));
    }
    await Post.incrementViewCount(post.post_id);
    res.json(successResponse(post));
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const {
      title, content, excerpt, categoryId, status, featuredImage,
      metaTitle, metaDescription, metaKeywords, isFeatured, allowComments, tagIds,
    } = req.body;

    const slug = await generateUniqueSlug(title, Post.slugExists);
    const postId = await Post.create({
      title,
      slug,
      content,
      excerpt: excerpt || extractExcerpt(content),
      authorId: req.user.userId,
      categoryId,
      status: status || 'draft',
      featuredImage,
      metaTitle,
      metaDescription,
      metaKeywords,
      isFeatured,
      allowComments,
      readingTime: calculateReadingTime(content),
    });

    if (Array.isArray(tagIds) && tagIds.length) {
      await Post.setTags(postId, tagIds);
    }

    const post = await Post.findById(postId);
    res.status(201).json(successResponse(post, 'Post created successfully'));
  } catch (error) {
    next(error);
  }
};

const BODY_TO_COLUMN = {
  title: 'title',
  content: 'content',
  excerpt: 'excerpt',
  categoryId: 'category_id',
  status: 'status',
  featuredImage: 'featured_image',
  metaTitle: 'meta_title',
  metaDescription: 'meta_description',
  metaKeywords: 'meta_keywords',
  isFeatured: 'is_featured',
  allowComments: 'allow_comments',
};

const update = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json(errorResponse('Post not found'));
    if (!canModify(post, req.user)) return res.status(403).json(errorResponse('Insufficient permissions'));

    const fields = {};
    Object.entries(req.body).forEach(([key, value]) => {
      const column = BODY_TO_COLUMN[key];
      if (column) fields[column] = value;
    });

    if (fields.title && fields.title !== post.title) {
      fields.slug = await generateUniqueSlug(fields.title, Post.slugExists);
    }
    if (fields.content) {
      fields.reading_time = calculateReadingTime(fields.content);
    }
    if (fields.status === 'published' && post.status !== 'published') {
      fields.published_at = new Date();
    }

    if (Object.keys(fields).length) {
      await Post.update(post.post_id, fields);
    }
    if (Array.isArray(req.body.tagIds)) {
      await Post.setTags(post.post_id, req.body.tagIds);
    }

    const updated = await Post.findById(post.post_id);
    res.json(successResponse(updated, 'Post updated successfully'));
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json(errorResponse('Post not found'));
    if (!canModify(post, req.user)) return res.status(403).json(errorResponse('Insufficient permissions'));

    await Post.remove(post.post_id);
    res.json(successResponse(null, 'Post deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = { list, mine, getBySlug, create, update, remove };
