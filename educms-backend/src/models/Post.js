const { query } = require('../config/database');

const LIST_FIELDS = `
  p.post_id, p.title, p.slug, p.excerpt, p.status, p.featured_image,
  p.view_count, p.like_count, p.is_featured, p.reading_time,
  p.created_at, p.updated_at, p.published_at,
  p.author_id, u.username AS author_username,
  p.category_id, c.name AS category_name, c.slug AS category_slug
`;

const DETAIL_FIELDS = `${LIST_FIELDS}, p.content, p.meta_title, p.meta_description, p.meta_keywords, p.allow_comments`;

const BASE_JOIN = `
  FROM posts p
  LEFT JOIN users u ON p.author_id = u.user_id
  LEFT JOIN categories c ON p.category_id = c.category_id
`;

const slugExists = async (slug) => {
  const result = await query('SELECT 1 FROM posts WHERE slug = $1', [slug]);
  return result.rowCount > 0;
};

const getTags = async (postId) => {
  const result = await query(
    `SELECT t.tag_id, t.name, t.slug FROM tags t
     JOIN post_tags pt ON pt.tag_id = t.tag_id WHERE pt.post_id = $1`,
    [postId]
  );
  return result.rows;
};

const setTags = async (postId, tagIds) => {
  await query('DELETE FROM post_tags WHERE post_id = $1', [postId]);
  if (tagIds && tagIds.length) {
    const values = tagIds.map((_, i) => `($1, $${i + 2})`).join(', ');
    await query(`INSERT INTO post_tags (post_id, tag_id) VALUES ${values}`, [postId, ...tagIds]);
  }
};

const create = async (data) => {
  const result = await query(
    `INSERT INTO posts (
       title, slug, content, excerpt, author_id, category_id, status,
       featured_image, meta_title, meta_description, meta_keywords,
       is_featured, allow_comments, reading_time, published_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     RETURNING post_id`,
    [
      data.title,
      data.slug,
      data.content,
      data.excerpt || null,
      data.authorId,
      data.categoryId || null,
      data.status,
      data.featuredImage || null,
      data.metaTitle || null,
      data.metaDescription || null,
      data.metaKeywords || null,
      data.isFeatured || false,
      data.allowComments !== false,
      data.readingTime,
      data.status === 'published' ? new Date() : null,
    ]
  );
  return result.rows[0].post_id;
};

const findById = async (postId) => {
  const result = await query(`SELECT ${DETAIL_FIELDS} ${BASE_JOIN} WHERE p.post_id = $1`, [postId]);
  if (!result.rows[0]) return null;
  const tags = await getTags(postId);
  return { ...result.rows[0], tags };
};

const findBySlug = async (slug) => {
  const result = await query(`SELECT ${DETAIL_FIELDS} ${BASE_JOIN} WHERE p.slug = $1`, [slug]);
  if (!result.rows[0]) return null;
  const tags = await getTags(result.rows[0].post_id);
  return { ...result.rows[0], tags };
};

const list = async ({ limit, offset, status, categoryId, authorId, search }) => {
  const conditions = [];
  const params = [];

  if (status) {
    params.push(status);
    conditions.push(`p.status = $${params.length}`);
  }
  if (categoryId) {
    params.push(categoryId);
    conditions.push(`p.category_id = $${params.length}`);
  }
  if (authorId) {
    params.push(authorId);
    conditions.push(`p.author_id = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(p.title ILIKE $${params.length} OR p.excerpt ILIKE $${params.length})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await query(`SELECT COUNT(*) FROM posts p ${where}`, params);
  const totalItems = parseInt(countResult.rows[0].count, 10);

  const listParams = [...params, limit, offset];
  const result = await query(
    `SELECT ${LIST_FIELDS} ${BASE_JOIN} ${where}
     ORDER BY p.created_at DESC LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
    listParams
  );

  return { posts: result.rows, totalItems };
};

const update = async (postId, fields) => {
  const params = [];
  const setClauses = Object.entries(fields).map(([key, value]) => {
    params.push(value);
    return `${key} = $${params.length}`;
  });

  params.push(postId);
  await query(`UPDATE posts SET ${setClauses.join(', ')} WHERE post_id = $${params.length}`, params);
};

const remove = async (postId) => {
  await query('DELETE FROM posts WHERE post_id = $1', [postId]);
};

const incrementViewCount = async (postId) => {
  await query('UPDATE posts SET view_count = view_count + 1 WHERE post_id = $1', [postId]);
};

module.exports = {
  slugExists,
  create,
  findById,
  findBySlug,
  list,
  update,
  remove,
  setTags,
  getTags,
  incrementViewCount,
};
